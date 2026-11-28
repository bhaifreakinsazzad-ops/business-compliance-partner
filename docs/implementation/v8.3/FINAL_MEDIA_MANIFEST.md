# Business Compliance Partner (BCP) — V8.3 Final Media Manifest

**Source Manifest Module:** `src/lib/config/media-manifest.ts`  
**Total Registered Production Assets:** 39 governed entries (34 owner-supplied/remediated `.webp` assets + 4 preserved fallbacks/studio assets + 1 master brand logo)

---

## 1. Provenance Taxonomy

| Provenance Token | Meaning | Count |
|---|---|---:|
| `BCP_MASTER_BRAND_BOOK_V1` | Unaltered circular master seal (`/brand/bcp-master-logo.png`) | 1 |
| `BCP_SUPPLIED_BRANDED_V83` | Direct owner-supplied `.webp` asset integrated at native fidelity | 26 |
| `BCP_REMEDIATED_BRANDED_V83` | Owner-supplied asset with localized text/e-TIN/seal remediation cleanly applied in WebP | 4 |
| `BCP_FRAMED_WIDE_V83` | Owner-supplied `825×221–223` banner centered inside unified `960×540` (`16:9`) Periwinkle studio canvas | 4 |
| `BCP_GENERATED_EDITORIAL_V82` | Preserved V8.2 editorial studio visual (`bcp-studio-editorial.webp`, `service-editorial-kit.webp`) | 2 |
| `BCP_COMPOSED_CONCEPT_V82` | Neutral pillar fallback cover / empty state (`course-default`, `book-default`, `empty-catalogue`) | 3 |

---

## 2. Resolver Contracts

1. `resolveHeroSlideAsset(slideId)` → Returns the exact `1672×941` (`16:9`) campaign banner for `"ecosystem-overview"`, `"professional-courses"`, `"tax-vat-services"`, or `"books-storefront"`.
2. `resolveCourseThumbnailAsset(categorySlug, offeringSlug?)` → Deterministically resolves all 10 `COURSES` category slugs (`5` native `1672×941` + `5` studio-framed `960×540`), guaranteeing uniform `16:9` proportions and `DEFAULT_COURSE_MEDIA` fallback for unmapped categories.
3. `resolveServiceTrackAsset(trackId)` → Maps `"tax"` (`1672×941`), `"vat"` (`1672×941`), `"rjsc"` (`825×221`), and `"licensing"` (`825×221`) for `ServicesGatewaySection.tsx`.
4. `resolveBookCoverAsset(bookSlug, categorySlug?)` → **Strict slug lookup** across all 11 preview books (`1200×1600`, `3:4`). Unknown or newly created book slugs strictly return `DEFAULT_BOOK_COVER_MEDIA` (`book-default.webp`) rather than borrowing another book's titled cover.
5. `resolveInstitutionalAsset(slideId)` → Returns portrait `bcp-institutional-poster.webp` (`1122×1402`, `4:5`) on Slide 1 (`"foundation"`) and `bcp-studio-editorial.webp` (`1024×768`, `4:3`) on Slide 2 (`"standards"`).
6. `resolveSupportBannerAsset()` → Returns `customer-support.webp` (`825×221`) for `/contact`.
7. `resolveEmptyStateAsset(variant)` → Returns `"courses"`, `"services"`, `"books"`, or `"generic"` empty-state illustration cleanly mapped to `<EmptyState variant="..." />`.
