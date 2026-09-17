import assert from "node:assert/strict";
import { and, eq, inArray } from "drizzle-orm";
import {
  auditLogsTable,
  centersTable,
  db,
  organizationsTable,
  rolesTable,
  userCenterScopesTable,
  userRolesTable,
  usersTable,
} from "@workspace/db";
import { getUserCenterScope, userHasPermission } from "./authorization";
import { writeAuditLog } from "./audit";

const testExternalId = `rbac-verification-${Date.now()}`;

async function main(): Promise<void> {
  const [organization] = await db
    .select({ id: organizationsTable.id })
    .from(organizationsTable)
    .where(eq(organizationsTable.code, "EDU-CENTRAL"))
    .limit(1);
  assert.ok(organization, "seed organization must exist");

  const centers = await db
    .select({ id: centersTable.id })
    .from(centersTable)
    .where(eq(centersTable.organizationId, organization.id))
    .orderBy(centersTable.id)
    .limit(2);
  assert.ok(centers.length >= 2, "scope verification needs two centers");

  const [centerManagerRole] = await db
    .select({ id: rolesTable.id })
    .from(rolesTable)
    .where(eq(rolesTable.code, "center_manager"))
    .limit(1);
  assert.ok(centerManagerRole, "center_manager role must exist");

  const [testUser] = await db
    .insert(usersTable)
    .values({
      organizationId: organization.id,
      externalId: testExternalId,
      displayName: "RBAC Verification User",
      email: `${testExternalId}@example.invalid`,
      status: "active",
    })
    .returning();
  assert.ok(testUser);

  const [auditLog] = await db
    .insert(auditLogsTable)
    .values({
      userId: testUser.id,
      organizationId: organization.id,
      centerId: centers[0].id,
      action: "test",
      entity: "rbac_verification",
      entityId: testExternalId,
    })
    .returning();

  try {
    await db.insert(userRolesTable).values({
      userId: testUser.id,
      roleId: centerManagerRole.id,
      centerId: centers[0].id,
      dataScope: "center",
    });

    assert.equal(await userHasPermission(testUser.id, "centers.view"), true);
    assert.equal(await userHasPermission(testUser.id, "roles.manage"), false);

    const scope = await getUserCenterScope(testUser.id);
    assert.equal(scope.organizationWide, false);
    assert.deepEqual(scope.centerIds, [centers[0].id]);
    assert.equal(scope.centerIds.includes(centers[1].id), false);

    const accessibleCenters = await db
      .select({ id: centersTable.id })
      .from(centersTable)
      .where(and(
        eq(centersTable.organizationId, organization.id),
        inArray(centersTable.id, scope.centerIds),
      ));
    assert.deepEqual(accessibleCenters.map((center) => center.id), [centers[0].id]);

    await writeAuditLog({
      userId: testUser.id,
      organizationId: organization.id,
      centerId: centers[0].id,
      action: "test_helper",
      entity: "rbac_verification",
      entityId: testExternalId,
    });

    console.log("RBAC verification passed: permission and center scope denied cross-center access.");
  } finally {
    await db.delete(auditLogsTable).where(eq(auditLogsTable.entityId, testExternalId));
    await db.delete(userCenterScopesTable).where(eq(userCenterScopesTable.userId, testUser.id));
    await db.delete(userRolesTable).where(eq(userRolesTable.userId, testUser.id));
    await db.delete(usersTable).where(eq(usersTable.id, testUser.id));
  }
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    const { pool } = await import("@workspace/db");
    await pool.end();
  });