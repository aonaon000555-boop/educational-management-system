import { clerkClient, getAuth } from "@clerk/express";
import type { NextFunction, Request, RequestHandler, Response } from "express";
import { and, eq, sql } from "drizzle-orm";
import {
  centersTable,
  db,
  organizationsTable,
  rolesTable,
  userCenterScopesTable,
  userRolesTable,
  usersTable,
  type User,
} from "@workspace/db";
import { logger } from "./logger";
import { writeAuditLog } from "./audit";

export class AuthenticationError extends Error {
  readonly statusCode = 401;

  constructor(message = "Unauthorized") {
    super(message);
    this.name = "AuthenticationError";
  }
}

function getClerkEmail(clerkUser: { primaryEmailAddress?: { emailAddress: string } | null; emailAddresses: Array<{ emailAddress: string }> }, userId: string): string {
  return clerkUser.primaryEmailAddress?.emailAddress ?? clerkUser.emailAddresses[0]?.emailAddress ?? `${userId}@clerk.local`;
}

function getClerkDisplayName(clerkUser: { firstName: string | null; lastName: string | null }, email: string): string {
  const name = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ").trim();
  return name || email;
}

function isConfiguredDevelopmentSuperAdmin(clerkUserId: string, email: string): boolean {
  if (process.env.NODE_ENV === "production") {
    return false;
  }

  const configuredUserId = process.env.DEV_SUPER_ADMIN_CLERK_USER_ID?.trim();
  const configuredEmail = process.env.DEV_SUPER_ADMIN_EMAIL?.trim().toLowerCase();
  return (configuredUserId !== undefined && configuredUserId.length > 0 && configuredUserId === clerkUserId)
    || (configuredEmail !== undefined && configuredEmail.length > 0 && configuredEmail === email.toLowerCase());
}

export async function getOrProvisionLocalUser(req: Request): Promise<User> {
  const clerkUserId = getAuth(req).userId;
  if (!clerkUserId) {
    throw new AuthenticationError();
  }

  const [existingUser] = await db
    .select()
    .from(usersTable)
    .where(and(eq(usersTable.externalId, clerkUserId), sql`${usersTable.deletedAt} IS NULL`))
    .limit(1);
  if (existingUser) {
    return existingUser;
  }

  const clerkUser = await clerkClient.users.getUser(clerkUserId);
  const email = getClerkEmail(clerkUser, clerkUserId);
  const displayName = getClerkDisplayName(clerkUser, email);
  const [organization] = await db
    .select()
    .from(organizationsTable)
    .where(eq(organizationsTable.status, "active"))
    .limit(1);

  if (!organization) {
    throw new Error("No active organization is configured");
  }

  let provisionedUser: User | undefined;
  let provisionedAsSuperAdmin = false;
  let createdUser = false;

  await db.transaction(async (tx) => {
    await tx.execute(sql`select pg_advisory_xact_lock(918273645)`);

    const [alreadyProvisioned] = await tx
      .select()
      .from(usersTable)
      .where(eq(usersTable.externalId, clerkUserId))
      .limit(1);
    if (alreadyProvisioned) {
      provisionedUser = alreadyProvisioned;
      return;
    }

    const [systemAdminRole] = await tx
      .select()
      .from(rolesTable)
      .where(eq(rolesTable.code, "system_admin"))
      .limit(1);

    provisionedAsSuperAdmin = isConfiguredDevelopmentSuperAdmin(clerkUserId, email);
    const [insertedUser] = await tx
      .insert(usersTable)
      .values({
        organizationId: organization.id,
        roleId: provisionedAsSuperAdmin ? systemAdminRole?.id ?? null : null,
        externalId: clerkUserId,
        displayName,
        email,
        status: "active",
        createdBy: clerkUserId,
      })
      .returning();

    provisionedUser = insertedUser;
    createdUser = true;

    if (provisionedAsSuperAdmin && systemAdminRole) {
      await tx.insert(userRolesTable).values({
        userId: insertedUser.id,
        roleId: systemAdminRole.id,
        dataScope: "organization",
        createdBy: clerkUserId,
      });

      const centers = await tx
        .select({ id: centersTable.id })
        .from(centersTable)
        .where(eq(centersTable.organizationId, organization.id));
      if (centers.length > 0) {
        await tx.insert(userCenterScopesTable).values(
          centers.map((center) => ({
            userId: insertedUser.id,
            centerId: center.id,
          })),
        );
      }
    }

  });

  if (!provisionedUser) {
    throw new Error("Unable to provision local user");
  }

  if (provisionedAsSuperAdmin) {
    logger.info({ userId: provisionedUser.id }, "Provisioned development super admin");
  }

  if (createdUser) {
    await writeAuditLog({
      userId: provisionedUser.id,
      organizationId: organization.id,
      action: "provision",
      entity: "user",
      entityId: String(provisionedUser.id),
      metadata: {
        source: "clerk",
        provisionedAsSuperAdmin,
      },
    });
  }

  return provisionedUser;
}

export const requireLocalUser: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
  void getOrProvisionLocalUser(req)
    .then((user) => {
      res.locals.localUser = user;
      next();
    })
    .catch((error: unknown) => {
      if (error instanceof AuthenticationError) {
        res.status(error.statusCode).json({ error: error.message });
        return;
      }
      logger.error({ err: error }, "Failed to provision local user");
      res.status(500).json({ error: "Authentication provisioning failed" });
    });
};