import { Router, type IRouter } from "express";
import { eq, sql } from "drizzle-orm";
import { GetAccessContextResponse, GetDashboardSummaryResponse, ListCentersResponse } from "@workspace/api-zod";
import { db, auditLogsTable, centersTable, permissionsTable, rolePermissionsTable, rolesTable, userCenterScopesTable, userRolesTable, usersTable, type User } from "@workspace/db";
import { requireLocalUser } from "../lib/auth";
import { getUserCenterScope, requirePermission } from "../lib/authorization";

const router: IRouter = Router();

router.get("/dashboard/summary", requireLocalUser, requirePermission("organization.view"), async (_req, res): Promise<void> => {
  const user = res.locals.localUser as User;
  const scope = await getUserCenterScope(user.id);
  const centerScope = scope.organizationWide
    ? sql`${centersTable.organizationId} = ${user.organizationId}`
    : scope.centerIds.length > 0
      ? sql`${centersTable.organizationId} = ${user.organizationId} AND ${centersTable.id} IN (${sql.join(scope.centerIds.map((id) => sql`${id}`), sql`, `)})`
      : sql`false`;
  const [centersCount, activeCentersCount, usersCount, rolesCount, auditEventsCount] =
    await Promise.all([
      db.select({ count: sql<number>`count(*)::int` }).from(centersTable).where(sql`${centerScope} AND ${centersTable.deletedAt} IS NULL`),
      db.select({ count: sql<number>`count(*)::int` }).from(centersTable).where(sql`${centerScope} AND ${centersTable.status} = 'active' AND ${centersTable.deletedAt} IS NULL`),
      db.select({ count: sql<number>`count(*)::int` }).from(usersTable).where(sql`${usersTable.organizationId} = ${user.organizationId} AND ${usersTable.deletedAt} IS NULL`),
      db.select({ count: sql<number>`count(*)::int` }).from(rolesTable).where(sql`${rolesTable.organizationId} = ${user.organizationId} OR ${rolesTable.organizationId} IS NULL`),
      db.select({ count: sql<number>`count(*)::int` }).from(auditLogsTable).where(sql`${auditLogsTable.organizationId} = ${user.organizationId}`),
    ]);

  const data = GetDashboardSummaryResponse.parse({
    centersCount: centersCount[0]?.count ?? 0,
    activeCentersCount: activeCentersCount[0]?.count ?? 0,
    usersCount: usersCount[0]?.count ?? 0,
    rolesCount: rolesCount[0]?.count ?? 0,
    auditEventsCount: auditEventsCount[0]?.count ?? 0,
    setupStatus: "foundation",
  });
  res.json(data);
});

router.get("/centers", requireLocalUser, requirePermission("centers.view"), async (_req, res): Promise<void> => {
  const user = res.locals.localUser as User;
  const scope = await getUserCenterScope(user.id);
  if (!scope.organizationWide && scope.centerIds.length === 0) {
    res.json([]);
    return;
  }
  const centers = await db
    .select({
      id: centersTable.id,
      name: centersTable.name,
      code: centersTable.code,
      city: centersTable.city,
      status: centersTable.status,
    })
    .from(centersTable)
    .where(scope.organizationWide
      ? sql`${centersTable.organizationId} = ${user.organizationId} AND ${centersTable.deletedAt} IS NULL`
      : sql`${centersTable.organizationId} = ${user.organizationId} AND ${centersTable.deletedAt} IS NULL AND ${centersTable.id} IN (${sql.join(scope.centerIds.map((id) => sql`${id}`), sql`, `)})`)
    .orderBy(centersTable.name);

  res.json(ListCentersResponse.parse(centers));
});

router.get("/access/context", requireLocalUser, async (_req, res): Promise<void> => {
  const user = res.locals.localUser as User;
  const assignments = await db
    .select({
      role: rolesTable.code,
      permission: permissionsTable.code,
      centerId: userRolesTable.centerId,
    })
    .from(userRolesTable)
    .innerJoin(rolesTable, eq(rolesTable.id, userRolesTable.roleId))
    .leftJoin(rolePermissionsTable, eq(rolePermissionsTable.roleId, rolesTable.id))
    .leftJoin(permissionsTable, eq(permissionsTable.id, rolePermissionsTable.permissionId))
    .where(sql`${userRolesTable.userId} = ${user.id}`);
  const directScopes = await db
    .select({ centerId: userCenterScopesTable.centerId })
    .from(userCenterScopesTable)
    .where(sql`${userCenterScopesTable.userId} = ${user.id}`);
  const centerIds = [...assignments.map((assignment) => assignment.centerId), ...directScopes.map((scope) => scope.centerId)]
    .filter((centerId): centerId is number => centerId !== null)
    .filter((centerId, index, values) => values.indexOf(centerId) === index);
  const role = assignments[0]?.role ?? null;
  const permissions = assignments
    .map((assignment) => assignment.permission)
    .filter((permission): permission is string => permission !== null)
    .filter((permission, index, values) => values.indexOf(permission) === index);

  res.json(GetAccessContextResponse.parse({
    authenticated: true,
    role,
    permissions,
    centerIds,
  }));
});

export default router;