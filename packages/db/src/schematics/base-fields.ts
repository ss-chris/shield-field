import { boolean, timestamp } from "drizzle-orm/pg-core";

/**
 * Base fields that should be included in all tables
 * Provides createdAt, updatedAt, and isDeleted for soft deletes
 */
export const baseFields = {
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp()
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  isDeleted: boolean().default(false).notNull(),
};

/**
 * Alternative base fields without soft delete
 * Use this for tables that should never be soft deleted (e.g., audit logs)
 */
export const baseFieldsNoSoftDelete = {
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp()
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
};

/**
 * Minimal base fields for read-only or immutable records
 * Only includes createdAt
 */
export const baseFieldsReadOnly = {
  createdAt: timestamp().defaultNow().notNull(),
};
