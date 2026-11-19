# Swarm Worker Brief 02 — `backend-core` (Wave 1 Author)

- **Role:** PostgreSQL Service Layer, Lead Backend, Admin Auth & API Architect
- **Wave:** 1 (runs in parallel with `ui-system`)
- **Workspace Mode:** `"share"` (git worktree off `main`)

## Strict File Ownership
You ONLY create or edit files inside:
- `src/lib/services/**`
- `src/app/api/**` *(DO NOT modify `src/app/api/health/route.ts`)*
- `tests/integration/**`

**DO NOT touch** `prisma/schema.prisma`, `src/types/**`, `src/lib/security/**`, `src/lib/validation/**`, `src/components/**`, or `src/app/**` page routes.

## Required Deliverables

### 1. Catalogue & Public Read Services (`src/lib/services/catalogue.ts`)
Implement clean typed functions using `prisma` when `isDatabaseConfigured()` is true, and gracefully falling back to filtering `prisma/seed-data/*` (via `isPubliclyVisible()`) when `DATABASE_URL` is unconfigured in local preview:
- `listPublishedCourses(filter?)` & `getPublishedCourseBySlug(slug)`
- `listPublishedServices(filter?)` & `getPublishedServiceBySlug(slug)`
- `listPublishedLicensing(filter?)` & `getPublishedLicensingBySlug(slug)`
- `listPublishedFaqs(pillar?)`
- `searchPublishedCatalogue(query)` — unified normalized Bengali + English acronym search grouped by Courses, Services, Licensing.

### 2. Durable Transactional Lead Backend (`src/lib/services/leads.ts` & `src/app/api/leads/route.ts`)
- `POST /api/leads`:
  1. Check `isDatabaseConfigured()`: if false, return HTTP `503` truthful service-unavailable JSON error (NEVER fake success!).
  2. Apply rate limiter (`InMemoryRateLimiter`: e.g., max 5 requests per 10 minutes per `hashClientIp(ip)`). Return `429` if exceeded.
  3. Parse & validate JSON body with `leadSubmissionSchema` (strict Zod schema normalizes BD mobile, requires `consentAccepted === true`, rejects honeypot). Return `422` with Bengali field errors on failure.
  4. Verify optional Cloudflare Turnstile token if `TURNSTILE_SECRET_KEY` is configured; reject invalid token with `400`.
  5. Idempotency check: look up `prisma.lead.findUnique({ where: { idempotencyKey } })`. If already recorded, return original `publicReference` cleanly (`200`) without creating a duplicate row.
  6. Generate unique `publicReference` via `generatePublicReference()` inside a transaction (retrying on rare P2002 collision on `publicReference`), insert `Lead` with `consentAt: new Date()`, `ipHash`, and `privacyPolicyVersion` from `SiteSetting`.
  7. Trigger `getLeadNotifier().notifyNewLead(...)` asynchronously (`void ...catch(() => ...)` non-blocking, NEVER failing a committed lead or logging PII).
  8. Return HTTP `201` `{ ok: true, data: { publicReference, submittedAt, messageBn } }`.

### 3. Unified Public Search API (`src/app/api/catalogue/search/route.ts`)
- `GET /api/catalogue/search?q=...` returning grouped `{ courses, services, licensing }` (limit per pillar for fast response).

### 4. Protected Staff Admin APIs (`src/app/api/admin/**`)
Every handler (except `/login` & `/logout`) MUST call `requireAdminSession(requiredPermission)` from `src/lib/security/session.ts` and handle `AuthenticationError` (`401`) & `AuthorizationError` (`403`):
- `POST /api/admin/auth/login` — rate-limited, verifies email + `verifyPassword()`, checks `isActive`, creates `AdminSession`, sets HttpOnly cookie (`SESSION_COOKIE_NAME`, `buildSessionCookieOptions`), records `AuditLog`.
- `POST /api/admin/auth/logout` — calls `revokeCurrentAdminSession()`, clears cookie, records `AuditLog`.
- `GET /api/admin/auth/me` — returns current authenticated admin user DTO (safe fields only, never `passwordHash`).
- `GET /api/admin/leads` — requires `leads:view`; supports search (`q` over name/mobile/publicReference), `status`, `pillar`, pagination.
- `PATCH /api/admin/leads/[id]` — requires `leads:update` (and `leads:assign` if changing `assignedToId`); updates status/notes/timestamps (`contactedAt`, `closedAt`) + writes `AuditLog`.
- `GET /api/admin/leads/export` — requires `leads:export` (`ADMIN` or `LEAD_MANAGER` only); streams sanitized CSV using `toCsv()` with `Content-Disposition: attachment` and logs `LEAD_EXPORT_CSV` in `audit_logs`.
- Content CRUD APIs (`content:read` / `content:write` / `content:publish`):
  - `GET / POST /api/admin/courses` & `PATCH / DELETE /api/admin/courses/[id]`
  - `GET / POST /api/admin/services` & `PATCH / DELETE /api/admin/services/[id]`
  - `GET / POST /api/admin/licensing` & `PATCH / DELETE /api/admin/licensing/[id]`
  - `GET / POST /api/admin/faqs` & `PATCH / DELETE /api/admin/faqs/[id]`
  - Every mutation runs `findForbiddenContentMatch()` (rejecting `FIXXER`, `DhandaBuzz`, `PS-DEMO`, `example.com`, etc. with HTTP `422`), writes a snapshot to `content_revisions`, and records `audit_logs`.
- `GET / PATCH /api/admin/settings` — requires `settings:manage` (`ADMIN` only); updates `SiteSetting`, validates no forbidden strings, logs `ContentRevision` + `AuditLog`.
- `GET /api/admin/audit` — requires `audit:view` (`ADMIN` only); paginated audit logs + recent content revisions.

### 5. Integration Tests (`tests/integration/`)
- Write thorough Vitest integration tests mocking Prisma client cleanly (plus optional live DB flag) verifying:
  - Lead creation transaction, real `PS-YYYY-XXXXXXXX` format, idempotent retry deduplication, `503` fail-closed behavior without DB, rate-limit `429` trigger, zero PII in notifier calls.
  - Admin route 401/403 RBAC enforcement across `EDITOR`, `LEAD_MANAGER`, and `ADMIN`.
  - Run `npm run typecheck && npm run lint && npm run test` before reporting done.
