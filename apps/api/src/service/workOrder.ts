import { and, eq, inArray } from "drizzle-orm";

import type {
  InsertWarehouseProductTransaction,
  InsertWorkOrder,
  SelectWorkOrder,
  UpdateWorkOrder,
} from "@safestreets/db/schema";
import { db } from "@safestreets/db/client";
import {
  customer,
  product,
  warehouse,
  warehouseProduct,
  warehouseProductTransaction,
  workOrder,
  workOrderLineItem,
  workOrderLineItemStatusEnum,
} from "@safestreets/db/schema";

import type { Order, OrderItem, PricebookEntry } from "../schema/salesforce";
import type { workOrderFilters } from "../schema/workOrder";
import { env } from "../env";
import SalesforceService from "./salesforce";

const salesforceService = await SalesforceService.initConnection(
  env.SALESFORCE_STAGING_USERNAME,
  env.SALESFORCE_STAGING_PASSWORD,
);

class WorkOrderService {
  async listWorkOrders(filters: workOrderFilters) {
    let conditions = [];
    if (filters.id) {
      conditions.push(eq(workOrder.id, filters.id));
    }

    return db.query.workOrder.findMany({
      limit: filters.limit ?? 50,
      offset: filters.offset ?? 0,
      where: and(...conditions),
    });
  }

  async getWorkOrder(id: number) {
    const [result] = await db
      .select()
      .from(workOrder)
      .where(eq(workOrder.id, id));

    if (!result) {
      throw new Error(`WorkOrder with id ${id} not found`);
    }

    return result;
  }

  async createWorkOrder(w: InsertWorkOrder) {
    const [result] = await db.insert(workOrder).values(w).returning();
    return result;
  }

  async updateWorkOrder(w: UpdateWorkOrder, id: number) {
    const [previous] = await db
      .select()
      .from(workOrder)
      .where(eq(workOrder.id, id));

    const [result] = await db
      .update(workOrder)
      .set(w)
      .where(eq(workOrder.id, id))
      .returning();

    if (!result) {
      throw new Error(`WorkOrder with id ${id} not found`);
    }

    // consume inventory if completed
    if (previous.status !== "completed" && result.status === "completed") {
      this.processInventory(result);
    }

    return result;
  }

  async processInventory(w: SelectWorkOrder) {
    const [userWarehouse] = await db
      .select()
      .from(warehouse)
      .where(eq(warehouse.userId, w.userId));
    const warehouseProducts = await db
      .select()
      .from(warehouseProduct)
      .where(eq(warehouseProduct.warehouseId, userWarehouse.id));
    const wolis = await db
      .select()
      .from(workOrderLineItem)
      .where(eq(workOrderLineItem.workOrderId, w.id));

    let wpUpdateMap = new Map();
    let wptCreates = [];
    const nonConsumptionStatuses: (typeof workOrderLineItemStatusEnum.enumValues)[number][] =
      ["canceled_not_used", "ordered_out_of_stock"];

    for (const lineItem of wolis) {
      if (nonConsumptionStatuses.includes(lineItem.status)) {
        continue;
      }

      let matchingProduct = warehouseProducts.find(
        (p) => p.productId === lineItem.productId,
      );

      if (!matchingProduct) {
        console.error(
          `Inventory consumption failed - work order with id ${w.id} completed,
          tech user id is ${w.userId}, but is missing warehouse
          product matching product id ${lineItem.productId}`,
        );
        continue;
      }

      if (matchingProduct.onHandQuantity < lineItem.quantity) {
        console.error(
          `Warehouse product with id ${matchingProduct.id} quantity less than installed
          line item with id ${lineItem.id} quantity at the time of consumption`,
        );
      }

      matchingProduct.onHandQuantity -= lineItem.quantity;
      const { id, ...noIdWp } = matchingProduct;
      wpUpdateMap.set(id, noIdWp);

      const wpt: InsertWarehouseProductTransaction = {
        type: "consumption",
        quantity: -lineItem.quantity,
        productId: lineItem.productId,
        sourceWarehouseId: userWarehouse.id,
        destinationWorkOrderId: w.id,
      };
      wptCreates.push(wpt);
    }

    return db.transaction(async (tx) => {
      for (const wp of wpUpdateMap) {
        await tx
          .update(warehouseProduct)
          .set(wp[1])
          .where(eq(warehouseProduct.id, wp[0]));
      }
      await tx.insert(warehouseProductTransaction).values(wptCreates);
    });
  }

  async createCloseOutOrderInSF(workOrderId: number) {
    const [wo] = await db
      .select()
      .from(workOrder)
      .where(eq(workOrder.id, workOrderId))
      .limit(1);
    const [c] = await db
      .select()
      .from(customer)
      .where(eq(customer.id, wo.customerId))
      .limit(1);
    const wolis = await db
      .select()
      .from(workOrderLineItem)
      .where(eq(workOrderLineItem.workOrderId, workOrderId));
    const products = await db
      .select()
      .from(product)
      .where(
        inArray(
          product.id,
          wolis.map((w) => w.productId),
        ),
      );

    const productIdList = products.map((p) => `'${p.externalId}'`).join(", ");
    const pricebookQuery = `
          SELECT
            Id,
            Product2Id
          FROM PricebookEntry
          WHERE Product2Id IN (${productIdList})
        `;
    const pricebookResult = await salesforceService.query(pricebookQuery);
    const pricebooks = pricebookResult.records as PricebookEntry[];
    console.log("pricebooks from query", pricebooks);

    // create order
    const upsertOrder: Order = {
      AccountId: c.externalId,
      Pricebook2Id: "01s4P000003naicQAA", // standard pricebook
      Status: "Draft",
      RecordTypeId: "0124P000000hVuwQAE", // close out order
      ExternalId__c: workOrderId.toString(),
      EffectiveDate: Date.now().toString(),
    };

    const newOrder = await salesforceService.upsertSObject(
      "Order",
      "ExternalId__c",
      upsertOrder,
    );
    if (!newOrder.id) {
      throw new Error("Failed to create close out order");
    }

    // create order items
    let upsertOrderItems = [];
    for (const woli of wolis) {
      const p = products.find((p) => p.id === woli.productId);
      const pb = pricebooks.find((pb) => pb.Product2Id === p?.externalId);

      if (!p) {
        throw new Error("Failed to set order item, product is undefined");
      }
      if (!pb?.Id) {
        throw new Error("Failed to set order item, pricebook id is undefined");
      }

      const orderItem: OrderItem = {
        Quantity: woli.quantity,
        UnitPrice: woli.unitPrice,
        OrderId: newOrder.id,
        Product2Id: p.externalId,
        Installation_Status__c: "Not Installed",
        External_Id__c: woli.id.toString(),
        PricebookEntryId: pb.Id,
      };
      upsertOrderItems.push(orderItem);
    }
    console.log("order items to upsert", upsertOrderItems);
    const result = await salesforceService.upsertSObjects(
      "OrderItem",
      "External_Id__c",
      upsertOrderItems,
    );
    console.log("upsert result", result);
    const newOrderItems = result.map((r) => r.id);
    if (result.length == 0) {
      throw new Error("Failed to upsert order items");
    }
    console.log("mapped ids from result", newOrderItems);

    console.log(
      `Upserted order with id ${newOrder.id}, and upserted order items with ids ${newOrderItems.join(", ")}`,
    );
  }
}

export default WorkOrderService;
