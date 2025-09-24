import type { z } from "zod/v4";
import { relations } from "drizzle-orm";
import { pgTable } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

import { baseFields } from "./base-fields";

// ============== Tables ==============

export const user = pgTable("user", (t) => ({
  id: t.text("id").primaryKey(),
  name: t.text("name").notNull(),
  email: t.text("email").notNull().unique(),
  emailVerified: t.boolean("email_verified").default(false).notNull(),
  image: t.text("image"),
  ...baseFields,
}));

export const session = pgTable("session", (t) => ({
  id: t.text("id").primaryKey(),
  expiresAt: t.timestamp("expires_at").notNull(),
  token: t.text("token").notNull().unique(),
  ipAddress: t.text("ip_address"),
  userAgent: t.text("user_agent"),
  userId: t
    .text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  activeOrganizationId: t.text("active_organization_id"),
  ...baseFields,
}));

export const account = pgTable("account", (t) => ({
  id: t.text("id").primaryKey(),
  accountId: t.text("account_id").notNull(),
  providerId: t.text("provider_id").notNull(),
  userId: t
    .text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: t.text("access_token"),
  refreshToken: t.text("refresh_token"),
  idToken: t.text("id_token"),
  accessTokenExpiresAt: t.timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: t.timestamp("refresh_token_expires_at"),
  scope: t.text("scope"),
  password: t.text("password"),
  ...baseFields,
}));

export const verification = pgTable("verification", (t) => ({
  id: t.text("id").primaryKey(),
  identifier: t.text("identifier").notNull(),
  value: t.text("value").notNull(),
  expiresAt: t.timestamp("expires_at").notNull(),
  ...baseFields,
}));

export const organization = pgTable("organization", (t) => ({
  id: t.text("id").primaryKey(),
  name: t.text("name").notNull(),
  slug: t.text("slug").unique(),
  logo: t.text("logo"),
  metadata: t.text("metadata"),
  ...baseFields,
}));

export const member = pgTable("member", (t) => ({
  id: t.text("id").primaryKey(),
  organizationId: t
    .text("organization_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  userId: t
    .text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  role: t.text("role").default("member").notNull(),
  ...baseFields,
}));

export const invitation = pgTable("invitation", (t) => ({
  id: t.text("id").primaryKey(),
  organizationId: t
    .text("organization_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  email: t.text("email").notNull(),
  role: t.text("role"),
  status: t.text("status").default("pending").notNull(),
  expiresAt: t.timestamp("expires_at").notNull(),
  inviterId: t
    .text("inviter_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  ...baseFields,
}));

export const ssoProvider = pgTable("sso_provider", (t) => ({
  id: t.text("id").primaryKey(),
  issuer: t.text("issuer").notNull(),
  oidcConfig: t.text("oidc_config"),
  samlConfig: t.text("saml_config"),
  userId: t.text("user_id").references(() => user.id, { onDelete: "cascade" }),
  providerId: t.text("provider_id").notNull().unique(),
  organizationId: t.text("organization_id"),
  domain: t.text("domain").notNull(),
}));

// ============== Relations ==============

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  members: many(member),
  invitations: many(invitation),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
  activeOrganization: one(organization, {
    fields: [session.activeOrganizationId],
    references: [organization.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

export const organizationRelations = relations(organization, ({ many }) => ({
  members: many(member),
  invitations: many(invitation),
  activeSessions: many(session),
}));

export const memberRelations = relations(member, ({ one }) => ({
  organization: one(organization, {
    fields: [member.organizationId],
    references: [organization.id],
  }),
  user: one(user, {
    fields: [member.userId],
    references: [user.id],
  }),
}));

export const invitationRelations = relations(invitation, ({ one }) => ({
  organization: one(organization, {
    fields: [invitation.organizationId],
    references: [organization.id],
  }),
  inviter: one(user, {
    fields: [invitation.inviterId],
    references: [user.id],
  }),
}));

// ============== Schemas & Types ==============

export const insertUserSchema = createInsertSchema(user);
export const selectUserSchema = createSelectSchema(user);
export type InsertUser = z.infer<typeof insertUserSchema>;
export type SelectUser = z.infer<typeof selectUserSchema>;

export const insertSessionSchema = createInsertSchema(session);
export const selectSessionSchema = createSelectSchema(session);
export type InsertSession = z.infer<typeof insertSessionSchema>;
export type SelectSession = z.infer<typeof selectSessionSchema>;

export const insertAccountSchema = createInsertSchema(account);
export const selectAccountSchema = createSelectSchema(account);
export type InsertAccount = z.infer<typeof insertAccountSchema>;
export type SelectAccount = z.infer<typeof selectAccountSchema>;

export const insertVerificationSchema = createInsertSchema(verification);
export const selectVerificationSchema = createSelectSchema(verification);
export type InsertVerification = z.infer<typeof insertVerificationSchema>;
export type SelectVerification = z.infer<typeof selectVerificationSchema>;

export const insertOrganizationSchema = createInsertSchema(organization);
export const selectOrganizationSchema = createSelectSchema(organization);
export type InsertOrganization = z.infer<typeof insertOrganizationSchema>;
export type SelectOrganization = z.infer<typeof selectOrganizationSchema>;

export const insertMemberSchema = createInsertSchema(member);
export const selectMemberSchema = createSelectSchema(member);
export type InsertMember = z.infer<typeof insertMemberSchema>;
export type SelectMember = z.infer<typeof selectMemberSchema>;

export const insertInvitationSchema = createInsertSchema(invitation);
export const selectInvitationSchema = createSelectSchema(invitation);
export type InsertInvitation = z.infer<typeof insertInvitationSchema>;
export type SelectInvitation = z.infer<typeof selectInvitationSchema>;
