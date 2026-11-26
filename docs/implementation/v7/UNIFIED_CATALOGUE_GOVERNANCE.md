# Unified Catalogue & Content Governance — BCP V7.0

## 1. 437-Record Source-of-Truth Preservation

- **Total Source Inventory:** **437** records across **27 categories**:
  - Learn (Courses): **105** (`A-001` – `A-105`)
  - Services: **247** (`B-001` – `B-247`)
  - Licensing & Registration: **85** (`C-001` – `C-085`)
- **Consultancy Isolation:** Remains strictly an interactive intake channel (`/consultancy`, `/api/leads`) and never inflates the 437-record source count.
- **Dry-Run Verification:** `npm run catalogue:dry-run` verified 437 entries across 27 categories with `0` skipped records and `0` errors.

## 2. Fail-Closed Draft & Governance Enforcement (`src/lib/services/catalogue.ts`, `src/lib/books/catalog.ts`)

- Public slug resolvers (`getPublishedCourseBySlug`, `getPublishedServiceBySlug`, `getPublishedLicensingBySlug`, `getGovernedBookBySlug`) execute exact `findUnique({ where: { slug } })` queries when the database is populated.
- If a database record exists with `status !== "PUBLISHED"` (e.g., `DRAFT` or `INACTIVE`), or if the table is populated and the slug is absent, resolvers return `null` (fail closed) rather than falling back to seed files—preventing unpublished drafts from leaking onto public routes.
- **Books Dual Publication State:** `UPCOMING_PREVIEW` books display editorial preview + WhatsApp/online interest capture with zero synthetic prices; `PUBLISHED_PRICED` books unlock integer-paisa checkout (`BookCheckoutPanel.tsx`).
- **Editorial Truthfulness:** Zero fabricated pricing, durations, customer review counts, or synthetic government approval guarantees anywhere in public views.
