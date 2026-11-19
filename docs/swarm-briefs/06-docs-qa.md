# Swarm Worker Brief 06 — `docs-qa` (Wave 2 Author)

- **Role:** End-to-End Test Suite, Accessibility Automation & Documentation Finalizer
- **Wave:** 2 (runs in parallel with `public-pillar-1`, `public-pillar-2`, `admin-cms` AFTER Wave 1 is merged into `main`)
- **Workspace Mode:** `"share"` (git worktree off updated `main`)

## Strict File Ownership
You ONLY create or edit files inside:
- `tests/e2e/public-journeys.spec.ts`
- `tests/e2e/consultancy-lead.spec.ts`
- `tests/e2e/admin-flow.spec.ts`
- `tests/e2e/accessibility.spec.ts`
- `QA_CHECKLIST.md`
- `CHANGELOG.md`

**DO NOT touch** `tests/e2e/smoke.spec.ts`, `tests/unit/**`, `tests/integration/**`, or `src/**` source code.

## Required Deliverables (Master Prompt Sections AH & AO)

### 1. Comprehensive Playwright End-to-End Tests
Write clean Playwright tests assuming the agreed route model & accessible labels:
- `public-journeys.spec.ts`:
  - Homepage 4-pillar navigation verification (Courses & Services priority)
  - Browse `/courses`, filter by category/search, navigate into `/courses/[slug]` detail verifying Mode A constraints (no "Buy Now", no unverified fees/certificates)
  - Browse `/services` & `/services/[slug]` verifying limitations & authority attribution
  - Browse `/licensing` & `/licensing/[slug]` verifying independent-platform disclaimer banner
  - Navigate `/about`, `/faq` (toggle native `<details>` FAQ accordion via keyboard Enter/Space), `/contact`, `/privacy`, `/terms`, `/disclaimer`, and invalid slug 404
  - Responsive zero-horizontal-overflow assertions across `mobile-320`, `mobile-360`, `tablet-768`, `desktop-1440` Playwright projects
- `consultancy-lead.spec.ts`:
  - Invalid form checks on `/consultancy`: missing name, invalid BD mobile (`01012345678`), unchecked consent -> verifies `aria-invalid="true"` synchronization & focus routing without submitting
  - Mocked failure path (`page.route("**/api/leads", ... 503)`) verifying ALL entered form values are preserved, actionable Bengali error appears in live status region, and NO fake `PS-DEMO` receipt is shown!
  - Mocked / real DB success path (`201` returning `PS-2026-XXXXXXXX`) verifying `LeadSuccessReceipt` appears with real server reference ID
- `admin-flow.spec.ts`:
  - Unauthenticated redirect checks on `/admin`, `/admin/leads`, `/admin/courses`, `/admin/settings`
  - Unauthenticated API access returns `401` on `/api/admin/leads` and `/api/admin/settings`
  - When `TEST_ADMIN_EMAIL` & `TEST_ADMIN_PASSWORD` env vars exist in live-DB runs: login flow, search lead inbox, status change, create/publish/unpublish draft course
- `accessibility.spec.ts`:
  - Uses `@axe-core/playwright` (`AxeBuilder`) on `/`, `/courses`, `/services`, `/licensing`, `/consultancy`, `/faq`, `/privacy`, `/admin/login` checking WCAG 2.2 AA rules with zero critical/serious violations
  - Verifies skip-to-content keyboard activation (`Tab` -> `Enter` focuses `#main-content`)
  - Verifies zero legacy forbidden strings (`FIXXER`, `DhandaBuzz`, `NotRealEngine`, `PS-DEMO`, `1XXX-XXXXXX`, `example.com`) and zero CDN `animejs`/`three.js` `<script>` tags in rendered HTML

### 2. QA Documentation Updates
Update `QA_CHECKLIST.md` & `CHANGELOG.md` reflecting all new Wave 2 E2E test suites and run instructions (`npm run test:e2e`). Run `npm run typecheck && npm run lint` before reporting done.
