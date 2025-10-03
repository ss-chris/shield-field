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

export const workOrderStatusEnum = pgEnum("work_order_statuses", [
  "pending",
  "assigned",
  "in_progress",
  "completed",
  "cancelled",
]);

export const workOrderCannotCompleteReasonEnum = pgEnum(
  "work_order_cannot_complete_reasons",
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

export const workOrderTypeEnum = pgEnum("work_order_types", [
  "installation",
  "maintenance",
  "repair",
  "inspection",
  "removal",
]);

export const workOrderLineItemStatusEnum = pgEnum(
  "work_order_line_item_statuses",
  [
    "completed_mounted_and_programmed",
    "canceled_not_used",
    "left_not_mounted_or_programmed",
    "mounted_not_programmed",
    "ordered_out_of_stock",
    "programmed_hvac_needed",
    "programmed_not_installed",
  ],
);

export const workOrderLineItemConfirmationStatusEnum = pgEnum(
  "work_order_line_item_confirmation_statuses",
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

export const workOrder = pgTable("work_order", (t) => ({
  id: t.serial().primaryKey(),
  type: workOrderTypeEnum().notNull(),
  status: workOrderStatusEnum().notNull(),
  cannotCompleteReason: workOrderCannotCompleteReasonEnum(),
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

export const workOrderLineItem = pgTable("work_order_line_item", (t) => ({
  id: t.serial().primaryKey(),
  status: workOrderLineItemStatusEnum().notNull(),
  confirmationStatus: workOrderLineItemConfirmationStatusEnum().notNull(),
  quantity: t.integer().notNull(),
  unitPrice: t.numeric({ precision: 10, scale: 2, mode: "number" }).notNull(),
  soldById: t.text(),
  productId: t
    .integer()
    .references(() => product.id)
    .notNull(),
  workOrderId: t
    .integer()
    .references(() => workOrder.id)
    .notNull(),
  installedById: t.text().references(() => user.id),
  ...baseFields,
}));

export const workOrderHistory = pgTable("work_order_history", (t) => ({
  id: t.bigserial({ mode: "number" }).primaryKey(),
  workOrderId: t
    .integer()
    .references(() => workOrder.id)
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

export const workOrderRelations = relations(workOrder, ({ one, many }) => ({
  user: one(user, {
    fields: [workOrder.userId],
    references: [user.id],
  }),
  location: one(location, {
    fields: [workOrder.locationId],
    references: [location.id],
  }),
  organization: one(organization, {
    fields: [workOrder.organizationId],
    references: [organization.id],
  }),
  customer: one(customer, {
    fields: [workOrder.customerId],
    references: [customer.id],
  }),
  history: many(workOrderHistory),
  workOrderLineItems: many(workOrderLineItem),
}));

export const workOrderHistoryRelations = relations(
  workOrderHistory,
  ({ one }) => ({
    workOrder: one(workOrder, {
      fields: [workOrderHistory.workOrderId],
      references: [workOrder.id],
    }),
    user: one(user, {
      fields: [workOrderHistory.userId],
      references: [user.id],
    }),
  }),
);

// ============== Schemas & Types ==============

export const insertWorkOrderSchema = createInsertSchema(workOrder);
export const selectWorkOrderSchema = createSelectSchema(workOrder);
export const updateWorkOrderSchema = createUpdateSchema(workOrder);
export type InsertWorkOrder = z.infer<typeof insertWorkOrderSchema>;
export type SelectWorkOrder = z.infer<typeof selectWorkOrderSchema>;
export type UpdateWorkOrder = z.infer<typeof updateWorkOrderSchema>;

export const insertCustomerSchema = createInsertSchema(customer);
export const selectCustomerSchema = createSelectSchema(customer);
export const updateCustomerSchema = createUpdateSchema(customer);
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type SelectCustomer = z.infer<typeof selectCustomerSchema>;
export type UpdateCustomer = z.infer<typeof updateCustomerSchema>;

export const insertWorkOrderLineItemSchema =
  createInsertSchema(workOrderLineItem);
export const selectWorkOrderLineItemSchema =
  createSelectSchema(workOrderLineItem);
export const updateWorkOrderLineItemSchema =
  createUpdateSchema(workOrderLineItem);
export type InsertWorkOrderLineItem = z.infer<
  typeof insertWorkOrderLineItemSchema
>;
export type SelectWorkOrderLineItem = z.infer<
  typeof selectWorkOrderLineItemSchema
>;
export type UpdateWorkOrderLineItem = z.infer<
  typeof updateWorkOrderLineItemSchema
>;

export const insertWorkOrderHistorySchema =
  createInsertSchema(workOrderHistory);
export const selectWorkOrderHistorySchema =
  createSelectSchema(workOrderHistory);
export type InsertWorkOrderHistory = z.infer<
  typeof insertWorkOrderHistorySchema
>;
export type SelectWorkOrderHistory = z.infer<
  typeof selectWorkOrderHistorySchema
>;
