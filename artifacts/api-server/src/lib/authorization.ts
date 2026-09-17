import { and, eq } from "drizzle-orm";
import type { NextFunction, Request, RequestHandler, Response } from "express";
import {
  db,
  permissionsTable,
  rolePermissionsTable,
  userCenterScopesTable,
  userRolesTable,
  type User,
} from "@workspace/db";

export async function userHasPermission(userId: number, permissionCode: string): Promise<boolean> {
  const [permission] = await db
    .select({ id: permissionsTable.id })
    .from(userRolesTable)
    .innerJoin(rolePermissionsTable, eq(rolePermissionsTable.roleId, userRolesTable.roleId))
    .innerJoin(permissionsTable, and(
      eq(permissionsTable.id, rolePermissionsTable.permissionId),
      eq(permissionsTable.code, permissionCode),
    ))
    .where(eq(userRolesTable.userId, userId))
    .limit(1);
  return Boolean(permission);
}

export function requirePermission(permissionCode: string): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = res.locals.localUser as User | undefined;
    if (!user) {
      res.status(500).json({ error: "Local user context is missing" });
      return;
    }
    void userHasPermission(user.id, permissionCode)
      .then((allowed) => {
        if (!allowed) {
          res.status(403).json({ error: "Forbidden" });
          return;
        }
        next();
      })
      .catch(next);
  };
}

export async function getUserCenterScope(userId: number): Promise<{ organizationWide: boolean; centerIds: number[] }> {
  const assignments = await db
    .select({ dataScope: userRolesTable.dataScope, centerId: userRolesTable.centerId })
    .from(userRolesTable)
    .where(eq(userRolesTable.userId, userId));
  const directScopes = await db
    .select({ centerId: userCenterScopesTable.centerId })
    .from(userCenterScopesTable)
    .where(eq(userCenterScopesTable.userId, userId));
  const centerIds = [...assignments.map((assignment) => assignment.centerId), ...directScopes.map((scope) => scope.centerId)]
    .filter((centerId): centerId is number => centerId !== null)
    .filter((centerId, index, values) => values.indexOf(centerId) === index);
  return {
    organizationWide: assignments.some((assignment) => assignment.dataScope === "organization"),
    centerIds,
  };
}