import { createInsertSchema } from "drizzle-zod";
import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { z } from "zod/v4";

export const centersTable = pgTable("centers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
  city: text("city").notNull(),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertCenterSchema = createInsertSchema(centersTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertCenter = z.infer<typeof insertCenterSchema>;
export type Center = typeof centersTable.$inferSelect;