# Swarm Worker Brief 05 — `admin-cms` (Wave 2 Author)

- **Role:** Protected Staff Admin CMS & Lead Inbox Engineer
- **Wave:** 2 (runs in parallel with `public-pillar-1`, `public-pillar-2`, `docs-qa` AFTER Wave 1 is merged into `main`)
- **Workspace Mode:** `"share"` (git worktree off updated `main`)

## Strict File Ownership
You ONLY create or edit files inside:
- `src/app/admin/**`
- `src/components/admin/**`

**DO NOT touch** public routes, `src/app/api/**`, `src/lib/**`, `src/middleware.ts`, or Wave 1 UI primitives (`src/components/ui|layout|shared|forms/**`).

## Required Deliverables (Master Prompt Section R)

### 1. Security & Layout Isolation (`src/app/admin/layout.tsx`)
- Root admin layout validates `getCurrentAdminSession()` (outside `/admin/login`) on the server and passes `{ email, name, role }` to `AdminSidebar`.
- Every protected route MUST run `requireAdminSession(requiredPermission)` on the server, catching `AuthenticationError` (redirect to `/admin/login`) and `AuthorizationError` (render truthful 403 unauthorized notice) — NEVER rely solely on client-side navigation hiding!
- Code-split cleanly from public pages (only loaded under `/admin/*`).
- Every `/admin/*` page sets `robots: { index: false, follow: false }`.

### 2. Required Admin Routes
1. `/admin/login`: Clean Quiet Confidence staff sign-in page (`autocomplete="email"`, `autocomplete="current-password"`, show/hide password toggle button with `aria-pressed`, accessible live error alerts, calls `POST /api/admin/auth/login`). Note: zero hardcoded dev credentials in UI!
2. `/admin` (Dashboard): Summary cards for Leads by status (`NEW`, `CONTACTED`, `QUALIFIED`), Content counts (`PUBLISHED` vs `DRAFT` across Courses/Services/Licensing), quick links scoped to `hasPermission(role, ...)`.
3. `/admin/leads`: Lead Inbox (requires `leads:view`):
   - Search by reference ID (`PS-...`), name, or normalized BD mobile
   - Filter by status (`NEW`..`SPAM`), pillar, date range
   - Lead detail drawer/panel (`AdminLeadPanel`) allowing `leads:update` status updates, internal staff notes, assignee selection (`leads:assign`), and sanitized CSV download button (`/api/admin/leads/export`, visible & functional only for `ADMIN` / `LEAD_MANAGER`).
4. `/admin/courses`: Full Course CRUD & publish toggle (`content:read`, `content:write`, `content:publish`). Must show `ContentStatus` (`DRAFT` | `PENDING_REVIEW` | `APPROVED` | `PUBLISHED`), `AvailabilityStatus` (`ACTIVE` | `UPCOMING` | `INTEREST_ONLY` | `INACTIVE`), editable modules/syllabus, verification date/reviewer fields, and revision history list! Warn clearly if `feeDisplay`/`duration`/`instructorId` remain empty until client confirmation.
5. `/admin/services`: Full Professional Service CRUD & publish toggle, editing `whoNeedsItBn`, `assistanceScopeBn`, `limitationsBn`, `documentsSummary`, `processSteps`, `authorityName`, separated fee notes (`serviceFeeNoteBn` / `govtFeeNoteBn`), `requiresSpecialist`, and `lastVerifiedAt`.
6. `/admin/licensing`: Full Licensing Entry CRUD & publish toggle, editing `authorityName`, `authorityType`, `officialSourceLabel`, `officialSourceUrl`, scope, limitations, docs, process, verification metadata.
7. `/admin/content`: FAQ manager (`faqs:manage`) — create/edit/publish Bengali FAQs with `pillar` and `isRegulatory` + verification date flags, plus Content Revisions viewer.
8. `/admin/settings`: Site Settings editor (`settings:manage`, `ADMIN` role ONLY) allowing white-label update of brand name, tagline, provisional identity flag, verified phone/WhatsApp/email/address, social links, legal disclaimer, privacy policy version, retention days, and staging banner. Never handle secrets here.
9. `/admin/audit`: Read-only Audit Log & Revision viewer (`audit:view`, `ADMIN` role ONLY).

## Verification
Run `npm run typecheck && npm run lint && npm run test` before reporting done.
