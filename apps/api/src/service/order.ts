import dayjs from "dayjs";
import { and, eq, inArray } from "drizzle-orm";

import type {
  InsertOrder,
  InsertWarehouseProductTransaction,
  SelectOrder,
  UpdateOrder,
} from "@safestreets/db/schema";
import { db } from "@safestreets/db/client";
import {
  customer,
  order,
  orderProduct,
  orderProductStatusEnum,
  product,
  warehouse,
  warehouseProduct,
  warehouseProductTransaction,
} from "@safestreets/db/schema";

import type { orderFilters } from "../schema/order";
import type { OrderItem, PricebookEntry, SFOrder } from "../schema/salesforce";
import { env } from "../env";
import SalesforceService from "./salesforce";

const STANDARD_PRICEBOOK_ID = "01s4P000003naicQAA";
const CLOSE_OUR_ORDER_RECORD_TYPE_ID = "0124P000000hVuwQAE";

const salesforceService = await SalesforceService.initConnection(
  env.SALESFORCE_STAGING_USERNAME,
  env.SALESFORCE_STAGING_PASSWORD,
);

class OrderService {
  async listOrders(filters: orderFilters) {
    let conditions = [];
    if (filters.id) {
      conditions.push(eq(order.id, filters.id));
    }

    return db.query.order.findMany({
      limit: filters.limit ?? 50,
      offset: filters.offset ?? 0,
      where: and(...conditions),
    });
  }

  async getOrder(id: number) {
    const [result] = await db.select().from(order).where(eq(order.id, id));

    if (!result) {
      throw new Error(`Order with id ${id} not found`);
    }

    return result;
  }

  async createOrder(w: InsertOrder) {
    const [result] = await db.insert(order).values(w).returning();
    return result;
  }

  async updateOrder(w: UpdateOrder, id: number) {
    const [previous] = await db.select().from(order).where(eq(order.id, id));

    const [result] = await db
      .update(order)
      .set(w)
      .where(eq(order.id, id))
      .returning();

    if (!result) {
      throw new Error(`Order with id ${id} not found`);
    }

    // consume inventory if completed
    if (previous.status !== "completed" && result.status === "completed") {
      this.processInventory(result);
    }

    return result;
  }

  async processInventory(w: SelectOrder) {
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
      .from(orderProduct)
      .where(eq(orderProduct.orderId, w.id));

    let wpUpdateMap = new Map();
    let wptCreates = [];
    const nonConsumptionStatuses: (typeof orderProductStatusEnum.enumValues)[number][] =
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
        destinationOrderId: w.id,
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

  async createCloseOutOrderInSF(orderId: number) {
    const o = await db.query.order.findFirst({
      where: eq(order.id, orderId),
      with: {
        orderProducts: {
          with: {
            product: true,
          },
        },
        customer: true,
      },
    });
    if (!o) {
      throw new Error(`no order found with id: ${orderId}`);
    }
    const productIdList = o.orderProducts
      .map((op) => `'${op.product.externalId}'`)
      .join(", ");
    const pricebooks = await this.getPricebooksByProductIds(productIdList);
    const existingOrder = await this.getOrderByExternalId(orderId.toString());

    // create order
    const upsertOrder: SFOrder = {
      AccountId: o.customer.externalId,
      Pricebook2Id: STANDARD_PRICEBOOK_ID,
      Status: "Draft",
      RecordTypeId: CLOSE_OUR_ORDER_RECORD_TYPE_ID,
      ExternalId__c: orderId.toString(),
      EffectiveDate:
        existingOrder?.EffectiveDate ?? dayjs(new Date()).format("YYYY-MM-DD"),
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
    for (const op of o.orderProducts) {
      const pb = pricebooks.find(
        (pb) => pb.Product2Id === op.product.externalId,
      );
      if (!pb?.Id) {
        throw new Error("Failed to set order item, pricebook id is undefined");
      }
      const orderItem: OrderItem = {
        Quantity: op.quantity,
        UnitPrice: op.unitPrice,
        OrderId: newOrder.id,
        Product2Id: op.product.externalId,
        Installation_Status__c: "Not Installed",
        External_Id__c: op.id.toString(),
        PricebookEntryId: pb.Id,
      };
      upsertOrderItems.push(orderItem);
    }
    await salesforceService.upsertSObjects(
      "OrderItem",
      "External_Id__c",
      upsertOrderItems,
    );
  }

  async getPricebooksByProductIds(ids: string) {
    const pricebookQuery = `
          SELECT
            Id,
            Product2Id
          FROM PricebookEntry
          WHERE Product2Id IN (${ids})
        `;
    const pricebookResult = await salesforceService.query(pricebookQuery);
    return pricebookResult.records as PricebookEntry[];
  }

  async getOrderByExternalId(id: string) {
    const orderQuery = `
          SELECT
            Id,
            ExternalId__c,
            EffectiveDate
          FROM Order
          WHERE ExternalId__c = '${id}'
        `;
    const orderResult = await salesforceService.query(orderQuery);
    return orderResult.records[0] as SFOrder;
  }
}

export default OrderService;
