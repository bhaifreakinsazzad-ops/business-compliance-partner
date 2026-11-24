# Requirements Matrix

Status values: `NOT_STARTED`, `IN_PROGRESS`, `IMPLEMENTED`, `VERIFIED`, `BLOCKED`, `APPROVAL_REQUIRED`.

This matrix reflects repository evidence as of 2026-11-25. `IMPLEMENTED` means code exists but is not assumed to have passed the current execution run; runtime evidence belongs in `TEST_REPORT.md`.

| ID | Requirement | Status | Evidence / next gate |
|---|---|---|---|
| R00-01 | Inspect Git baseline and preserve local work | VERIFIED | Branch created from `1d64426`; `.gitignore` edit preserved; requested main read-only verified as `7665bc3` |
| R00-02 | Isolated V2 implementation branch | VERIFIED | `feature/bcp-platform-v2` |
| R00-03 | Required implementation records | VERIFIED | Required audit, plan, decision, risk, execution and test records are present |
| R01-01 | Preserve Next 15/React 19/TS/Tailwind 4/Prisma 6 stack | VERIFIED | Exact lockfile versions recorded in repository audit |
| R01-02 | Baseline install/typecheck/lint/test/build/E2E | VERIFIED | Build, 50 Vitest tests and all executable Playwright cases pass; see TEST_REPORT |
| R01-03 | Supported ESLint CLI | VERIFIED | `npm run lint` uses `eslint .` and passes |
| R01-04 | Pin supported Node runtime | VERIFIED | Node 22 pinned in `engines` and `.nvmrc`; Vercel setting still requires reconciliation |
| R02-01 | Reconcile Vercel project/Git/deployment/domain/settings | BLOCKED | Authorized control-plane evidence not yet available; do not mutate integration |
| R02-02 | Identify authorized BCP Supabase project | BLOCKED | No verified project/config; PowerPointBD prohibited |
| R02-03 | Separate development/preview/production configuration | IN_PROGRESS | Environment modes exist; preview DB/isolation and server validation not verified |
| R03-01 | Replace active legacy identity with official BCP | VERIFIED | Active UI, metadata, seed copy, mail subject and package identity reconciled; legacy asset is not rendered |
| R03-02 | Use unchanged approved master logo | BLOCKED | Official circular badge not supplied in repository/attachment |
| R03-03 | Additive SiteSetting brand migration | IMPLEMENTED | Additive migration and non-empty idempotent seed update preserve verified contacts; target DB application blocked |
| R03-04 | New BCP references; preserve searchable PS references | VERIFIED | Generator emits BCP; validator accepts BCP and historical PS; unit coverage passes |
| R04-01 | BCP semantic design tokens and typography | VERIFIED | Official palette and requested Inter/Cormorant/Noto families build successfully |
| R04-02 | Reusable accessible component library | IMPLEMENTED | Existing layout/UI/shared/form components; V2 primitive coverage/showcase remains incomplete |
| R04-03 | Reduced-motion-safe interaction system | IMPLEMENTED | CSS reduced-motion rules and native dialog/details patterns exist |
| R05-01 | Responsive global navigation | IMPLEMENTED | Desktop/mobile header and keyboard-aware dialog exist; V2 IA/language/account additions pending |
| R05-02 | Premium Business Command Center homepage | IMPLEMENTED | BCP hero, solution finder, pillars, catalogue, search, process, trust, enquiry and responsive layout implemented |
| R05-03 | Verified footer/contact/policy/disclaimer behavior | IMPLEMENTED | Legal routes and null-safe contact config exist; official values require approval |
| R06-01 | Reconcile 437 entries / 27 categories | BLOCKED | 27 categories present; 96/437 offering records; authoritative dataset absent |
| R06-02 | Governed schema-validated dry-run catalogue importer | NOT_STARTED | Only direct seed upserts exist |
| R06-03 | Editorial publication/availability separation | IMPLEMENTED | `ContentStatus` and `AvailabilityStatus` are independent |
| R06-04 | Catalogue completeness report | NOT_STARTED | No report/import reconciliation UI/API |
| R07-01 | Course catalogue/detail/enquiry routes | IMPLEMENTED | `/courses`, `/courses/[slug]`, enquiry deep links |
| R07-02 | Service catalogue/detail/enquiry routes | IMPLEMENTED | `/services`, `/services/[slug]` |
| R07-03 | Licensing authority directory/details | IMPLEMENTED | `/licensing`, `/licensing/[slug]`, authority notes |
| R07-04 | Durable structured consultancy intake | IMPLEMENTED | `/consultancy`, `POST /api/leads`, reference receipt and failure states |
| R08-01 | Deterministic Business Solution Finder | VERIFIED | Goal/type/stage rule UI returns explained next steps; Playwright passes at four widths |
| R08-02 | Universal Bengali/English command search | IN_PROGRESS | Unified search exists; lacks pagination/indexed DB search/digit normalization evidence |
| R08-03 | Business readiness assessment | NOT_STARTED | No reviewed assessment rules/UI |
| R08-04 | Smart document checklists | NOT_STARTED | No checklist generator/local persistence |
| R08-05 | Personalized business roadmap | NOT_STARTED | No sequence/rationale engine |
| R09-01 | Staff auth, roles and server-side RBAC | IMPLEMENTED | DB sessions and ADMIN/EDITOR/LEAD_MANAGER checks |
| R09-02 | Admin catalogue/FAQ/settings/audit UI and APIs | IMPLEMENTED | Routes and handlers exist |
| R09-03 | Lead inbox/status management/CSV | IMPLEMENTED | Lead list/update/export helpers exist |
| R09-04 | Assignment, follow-up tasks, customer records, user management | NOT_STARTED | Schema/UI missing or partial assignment display only |
| R09-05 | Distributed production rate limiting | IMPLEMENTED | Atomic Upstash REST limiter with non-production local fallback and production fail-closed behavior |
| R10-01 | Customer identity and organization workspace | APPROVAL_REQUIRED | Requires verified DB and approved identity/data architecture |
| R10-02 | Cross-account/organization ownership enforcement tests | APPROVAL_REQUIRED | Customer model not approved/implemented |
| R11-01 | Orders/quotations/invoices/payment abstraction | APPROVAL_REQUIRED | Pricing and merchant/provider decisions absent |
| R11-02 | Secure idempotent payment/webhook flow | APPROVAL_REQUIRED | No provider credentials or sandbox approval |
| R12-01 | LMS content/enrollment/progress/assessment | APPROVAL_REQUIRED | Course content and DB/customer prerequisites absent |
| R12-02 | Protected learning assets/entitlements | APPROVAL_REQUIRED | Storage and enrollment architecture absent |
| R13-01 | Business profiles/compliance cases/milestones | APPROVAL_REQUIRED | Customer/data architecture prerequisite absent |
| R13-02 | Secure private document exchange | APPROVAL_REQUIRED | Uploads intentionally disabled pending safeguards/retention approval |
| R14-01 | PWA installability/offline policy | NOT_STARTED | Core product stability/release scope prerequisite |
| R14-02 | Reliable event/scheduled automation | APPROVAL_REQUIRED | Provider/jobs/operational workflows not approved |
| R14-03 | Retrieval-grounded AI assistant | APPROVAL_REQUIRED | Provider, privacy, cost, source and evaluation gates absent |
| R15-01 | Preserve Prisma as migration owner | VERIFIED | Existing Prisma schema/migration retained; no competing system introduced |
| R15-02 | Additive migration/drift/backup validation on target DB | BLOCKED | Authorized BCP database not identified |
| R16-01 | Complete Bengali and English experiences | NOT_STARTED | Bengali-first UI exists; full locale routing/translation does not |
| R16-02 | Metadata/sitemap/robots/canonical/structured data | IN_PROGRESS | Metadata/sitemap/robots exist; bilingual canonical/hreflang and full schema coverage pending |
| R16-03 | Performance targets measured under stated conditions | NOT_STARTED | No current Lighthouse/Core Web Vitals evidence |
| R16-04 | WCAG 2.2 AA automated and manual verification | IN_PROGRESS | axe/keyboard tests exist; execution and representative screen-reader evidence pending |
| R17-01 | Fail readiness when DB absent/unavailable | VERIFIED | `/api/health` returns 503 unless PostgreSQL is connected |
| R17-02 | Prevent production seed fallback masking DB outage | VERIFIED | Production catalogue lists/detail/FAQ return empty/null instead of seed fixtures |
| R17-03 | Security headers/session/input/PII controls | IN_PROGRESS | Added bounded JSON bodies, distributed abuse controls and fail-closed production config; CSP/CSRF penetration review remains |
| R18-01 | Unit/integration/E2E suite for approved release | VERIFIED | Typecheck/lint/build, 50 Vitest and all executable Playwright cases pass for implemented scope |
| R18-02 | Eight-viewport screenshot inspection | VERIFIED | Full-page screenshots captured and visually inspected at all requested 320/360/390/430/768/1024/1440/1920 widths |
| R18-03 | Visual QA against approved BCP direction | BLOCKED | Official master logo/source pack absent; implementation not yet complete |
| R19-01 | Intended-repository PR and isolated Vercel preview | BLOCKED | Git/Vercel integration discrepancy and preview DB not reconciled |
| R19-02 | Production release gates and authorization | APPROVAL_REQUIRED | Explicit authorization plus infrastructure/catalogue/policy/test gates required |
| R20-01 | Dependency-aware parallel workstreams with file ownership | VERIFIED | Non-overlapping Wave 0 assignments established by lead agent |
| R21-01 | Accurate handover docs, routes, tests and limitations | VERIFIED | Source, audit, environment, deployment, security, admin, test and limitations records completed |

