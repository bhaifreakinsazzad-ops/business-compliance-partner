# BCP Platform V2 — Executable Release Plan

## Approved implementation scope in this branch

1. Preserve the working Next.js/Prisma public site, durable enquiry flow and staff CMS.
2. Reconcile active identity, metadata, design tokens, database defaults and new reference IDs to BCP.
3. Add deterministic guided solution discovery and retain universal catalogue search.
4. Fail closed for production database health, catalogue fallback, production bot checks and distributed rate limiting.
5. Record source, infrastructure, security, test and release evidence.
6. Prepare a reviewable branch; do not deploy or change production infrastructure without release authorization.

## Dependency waves

| Wave | Scope | State |
|---|---|---|
| 0 | Source, repository, infrastructure, security and baseline audit | IMPLEMENTED |
| 1 | BCP configuration, tokens, migrations, health and reference contracts | IN_PROGRESS |
| 2 | Public experience, search, solution finder and CMS reconciliation | IN_PROGRESS |
| 3 | Accounts, payments, LMS and compliance workspace | APPROVAL_REQUIRED |
| 4 | Automated, responsive, accessibility and security verification | IN_PROGRESS |
| 5 | Preview deployment and release gate | BLOCKED |

## File ownership used for parallel work

- Lead agent: application code, schema/migrations, source truth, plan, decisions and execution log.
- Repository audit agent: `REPOSITORY_AUDIT.md`, `GAP_ANALYSIS.md`, `REQUIREMENTS_MATRIX.md`.
- Infrastructure/security agent: `INFRASTRUCTURE_AUDIT.md`, `RISK_REGISTER.md`.
- QA agent: `TEST_REPORT.md`.

## Release gates

No preview or production promotion is permitted until the intended Git integration, supported Node runtime, isolated database, required environment variables, approved catalogue/content and rollback plan are verified. Production additionally requires explicit authorization.
