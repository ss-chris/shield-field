import { and, eq, inArray, or } from "drizzle-orm";

import type {
  InsertPurchaseOrder,
  InsertPurchaseOrderLineItem,
  InsertPurchaseOrderShipment,
  InsertPurchaseOrderShipmentTrackingEvent,
  InsertWarehouse,
  InsertWarehouseProduct,
  InsertWarehouseProductTransaction,
  SelectPurchaseOrder,
  UpdatePurchaseOrder,
  UpdatePurchaseOrderLineItem,
  UpdatePurchaseOrderShipment,
  UpdateWarehouse,
  warehouseProductTransactionTypeEnum,
} from "@safestreets/db/schema";
import { db } from "@safestreets/db/client";
import {
  purchaseOrder,
  purchaseOrderLineItem,
  purchaseOrderShipment,
  purchaseOrderShipmentTrackingEvent,
  warehouse,
  warehouseProduct,
  warehouseProductTransaction,
} from "@safestreets/db/schema";

import type {
  posteFilters,
  purchaseOrderFilters,
  purchaseOrderLineItemFilters,
  purchaseOrderShipmentFilters,
  warehouseFilters,
  warehouseProductFilters,
  warehouseProductTransactionFilters,
} from "~/schema/inventory";

class InventoryService {
  async listWarehouses(filters: warehouseFilters) {
    let conditions = [];
    if (filters.type) {
      conditions.push(eq(warehouse.type, filters.type));
    }
    if (filters.id) {
      conditions.push(eq(warehouse.id, filters.id));
    }

    return db.query.warehouse.findMany({
      limit: filters.limit ?? 50,
      offset: filters.offset ?? 0,
      where: and(...conditions),
    });
  }

  async getWarehouse(id: number) {
    const [result] = await db
      .select()
      .from(warehouse)
      .where(eq(warehouse.id, id));

    if (!result) {
      throw new Error(`Warehouse with id ${id} not found`);
    }

    return result;
  }

  async createWarehouse(w: InsertWarehouse) {
    const [result] = await db.insert(warehouse).values(w).returning();
    return result;
  }

  async updateWarehouse(w: UpdateWarehouse, id: number) {
    const [result] = await db
      .update(warehouse)
      .set(warehouse)
      .where(eq(warehouse.id, id))
      .returning();

    if (!result) {
      throw new Error(`AWT with id ${id} not found`);
    }

    return result;
  }

  // Warehouse Product

  async listWarehouseProducts(filters: warehouseProductFilters) {
    let conditions = [];
    if (filters.id) {
      conditions.push(eq(warehouse.id, filters.id));
    }
    if (filters.warehouseId) {
      conditions.push(eq(warehouseProduct.warehouseId, filters.warehouseId));
    }
    if (filters.productId) {
      conditions.push(eq(warehouseProduct.productId, filters.productId));
    }

    return db.query.warehouseProduct.findMany({
      where: and(...conditions),
    });
  }

  async createWarehouseProduct(wp: InsertWarehouseProduct) {
    const [result] = await db.insert(warehouseProduct).values(wp).returning();
    return result;
  }

  // Warehouse Product Transaction

  async listWarehouseProductTransactions(
    filters: warehouseProductTransactionFilters,
  ) {
    let conditions = [];
    if (filters.id) {
      conditions.push(eq(warehouseProductTransaction.id, filters.id));
    }
    if (filters.warehouseId) {
      conditions.push(
        or(
          eq(
            warehouseProductTransaction.sourceWarehouseId,
            filters.warehouseId,
          ),
          eq(
            warehouseProductTransaction.destinationWarehouseId,
            filters.warehouseId,
          ),
        ),
      );
    }

    return db.query.warehouseProductTransaction.findMany({
      where: and(...conditions),
    });
  }

  async createWarehouseProductTransaction(
    wpt: InsertWarehouseProductTransaction,
  ) {
    const [result] = await db
      .insert(warehouseProductTransaction)
      .values(wpt)
      .returning();
    return result;
  }

  // Purchase Order

  async listPurchaseOrders(filters: purchaseOrderFilters) {
    let conditions = [];
    if (filters.id) {
      conditions.push(eq(purchaseOrder.id, filters.id));
    }
    if (filters.statuses) {
      conditions.push(inArray(purchaseOrder.status, filters.statuses));
    }
    if (filters.type) {
      conditions.push(eq(purchaseOrder.type, filters.type));
    }
    if (filters.warehouseId) {
      conditions.push(
        or(
          eq(purchaseOrder.sourceWarehouseId, filters.warehouseId),
          eq(purchaseOrder.destinationWarehouseId, filters.warehouseId),
        ),
      );
    }
    if (filters.parentPurchaseOrderId) {
      conditions.push(
        eq(purchaseOrder.parentPurchaseOrderId, filters.parentPurchaseOrderId),
      );
    }

    return db.query.purchaseOrder.findMany({
      where: and(...conditions),
    });
  }

  async createPurchaseOrder(po: InsertPurchaseOrder) {
    const [result] = await db.insert(purchaseOrder).values(po).returning();
    return result;
  }

  async bulkCreatePurchaseOrder(pos: InsertPurchaseOrder[]) {
    return db.insert(purchaseOrder).values(pos).returning();
  }

  async updatePurchaseOrder(po: UpdatePurchaseOrder, id: number) {
    const [previous] = await db
      .select()
      .from(purchaseOrder)
      .where(eq(purchaseOrder.id, id));

    const [result] = await db
      .update(purchaseOrder)
      .set(po)
      .where(eq(purchaseOrder.id, id))
      .returning();

    if (!result) {
      throw new Error(`PO with id ${id} not found`);
    }

    if (result.status !== "complete") {
      return result;
    }
    if (previous.status !== "complete") {
      await this.processPOCompletion(result);
    }

    return result;
  }

  async processPOCompletion(po: SelectPurchaseOrder) {
    if (!po.sourceWarehouseId) {
      throw new Error(
        "Attempted to create a purchase order with no source warehouse",
      );
    }

    // get current warehouse products
    const polis = await db
      .select()
      .from(purchaseOrderLineItem)
      .where(eq(purchaseOrderLineItem.purchaseOrderId, po.id));
    const [sourceWarehouse] = await db
      .select()
      .from(warehouse)
      .where(eq(warehouse.id, po.sourceWarehouseId));
    const [destinationWarehouse] = await db
      .select()
      .from(warehouse)
      .where(eq(warehouse.id, po.destinationWarehouseId));
    const sourceWarehouseProducts = await db
      .select()
      .from(warehouseProduct)
      .where(eq(warehouseProduct.warehouseId, po.sourceWarehouseId));
    const destinationWarehouseProducts = await db
      .select()
      .from(warehouseProduct)
      .where(eq(warehouseProduct.warehouseId, po.destinationWarehouseId));

    let transactionType: (typeof warehouseProductTransactionTypeEnum.enumValues)[number];
    switch (sourceWarehouse.type) {
      case "individual":
      case "warehouse":
        if (destinationWarehouse.type === "vendor") {
          transactionType = "return";
        } else {
          transactionType = "transfer";
        }
        break;
      case "vendor":
        transactionType = "replenishment";
        break;
    }

    // handle inventory exchange
    let createWarehouseProducts = [];
    let updateWarehouseProducts = [];
    let createWarehouseProductTransactions = [];

    for (const poli of polis) {
      // warehouse product create/update
      let sourceWarehouseProduct = sourceWarehouseProducts.find(
        (wp) => wp.productId === poli.productId,
      );
      let destinationWarehouseProduct = destinationWarehouseProducts.find(
        (wp) => wp.productId === poli.productId,
      );
      if (sourceWarehouseProduct && sourceWarehouse.type !== "vendor") {
        sourceWarehouseProduct.onHandQuantity -= poli.quantityReceived;
        updateWarehouseProducts.push(sourceWarehouseProduct);
      }
      if (destinationWarehouseProduct) {
        if (destinationWarehouse.type !== "vendor") {
          destinationWarehouseProduct.onHandQuantity += poli.quantityReceived;
          updateWarehouseProducts.push(destinationWarehouseProduct);
        }
      } else {
        const wp: InsertWarehouseProduct = {
          warehouseId: po.destinationWarehouseId,
          onHandQuantity: poli.quantityReceived,
          desiredQuantity: poli.quantityOrdered,
          productId: poli.productId,
        };
        createWarehouseProducts.push(wp);
      }

      // transaction creation(s)
      let quantity = poli.quantityReceived;
      if (transactionType === "return") {
        quantity = -quantity;
      }
      const wpt: InsertWarehouseProductTransaction = {
        type: transactionType,
        quantity: quantity,
        productId: poli.productId,
        sourceWarehouseId: po.sourceWarehouseId,
        destinationWarehouseId: po.destinationWarehouseId,
      };
      createWarehouseProductTransactions.push(wpt);
      if (transactionType === "transfer") {
        createWarehouseProductTransactions.push({
          ...wpt,
          quantity: -quantity,
          sourceWarehouseId: wpt.destinationWarehouseId,
          destinationWarehouseId: wpt.sourceWarehouseId,
        });
      }
    }

    // poop.. oh wait.. CRUD

    const wpMap = new Map(
      updateWarehouseProducts.map(({ id, ...noIdObject }) => [id, noIdObject]),
    );

    return db.transaction(async (tx) => {
      if (createWarehouseProducts.length > 0) {
        await tx.insert(warehouseProduct).values(createWarehouseProducts);
      }
      if (createWarehouseProductTransactions.length > 0) {
        await tx
          .insert(warehouseProductTransaction)
          .values(createWarehouseProductTransactions);
      }
      for (const wp of wpMap) {
        await tx
          .update(warehouseProduct)
          .set(wp[1])
          .where(eq(warehouseProduct.id, wp[0]));
      }
      console.log(
        `[Inventory Process] created ${createWarehouseProducts.length} WPs, ${createWarehouseProductTransactions.length} WPTs, updated ${wpMap.size} WPs`,
      );
    });
  }

  // Purchase Order Line Item

  async listPurchaseOrderLineItems(filters: purchaseOrderLineItemFilters) {
    let conditions = [];
    if (filters.id) {
      conditions.push(eq(purchaseOrderLineItem.id, filters.id));
    }
    if (filters.purchaseOrderIds) {
      conditions.push(
        inArray(
          purchaseOrderLineItem.purchaseOrderId,
          filters.purchaseOrderIds,
        ),
      );
    }

    return db.query.purchaseOrderLineItem.findMany({
      where: and(...conditions),
    });
  }

  async createPurchaseOrderLineItems(polis: InsertPurchaseOrderLineItem[]) {
    return db.insert(purchaseOrderLineItem).values(polis).returning();
  }

  async updatePurchaseOrderLineItems(
    purchaseOrderLineItems: UpdatePurchaseOrderLineItem[],
  ) {
    let map = new Map(
      purchaseOrderLineItems.map(({ id, ...nonIdOnj }) => [id, nonIdOnj]),
    );
    let updates: UpdatePurchaseOrderLineItem[] = [];
    await db.transaction(async (tx) => {
      for (const item of map) {
        if (!item[0]) {
          throw new Error(
            "missing id for poli, please include ids on poli batch update",
          );
        }
        const [result] = await tx
          .update(purchaseOrderLineItem)
          .set(item[1])
          .where(eq(purchaseOrderLineItem.id, item[0]))
          .returning();
        updates.push(result);
      }
    });
    return updates;
  }

  // Purchase Order Shipment

  async listPurchaseOrderShipments(filters: purchaseOrderShipmentFilters) {
    let conditions = [];
    if (filters.id) {
      conditions.push(eq(purchaseOrderShipment.id, filters.id));
    }
    if (filters.purchaseOrderId) {
      conditions.push(
        eq(purchaseOrderShipment.purchaseOrderId, filters.purchaseOrderId),
      );
    }

    return db.query.purchaseOrderShipment.findMany({
      where: and(...conditions),
    });
  }

  async createPurchaseOrderShipment(pos: InsertPurchaseOrderShipment) {
    const [result] = await db
      .insert(purchaseOrderShipment)
      .values(pos)
      .returning();
    return result;
  }

  async updatePurchaseOrderShipment(
    pos: UpdatePurchaseOrderShipment,
    id: number,
  ) {
    const [result] = await db
      .update(purchaseOrderShipment)
      .set(pos)
      .where(eq(purchaseOrderShipment.id, id))
      .returning();

    if (!result) {
      throw new Error(`POS with id ${id} not found`);
    }

    return result;
  }

  // Purchase Order Shipment Tracking Event

  async listPurchaseOrderShipmentTrackingEvents(filters: posteFilters) {
    let conditions = [];
    if (filters.id) {
      conditions.push(eq(purchaseOrderShipmentTrackingEvent.id, filters.id));
    }
    if (filters.purchaseOrderShipmentId) {
      conditions.push(
        eq(
          purchaseOrderShipmentTrackingEvent.purchaseOrderShipmentId,
          filters.purchaseOrderShipmentId,
        ),
      );
    }

    return db.query.purchaseOrderShipmentTrackingEvent.findMany({
      where: and(...conditions),
    });
  }

  async createPurchaseOrderShipmentTrackingEvent(
    poste: InsertPurchaseOrderShipmentTrackingEvent,
  ) {
    const [result] = await db
      .insert(purchaseOrderShipmentTrackingEvent)
      .values(poste)
      .returning();
    return result;
  }
}

export default InventoryService;
