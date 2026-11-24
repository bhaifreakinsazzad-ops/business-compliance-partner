# Repository Audit

**Audit date:** 2026-11-25  
**Branch:** `feature/bcp-platform-v2`  
**Audited HEAD:** `1d644268a14ba4138705871eee6a4a3092ac34ea`  
**Requested repository main (read-only verification):** `7665bc3c0088293b9e3fa9d1d8250793815031b7`

## Executive finding

The checkout is a functional Paperwork Squad Phase-1 application, not an empty starter. It contains a Bengali-first public catalogue, database-backed lead capture, staff authentication/RBAC, an admin CMS and lead inbox, regulatory-content guardrails, and Vitest/Playwright suites. The V2 directive should therefore be implemented as an additive transformation that preserves routes, IDs, migration history, and staff workflows.

The checkout also proves the infrastructure mismatch described in the directive: local HEAD is the newer deployed/admin-CMS commit, while configured `origin/main` is the older `7665bc3` baseline and `origin` points to `notrealenginellc/Paperwork-Squad`. No remote or deployment setting was changed during this audit.

## Working-tree safety

- The branch was created from local HEAD so the newer admin implementation is retained.
- A pre-existing `.gitignore` modification adds `.vercel` and `.env*`; it was not overwritten.
- No `AGENTS.md` exists in the repository.
- Only one Prisma migration exists: `prisma/migrations/20261119000000_init/migration.sql`.

## Installed stack (lockfile evidence)

| Package | Exact lockfile version |
|---|---:|
| Next.js | 15.5.29 |
| React / React DOM | 19.3.1 |
| Prisma / `@prisma/client` | 6.19.3 |
| TypeScript | 5.9.3 |
| ESLint | 9.39.5 |
| Tailwind CSS | 4.3.5 |
| Vitest | 3.2.7 |
| Playwright | 1.65.1 |
| Zod | 3.25.76 |
| Lucide React | 0.511.0 |

The execution host reports Node.js `v22.14.0` and npm `10.9.2`. `package.json` does not currently pin an `engines.node` range. The `lint` script still calls removed/legacy `next lint` behavior and requires migration to the ESLint CLI.

## Current application surface

### Public routes

- `/`
- `/courses` and `/courses/[slug]`
- `/services` and `/services/[slug]`
- `/licensing` and `/licensing/[slug]`
- `/consultancy`
- `/about`, `/faq`, `/contact`
- `/privacy`, `/terms`, `/disclaimer`
- generated `sitemap.xml`, `robots.txt`, and a Bengali 404

### Staff routes

- `/admin/login`, `/admin/dashboard`, `/admin/leads`
- `/admin/courses`, `/admin/services`, `/admin/licensing`, `/admin/content`
- `/admin/settings`, `/admin/audit`

### APIs

- Public: `POST /api/leads`, `GET /api/catalogue/search`, `GET /api/health`
- Staff auth: login, logout, current session
- Staff content: list/create/update endpoints for courses, services, licensing and FAQs
- Staff operations: leads, settings and audit history

## Database model audit

The schema currently defines:

- Catalogue/content: `Category`, `Instructor`, `Course`, `Service`, `LicensingEntry`, `Faq`, `SiteSetting`
- Lead CRM: `Lead`
- Staff security/governance: `AdminUser`, `AdminSession`, `ContentRevision`, `AuditLog`
- Existing roles: `ADMIN`, `EDITOR`, `LEAD_MANAGER`
- Existing publication lifecycle: `DRAFT -> PENDING_REVIEW -> APPROVED -> PUBLISHED`
- Existing lead lifecycle: `NEW -> REVIEWED -> CONTACTED -> QUALIFIED -> CONVERTED -> CLOSED`, plus `SPAM`

There are no customer identity, organization, order, quotation, invoice, payment, LMS enrollment/content, business profile, compliance case, document, notification, or support models.

## Catalogue inventory evidence

Static inspection of the seed source gives:

| Inventory | Present | Directive target | Gap |
|---|---:|---:|---:|
| Course categories | 10 | 10 | 0 |
| Service categories | 11 | 11 | 0 |
| Licensing categories | 6 | 6 | 0 |
| Courses | 51 (6 curated + 45 draft) | 105 | 54 |
| Services | 27 (8 published + 19 draft) | 247 | 220 |
| Licensing entries | 18 (6 published + 12 draft) | 85 | 67 |
| Total offerings | 96 | 437 | 341 |

The 27 catalogue categories match the target taxonomy. The source arrays are materially short of the 437-record authoritative inventory and do not constitute a governed importer. Existing records should not be mass-published merely to close the numerical gap.

## Engineering findings

### Strengths to preserve

- Strict TypeScript, App Router, server components, Prisma/PostgreSQL, Zod validation.
- Public route compatibility and stable slugs.
- Lead submissions fail closed when the database is absent; successful receipt IDs come only from durable persistence.
- Lead idempotency is enforced by a unique key and transaction/race handling.
- Notification failure is separated from the successful database commit.
- Admin sessions are database-backed, HttpOnly, `SameSite=Lax`, expiring, and checked server-side.
- RBAC is enforced in handlers/server components rather than relying only on middleware.
- Admin mutations record content revisions and audit logs.
- CSV hardening, forbidden-content validation, privacy-conscious logging, and verified-authority disclaimers exist.
- Public catalogue queries exclude non-published/inactive records.
- Automated suites cover validation, RBAC/security utilities, admin APIs, public journeys, form failure/success behavior, accessibility, keyboard behavior, and overflow at configured viewports.

### Defects and risks requiring refactor

1. `GET /api/health` returns HTTP 200 when the database is unconfigured because only `status === "error"` maps to 503. This conflicts with the V2 readiness gate.
2. Public catalogue functions silently fall back to seed records on any database query error in all environments. Production must not mask an outage with stale candidate data.
3. Lead throttling is an in-process `Map`; it is not effective across Vercel instances or regions.
4. `prisma/seed.ts` uses `SiteSetting.upsert({ update: {} })`, so existing legacy branding is not migrated.
5. New references use the legacy `PS-YYYY-XXXXXXXX` prefix. Historical PS values must remain valid, but new values require the approved BCP policy.
6. Brand identity, tokens, metadata, notification subjects, cookie names, package metadata, tests and documentation are still Paperwork Squad/`ps-*` based.
7. The public `getPublicSiteConfig()` catches every database error and returns legacy defaults, including in production.
8. Public search loads complete published lists and filters in application memory; it is not paginated or backed by measured Bengali text-search indexes.
9. No production-required Turnstile flag exists; absence of the secret silently disables bot verification.
10. No CSP is configured. Current headers cover clickjacking, MIME sniffing, referrer and permissions policy only.
11. No explicit Node engine is pinned despite the deployment/runtime compatibility requirement.
12. Stale local `file:///e:/.../Paperwork Squad` documentation links remain.

## KEEP / REFACTOR / REPLACE / ADD / REMOVE matrix

| Module | Decision | Evidence / required action |
|---|---|---|
| Next.js App Router + React | KEEP | Working public/admin routes and server-rendered catalogue |
| Prisma/PostgreSQL migration ownership | KEEP | Existing schema and initial migration are the system of record |
| Public route/slugs | KEEP | Preserve indexed URLs and backwards compatibility |
| Lead durability/idempotency | KEEP | Unique idempotency key, transaction and truthful 503 path |
| Staff auth/RBAC/audit | KEEP + HARDEN | Preserve roles and server checks; add revocation/operational coverage as needed |
| Catalogue seed fallback | REFACTOR | Restrict to explicit development/staging use; production must fail truthfully |
| Health API | REFACTOR | Separate liveness/readiness or return non-ready for unconfigured DB |
| Rate limiter | REPLACE | Use a configured distributed provider in production with safe local adapter |
| Brand configuration/tokens | REPLACE | Central BCP identity, official colors/fonts/logo; preserve historical DB values through migration |
| Reference generation | REFACTOR | Generate BCP references for new records; continue accepting/searching PS references |
| Static seed process | REFACTOR | Preserve curated records but add schema-validated, dry-run, idempotent reconciliation importer |
| Public search | REFACTOR | Pagination, query limits, normalized Bengali/English/number search, measured DB indexes |
| Admin CMS/lead inbox | KEEP + EXTEND | UI and APIs exist; add missing categories, users/permissions, assignments/tasks, completeness reporting |
| Solution finder/readiness/roadmap/checklists | ADD | No current routes, rules engine or persistence |
| Customer workspace | ADD behind release gate | No customer/organization ownership model exists |
| Commerce/payments | ADD behind release gate | No approved prices, merchant credentials or order/payment models |
| LMS | ADD behind release gate | Course catalogue is enquiry-only; no protected lessons/enrollments |
| Compliance cases/documents | ADD behind release gate | No case/storage model; sensitive uploads must remain disabled |
| PWA/automation/AI | ADD later behind flags | Core prerequisites and approvals are absent |
| Legacy active Paperwork Squad rendering | REMOVE | Replace active identity; retain only historical migration/audit references where needed |

## Test inventory

- Unit: admin lead helpers, content governance, lead validation, phone normalization, security/reference/RBAC/CSV.
- Integration: admin content APIs.
- E2E: smoke/public catalogues, unified search, detail/enquiry paths, consultancy success/error behavior, automated axe checks, keyboard behavior and mobile dialog.

This audit records test presence only. Runtime pass/fail evidence belongs in `TEST_REPORT.md`; no test is marked verified here without an executed result.

