# Production & Staging Deployment Checklist — BCP V7.0

## Pre-Deployment Verification (Completed In Codebase)
- [x] `bun.lock` removed; `package-lock.json` standardized (`postinstall: prisma generate`).
- [x] `npm run typecheck` (`0` errors), `npm run lint` (`0` errors, `0` warnings), `npm test` (`18` files / `118` tests), `tsx --test src/lib/three/timing.test.ts` (`3/3`), `npm run catalogue:dry-run` (`437` records / `27` categories), `npm run build` (**PASSED**).
- [x] Executive Lavender desktop (`1440×900`) and mobile (`390×844`, `320×568`) browser checks verified via `playwright-cli`.

## Staging / Production Rollout Gates (Operator Actions Required)
- [ ] Configure `DATABASE_URL`, `DIRECT_URL`, independent `CUSTOMER_SESSION_SECRET` & `ADMIN_SESSION_SECRET`, and `HEALTHCHECK_TOKEN`.
- [ ] Configure `PRIVATE_STORAGE_PROVIDER=S3` or `SUPABASE` with bucket, endpoint, and private credentials (`ALLOW_EPHEMERAL_PRIVATE_STORAGE` unset).
- [ ] Verify `SANDBOX_PAYMENTS_ENABLED` is unset/`false` in production.
- [ ] Execute `npx prisma migrate deploy` to apply `20261127000000_v7_executive_hardening`.
- [ ] Execute `npm run db:seed` and `npm run catalogue:import` against staging PostgreSQL.
- [ ] Run `npm run test:e2e` against the migrated staging instance.
- [ ] Verify authenticated `/api/health` with `Authorization: Bearer $HEALTHCHECK_TOKEN` returns `database: "connected"` and `privateStorage.configured: true`.
- [ ] Confirm GitHub branch (`feature/bcp-v7-signature-finalization`) diff vs `a07062c` cleanly prior to merging into `main` for Vercel deployment (`w9h-engineering`).
