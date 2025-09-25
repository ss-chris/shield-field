import { relations } from "drizzle-orm";
import { pgEnum, pgTable } from "drizzle-orm/pg-core";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import { z } from "zod/v4";

import { baseFields } from "./base-fields";
import { location } from "./locations";
import { workOrder } from "./operations";

// ============== Enums ==============

export const warehouseTypeEnum = pgEnum("warehouse_types", [
  "vendor",
  "individual",
  "warehouse",
]);

export const warehouseProductTransactionTypeEnum = pgEnum(
  "warehouse_product_transaction_types",
  ["uninstall", "return", "consumption", "replenishment", "transfer"],
);

export const purchaseOrderStatusEnum = pgEnum("purchase_order_statuses", [
  "open",
  "approved",
  "declined",
  "complete",
]);

export const purchaseOrderLineItemStatusEnum = pgEnum(
  "purchase_order_line_item_statuses",
  ["created", "ordered", "completed", "missing"],
);

export const purchaseOrderShipmentStatusEnum = pgEnum(
  "purchase_order_shipment_statuses",
  ["pending", "onroute", "delivered"],
);

// ============== Tables ==============

export const product = pgTable("product", (t) => ({
  id: t.serial().primaryKey(),
  externalId: t.text().notNull(),
  name: t.text().notNull(),
  ...baseFields,
}));

export const warehouse = pgTable("warehouse", (t) => ({
  id: t.serial().primaryKey(),
  name: t.text(),
  shipTo: t.text().notNull(),
  type: warehouseTypeEnum().notNull(),
  accountId: t.text().notNull(),
  integrationType: t.text().notNull(),
  active: t.boolean().default(true),
  keepStocked: t.boolean().default(true),
  shippingLocationId: t
    .integer()
    .references(() => location.id)
    .notNull(),
  ...baseFields,
}));

export const warehouseProduct = pgTable("warehouse_product", (t) => ({
  id: t.serial().primaryKey(),
  onHandQuantity: t.integer().notNull(),
  desiredQuantity: t.integer().notNull(),
  canBeOrdered: t.boolean().default(true),
  warehouseId: t
    .integer()
    .references(() => warehouse.id)
    .notNull(),
  productId: t
    .integer()
    .references(() => product.id)
    .notNull(),
  ...baseFields,
}));

export const warehouseProductTransaction = pgTable(
  "warehouse_product_transaction",
  (t) => ({
    id: t.serial().primaryKey(),
    type: warehouseProductTransactionTypeEnum().notNull(),
    quantity: t.integer().notNull(),
    productId: t.integer().references(() => product.id),
    sourceWarehouseId: t.integer().references(() => warehouse.id),
    sourceWorkOrderId: t.integer().references(() => workOrder.id),
    destinationWarehouseId: t.integer().references(() => warehouse.id),
    destinationWorkOrderId: t.integer().references(() => workOrder.id),
    ...baseFields,
  }),
);

export const purchaseOrder = pgTable("purchase_order", (t) => ({
  id: t.serial().primaryKey(),
  type: t.text().notNull(),
  status: purchaseOrderStatusEnum().default("open").notNull(),
  shippingMethod: t.text(),
  parentPurchaseOrderId: t.integer(),
  sourceWarehouseId: t.integer().references(() => warehouse.id),
  destinationWarehouseId: t
    .integer()
    .references(() => warehouse.id)
    .notNull(),
  ...baseFields,
}));

export const purchaseOrderLineItem = pgTable(
  "purchase_order_line_item",
  (t) => ({
    id: t.serial().primaryKey(),
    status: purchaseOrderLineItemStatusEnum().default("created").notNull(),
    quantityOrdered: t.integer().notNull(),
    quantityReceived: t.integer().notNull(),
    purchaseOrderId: t
      .integer()
      .references(() => purchaseOrder.id)
      .notNull(),
    productId: t
      .integer()
      .references(() => product.id)
      .notNull(),
    ...baseFields,
  }),
);

export const purchaseOrderShipment = pgTable(
  "purchase_order_shipment",
  (t) => ({
    id: t.serial().primaryKey(),
    trackingNumber: t.text().notNull(),
    carrier: t.text().notNull(),
    status: purchaseOrderShipmentStatusEnum().default("pending").notNull(),
    lastCarrierMessage: t.text(),
    shipmentDate: t.timestamp(),
    estimatedDeliveryDate: t.timestamp(),
    deliveryDate: t.timestamp(),
    purchaseOrderId: t
      .integer()
      .references(() => purchaseOrder.id)
      .notNull(),
    ...baseFields,
  }),
);

export const purchaseOrderShipmentTrackingEvent = pgTable(
  "purchase_order_shipment_tracking_event",
  (t) => ({
    id: t.serial().primaryKey(),
    trackingEventMessage: t.text().notNull(),
    timestamp: t.timestamp().notNull(),
    purchaseOrderShipmentId: t
      .integer()
      .references(() => purchaseOrderShipment.id)
      .notNull(),
    ...baseFields,
  }),
);

// ============== Relations ==============

export const productRelations = relations(product, ({ many }) => ({
  warehouseProducts: many(warehouseProduct),
  warehouseProductTransactions: many(warehouseProductTransaction),
  purchaseOrderLineItems: many(purchaseOrderLineItem),
}));

export const warehouseRelations = relations(warehouse, ({ one, many }) => ({
  shippingLocation: one(location, {
    fields: [warehouse.shippingLocationId],
    references: [location.id],
  }),
  warehouseProducts: many(warehouseProduct),
  sourceTransactions: many(warehouseProductTransaction),
  destinationTransactions: many(warehouseProductTransaction),
  sourcePurchaseOrders: many(purchaseOrder),
  destinationPurchaseOrders: many(purchaseOrder),
}));

export const warehouseProductRelations = relations(
  warehouseProduct,
  ({ one }) => ({
    warehouse: one(warehouse, {
      fields: [warehouseProduct.warehouseId],
      references: [warehouse.id],
    }),
    product: one(product, {
      fields: [warehouseProduct.productId],
      references: [product.id],
    }),
  }),
);

export const warehouseProductTransactionRelations = relations(
  warehouseProductTransaction,
  ({ one }) => ({
    product: one(product, {
      fields: [warehouseProductTransaction.productId],
      references: [product.id],
    }),
    sourceWarehouse: one(warehouse, {
      fields: [warehouseProductTransaction.sourceWarehouseId],
      references: [warehouse.id],
    }),
    sourceWorkOrder: one(workOrder, {
      fields: [warehouseProductTransaction.sourceWorkOrderId],
      references: [workOrder.id],
    }),
    destinationWarehouse: one(warehouse, {
      fields: [warehouseProductTransaction.destinationWarehouseId],
      references: [warehouse.id],
    }),
    destinationWorkOrder: one(workOrder, {
      fields: [warehouseProductTransaction.destinationWorkOrderId],
      references: [workOrder.id],
    }),
  }),
);

export const purchaseOrderRelations = relations(
  purchaseOrder,
  ({ one, many }) => ({
    sourceWarehouse: one(warehouse, {
      fields: [purchaseOrder.sourceWarehouseId],
      references: [warehouse.id],
    }),
    destinationWarehouse: one(warehouse, {
      fields: [purchaseOrder.destinationWarehouseId],
      references: [warehouse.id],
    }),
    parentPurchaseOrder: one(purchaseOrder, {
      fields: [purchaseOrder.parentPurchaseOrderId],
      references: [purchaseOrder.id],
    }),
    childPurchaseOrders: many(purchaseOrder),
    lineItems: many(purchaseOrderLineItem),
    shipments: many(purchaseOrderShipment),
  }),
);

export const purchaseOrderLineItemRelations = relations(
  purchaseOrderLineItem,
  ({ one }) => ({
    purchaseOrder: one(purchaseOrder, {
      fields: [purchaseOrderLineItem.purchaseOrderId],
      references: [purchaseOrder.id],
    }),
    product: one(product, {
      fields: [purchaseOrderLineItem.productId],
      references: [product.id],
    }),
  }),
);

export const purchaseOrderShipmentRelations = relations(
  purchaseOrderShipment,
  ({ one, many }) => ({
    purchaseOrder: one(purchaseOrder, {
      fields: [purchaseOrderShipment.purchaseOrderId],
      references: [purchaseOrder.id],
    }),
    trackingEvents: many(purchaseOrderShipmentTrackingEvent),
  }),
);

export const purchaseOrderShipmentTrackingEventRelations = relations(
  purchaseOrderShipmentTrackingEvent,
  ({ one }) => ({
    shipment: one(purchaseOrderShipment, {
      fields: [purchaseOrderShipmentTrackingEvent.purchaseOrderShipmentId],
      references: [purchaseOrderShipment.id],
    }),
  }),
);

// ============== Schemas & Types ==============

export const insertProductSchema = createInsertSchema(product);
export const selectProductSchema = createSelectSchema(product);
export const updateProductSchema = createUpdateSchema(product);
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type SelectProduct = z.infer<typeof selectProductSchema>;
export type UpdateProduct = z.infer<typeof updateProductSchema>;

export const insertWarehouseSchema = createInsertSchema(warehouse, {
  type: z.enum(warehouseTypeEnum.enumValues),
});
export const selectWarehouseSchema = createSelectSchema(warehouse);
export const updateWarehouseSchema = createUpdateSchema(warehouse);
export type InsertWarehouse = z.infer<typeof insertWarehouseSchema>;
export type SelectWarehouse = z.infer<typeof selectWarehouseSchema>;
export type UpdateWarehouse = z.infer<typeof updateWarehouseSchema>;

export const insertWarehouseProductSchema =
  createInsertSchema(warehouseProduct);
export const selectWarehouseProductSchema =
  createSelectSchema(warehouseProduct);
export const updateWarehouseProductSchema =
  createUpdateSchema(warehouseProduct);
export type InsertWarehouseProduct = z.infer<
  typeof insertWarehouseProductSchema
>;
export type SelectWarehouseProduct = z.infer<
  typeof selectWarehouseProductSchema
>;
export type UpdateWarehouseProduct = z.infer<
  typeof updateWarehouseProductSchema
>;

export const insertWarehouseProductTransactionSchema = createInsertSchema(
  warehouseProductTransaction,
  {
    type: z.enum(warehouseProductTransactionTypeEnum.enumValues),
  },
);
export const selectWarehouseProductTransactionSchema = createSelectSchema(
  warehouseProductTransaction,
);
export const updateWarehouseProductTransactionSchema = createUpdateSchema(
  warehouseProductTransaction,
);
export type InsertWarehouseProductTransaction = z.infer<
  typeof insertWarehouseProductTransactionSchema
>;
export type SelectWarehouseProductTransaction = z.infer<
  typeof selectWarehouseProductTransactionSchema
>;
export type UpdateWarehouseProductTransaction = z.infer<
  typeof updateWarehouseProductTransactionSchema
>;

export const insertPurchaseOrderSchema = createInsertSchema(purchaseOrder, {
  status: z.enum(purchaseOrderStatusEnum.enumValues),
});
export const selectPurchaseOrderSchema = createSelectSchema(purchaseOrder);
export const updatePurchaseOrderSchema = createUpdateSchema(purchaseOrder);
export type InsertPurchaseOrder = z.infer<typeof insertPurchaseOrderSchema>;
export type SelectPurchaseOrder = z.infer<typeof selectPurchaseOrderSchema>;
export type UpdatePurchaseOrder = z.infer<typeof updatePurchaseOrderSchema>;

export const insertPurchaseOrderLineItemSchema = createInsertSchema(
  purchaseOrderLineItem,
  {
    status: z.enum(purchaseOrderLineItemStatusEnum.enumValues),
  },
);
export const selectPurchaseOrderLineItemSchema = createSelectSchema(
  purchaseOrderLineItem,
);
export const updatePurchaseOrderLineItemSchema = createUpdateSchema(
  purchaseOrderLineItem,
);
export type InsertPurchaseOrderLineItem = z.infer<
  typeof insertPurchaseOrderLineItemSchema
>;
export type SelectPurchaseOrderLineItem = z.infer<
  typeof selectPurchaseOrderLineItemSchema
>;
export type UpdatePurchaseOrderLineItem = z.infer<
  typeof updatePurchaseOrderLineItemSchema
>;

export const insertPurchaseOrderShipmentSchema = createInsertSchema(
  purchaseOrderShipment,
  {
    status: z.enum(purchaseOrderShipmentStatusEnum.enumValues),
  },
);
export const selectPurchaseOrderShipmentSchema = createSelectSchema(
  purchaseOrderShipment,
);
export const updatePurchaseOrderShipmentSchema = createUpdateSchema(
  purchaseOrderShipment,
);
export type InsertPurchaseOrderShipment = z.infer<
  typeof insertPurchaseOrderShipmentSchema
>;
export type SelectPurchaseOrderShipment = z.infer<
  typeof selectPurchaseOrderShipmentSchema
>;
export type UpdatePurchaseOrderShipment = z.infer<
  typeof updatePurchaseOrderShipmentSchema
>;

export const insertPurchaseOrderShipmentTrackingEventSchema =
  createInsertSchema(purchaseOrderShipmentTrackingEvent);
export const selectPurchaseOrderShipmentTrackingEventSchema =
  createSelectSchema(purchaseOrderShipmentTrackingEvent);
export const updatePurchaseOrderShipmentTrackingEventSchema =
  createUpdateSchema(purchaseOrderShipmentTrackingEvent);
export type InsertPurchaseOrderShipmentTrackingEvent = z.infer<
  typeof insertPurchaseOrderShipmentTrackingEventSchema
>;
export type SelectPurchaseOrderShipmentTrackingEvent = z.infer<
  typeof selectPurchaseOrderShipmentTrackingEventSchema
>;
export type UpdatePurchaseOrderShipmentTrackingEvent = z.infer<
  typeof updatePurchaseOrderShipmentTrackingEventSchema
>;
