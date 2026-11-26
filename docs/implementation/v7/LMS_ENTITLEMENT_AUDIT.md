# LMS Entitlement Audit — BCP V7.0

## 1. Enrollment Model & Entitlement Governance

- **Schema Governance (`prisma/schema.prisma`, `20261127000000_v7_executive_hardening`):**
  - `Course.enrollmentModel` (`CourseEnrollmentModel`: `OPEN` | `PAID` | `RESTRICTED`, default `OPEN`) and `Course.pricePaisa` (`Int?`).
  - `CourseEntitlement` links `customerId`, `courseId`, `status` (`ACTIVE` | `REVOKED` | `EXPIRED`), `source` (`FREE_OPEN` | `PAID_ORDER` | `ADMIN_GRANT`), optional `orderId`, and `expiresAt`.
- **Admin CMS Governance (`src/lib/validation/content.ts`, `/api/admin/courses/**`):**
  - `courseUpsertSchema` validates and exposes `enrollmentModel` and integer `pricePaisa` to authorized admins (`courses:manage`).

## 2. API Enforcement Across Student Journeys

- `POST /api/lms/enroll`: Checks `Course.enrollmentModel`. `OPEN` courses automatically ensure an `ACTIVE` `FREE_OPEN` `CourseEntitlement` record. `PAID` and `RESTRICTED` courses deny self-enrollment unless an active, unexpired `CourseEntitlement` already exists.
- `POST /api/lms/progress`: Verifies both `Enrollment` AND active `CourseEntitlement` for non-open courses. If a paid entitlement was revoked or expired, progress updates fail closed (`403 ENTITLEMENT_INACTIVE`). Completion triggers server-verified `enrollment_completed` analytics via `recordServerVerifiedEvent`.
- `POST /api/lms/certificate`: Issues completion certificates only after verified entitlement + full lesson progress.

## 3. Verification Status

- `tests/integration/v7-security-commerce.test.ts` (**PASSED**): Verified `Course.enrollmentModel` enforcement and immediate progress rejection when a `PAID` `CourseEntitlement` is revoked/inactive.
- `tests/integration/v6-security-commerce.test.ts` (**PASSED**): Verified enrollment, progress tracking, and certificate issuance baseline.
