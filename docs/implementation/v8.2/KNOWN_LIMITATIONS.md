# Business Compliance Partner (BCP) — V8.2 Known Limitations & Governance Notes

1. **PostgreSQL & Live Database Dependencies in Staging/Preview Environments**
   - Public routes remain fail-closed and truthful when `DATABASE_URL` is absent or unmigrated, using governed fallback fixtures only when `canUseCatalogueFixtures()` permits (never substituting demo records for live production when `DISABLE_SEED_FALLBACK=true`).
   - `/api/health` returns `503` unconfigured status when `DATABASE_URL` is not provisioned (expected security-by-design behavior).

2. **Pre-Release Concept Artwork Scope**
   - All 11 books in `BOOK_PREVIEW_CATALOG` remain in `UPCOMING_PREVIEW` commercial state; their portrait covers are explicitly labeled as **"প্রস্তাবিত কনসেপ্ট প্রচ্ছদ · BCP CONCEPT EDITION"** until client-approved pricing, ISBNs, and print inventory are published in Admin.
   - No instructor, founder, or author human portraits were fabricated; `ExpertProfile` uses architectural studio photography paired with official brand assets.

3. **Verified Contact Channels**
   - Only the client-verified official WhatsApp channel (`+880 1521-537864`) is published by default. Phone, email, and physical office address remain omitted until entered in `SiteSetting` by an authorized Admin.

4. **Static Asset Optimization & Prisma Media Columns**
   - Media mappings live in `src/lib/config/media-manifest.ts` rather than altering the production Prisma schema (`Course`, `Book`, `Instructor` tables). Future Admin uploads can extend `media-manifest.ts` or add nullable URL columns via a planned forward migration.

5. **Playwright Visual Verification in Software-Rendered Container**
   - Chromium headless rendering uses software SwiftShader / WebGL fence synchronization (`BookPreview3D.tsx`) which automatically adapts pixel ratio and frame cadence so interactive 3D previews remain responsive without GPU locks.
