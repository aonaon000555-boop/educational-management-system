import { Router, type IRouter } from "express";
import { sql } from "drizzle-orm";
import { GetAccessContextResponse, GetDashboardSummaryResponse, ListCentersResponse } from "@workspace/api-zod";
import { db, auditLogsTable, centersTable, rolesTable, usersTable } from "@workspace/db";

const router: IRouter = Router();

router.get("/dashboard/summary", async (_req, res) => {
  const [centersCount, activeCentersCount, usersCount, rolesCount, auditEventsCount] =
    await Promise.all([
      db.select({ count: sql<number>`count(*)::int` }).from(centersTable),
      db.select({ count: sql<number>`count(*)::int` }).from(centersTable).where(sql`${centersTable.status} = 'active'`),
      db.select({ count: sql<number>`count(*)::int` }).from(usersTable),
      db.select({ count: sql<number>`count(*)::int` }).from(rolesTable),
      db.select({ count: sql<number>`count(*)::int` }).from(auditLogsTable),
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

router.get("/centers", async (_req, res) => {
  const centers = await db
    .select({
      id: centersTable.id,
      name: centersTable.name,
      code: centersTable.code,
      city: centersTable.city,
      status: centersTable.status,
    })
    .from(centersTable)
    .orderBy(centersTable.name);

  res.json(ListCentersResponse.parse(centers));
});

router.get("/access/context", (_req, res) => {
  res.json(
    GetAccessContextResponse.parse({
      authenticated: false,
      role: null,
      permissions: [],
      centerIds: [],
    }),
  );
});

export default router;