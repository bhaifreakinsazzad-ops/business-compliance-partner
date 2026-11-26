# Changelog — BCP V7.0 ("Executive Signature — Living Lavender Experience")

## Security, Storage & RBAC
- Added fail-closed durable private storage checks (`assertDurablePrivateStorageConfigured`), `S3`/`SUPABASE` storage adapters, magic-byte inspection, SHA-256 checksum enforcement, quarantine (`423`), soft-delete admin controls, and CRLF-safe `Content-Disposition`.
- Narrowed `LEAD_MANAGER` permissions to prevent raw document download, delete, or order cancellation (`src/lib/security/rbac.ts`).
- Redacted unauthenticated `/api/health` diagnostics behind `ADMIN` session or timing-safe `HEALTHCHECK_TOKEN`.

## Commerce, Paisa Integrity & Concurrency
- Added integer `*Paisa` + `currency`, `Order.idempotencyHash`, `Order.reservedUntil`, cancellation metadata, and `@unique Order.quoteId` in Prisma schema and `20261127000000_v7_executive_hardening` migration.
- Enforced deterministic duplicate `bookId` merging BEFORE quantity caps (`<=20` per book, `<=50` total), canonical payload hash conflict detection (`409`), atomic `updateMany` guards on quotes & payments, and transactional stock restoration (`ORDER_CANCELLED_RESTORE`) + invoice voiding on cancel.
- Isolated `node:crypto` into server-only `src/lib/commerce/checkout-rules.ts` so `src/lib/commerce/payments.ts` bundles cleanly in browser clients.

## LMS, Catalogue & Analytics Governance
- Added `Course.enrollmentModel` (`OPEN` | `PAID` | `RESTRICTED`) and `CourseEntitlement` enforcement across `/api/lms/enroll`, `/api/lms/progress`, `/api/lms/certificate`, and admin course CMS routes.
- Hardened slug resolvers (`getPublishedCourseBySlug`, `getPublishedServiceBySlug`, `getPublishedLicensingBySlug`) to fail closed on DB `DRAFT`/`INACTIVE` entries.
- Separated `client_observed` browser tracking (`src/lib/analytics/events.ts`) from `server_verified` ledger recording (`src/lib/analytics/server.ts`, `AnalyticsServerEvent`).

## 3D, Motion, UI & Dependency Hygiene
- Eliminated `THREE.Clock` across WebGL scenes in favor of `src/lib/three/timing.ts`; added `awaitWebGLFrameFence()` (`gl.fenceSync`) and coalesced on-demand rendering.
- Fixed mobile sticky header overflow on `320px`/`390px` viewports (`AppHeader.tsx`), removed `backdrop-blur` over WebGL canvases, decoupled CSS `transform` transitions from Motion hover transforms, removed `/bun.lock`, and replaced `next/font/google` with Google Fonts `<link>`.
