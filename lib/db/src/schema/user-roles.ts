import { createInsertSchema } from "drizzle-zod";
import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { z } from "zod/v4";
import { centersTable } from "./centers";
import { rolesTable } from "./roles";
import { usersTable } from "./users";

export const userRolesTable = pgTable("user_roles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  roleId: integer("role_id").notNull().references(() => rolesTable.id),
  centerId: integer("center_id").references(() => centersTable.id),
  dataScope: text("data_scope").notNull().default("organization"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  createdBy: text("created_by"),
});

export const insertUserRoleSchema = createInsertSchema(userRolesTable).omit({ id: true, createdAt: true });
export type InsertUserRole = z.infer<typeof insertUserRoleSchema>;
export type UserRole = typeof userRolesTable.$inferSelect;