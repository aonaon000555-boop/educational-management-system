import { createInsertSchema } from "drizzle-zod";
import { integer, pgTable, primaryKey, timestamp } from "drizzle-orm/pg-core";
import { z } from "zod/v4";
import { centersTable } from "./centers";
import { usersTable } from "./users";

export const userCenterScopesTable = pgTable("user_center_scopes", {
  userId: integer("user_id").notNull().references(() => usersTable.id),
  centerId: integer("center_id").notNull().references(() => centersTable.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  pk: primaryKey({ columns: [table.userId, table.centerId] }),
}));

export const insertUserCenterScopeSchema = createInsertSchema(userCenterScopesTable).omit({ createdAt: true });
export type InsertUserCenterScope = z.infer<typeof insertUserCenterScopeSchema>;
export type UserCenterScope = typeof userCenterScopesTable.$inferSelect;