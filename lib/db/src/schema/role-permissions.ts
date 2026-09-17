import { integer, pgTable, primaryKey } from "drizzle-orm/pg-core";
import { permissionsTable } from "./permissions";
import { rolesTable } from "./roles";

export const rolePermissionsTable = pgTable("role_permissions", {
  roleId: integer("role_id").notNull().references(() => rolesTable.id),
  permissionId: integer("permission_id").notNull().references(() => permissionsTable.id),
}, (table) => ({
  pk: primaryKey({ columns: [table.roleId, table.permissionId] }),
}));

export type RolePermission = typeof rolePermissionsTable.$inferSelect;