import type { z } from "zod/v4";
import { relations } from "drizzle-orm";
import { pgTable } from "drizzle-orm/pg-core";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";

import { organization, user } from "./auth-schema";
import { baseFields, baseFieldsReadOnly } from "./base-fields";
import { operatingHoursPolicy } from "./scheduling";

// ============== Tables ==============

export const address = pgTable("address", (t) => ({
  id: t.serial().primaryKey(),
  line1: t.text().notNull(),
  line2: t.text(),
  line3: t.text(),
  city: t.text().notNull(),
  state: t.text().notNull(),
  stateCode: t.text().notNull(),
  zip: t.text().notNull(),
  county: t.text().notNull(),
  latitude: t.numeric({ precision: 12, scale: 9 }),
  longitude: t.numeric({ precision: 12, scale: 9 }),
  ...baseFields,
}));

export const location = pgTable("location", (t) => ({
  id: t.serial().primaryKey(),
  name: t.text().notNull(),
  addressId: t
    .integer()
    .references(() => address.id)
    .notNull(),
  organizationId: t
    .text()
    .references(() => organization.id)
    .notNull(),
  ...baseFields,
}));

export const territory = pgTable("territory", (t) => ({
  id: t.serial().primaryKey(),
  organizationId: t
    .text()
    .references(() => organization.id)
    .notNull(),
  name: t.text().notNull(),
  managerId: t
    .text()
    .references(() => user.id)
    .notNull(),
  color: t.text().default("#000").notNull(),
  polygon: t.jsonb().default({}).notNull(),
  active: t.boolean().default(true).notNull(),
  operatingHoursPolicyId: t.integer().references(() => operatingHoursPolicy.id),
  ...baseFields,
}));

export const camp = pgTable("camp", (t) => ({
  id: t.serial().primaryKey(),
  name: t.text().notNull(),
  address: t.text(),
  startDate: t.date(),
  endDate: t.date(),
  partnerDealer: t.text(),
  organizationId: t
    .text()
    .references(() => organization.id)
    .notNull(),
  territoryId: t
    .integer()
    .references(() => territory.id)
    .notNull(),
  ...baseFields,
}));

export const campHistory = pgTable("camp_history", (t) => ({
  id: t.serial().primaryKey(),
  dateTime: t.timestamp().notNull(),
  campId: t
    .integer()
    .references(() => camp.id)
    .notNull(),
  campName: t.text(),
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

export const addressRelations = relations(address, ({ many }) => ({
  locations: many(location),
}));

export const locationRelations = relations(location, ({ one }) => ({
  address: one(address, {
    fields: [location.addressId],
    references: [address.id],
  }),
  organization: one(organization, {
    fields: [location.organizationId],
    references: [organization.id],
  }),
}));

export const territoryRelations = relations(territory, ({ one, many }) => ({
  organization: one(organization, {
    fields: [territory.organizationId],
    references: [organization.id],
  }),
  manager: one(user, {
    fields: [territory.managerId],
    references: [user.id],
  }),
  operatingHoursPolicy: one(operatingHoursPolicy, {
    fields: [territory.operatingHoursPolicyId],
    references: [operatingHoursPolicy.id],
  }),
  camps: many(camp),
}));

export const campRelations = relations(camp, ({ one, many }) => ({
  organization: one(organization, {
    fields: [camp.organizationId],
    references: [organization.id],
  }),
  territory: one(territory, {
    fields: [camp.territoryId],
    references: [territory.id],
  }),
  history: many(campHistory),
}));

export const campHistoryRelations = relations(campHistory, ({ one }) => ({
  camp: one(camp, {
    fields: [campHistory.campId],
    references: [camp.id],
  }),
  user: one(user, {
    fields: [campHistory.userId],
    references: [user.id],
  }),
}));

// ============== Schemas & Types ==============

export const insertAddressSchema = createInsertSchema(address);
export const selectAddressSchema = createSelectSchema(address);
export const updateAddressSchema = createUpdateSchema(address);
export type InsertAddress = z.infer<typeof insertAddressSchema>;
export type SelectAddress = z.infer<typeof selectAddressSchema>;
export type UpdateAddress = z.infer<typeof updateAddressSchema>;

export const insertLocationSchema = createInsertSchema(location);
export const selectLocationSchema = createSelectSchema(location);
export const updateLocationSchema = createUpdateSchema(location);
export type InsertLocation = z.infer<typeof insertLocationSchema>;
export type SelectLocation = z.infer<typeof selectLocationSchema>;
export type UpdateLocation = z.infer<typeof updateLocationSchema>;

export const insertTerritorySchema = createInsertSchema(territory);
export const selectTerritorySchema = createSelectSchema(territory);
export const updateTerritorySchema = createUpdateSchema(territory);
export type InsertTerritory = z.infer<typeof insertTerritorySchema>;
export type SelectTerritory = z.infer<typeof selectTerritorySchema>;
export type UpdateTerritory = z.infer<typeof updateTerritorySchema>;

export const insertCampSchema = createInsertSchema(camp);
export const selectCampSchema = createSelectSchema(camp);
export const updateCampSchema = createUpdateSchema(camp);
export type InsertCamp = z.infer<typeof insertCampSchema>;
export type SelectCamp = z.infer<typeof selectCampSchema>;
export type UpdateCamp = z.infer<typeof updateCampSchema>;

export const insertCampHistorySchema = createInsertSchema(campHistory);
export const selectCampHistorySchema = createSelectSchema(campHistory);
export type InsertCampHistory = z.infer<typeof insertCampHistorySchema>;
export type SelectCampHistory = z.infer<typeof selectCampHistorySchema>;
