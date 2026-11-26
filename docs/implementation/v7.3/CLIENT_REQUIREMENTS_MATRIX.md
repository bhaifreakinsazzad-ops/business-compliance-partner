# Client Requirements Verification Matrix — V7.3

| Req ID | Client Revision Requirement | Implementation Artifact(s) | Status |
|---|---|---|---|
| **CR-01** | Primary commercial foundation & exact sequence: `1. Courses -> 2. Services -> 3. Books` | `src/lib/config/pillars.ts`, `src/styles/tokens.json` | **Verified** |
| **CR-02** | Visible exact English words `Courses`, `Services`, `Books` paired with Bengali labels (no substitute labels) | `NavLinksClient.tsx`, `MobileNavigation.tsx`, `PrimaryBusinessActions.tsx`, `Footer.tsx`, `CTASection.tsx` | **Verified** |
| **CR-03** | Desktop nav supports direct navigation to `/courses`, `/services`, `/books` AND accessible mega-menus | `src/components/layout/NavLinksClient.tsx` | **Verified** |
| **CR-04** | Mobile drawer leads strictly with `1. Courses`, `2. Services`, `3. Books` with consistent icons & supporting links separated | `src/components/layout/MobileNavigation.tsx`, `src/components/layout/AppHeader.tsx` | **Verified** |
| **CR-05** | Three flagship cards share identical `#DDD6EB` Muted Lavender surface, equal visual weight, and exact order | `src/components/home/PrimaryBusinessActions.tsx`, `src/app/globals.css` | **Verified** |
| **CR-06** | Compact hero establishes three-pillar positioning ("Learn with confidence. Get professional assistance. Discover practical knowledge.") | `src/components/home/PromotionalHeroSlider.tsx` | **Verified** |
| **CR-07** | Homepage reorganized into distinct Pillar 01 (`Courses`), Pillar 02 (`Services` + Licensing/Consultancy), Pillar 03 (`Books`), plus connected ecosystem | `src/app/page.tsx`, `src/components/home/ConnectedEcosystemShowcase.tsx` | **Verified** |
| **CR-08** | Unified & Quick search support `All | Courses | Services | Books` division filter tabs and grouped results | `src/components/home/UnifiedSearchSection.tsx`, `src/components/layout/QuickSearchDialog.tsx` | **Verified** |
| **CR-09** | Bidirectional cross-division journeys linking Courses ↔ Services ↔ Books on detail pages | `src/app/courses/[slug]/page.tsx`, `src/app/services/[slug]/page.tsx`, `src/app/books/[slug]/page.tsx` | **Verified** |
| **CR-10** | Closing CTA supports all three paths (`Explore Courses`, `Explore Services`, `Explore Books`) | `src/components/shared/CTASection.tsx`, `src/app/page.tsx` | **Verified** |
| **CR-11** | Preserve untouched circular logo badge, Mode A truthfulness, 437-record inventory, security & RBAC | `src/lib/config/site.ts`, `src/lib/books/catalog.ts`, existing portal/admin routes | **Verified** |
| **CR-12** | Three.js scenes follow monotonic delta timing (`createDeltaTimer`) + WebGL fence pacing (`awaitWebGLFrameFence`), zero `THREE.Clock` | `src/components/ui/HeroCanvas3D.tsx`, `src/components/three/HeroKnowledgeStudio3D.tsx`, `src/components/three/BookPreview3D.tsx` | **Verified** |
