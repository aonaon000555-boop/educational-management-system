import { auditLogsTable, db, type InsertAuditLog } from "@workspace/db";

export async function writeAuditLog(input: InsertAuditLog): Promise<void> {
  await db.insert(auditLogsTable).values(input);
}