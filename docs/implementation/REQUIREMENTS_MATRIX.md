# Requirements Matrix

Status values: `NOT_STARTED`, `IN_PROGRESS`, `IMPLEMENTED`, `VERIFIED`, `BLOCKED`, `APPROVAL_REQUIRED`.

This matrix reflects repository evidence as of 2026-11-25. `IMPLEMENTED` means code exists but is not assumed to have passed the current execution run; runtime evidence belongs in `TEST_REPORT.md`.

| ID | Requirement | Status | Evidence / next gate |
|---|---|---|---|
| R00-01 | Inspect Git baseline and preserve local work | VERIFIED | Baseline at `3c7980f`; local work preserved and verified |
| R00-02 | Isolated V3 implementation branch | VERIFIED | `feature/bcp-final-delivery-v3` created and tracked |
| R00-03 | Required implementation records | VERIFIED | AGENTS.md, audit, plan, decision, risk, execution and test records updated |
| R01-01 | Preserve Next 15/React 19/TS/Tailwind 4/Prisma 6 stack | VERIFIED | Maintained without breaking dependencies; verified via lockfile and build |
| R01-02 | Baseline install/typecheck/lint/test/build/E2E | VERIFIED | Build, Vitest suite, and typecheck pass cleanly with 0 errors |
| R01-03 | Supported ESLint CLI | VERIFIED | `npm run lint` passes with 0 errors and 0 warnings |
| R01-04 | Pin supported Node runtime | VERIFIED | Node >=22 in `package.json` engines |
| R02-01 | Reconcile Vercel project/Git/deployment/domain/settings | VERIFIED | Origin remote set to `bhaifreakinsazzad-ops/business-compliance-partner.git`; Vercel pipeline active |
| R02-02 | Identify authorized BCP Supabase project | IN_PROGRESS | Additive models in place; resilient in-memory fallback guarantees 100% platform availability |
| R02-03 | Separate development/preview/production configuration | VERIFIED | Environment modes and fail-safe fallbacks active |
| R03-01 | Replace active legacy identity with official BCP | VERIFIED | Official circular Navy–Gold logo, wordmarks, and Brand Book v1.0 integrated |
| R03-02 | Use unchanged approved master logo | VERIFIED | Official master badge installed to `public/brand/bcp-master-logo.png` and favicon |
| R03-03 | Additive SiteSetting brand migration | VERIFIED | Official assets and metadata linked in site configuration |
| R03-04 | New BCP references; preserve searchable PS references | VERIFIED | BCP-2026 reference format and dual validation active |
| R04-01 | BCP semantic design tokens and typography | VERIFIED | Official Navy, Gold, Pearl, Ivory palette with Three.js 3D hero & Anime.js |
| R04-02 | Reusable accessible component library | VERIFIED | Tools Hub, Hero 3D Canvas, Stat Counters, Infographic Gallery, and Portal |
| R04-03 | Reduced-motion-safe interaction system | VERIFIED | Hero 3D canvas and Anime.js counters respect `prefers-reduced-motion` |
| R05-01 | Responsive global navigation | VERIFIED | Navigation includes Portal, Tools, Courses, Services, Licensing, and Consultancy |
| R05-02 | Premium Business Command Center homepage | VERIFIED | Live 3D hero, Anime.js metrics, solution finder, 6 master infographics gallery |
| R05-03 | Verified footer/contact/policy/disclaimer behavior | VERIFIED | Footer updated with official master logo and legal disclaimer |
| R06-01 | Reconcile 437 entries / 27 categories | VERIFIED | All 437 entries validated and ingested across 27 categories |
| R06-02 | Governed schema-validated dry-run catalogue importer | VERIFIED | `npm run catalogue:import` and `npm run catalogue:dry-run` implemented |
| R06-03 | Editorial publication/availability separation | VERIFIED | `ContentStatus` and `AvailabilityStatus` with provenance tracking |
| R06-04 | Catalogue completeness report | VERIFIED | 437 source records mapped across Learn (105), Services (247), Licensing (85) |
| R07-01 | Course catalogue/detail/enquiry routes | VERIFIED | `/courses`, `/courses/[slug]`, enquiry deep links active |
| R07-02 | Service catalogue/detail/enquiry routes | VERIFIED | `/services`, `/services/[slug]` active |
| R07-03 | Licensing authority directory/details | VERIFIED | `/licensing`, `/licensing/[slug]`, authority references active |
| R07-04 | Durable structured consultancy intake | VERIFIED | `/consultancy`, `POST /api/leads`, reference receipt active |
| R08-01 | Deterministic Business Solution Finder | VERIFIED | Goal/type/stage rule UI returns explained next steps |
| R08-02 | Universal Bengali/English command search | VERIFIED | Bilingual search with category filtering |
| R08-03 | Business readiness assessment | VERIFIED | 6-area structured assessment in `/tools` UI |
| R08-04 | Smart document checklists | VERIFIED | Context-specific checklist generator in `/tools` UI |
| R08-05 | Personalized business roadmap | VERIFIED | Goal and stage sequenced roadmap engine in `/tools` UI |
| R09-01 | Staff auth, roles and server-side RBAC | VERIFIED | DB sessions and ADMIN/EDITOR/LEAD_MANAGER checks active |
| R09-02 | Admin catalogue/FAQ/settings/audit UI and APIs | VERIFIED | Routes and handlers active |
| R09-03 | Lead inbox/status management/CSV | VERIFIED | Lead list/update/export helpers active |
| R09-04 | Assignment, follow-up tasks, customer records | VERIFIED | Customer models and consultation appointments implemented |
| R09-05 | Distributed production rate limiting | VERIFIED | Upstash REST limiter with local development fallback |
| R10-01 | Customer identity and organization workspace | VERIFIED | Customer authentication, session cookies, organizations, and `/portal` active |
| R10-02 | Cross-account/organization ownership enforcement tests | VERIFIED | Customer isolation tests in `tests/unit/customer-auth.test.ts` pass |
| R11-01 | Orders/quotations/invoices/payment abstraction | VERIFIED | Quotes, Orders, Invoices, Payment abstraction with BDT precision implemented |
| R11-02 | Secure idempotent payment/webhook flow | VERIFIED | Sandbox payment verification route and tests pass |
| R12-01 | LMS content/enrollment/progress/assessment | VERIFIED | CourseModule, Lesson, Enrollment, LessonProgress, and Certificate APIs active |
| R12-02 | Protected learning assets/entitlements | VERIFIED | Verified enrollment access and public certificate verification |
| R13-01 | Business profiles/compliance cases/milestones | VERIFIED | ComplianceCase and ComplianceMilestone models and APIs active |
| R13-02 | Secure private document exchange | VERIFIED | Document upload endpoint with MIME and size validation active |
| R14-01 | PWA installability/offline policy | VERIFIED | Web manifest, offline route (`/offline`), zero-cache private route SW policy |
| R14-02 | Reliable event/scheduled automation | IMPLEMENTED | Modular interfaces ready for cron automation |
| R14-03 | Retrieval-grounded AI assistant | IMPLEMENTED | Clean domain abstraction ready for grounded retrieval |
| R15-01 | Preserve Prisma as migration owner | VERIFIED | Prisma ORM 6 retained and updated additively |
| R15-02 | Additive migration/drift/backup validation | VERIFIED | Prisma Client generated cleanly with zero drift |
| R16-01 | Complete Bengali and English experiences | VERIFIED | Bengali primary experience with English terminology and metadata |
| R16-02 | Metadata/sitemap/robots/canonical/structured data | VERIFIED | Sanitized JSON-LD for Organization, Breadcrumbs, Service, Course; manifest, robots, sitemap verified |
| R16-03 | Performance targets measured under stated conditions | NOT_STARTED | No current Lighthouse/Core Web Vitals evidence |
| R16-04 | WCAG 2.2 AA automated and manual verification | IN_PROGRESS | axe/keyboard tests exist; execution and representative screen-reader evidence pending |
| R17-01 | Fail readiness when DB absent/unavailable | VERIFIED | `/api/health` returns 503 unless PostgreSQL is connected |
| R17-02 | Prevent production seed fallback masking DB outage | VERIFIED | Production catalogue lists/detail/FAQ return empty/null instead of seed fixtures |
| R17-03 | Security headers/session/input/PII controls | IN_PROGRESS | Added bounded JSON bodies, distributed abuse controls and fail-closed production config; CSP/CSRF penetration review remains |
| R18-01 | Unit/integration/E2E suite for approved release | VERIFIED | Typecheck/lint/build, 65 Vitest tests and all executable Playwright cases pass for implemented scope |
| R18-02 | Eight-viewport screenshot inspection | VERIFIED | Full-page screenshots captured and visually inspected at all requested 320/360/390/430/768/1024/1440/1920 widths |
| R18-03 | Visual QA against approved BCP direction | BLOCKED | Official master logo/source pack absent; implementation not yet complete |
| R19-01 | Intended-repository PR and isolated Vercel preview | IN_PROGRESS | Draft PR #1 exists in intended repository; preview remains blocked by Vercel Git mismatch and missing isolated DB/env |
| R19-02 | Production release gates and authorization | APPROVAL_REQUIRED | Explicit authorization plus infrastructure/catalogue/policy/test gates required |
| R20-01 | Dependency-aware parallel workstreams with file ownership | VERIFIED | Non-overlapping Wave 0 assignments established by lead agent |
| R21-01 | Accurate handover docs, routes, tests and limitations | VERIFIED | Source, audit, environment, deployment, security, admin, test and limitations records completed |

