import { db } from "@acme/db/client";
import {
  CreatePurchaseOrderLineItemType,
  CreatePurchaseOrderShipmentTrackingEventType,
  CreatePurchaseOrderShipmentType,
  CreatePurchaseOrderType,
  CreateWarehouseProductTransactionType,
  CreateWarehouseProductType,
  CreateWarehouseType,
  FieldUserWarehouse,
  PurchaseOrder,
  PurchaseOrderLineItem,
  PurchaseOrderShipment,
  PurchaseOrderShipmentTrackingEvent,
  PurchaseOrderType,
  UpdatePurchaseOrderLineItemType,
  UpdatePurchaseOrderShipmentType,
  UpdatePurchaseOrderType,
  UpdateWarehouseType,
  Warehouse,
  WarehouseProduct,
  WarehouseProductTransaction,
  wptTypeEnum,
} from "@acme/db/schema";
import { and, eq, inArray, or } from "drizzle-orm";

import {
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
      conditions.push(eq(Warehouse.type, filters.type));
    }
    if (filters.id) {
      conditions.push(eq(Warehouse.id, filters.id));
    }
    if (filters.userId) {
      const fuWarehouses = await db
        .select()
        .from(FieldUserWarehouse)
        .where(eq(FieldUserWarehouse.userId, filters.userId));
      conditions.push(eq(Warehouse.id, fuWarehouses[0].warehouseId));
    }

    return db.query.Warehouse.findMany({
      limit: filters.limit ?? 50,
      offset: filters.offset ?? 0,
      where: and(...conditions),
    });
  }

  async getWarehouse(id: number) {
    const [result] = await db
      .select()
      .from(Warehouse)
      .where(eq(Warehouse.id, id));

    if (!result) {
      throw new Error(`Warehouse with id ${id} not found`);
    }

    return result;
  }

  async createWarehouse(warehouse: CreateWarehouseType) {
    const [result] = await db.insert(Warehouse).values(warehouse).returning();
    return result;
  }

  async updateWarehouse(warehouse: UpdateWarehouseType, id: number) {
    const [result] = await db
      .update(Warehouse)
      .set(warehouse)
      .where(eq(Warehouse.id, id))
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
      conditions.push(eq(Warehouse.id, filters.id));
    }
    if (filters.warehouseId) {
      conditions.push(eq(WarehouseProduct.warehouseId, filters.warehouseId));
    }
    if (filters.productId) {
      conditions.push(eq(WarehouseProduct.productId, filters.productId));
    }

    return db.query.WarehouseProduct.findMany({
      where: and(...conditions),
    });
  }

  async createWarehouseProduct(warehouseProduct: CreateWarehouseProductType) {
    const [result] = await db
      .insert(WarehouseProduct)
      .values(warehouseProduct)
      .returning();
    return result;
  }

  // Warehouse Product Transaction

  async listWarehouseProductTransactions(
    filters: warehouseProductTransactionFilters,
  ) {
    let conditions = [];
    if (filters.id) {
      conditions.push(eq(WarehouseProductTransaction.id, filters.id));
    }
    if (filters.warehouseId) {
      conditions.push(
        or(
          eq(
            WarehouseProductTransaction.sourceWarehouseId,
            filters.warehouseId,
          ),
          eq(
            WarehouseProductTransaction.destinationWarehouseId,
            filters.warehouseId,
          ),
        ),
      );
    }

    return db.query.WarehouseProductTransaction.findMany({
      where: and(...conditions),
    });
  }

  async createWarehouseProductTransaction(
    warehouseProductTransaction: CreateWarehouseProductTransactionType,
  ) {
    const [result] = await db
      .insert(WarehouseProductTransaction)
      .values(warehouseProductTransaction)
      .returning();
    return result;
  }

  // Purchase Order

  async listPurchaseOrders(filters: purchaseOrderFilters) {
    let conditions = [];
    if (filters.id) {
      conditions.push(eq(PurchaseOrder.id, filters.id));
    }
    if (filters.statuses) {
      conditions.push(inArray(PurchaseOrder.status, filters.statuses));
    }
    if (filters.type) {
      conditions.push(eq(PurchaseOrder.type, filters.type));
    }
    if (filters.warehouseId) {
      conditions.push(
        or(
          eq(PurchaseOrder.sourceWarehouseId, filters.warehouseId),
          eq(PurchaseOrder.destinationWarehouseId, filters.warehouseId),
        ),
      );
    }
    if (filters.parentPurchaseOrderId) {
      conditions.push(
        eq(PurchaseOrder.parentPurchaseOrderId, filters.parentPurchaseOrderId),
      );
    }

    return db.query.PurchaseOrder.findMany({
      where: and(...conditions),
    });
  }

  async createPurchaseOrder(purchaseOrder: CreatePurchaseOrderType) {
    const [result] = await db
      .insert(PurchaseOrder)
      .values(purchaseOrder)
      .returning();
    return result;
  }

  async bulkCreatePurchaseOrder(pos: CreatePurchaseOrderType[]) {
    return db.insert(PurchaseOrder).values(pos).returning();
  }

  async updatePurchaseOrder(
    purchaseOrder: UpdatePurchaseOrderType,
    id: number,
  ) {
    const [previous] = await db
      .select()
      .from(PurchaseOrder)
      .where(eq(PurchaseOrder.id, id));

    const [result] = await db
      .update(PurchaseOrder)
      .set(purchaseOrder)
      .where(eq(PurchaseOrder.id, id))
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

  async processPOCompletion(po: PurchaseOrderType) {
    if (!po.sourceWarehouseId) {
      throw new Error(
        "Attempted to create a purchase order with no source warehouse",
      );
    }

    // get current warehouse products
    const polis = await db
      .select()
      .from(PurchaseOrderLineItem)
      .where(eq(PurchaseOrderLineItem.purchaseOrderId, po.id));
    const [sourceWarehouse] = await db
      .select()
      .from(Warehouse)
      .where(eq(Warehouse.id, po.sourceWarehouseId));
    const [destinationWarehouse] = await db
      .select()
      .from(Warehouse)
      .where(eq(Warehouse.id, po.destinationWarehouseId));
    const sourceWarehouseProducts = await db
      .select()
      .from(WarehouseProduct)
      .where(eq(WarehouseProduct.warehouseId, po.sourceWarehouseId));
    const destinationWarehouseProducts = await db
      .select()
      .from(WarehouseProduct)
      .where(eq(WarehouseProduct.warehouseId, po.destinationWarehouseId));

    let transactionType: (typeof wptTypeEnum.enumValues)[number];
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
        const wp: CreateWarehouseProductType = {
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
      const wpt: CreateWarehouseProductTransactionType = {
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
        await tx.insert(WarehouseProduct).values(createWarehouseProducts);
      }
      if (createWarehouseProductTransactions.length > 0) {
        await tx
          .insert(WarehouseProductTransaction)
          .values(createWarehouseProductTransactions);
      }
      for (const wp of wpMap) {
        await tx
          .update(WarehouseProduct)
          .set(wp[1])
          .where(eq(WarehouseProduct.id, wp[0]));
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
      conditions.push(eq(PurchaseOrderLineItem.id, filters.id));
    }
    if (filters.purchaseOrderIds) {
      conditions.push(
        inArray(
          PurchaseOrderLineItem.purchaseOrderId,
          filters.purchaseOrderIds,
        ),
      );
    }

    return db.query.PurchaseOrderLineItem.findMany({
      where: and(...conditions),
    });
  }

  async createPurchaseOrderLineItems(
    purchaseOrderLineItems: CreatePurchaseOrderLineItemType[],
  ) {
    return db
      .insert(PurchaseOrderLineItem)
      .values(purchaseOrderLineItems)
      .returning();
  }

  async updatePurchaseOrderLineItems(
    purchaseOrderLineItems: UpdatePurchaseOrderLineItemType[],
  ) {
    let map = new Map(
      purchaseOrderLineItems.map(({ id, ...nonIdOnj }) => [id, nonIdOnj]),
    );
    let updates: UpdatePurchaseOrderLineItemType[] = [];
    await db.transaction(async (tx) => {
      for (const item of map) {
        if (!item[0]) {
          throw new Error(
            "missing id for poli, please include ids on poli batch update",
          );
        }
        const [result] = await tx
          .update(PurchaseOrderLineItem)
          .set(item[1])
          .where(eq(PurchaseOrderLineItem.id, item[0]))
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
      conditions.push(eq(PurchaseOrderShipment.id, filters.id));
    }
    if (filters.purchaseOrderId) {
      conditions.push(
        eq(PurchaseOrderShipment.purchaseOrderId, filters.purchaseOrderId),
      );
    }

    return db.query.PurchaseOrderShipment.findMany({
      where: and(...conditions),
    });
  }

  async createPurchaseOrderShipment(
    purchaseOrderShipment: CreatePurchaseOrderShipmentType,
  ) {
    const [result] = await db
      .insert(PurchaseOrderShipment)
      .values(purchaseOrderShipment)
      .returning();
    return result;
  }

  async updatePurchaseOrderShipment(
    purchaseOrderShipment: UpdatePurchaseOrderShipmentType,
    id: number,
  ) {
    const [result] = await db
      .update(PurchaseOrderShipment)
      .set(purchaseOrderShipment)
      .where(eq(PurchaseOrderShipment.id, id))
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
      conditions.push(eq(PurchaseOrderShipmentTrackingEvent.id, filters.id));
    }
    if (filters.purchaseOrderShipmentId) {
      conditions.push(
        eq(
          PurchaseOrderShipmentTrackingEvent.purchaseOrderShipmentId,
          filters.purchaseOrderShipmentId,
        ),
      );
    }

    return db.query.PurchaseOrderShipmentTrackingEvent.findMany({
      where: and(...conditions),
    });
  }

  async createPurchaseOrderShipmentTrackingEvent(
    poste: CreatePurchaseOrderShipmentTrackingEventType,
  ) {
    const [result] = await db
      .insert(PurchaseOrderShipmentTrackingEvent)
      .values(poste)
      .returning();
    return result;
  }
}

export default InventoryService;
