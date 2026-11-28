# Business Compliance Partner (BCP) — V8.3 Reference Visual Comparison Report

**Comparison Baseline:**
1. **Structural & Experiential Reference:** Bunyanum Marsus (`bunyanummarsus.com` / `Recording 2026-11-28 115516.mp4`)
2. **Color Grading Reference:** AKIJ iBOS (`ibos.io/managerium/`) White-to-Periwinkle Spectrum (`#FFFFFF → #FBFAFF → #E2E3FF → #B8BBFF → #243FBA → #202D72`)
3. **Previous Baseline:** BCP V8.2 → V8.3 Branded Asset Integration & Visual Finishing

---

## 1. Structural & Color Parity Matrix

| Homepage Zone | Reference Pattern (Bunyanum Marsus + AKIJ iBOS) | V8.3 Live Implementation (`public/assets/bcp/` + UI) | Visual Evidence (`docs/implementation/v8.3/screenshots/`) |
|---|---|---|---|
| **Top Utility Bar & Sticky Header** | Clean Midnight Navy utility strip + balanced single-row white sticky header with search & primary CTA | Preserves circular BCP seal (`/brand/bcp-master-logo.png`), crisp `Courses · Services · Books` dropdown order, responsive mobile header (`min-w-0 flex-1` avoiding `320px` overflow) | `home-hero-slide-01-1440.png`, `home-390.png`, `home-320.png` |
| **Perspective Coverflow Hero Carousel** | Full-bleed campaign artwork in center focal card flanked by angled adjacent previews + centered progress pill controls | Integrates all 4 V8.3 `1672×941` campaign banners (`hero-brand`, `hero-courses`, `hero-services`, `hero-books`) without heavy duplicated overlay text boxes; compact frosted `[data-hero-cta-strip]` anchors CTAs cleanly at bottom edge | `home-hero-slide-01-1440.png` .. `home-hero-slide-04-1440.png`, `home-1920.png` |
| **Three-Gateway Compact Strip** | Concise pill/card commercial doorway row immediately anchoring hero | Strict V8.3 order (`01 · Courses → 02 · Services → 03 · Books`) with uniform Soft Ice Lavender surfaces (`#E2E3FF`) | `home-hero-slide-01-1440.png`, `home-768.png` |
| **Popular Courses Storefront** | Category filter pills (`All` + subject tabs) over crisp `3×2` card grid | Displays 6 priority BCP tracks across `3` columns on desktop; all `16:9` cards aligned (`1672×941` native + `960×540` studio-framed wide banners) with crisp `Income Tax` (`e-TIN` fix) and `RJSC & Corporate Law` (non-govt badge fix) thumbnails | `home-courses-1440.png`, `home-desktop-full-1440.png` |
| **Services Gateway & Enquiry Panel** | Periwinkle spotlight stage paired side-by-side with interactive track selector and direct enquiry intake form | Tabs (`Tax`, `VAT 9.1`, `Smart RJSC`, `Licensing & e-GP`) switch seamlessly between `1672×941` and centered `825×221` artwork inside a locked `aspect-video` container beside the validated BD intake form | `home-services-1440.png`, `home-services-rjsc-1440.png` |
| **Books & Publications Showcase** | Dedicated editorial storefront featuring upright `3:4` book cover previews | Showcases 8 upfront covers (11 total catalogued in `/books`) with authentic BCP `1200×1600` (`3:4`) concept artwork and honest `"প্রকাশনা আসন্ন"` status (interactive 3D book preview on `/books/[slug]`) | `home-books-1440.png`, `books-1440.png`, `book-detail-1440.png` |
| **How BCP Works & Institutional Profile** | 4-step operating sequence followed by alternating Periwinkle institutional profile slider | Slide 1 showcases `4:5` portrait `bcp-institutional-poster.webp` (`hideMedallionLogo={true}` eliminating duplicate circle seal); Slide 2 pairs `bcp-studio-editorial.webp` with BCP's 48px master seal and 4 transparent operating principles | `home-institutional-1440.png`, `home-institutional-slide2-1440.png`, `home-desktop-full-1440.png` |
| **Support Banner & Division Empty States** | Branded visual headers on contact page and empathetic recovery views on filtered/empty routes | `/contact` displays centered `customer-support.webp` banner; filtered zero-match states on `/courses`, `/services`, `/books` render dedicated V8.3 illustrations with reset & consultancy CTAs | `contact-1440.png`, `empty-courses-1440.png`, `empty-services-1440.png`, `empty-books-1440.png` |

---

## 2. Visual Gains From V8.2 → V8.3

1. **Zero Generic Desk Mockups in Primary Flows:** Replaced transitional V8.2 placeholders in hero, courses, services, institutional Slide 1, contact support header, and division empty states with the 34 owner-supplied branded BCP artworks.
2. **Elimination of Hero Duplication:** Removed redundant floating badge/heading overlays over hero banners that already carry BCP's high-contrast artwork typography, keeping a single screen-reader-accessible `<h1>`.
3. **Remediated Micro-Defects Before Production:** Fixed `"Risk & Siptliance"` → `"Risk & Governance"`, `"PAN"` → Bangladesh `"e-TIN"`, synthetic green/red emblem → BCP Navy & Gold corporate badge, and `"Enterpreneurship &"` → `"Entrepreneurship &"`.
4. **Mobile Footer Target-Size Hardening:** Raised compact mobile footer link touch targets (`min-h-7`) to resolve WCAG 2.2 AA `target-size` compliance at `320px` while preserving crisp two-column desktop footer geometry.
