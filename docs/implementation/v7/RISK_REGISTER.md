# Risk Register — BCP V7.0

| ID | Risk Description | Likelihood | Impact | Mitigation / Current State |
|---|---|---|---|---|
| R-01 | `20261127000000_v7_executive_hardening` SQL migration not yet run against live PostgreSQL | Certain (Sandbox) | High if deployed unmigrated | Migration validated via `prisma validate`; `npx prisma migrate deploy` explicitly listed as blocking pre-production rollout gate |
| R-02 | Live cloud S3/Supabase credentials not present in sandbox | Medium | High in production | Server fails closed (`503 STORAGE_NOT_CONFIGURED`) rather than silently storing customer PII documents on ephemeral disk |
| R-03 | Unaudited commit history between `a07062c` and current baseline (`.git` missing in container) | Low | Medium | Must inspect `git log a07062c..HEAD` in connected repository before merging `feature/bcp-v7-signature-finalization` |
| R-04 | Book inventory reservation expiry (`Order.reservedUntil`) cleanup without scheduled cron | Low | Low | `reservedUntil` timestamp persisted on checkout; add scheduled cleanup worker if high-concurrency physical inventory traffic grows |
| R-05 | Next.js dev mode file watcher triggers fast-refresh rebuilds when automated tools write artifacts under project root | Low (Dev only) | None in prod | Production builds (`next build` + `next start`) do not watch filesystem |
