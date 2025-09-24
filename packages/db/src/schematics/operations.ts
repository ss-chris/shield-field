import type { z } from "zod/v4";
import { relations } from "drizzle-orm";
import { pgEnum, pgTable } from "drizzle-orm/pg-core";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";

import { organization, user } from "./auth-schema";
import { baseFields, baseFieldsReadOnly } from "./base-fields";
import { location } from "./locations";

// ============== Enums ==============

export const workOrderStatusEnum = pgEnum("work_order_statuses", [
  "pending",
  "assigned",
  "in_progress",
  "completed",
  "cancelled",
]);

export const workOrderTypeEnum = pgEnum("work_order_types", [
  "installation",
  "maintenance",
  "repair",
  "inspection",
  "removal",
]);

// ============== Tables ==============

export const workOrder = pgTable("work_order", (t) => ({
  id: t.serial().primaryKey(),
  type: t.text(),
  status: t.text(),
  source: t.text(),
  sourceDate: t.date(),
  calculatedDuration: t.integer(),
  totalTimeWorked: t.integer(),
  salesNote: t.text(),
  techNote: t.text(),
  navigationNote: t.text(),
  userId: t.text().references(() => user.id),
  locationId: t.integer().references(() => location.id),
  organizationId: t.text().references(() => organization.id),
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
  history: many(workOrderHistory),
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
