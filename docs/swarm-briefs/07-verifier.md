# Swarm Worker Brief 07 — `verifier` (Wave 3 Final QA Lead)

- **Role:** Full Phase-1 QA, Accessibility, Security & 35-Gate Definition-of-Done Lead
- **Wave:** 3 (runs ONLY AFTER Waves 1 and 2 are merged into `main`)
- **Workspace Mode:** `"inherit"` (operates on integrated `main` working tree)

## Mission
Independently execute and verify every gate of **Master Prompt Section AO (Definition of Done — Phase 1)** without trusting prior author claims.

## Mandatory Verification Protocol

1. **Static, Lint, Unit & Build Verification:**
   - Run `npm run typecheck` -> must pass with 0 errors
   - Run `npm run lint` -> must pass with 0 errors/warnings
   - Run `npm test` -> all Vitest unit + governance + integration tests must pass
   - Run `npm run build` -> Next.js production build must exit 0

2. **Forbidden Content & Scope Creep Static Sweep:**
   Run repo-wide case-insensitive search across `src/` & `prisma/` confirming:
   - Zero occurrences of `FIXXER`, `DhandaBuzz`, `NotRealEngine`, `leadconnector`, `PS-DEMO`, `+880 1XXX-XXXXXX`, `example.com`
   - Zero public/seed occurrences of unconfirmed `ISD` / `ASC`
   - Zero CDN `animejs` or `three` script injections
   - Zero Phase-2/3 LMS/payment/student-portal/public-NID-upload features

3. **Runtime Server, E2E & Responsive Verification (`320, 360, 768, 1024, 1440px`):**
   - Execute `npm run test:e2e` covering Playwright + `@axe-core/playwright` suites across configured viewports
   - Verify headers (`X-Content-Type-Options`, `X-Frame-Options`, `X-Robots-Tag: noindex, nofollow` in staging)
   - Verify `/sitemap.xml` includes only `PUBLISHED` routes (never `/admin` or `DRAFT` slugs) and `/robots.txt` blocks `/` in staging mode
   - Verify `POST /api/leads` truthfully returns HTTP `503` (NOT `200`/`PS-DEMO`) when `DATABASE_URL` is absent, and HTTP `201` with `PS-YYYY-XXXXXXXX` when live PostgreSQL is available
   - Inspect built bundle & Lighthouse / Core Web Vitals checks where available
   - Capture desktop (`1440x900`) and mobile (`360x800`) screenshots of `/`, `/courses`, `/services`, `/licensing`, `/consultancy`, and `/admin/login`

4. **Output Final Audit Report:**
   Summarize observed command results, any remaining blockers (e.g., missing client credentials/hosted DB env vars), and exact gate pass/fail status (1–35) to the coordinator before declaring `<!-- GOAL_COMPLETE -->`.
