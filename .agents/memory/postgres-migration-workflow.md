---
name: PostgreSQL migration workflow
description: Current development schema synchronization and migration artifact policy.
---

The development PostgreSQL database is synchronized with `drizzle-kit push` because it already contains data. A reviewable initial SQL migration is generated from the Core schema for fresh environments, but it must not be replayed against the current populated database without establishing migration history first.

**Why:** Replaying a create-table migration against the existing development database would fail or risk destructive reconciliation.

**How to apply:** Use `push` only for development schema synchronization and review the generated migration before choosing a production migration-history rollout.