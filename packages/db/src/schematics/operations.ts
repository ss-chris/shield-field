import type z from "zod/v4";
import { relations } from "drizzle-orm";
import { pgEnum, pgTable } from "drizzle-orm/pg-core";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";

import { organization, user } from "./auth";
import { baseFields, baseFieldsReadOnly } from "./base-fields";
import { product } from "./inventory";
import { location } from "./locations";

// ============== Enums ==============

export const orderStatusEnum = pgEnum("order_statuses", [
  "pending",
  "assigned",
  "in_progress",
  "completed",
  "cancelled",
]);

export const orderCannotCompleteReasonEnum = pgEnum(
  "order_cannot_complete_reasons",
  [
    "dry_run_customer_reschedule",
    "dry_run_customer_no_show",
    "dry_run_customer_cancel",
    "dry_run_review_quote",
    "adt_api_salesforce_down",
    "no_power_or_internet",
    "poo_nape_issue",
  ],
);

export const orderTypeEnum = pgEnum("order_types", [
  "installation",
  "maintenance",
  "repair",
  "inspection",
  "removal",
]);

export const orderProductStatusEnum = pgEnum("order_product_statuses", [
  "completed_mounted_and_programmed",
  "canceled_not_used",
  "left_not_mounted_or_programmed",
  "mounted_not_programmed",
  "ordered_out_of_stock",
  "programmed_hvac_needed",
  "programmed_not_installed",
]);

export const orderProductConfirmationStatusEnum = pgEnum(
  "order_product_confirmation_statuses",
  ["pending", "cancelled", "complete"],
);

export const customerStatusEnum = pgEnum("customer_statuses", [
  "open",
  "scheduled",
  "installed",
]);

// ============== Tables ==============

export const customer = pgTable("customer", (t) => ({
  id: t.serial().primaryKey(),
  externalId: t.text().notNull(),
  confirmationNumber: t.text(),
  status: customerStatusEnum().notNull(),
  source: t.text(),
  sourceDate: t.date(),
  soldById: t.text(),
  installDate: t.date(),
  locationId: t
    .integer()
    .references(() => location.id)
    .notNull(),
  organizationId: t.text().references(() => organization.id),
  ...baseFields,
}));

export const order = pgTable("order", (t) => ({
  id: t.serial().primaryKey(),
  type: orderTypeEnum().notNull(),
  status: orderStatusEnum().notNull(),
  cannotCompleteReason: orderCannotCompleteReasonEnum(),
  source: t.text(),
  sourceDate: t.date(),
  calculatedDuration: t.integer(),
  totalTimeWorked: t.integer(),
  salesNote: t.text(),
  techNote: t.text(),
  navigationNote: t.text(),
  customerId: t
    .integer()
    .references(() => customer.id)
    .notNull(),
  userId: t
    .text()
    .references(() => user.id)
    .notNull(),
  locationId: t.integer().references(() => location.id),
  organizationId: t.text().references(() => organization.id),
  ...baseFields,
}));

export const orderProduct = pgTable("order_product", (t) => ({
  id: t.serial().primaryKey(),
  status: orderProductStatusEnum().notNull(),
  confirmationStatus: orderProductConfirmationStatusEnum().notNull(),
  quantity: t.integer().notNull(),
  unitPrice: t.numeric({ precision: 10, scale: 2, mode: "number" }).notNull(),
  soldById: t.text(),
  productId: t
    .integer()
    .references(() => product.id)
    .notNull(),
  orderId: t
    .integer()
    .references(() => order.id)
    .notNull(),
  installedById: t.text().references(() => user.id),
  ...baseFields,
}));

export const orderHistory = pgTable("order_history", (t) => ({
  id: t.bigserial({ mode: "number" }).primaryKey(),
  orderId: t
    .integer()
    .references(() => order.id)
    .notNull(),
  dateTime: t.timestamp().notNull(),
  fieldChanged: t.text().notNull(),
  oldValue: t.text(),
  newValue: t.text(),
  userId: t
    .text()
    .references(() => user.id)
    .notNull(),
  ...baseFieldsReadOnly,
}));

// ============== Relations ==============

export const orderRelations = relations(order, ({ one, many }) => ({
  user: one(user, {
    fields: [order.userId],
    references: [user.id],
  }),
  location: one(location, {
    fields: [order.locationId],
    references: [location.id],
  }),
  organization: one(organization, {
    fields: [order.organizationId],
    references: [organization.id],
  }),
  customer: one(customer, {
    fields: [order.customerId],
    references: [customer.id],
  }),
  history: many(orderHistory),
  orderProducts: many(orderProduct),
}));

export const orderProductRelations = relations(orderProduct, ({ one }) => ({
  product: one(product, {
    fields: [orderProduct.productId],
    references: [product.id],
  }),
  order: one(order, {
    fields: [orderProduct.orderId],
    references: [order.id],
  }),
}));

export const customerRelations = relations(customer, ({ many }) => ({
  orders: many(order),
}));

export const orderHistoryRelations = relations(orderHistory, ({ one }) => ({
  order: one(order, {
    fields: [orderHistory.orderId],
    references: [order.id],
  }),
  user: one(user, {
    fields: [orderHistory.userId],
    references: [user.id],
  }),
}));

// ============== Schemas & Types ==============

export const insertOrderSchema = createInsertSchema(order);
export const selectOrderSchema = createSelectSchema(order);
export const updateOrderSchema = createUpdateSchema(order);
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type SelectOrder = z.infer<typeof selectOrderSchema>;
export type UpdateOrder = z.infer<typeof updateOrderSchema>;

export const insertCustomerSchema = createInsertSchema(customer);
export const selectCustomerSchema = createSelectSchema(customer);
export const updateCustomerSchema = createUpdateSchema(customer);
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type SelectCustomer = z.infer<typeof selectCustomerSchema>;
export type UpdateCustomer = z.infer<typeof updateCustomerSchema>;

export const insertOrderProductSchema = createInsertSchema(orderProduct);
export const selectOrderProductSchema = createSelectSchema(orderProduct);
export const updateOrderProductSchema = createUpdateSchema(orderProduct);
export type InsertOrderProduct = z.infer<typeof insertOrderProductSchema>;
export type SelectOrderProduct = z.infer<typeof selectOrderProductSchema>;
export type UpdateOrderProduct = z.infer<typeof updateOrderProductSchema>;

export const insertOrderHistorySchema = createInsertSchema(orderHistory);
export const selectOrderHistorySchema = createSelectSchema(orderHistory);
export type InsertOrderHistory = z.infer<typeof insertOrderHistorySchema>;
export type SelectOrderHistory = z.infer<typeof selectOrderHistorySchema>;
