# Security Architecture & Controls (OWASP ASVS 5.0 Baseline)

---

## 1. Input Validation & Spam/Abuse Prevention

- **Strict Zod Schemas (`src/lib/validation/lead.ts`, `content.ts`):** All API inputs reject unexpected fields (`.strict()` on lead submission).
- **Bangladesh Mobile Normalization (`src/lib/validation/phone.ts`):** Converts Bengali numerals (`০–৯`), strips whitespace/hyphens, normalizes `01XXXXXXXXX` / `+8801XXXXXXXXX` / `8801XXXXXXXXX` to `01XXXXXXXXX`, validates `^01[3-9]\d{8}$`.
- **Rate Limiting (`src/lib/security/rate-limit.ts`):** Sliding-window limiter interface (`InMemoryRateLimiter` in single-node dev/staging; swap cleanly to Redis/Upstash in multi-instance prod) protects `POST /api/leads` and `POST /api/admin/auth/login`.
- **Bot Protection:** Invisible honeypot field (`websiteHoneypot`) + optional server-verified Cloudflare Turnstile (`TURNSTILE_SECRET_KEY`).
- **Idempotency:** Unique `idempotencyKey` DB index prevents duplicate lead rows on retries or double-clicks.
- **Truthful Failure Handling:** No fake success (`PS-DEMO-*` strictly banned). Failures preserve user input and return HTTP `400`/`422`/`429`/`503`.

---

## 2. Authentication, Sessions & Least-Privilege RBAC

- **Password Hashing (`src/lib/security/password.ts`):** Node `crypto.scrypt` with per-user 16-byte salt and `crypto.timingSafeEqual` verification. Minimum 12-character password policy.
- **Session Storage (`src/lib/security/session.ts`):** Random 32-byte session token hashed via SHA-256 inside PostgreSQL `admin_sessions` with 12-hour TTL (`HttpOnly`, `SameSite=Lax`, `Secure` in production).
- **Dual-Layer Admin Enforcement:**
  1. `src/middleware.ts` checks cookie presence & sets `Cache-Control: no-store, private` on `/admin/*` and `/api/admin/*` (without importing Prisma on Edge Runtime).
  2. Every protected server page & API handler calls `requireAdminSession(permission)` to validate live PostgreSQL session + `isActive` + role capability (`ADMIN`, `EDITOR`, `LEAD_MANAGER` defined in `src/lib/security/rbac.ts`).
- **Audit Logging:** All logins, lead status changes, lead notes/assignments, CSV exports, content publish/unpublish actions, and settings updates write non-PII operational entries to `audit_logs`.
- **CSV Export Hardening (`src/lib/security/csv.ts`):** `sanitizeCsvCell()` escapes leading `=`, `+`, `-`, `@`, tab, and carriage return characters against spreadsheet formula injection; restricted to `leads:export` permission (`ADMIN` & `LEAD_MANAGER`).

---

## 3. HTTP Headers & Secrets Hygiene

Configured in `next.config.ts`:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- `X-Robots-Tag: noindex, nofollow` (enforced automatically whenever `NEXT_PUBLIC_APP_ENV !== "production"`)

Secrets live exclusively in server environment variables (`.env.local` / host secret manager) and are never stored in `SiteSetting` or committed to Git. Run `npm audit --omit=dev` before release.
