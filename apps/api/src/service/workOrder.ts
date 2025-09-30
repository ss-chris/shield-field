import { and, eq } from "drizzle-orm";

import type {
  InsertWarehouseProductTransaction,
  InsertWorkOrder,
  SelectWorkOrder,
  UpdateWorkOrder,
} from "@safestreets/db/schema";
import { db } from "@safestreets/db/client";
import {
  warehouse,
  warehouseProduct,
  warehouseProductTransaction,
  workOrder,
  workOrderLineItem,
  workOrderLineItemStatusEnum,
} from "@safestreets/db/schema";

import type { workOrderFilters } from "~/schema/workOrder";

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
}

export default WorkOrderService;
