---
name: Clerk local user bootstrap
description: Development authentication bootstrap and local user synchronization rule.
---

The local user record is provisioned from the authenticated Clerk user through `externalId`; no local password or JWT authentication is used. In a development database with no non-deleted users, the first authenticated Clerk user receives the `system_admin` role and organization-wide center scopes, and the provisioning is audit-logged.

**Why:** This enables a usable development environment without placing credentials in source code while keeping role and data-scope authority in PostgreSQL.

**How to apply:** Preserve the Clerk session-cookie flow and treat PostgreSQL `users`, `user_roles`, and scope tables as the application authorization source.