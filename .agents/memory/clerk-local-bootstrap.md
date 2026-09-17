---
name: Clerk local user bootstrap
description: Development authentication bootstrap and local user synchronization rule.
---

The local user record is provisioned from the authenticated Clerk user through `externalId`; no local password or JWT authentication is used. A development user receives `system_admin` only when their Clerk user ID or email explicitly matches the server-side development allowlist; otherwise new users receive no role and no administrative scope.

**Why:** An automatic first-user promotion could grant administrative access to an unintended account, even without a password in source code.

**How to apply:** Preserve the Clerk session-cookie flow, configure the development allowlist outside the frontend, and treat PostgreSQL `users`, `user_roles`, and scope tables as the application authorization source.