import type { z } from "zod/v4";
import { relations } from "drizzle-orm";
import { pgEnum, pgTable } from "drizzle-orm/pg-core";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";

import { organization } from "./auth";
import { baseFields } from "./base-fields";
import { location } from "./locations";
import { customer, order } from "./operations";

// ============== Enums ==============

export const appointmentStatusEnum = pgEnum("appointment_statuses", [
  "pending",
  "scheduled",
  "onRoute",
  "in_progress",
  "completed",
  "cancelled",
]);

// ============== Tables ==============

export const appointment = pgTable("appointment", (t) => ({
  id: t.serial().primaryKey(),
  externalId: t.text(),
  status: appointmentStatusEnum().notNull(),
  locationId: t.integer().references(() => location.id),
  customerId: t.integer().references(() => customer.id),
  orderId: t.integer().references(() => order.id),
  organizationId: t.text().references(() => organization.id),
  ...baseFields,
}));

/**
 * Defines the PATTERN for creating windows. This is the core of the dynamic
 * generation. It does NOT store start/end times, only the rules.
 * e.g., { name: "4-Hour Slots", duration: 240, step: 240 }
 */
export const arrivalWindowTemplate = pgTable(
  "arrival_window_template",
  (t) => ({
    id: t.integer().primaryKey().generatedAlwaysAsIdentity(),
    organizationId: t
      .text()
      .references(() => organization.id, { onDelete: "cascade" })
      .notNull(),
    name: t.text().notNull(),
    durationMinutes: t.integer().notNull(), //The length of each generated window, in minutes.
    stepMinutes: t.integer().notNull(), //The time between the start of one window and the start of the next, in minutes.
    ...baseFields,
  }),
);

/**
 * Operating Hours
 * Stores open and close times for each day of the week in a collection.
 */
export const operatingHoursPolicy = pgTable("operating_hours_policy", (t) => ({
  id: t.integer().primaryKey().generatedAlwaysAsIdentity(),
  organizationId: t
    .text()
    .references(() => organization.id, { onDelete: "cascade" })
    .notNull(),
  name: t.text().notNull(), // e.g., "Weekday Business Hours", "Weekend Service"
  ...baseFields,
}));

export const operatingHoursPolicyRule = pgTable(
  "operating_hours_policy_rule",
  (t) => ({
    id: t.integer().primaryKey().generatedAlwaysAsIdentity(),
    policyId: t // ISO 8601 standard: 1 = Monday, ..., 7 = Sunday
      .integer()
      .references(() => operatingHoursPolicy.id, { onDelete: "cascade" })
      .notNull(),
    dayOfWeek: t.smallint().notNull(),
    openTime: t.time({ withTimezone: false }).notNull(), // 24-hour HH:MM:SS
    closeTime: t.time({ withTimezone: false }).notNull(), // 24-hour HH:MM:SS
    earliestLeaveHomeTime: t.time({ withTimezone: false }).notNull(), // 24-hour HH:MM:SS
    latestReturnHomeTime: t.time({ withTimezone: false }).notNull(), // 24-hour HH:MM:SS
    ...baseFields,
  }),
);

/**
 * SchedulingPolicy
 * Wraps Operating Hours and Arrival Windows into one "Policy"
 * This policy is intended to be attached to each level of org hierarchy in the operaitons/locaitons.
 * Can be as granular or broad as a user wants.
 */

export const schedulingPolicy = pgTable("scheduling_policy", (t) => ({
  id: t.integer().primaryKey().generatedAlwaysAsIdentity(),
  organizationId: t
    .text()
    .references(() => organization.id, { onDelete: "cascade" })
    .notNull(),
  name: t.text().notNull(), // e.g., "Standard Service", "Peak Season"
  arrivalWindowTemplateId: t
    .integer()
    .references(() => arrivalWindowTemplate.id)
    .notNull(),
  operatingHoursPolicyId: t
    .integer()
    .references(() => operatingHoursPolicy.id)
    .notNull(),
  ...baseFields,
}));

// ============== Relations ==============

export const schedulingPolicyRelations = relations(
  schedulingPolicy,
  ({ one }) => ({
    arrivalWindowTemplate: one(arrivalWindowTemplate, {
      fields: [schedulingPolicy.arrivalWindowTemplateId],
      references: [arrivalWindowTemplate.id],
    }),
    operatingHoursPolicy: one(operatingHoursPolicy, {
      fields: [schedulingPolicy.operatingHoursPolicyId],
      references: [operatingHoursPolicy.id],
    }),
    organization: one(organization, {
      fields: [schedulingPolicy.organizationId],
      references: [organization.id],
    }),
  }),
);

export const arrivalWindowTemplateRelations = relations(
  arrivalWindowTemplate,
  ({ one, many }) => ({
    organization: one(organization, {
      fields: [arrivalWindowTemplate.organizationId],
      references: [organization.id],
    }),
    schedulingPolicies: many(schedulingPolicy),
  }),
);

export const operatingHoursPolicyRelations = relations(
  operatingHoursPolicy,
  ({ one, many }) => ({
    organization: one(organization, {
      fields: [operatingHoursPolicy.organizationId],
      references: [organization.id],
    }),
    rules: many(operatingHoursPolicyRule),
    schedulingPolicies: many(schedulingPolicy),
  }),
);

export const operatingHoursPolicyRuleRelations = relations(
  operatingHoursPolicyRule,
  ({ one }) => ({
    policy: one(operatingHoursPolicy, {
      fields: [operatingHoursPolicyRule.policyId],
      references: [operatingHoursPolicy.id],
    }),
  }),
);

export type operatingHoursPolicyInsert =
  typeof operatingHoursPolicy.$inferInsert;

export type operatingHoursPolicyRuleInsert =
  typeof operatingHoursPolicyRule.$inferInsert;

export type arrivalWindowTemplateInsert =
  typeof arrivalWindowTemplate.$inferInsert;

// ============== Schemas & Types ==============

export const insertArrivalWindowTemplateSchema = createInsertSchema(
  arrivalWindowTemplate,
);
export const selectArrivalWindowTemplateSchema = createSelectSchema(
  arrivalWindowTemplate,
);
export const updateArrivalWindowTemplateSchema = createUpdateSchema(
  arrivalWindowTemplate,
);
export type InsertArrivalWindowTemplate = z.infer<
  typeof insertArrivalWindowTemplateSchema
>;
export type SelectArrivalWindowTemplate = z.infer<
  typeof selectArrivalWindowTemplateSchema
>;
export type UpdateArrivalWindowTemplate = z.infer<
  typeof updateArrivalWindowTemplateSchema
>;

export const insertAppointmentSchema = createInsertSchema(appointment);
export const selectAppointmentSchema = createSelectSchema(appointment);
export const updateAppointmentSchema = createUpdateSchema(appointment);
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type SelectAppointment = z.infer<typeof selectAppointmentSchema>;
export type UpdateAppointment = z.infer<typeof updateAppointmentSchema>;

export const insertOperatingHoursPolicySchema =
  createInsertSchema(operatingHoursPolicy);
export const selectOperatingHoursPolicySchema =
  createSelectSchema(operatingHoursPolicy);
export const updateOperatingHoursPolicySchema =
  createUpdateSchema(operatingHoursPolicy);
export type InsertOperatingHoursPolicy = z.infer<
  typeof insertOperatingHoursPolicySchema
>;
export type SelectOperatingHoursPolicy = z.infer<
  typeof selectOperatingHoursPolicySchema
>;
export type UpdateOperatingHoursPolicy = z.infer<
  typeof updateOperatingHoursPolicySchema
>;

export const insertOperatingHoursPolicyRuleSchema = createInsertSchema(
  operatingHoursPolicyRule,
);
export const selectOperatingHoursPolicyRuleSchema = createSelectSchema(
  operatingHoursPolicyRule,
);
export const updateOperatingHoursPolicyRuleSchema = createUpdateSchema(
  operatingHoursPolicyRule,
);
export type InsertOperatingHoursPolicyRule = z.infer<
  typeof insertOperatingHoursPolicyRuleSchema
>;
export type SelectOperatingHoursPolicyRule = z.infer<
  typeof selectOperatingHoursPolicyRuleSchema
>;
export type UpdateOperatingHoursPolicyRule = z.infer<
  typeof updateOperatingHoursPolicyRuleSchema
>;

export const insertSchedulingPolicySchema =
  createInsertSchema(schedulingPolicy);
export const selectSchedulingPolicySchema =
  createSelectSchema(schedulingPolicy);
export const updateSchedulingPolicySchema =
  createUpdateSchema(schedulingPolicy);
export type InsertSchedulingPolicy = z.infer<
  typeof insertSchedulingPolicySchema
>;
export type SelectSchedulingPolicy = z.infer<
  typeof selectSchedulingPolicySchema
>;
export type UpdateSchedulingPolicy = z.infer<
  typeof updateSchedulingPolicySchema
>;
