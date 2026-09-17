import { createInsertSchema } from "drizzle-zod";
import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { z } from "zod/v4";
import { centersTable } from "./centers";
import { organizationsTable } from "./organizations";

export const educationalStagesTable = pgTable("educational_stages", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull().references(() => organizationsTable.id),
  centerId: integer("center_id").references(() => centersTable.id),
  name: text("name").notNull(),
  code: text("code").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
  createdBy: text("created_by"),
  updatedBy: text("updated_by"),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  deletedBy: text("deleted_by"),
});

export const insertEducationalStageSchema = createInsertSchema(educationalStagesTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
});
export type InsertEducationalStage = z.infer<typeof insertEducationalStageSchema>;
export type EducationalStage = typeof educationalStagesTable.$inferSelect;