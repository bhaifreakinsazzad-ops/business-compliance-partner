# Paperwork Squad — Swarm Orchestration Plan (Remaining Tasks)

> **Current Platform Status:** The full **Public Experience**, **Quiet Confidence Design System**, **Public Catalogue Services** (`src/lib/services/catalogue.ts`), **Durable Lead Capture Backend** (`POST /api/leads`), **Unified Catalogue Search** (`GET /api/catalogue/search`), **SEO (`sitemap.ts`, `robots.ts`)**, and **All 14 Public Routes** are **ALREADY COMPLETED & VERIFIED** in `main`.

The remaining tasks are scoped cleanly for parallel swarm agents to finish **Staff Admin Auth/APIs**, **Admin CMS & Lead Inbox UI**, **E2E Accessibility/Responsive Suites**, and **Final 35-Gate Verification**.

---

## 1. Frozen Completed Layers (DO NOT OVERWRITE)

Swarm agents must **NOT** modify:
- `src/types/domain.ts`, `prisma/schema.prisma`, `prisma/seed-data/*`
- `src/lib/db/*`, `src/lib/config/*`, `src/lib/security/*`, `src/lib/validation/*`, `src/lib/content/*`
- `src/lib/services/catalogue.ts`, `src/lib/services/leads.ts`
- `src/app/api/health/route.ts`, `src/app/api/leads/route.ts`, `src/app/api/catalogue/search/route.ts`
- `src/components/layout/**`, `src/components/ui/**`, `src/components/shared/**`, `src/components/forms/**`, `src/components/home/**`, `src/components/illustrations/**`
- All public routes (`/`, `/courses/**`, `/services/**`, `/licensing/**`, `/consultancy`, `/about`, `/faq`, `/contact`, `/privacy`, `/terms`, `/disclaimer`, `/sitemap.ts`, `/robots.ts`)

---

## 2. Disjoint Remaining Swarm Workstreams

| Wave | Worker Name | Workspace | Owned Paths | Brief |
|---|---|---|---|---|
| **1** | `backend-admin` | `share` | `src/app/api/admin/**`, `src/lib/services/admin-*.ts`, `tests/integration/**` | Build `/api/admin/auth/*`, `/api/admin/leads/*`, `/api/admin/courses|services|licensing|faqs/*`, `/api/admin/settings`, `/api/admin/audit` using `requireAdminSession()` + `AuditLog` + `ContentRevision` + `tests/integration/`. |
| **1** | `admin-cms` | `share` | `src/app/admin/**`, `src/components/admin/**` | Build `/admin/login`, `/admin` dashboard, `/admin/leads`, `/admin/courses`, `/admin/services`, `/admin/licensing`, `/admin/content`, `/admin/settings`, `/admin/audit` (strictly server-protected via `requireAdminSession()`). See `docs/swarm-briefs/05-admin-cms.md`. |
| **1** | `docs-qa` | `share` | `tests/e2e/public-journeys.spec.ts`, `tests/e2e/consultancy-lead.spec.ts`, `tests/e2e/admin-flow.spec.ts`, `tests/e2e/accessibility.spec.ts`, `QA_CHECKLIST.md`, `CHANGELOG.md` | Expand Playwright + `@axe-core/playwright` E2E tests across all public & admin routes at 320/360/768/1440px. See `docs/swarm-briefs/06-docs-qa.md`. |
| **2** | `verifier` | `inherit` | Integrated `main` verification | Merge all Wave 1 branches, run `npm run verify` + `npm run test:e2e`, run forbidden-string sweep, capture desktop & mobile screenshots, and validate all 35 DoD gates. See `docs/swarm-briefs/07-verifier.md`. |
| **All** | `monitor` | `inherit` | `swarm_monitor` skill watchdog | Coordinator monitors stalled workers. |

---

## 3. Exact Swarm Launch Commands (Remaining Tasks)

1. `swarm({ action: "title", title: "Paperwork Squad — Admin CMS & Final QA" })`
2. `swarm({ action: "add", name: "monitor", workspace: "inherit", brief: "Follow swarm_monitor skill." })`
3. Spawn `backend-admin`, `admin-cms`, and `docs-qa` in parallel with `workspace: "share"`!
4. Merge all 3 branches sequentially into `main`, run `npm run verify`, then run `verifier` (`workspace: "inherit"`).
