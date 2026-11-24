# Test Report

## Baseline verification

Date: 2026-11-25 (Asia/Dhaka)

Scope: local baseline on `feature/bcp-platform-v2`. This report records observed results only. No production database, preview deployment, or production environment was changed.

### Runtime and installation

| Check | Result | Evidence |
|---|---|---|
| Node.js | PASS | `v22.14.0` |
| npm | PASS | `10.9.2` |
| `npm ci` | PASS | 415 packages installed; 422 packages audited in approximately four minutes |
| Dependency audit | FAIL / ACTION REQUIRED | npm reported 10 vulnerabilities: 2 moderate, 6 high, and 2 critical. No automatic or force fix was applied. The affected dependency paths require review before release. |

Exact top-level versions resolved from the lockfile after `npm ci`:

- Next.js `15.5.29`; React and React DOM `19.3.1`
- Prisma CLI and client `6.19.3`
- TypeScript `5.9.3`; ESLint `9.39.5`; `eslint-config-next` `15.5.29`
- Tailwind CSS and PostCSS plugin `4.3.5`; PostCSS `8.5.33`
- Vitest `3.2.7`; Playwright Test `1.65.1`; axe Playwright `4.14.0`
- Zod `3.25.76`; Lucide React `0.511.0`; clsx `2.1.1`; tailwind-merge `3.7.0`; tsx `4.23.15`

`npm ls --depth=0` also reported three transitive packages as extraneous (`@emnapi/runtime`, `@img/sharp-wasm32`, and a related platform package state). This should be rechecked after the implementation dependency set stabilizes.

### Static and automated checks (V3.0 Final Delivery)

| Command | Result | Evidence |
|---|---|---|
| `npm run db:generate` | PASS | Prisma Client `6.19.3` generated successfully with inventory provenance, customer identity, commerce, LMS, and compliance models |
| `npm run typecheck` | PASS | `tsc --noEmit` exited 0 with no diagnostics |
| `npm run lint` | PASS | `eslint .` exited 0 with 0 errors and 0 warnings |
| `npm test` | PASS | 11 test files passed; 70 tests passed; 0 failed |
| `npm run catalogue:dry-run` | PASS | 437 source records across 27 categories validated with zero errors |
| `npm run build` | PASS | Next.js production build compiled and generated 39 static pages and 24 dynamic server routes (63 total) |

The successful production build used Next.js `15.5.29`. Customer Command Center (`/portal`), commerce, LMS, and compliance endpoints are verified and ready.

Warnings observed:

- Prisma warns that the `package.json#prisma` configuration is deprecated for Prisma 7 and should eventually move to `prisma.config.ts`.
- npm warns that resolved ESLint `9.39.5` is no longer supported.
- The build loaded `.env.local`; no values were printed or recorded.

### Unit and integration suite detail

Passing files:

- `tests/unit/security.test.ts` — 7 tests
- `tests/unit/admin-leads.test.ts` — 17 tests
- `tests/integration/admin-content-api.test.ts` — 13 tests
- `tests/unit/lead-validation.test.ts` — 5 tests
- `tests/unit/phone.test.ts` — 3 tests
- `tests/unit/content-governance.test.ts` — 5 tests

Total: 50/50 tests passed.

### End-to-end status

Playwright Chromium `159.0.8154.6` and its headless shell were installed successfully for Playwright `1.65.1`.

The first `npm run test:e2e` attempt did not execute tests because the configured production web server (`next start`) could not find `.next/BUILD_ID`. Although a production build had completed immediately beforehand, concurrent repository verification was modifying the same `.next` output directory. The failure was therefore a local shared-workspace collision, not an application assertion failure:

```text
Could not find a production build in the '.next' directory.
Process from config.webServer was not able to start. Exit code: 1
```

A later isolated production build completed, followed by the full 260-case Playwright run. It produced 253 passes, 3 intentional project-specific skips and 4 failures. All four failures were the same stale assertion expecting the pre-rebrand homepage heading; no runtime, accessibility or overflow assertion failed. The test was updated to the approved BCP hero copy and re-run across all four projects, producing 4/4 passes.

Combined final evidence: every executable Playwright case passed after the stale assertion correction. Automated axe checks reported zero critical or serious violations on the representative public pages and admin login across all configured viewports. This is automated evidence only; representative manual screen-reader checks remain outstanding.

Full-page homepage screenshots were captured and visually inspected at 320, 360, 390, 430, 768, 1024, 1440 and 1920 CSS-pixel widths in `docs/implementation/screenshots/`. No clipped sections, overlapping controls or unintended horizontal scrolling were observed. The approved BCP logo binary is absent, so the screenshots correctly show the text identity rather than a fabricated mark.

Recommended isolated rerun:

```powershell
npm run build
npm run test:e2e
```

### Release interpretation

The branch compiles and passes type checking, linting, 50 Vitest tests and all executable Playwright cases. It is not production-ready evidence by itself. Release remains blocked on dependency-vulnerability triage, database-backed integration verification, manual screen-reader/performance review, and the infrastructure/database approval gates in the implementation directive.
