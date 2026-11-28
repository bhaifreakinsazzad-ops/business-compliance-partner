# Business Compliance Partner (BCP) — V8.3 Known Limitations & Governance Notes

1. **Container Git Remote & Deployment Access**
   - The AI Studio execution container does not include `.git` repository metadata or Vercel deployment credentials; therefore, git branch push (`feature/bcp-final-delivery-v3` / `main`) and Vercel production redeploy must be synchronized from the verified workspace archive outside the sandbox.

2. **PostgreSQL & Live Database Dependencies in Preview Container**
   - Public routes remain fail-closed and truthful when `DATABASE_URL` is absent or unmigrated, displaying governed fallback fixtures only when `canUseCatalogueFixtures()` permits (never substituting demo records for live production when `DISABLE_SEED_FALLBACK=true`).
   - When a live production database returns zero records or is temporarily unreachable, division catalog pages (`/courses`, `/services`, `/licensing`, `/books`) render honest division-specific empty states (`courses-empty-state.webp`, `services-empty-state.webp`, `books-empty-state.webp`) with retry and consultancy links.
   - `/api/health` returns `503` unconfigured status when `DATABASE_URL` is not provisioned (expected security-by-design behavior).

3. **Pre-Release Book Edition & Strict Slug Isolation**
   - All 11 books in `BOOK_PREVIEW_CATALOG` remain in `UPCOMING_PREVIEW` commercial state until Admin publishes real stock, BDT integer-paisa pricing, and ISBN metadata.
   - `resolveBookCoverAsset()` strictly matches exact book slugs and falls back to neutral `book-default.webp` for any future unmapped book slug so no new book inherits another book's titled cover.

4. **Verified Contact Channels & Unfabricated Institutional Identity**
   - Only the client-verified official WhatsApp channel (`+880 1521-537864`) is published by default until physical address, phone, and email are populated in `SiteSetting`.
   - Zero staff bios or portraits were invented; `InstitutionalProfileSection` features the supplied portrait `bcp-institutional-poster.webp` on Slide 1 and `bcp-studio-editorial.webp` on Slide 2.

5. **Software-Rendered Headless Browser & WebGL Preview**
   - Interactive `BookPreview3D.tsx` renders in software SwiftShader WebGL (`awaitWebGLFrameFence()` + coalesced on-demand rendering) and degrades cleanly to the crisp `1200×1600` (`3:4`) static `.webp` cover image on headless or WebGL-disabled environments.
