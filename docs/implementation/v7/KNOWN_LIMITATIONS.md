# Known Limitations & External Blockers — BCP V7.0

In accordance with strict release governance honesty rules, items that could not be verified inside the sandbox container are recorded explicitly below:

1. **Live PostgreSQL Schema Migration & Seed Execution (`EXTERNALLY BLOCKED`):**
   - `prisma/migrations/20261127000000_v7_executive_hardening/migration.sql` was authored and validated cleanly via `prisma validate` and `prisma generate`, but `prisma migrate deploy` and `npm run db:seed` could not run because no PostgreSQL database server is provisioned in this container.
2. **Git History Inspection Since `a07062c` & Remote Branch Push (`EXTERNALLY BLOCKED`):**
   - The imported container workspace does not include a `.git` repository directory or remote GitHub credentials. Auditing commit-by-commit diffs since `a07062c` and pushing `feature/bcp-v7-signature-finalization` must be executed from the connected development/CI environment.
3. **Live Object Storage (`S3` / `SUPABASE`) Network Upload/Download (`EXTERNALLY BLOCKED`):**
   - Production fail-closed guards, SigV4 / Supabase REST adapters, magic-byte inspection, SHA-256 verification, and `423` quarantine checks are verified in unit and mocked integration suites; live cloud bucket credentials and CORS/bucket policies must be smoke-tested in staging.
4. **Full `@playwright/test` Multi-Spec E2E Run Against Seeded DB (`NOT RUN`):**
   - End-to-end verification in this environment used direct `playwright-cli` live inspection against `http://localhost:3000` (with fallback data active) and mocked Vitest route integration suites; full seeded database E2E flows (`npm run test:e2e`) should run in CI/staging after migration.
5. **Production Payment Gateways (`bKash`, `Nagad`, `SSLCommerz`):**
   - Intentionally unimplemented without merchant credentials; sandbox checkout remains strictly disabled whenever `NODE_ENV=production` or `NEXT_PUBLIC_APP_ENV=production`.
