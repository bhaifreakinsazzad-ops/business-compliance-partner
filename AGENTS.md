# Business Compliance Partner (BCP) — Engineering & Operating Rules

This document establishes permanent operating rules, brand constraints, architectural guidelines, and quality standards for all autonomous agents and engineers contributing to the BCP codebase.

---

## 1. Project Identity & Brand Authority

- **Official Brand Name:** Business Compliance Partner
- **Official Abbreviation:** BCP
- **Official Tagline:** One Partner. Complete Solutions. Confident Growth.
- **Brand Promise:** Simplifying Compliance. Empowering Business Growth.
- **Primary Market:** Bangladesh.
- **Master Badge:** Official circular Navy–Gold badge (`public/brand/bcp-master-logo.png`).
  - **Rule:** Never redraw, alter, or replace the circular master logo using generative AI or auto-tracing.
  - **Rule:** Preserve original artwork, proportions, and gold/navy color fidelity.
- **Palette Tokens:**
  - Midnight Navy: `#081838`
  - Royal Gold: `#C59028`
  - Accent Gold Light: `#DFB15B`
  - Pearl White: `#F8F8F8`
  - Ivory: `#F5F1E8`
  - Emerald: `#00865A`
  - Charcoal: `#181D26`
  - Slate Muted: `#596775`

---

## 2. Source-of-Truth Hierarchy

1. Latest explicit project-owner instructions.
2. BCP Final Client Business Overview & Implementation Plan V2.0.
3. BCP Revised Master Business Knowledge Base V1.1.
4. BCP Official Brand Book and Brand Configuration V1.0.
5. Authoritative BCP service catalogue V1.1 (`prisma/seed-data/bcp-catalogue-v1.1.json`).
6. Current repository implementation and verified schema.

---

## 3. Authoritative 437-Record Inventory Governance

- Total Source Records: **437**
  - **Learn (Courses):** 105 records (IDs: A-001 through A-105)
  - **Services:** 247 records (IDs: B-001 through B-247)
  - **Licensing & Registration:** 85 records (IDs: C-001 through C-085)
- Categories: **27 distinct categories** across the 3 operational pillars.
- Consultancy is an interactive customer intake pillar and must not inflate the 437-record source inventory.
- Ingestion is governed via `CatalogueSourceRecord`, `CatalogueOfferingMapping`, and `ImportBatch`.
- Ingestion command: `npm run catalogue:import` (dry run via `npm run catalogue:dry-run`).
- **Rule:** Unverified offerings remain in `UNVERIFIED` and `DRAFT` status until explicit client sign-off. Never publish fabricated prices, durations, or government approvals.

---

## 4. Architecture & Security Non-Negotiables

1. **Stack:** Next.js 15 App Router, React 19, TypeScript, Tailwind CSS 4, PostgreSQL, Prisma ORM 6, Zod, Vitest.
2. **Never expose secrets:** No passwords, database connection strings, private API keys, or personal customer information in code, logs, or public repositories.
3. **Database Health:** Never substitute demo catalogue records for production inventory. Fixtures are permitted only in isolated development/test or explicitly enabled non-production staging. Public routes remain truthful when inventory cannot be loaded.
4. **Customer vs. Staff Isolation:** Customer sessions (`bcp_customer_session`) and Staff Admin sessions (`bcp_admin_session`) are strictly isolated with independent cookie names, tokens, and authorization middleware.
5. **Private Document Protection:** Customer identity papers, financial records, and tax filings must never be stored in public directories or public CDNs. Use private server-authenticated endpoints.
6. **No Floating-Point Money:** In commerce modules, always calculate monetary values safely in BDT using exact integer paisa arithmetic or validated decimal representations.
7. **No Synthetic Guarantees:** Never claim guaranteed license issuance, government approval, legal victory, or simulated revenue.

---

## 5. Quality Pipeline & Deployment Gates

Every pull request or release branch must pass the full verification suite before merge:

```bash
npm run typecheck   # 0 TypeScript errors
npm run lint        # 0 ESLint errors
npm run test        # 100% passing Vitest test suite
npm run build       # Next.js clean production build
```

- **Production Git Remote:** `origin` points to `https://github.com/bhaifreakinsazzad-ops/business-compliance-partner.git`.
- **Target Vercel Project:** `business-compliance-partner` (`w9h-engineering`).
- Keep `main` and `feature/bcp-final-delivery-v3` synchronized and verified.

---

## 6. V7.0 Executive Signature — Living Lavender Governance

1. **Executive Lavender Visual Authority:**
   - The three flagship homepage cards (`Our Courses → Our Services → Our Books`) MUST remain in that exact DOM order and share the unified Muted Lavender (`#DDD6EB`) fill treatment (`rgb(221, 214, 235)`). Never restyle the homepage to predominantly navy-and-gold or assign unrelated colors per flagship card.
   - Maintain crisp mobile typography and flexible header sizing (`min-w-0 flex-1 lg:flex-initial`) so `320px` and `390px` viewports never suffer horizontal overflow (`scrollWidth <= clientWidth`).
2. **Fail-Closed Durable Private Document Storage (`src/lib/storage/private-documents.ts`):**
   - Production requires durable object storage (`PRIVATE_STORAGE_PROVIDER=S3|SUPABASE` with complete endpoint/bucket/credentials) and fails closed (`503 STORAGE_NOT_CONFIGURED`) Local ephemeral overrides are restricted to non-live test environments. New uploads remain quarantined until an authorized safety review.
   - Enforce binary magic-byte verification, SHA-256 checksum persistence and verification on download (`422`), quarantine enforcement (`423`), traversal-safe storage key resolution, and sanitized `Content-Disposition` headers.
   - Least-privilege RBAC (`src/lib/security/rbac.ts`): `ADMIN` holds `documents:admin`, `documents:delete`, `documents:download`, and `orders:cancel`; `LEAD_MANAGER` holds `documents:review` and `orders:manage` without unredacted customer document download or order cancellation; `EDITOR` is restricted to content management.
3. **Exact Integer-Paisa Commerce & Idempotency (`src/lib/commerce/`):**
   - Keep `src/lib/commerce/payments.ts` browser-safe (no `node:crypto` imports) and keep `hashIdempotencyPayload` inside server-only `src/lib/commerce/checkout-rules.ts`.
   - Duplicate `bookId` checkout line items MUST be merged deterministically BEFORE enforcing per-book (`<= 20`) and total-order (`<= 50`) quantity caps.
   - Reusing an idempotency key with a different canonical SHA-256 payload hash MUST fail with `409 IDEMPOTENCY_KEY_MISMATCH`.
   - Quote acceptance and sandbox payment verification MUST execute atomic conditional `updateMany` state guards; order cancellations MUST restore book stock (`BookInventoryMovement` `ORDER_CANCELLED_RESTORE`) and void open `DUE` invoices inside a single Prisma transaction.
   - Sandbox payments MUST remain gated on BOTH non-production environment AND `SANDBOX_PAYMENTS_ENABLED=true`.
4. **Authoritative LMS Entitlements:**
   - Course enrollment and lesson progress (`/api/lms/enroll`, `/api/lms/progress`, `/api/lms/certificate`) MUST enforce `Course.enrollmentModel` (`FREE`, `PAID`, `ENQUIRY_ONLY`, `INVITATION_ONLY`, `UNAVAILABLE`) and verify active `CourseEntitlement` records.
5. **Verified Analytics Separation:**
   - Browser `trackEvent()` (`src/lib/analytics/events.ts`) always emits `client_observed` and strips forbidden PII keys.
   - Authoritative conversions (`order_created`, `payment_verified`, `enrollment_completed`) are recorded exclusively server-side (`src/lib/analytics/server.ts`) as `server_verified` (`AnalyticsServerEvent`).
6. **3D, WebGL & Motion Discipline:**
   - Never use deprecated `THREE.Clock`; use pure monotonic delta timing (`src/lib/three/timing.ts`).
   - Apply coalesced on-demand rendering (`requestRender()`) and software-WebGL fence synchronization (`awaitWebGLFrameFence()` via `gl.fenceSync`) without continuous unbounded 60Hz `requestAnimationFrame` spinning.
   - Never apply `backdrop-blur-*` overlays over WebGL `<canvas>` elements, and never run CSS `transform` transitions concurrently with Motion `whileHover`/`whileTap` on the same element.
7. **Health Endpoint Redaction (`/api/health`):**
   - Public `/api/health` responses return minimal `{ ok, status, timestamp }` without database, environment, or storage diagnostics unless authenticated via a valid `ADMIN` session or timing-safe `HEALTHCHECK_TOKEN`.

