# Business Compliance Partner (BCP) — V8.3 Placeholder Resolution Report

## 1. Visual Defects Remediated in Owner-Supplied `.webp` Artwork

| File | Detected Issue | Resolution Applied | Verification Status |
|---|---|---|---|
| `hero-brand.webp` | Tilted desk form sheet displayed garbled OCR-like string `"Risk & Siptliance"` | Seamlessly matched gradient paper surface `#F7F8FD→#ECEEF8` and replaced angled text with crisp `"Risk & Governance"` serif typography matching perspective skew/rotation | Visually inspected (`1672×941`) |
| `course-income-tax.webp` | Tax desk sheet cell read `"PAN"` (Indian Permanent Account Number) instead of Bangladesh tax identifier | Cleanly replaced `"PAN"` inside table cell with Bangladesh `"e-TIN"` rotated/skewed to match form baseline | Visually inspected (`1672×941`) |
| `course-company-secretarial.webp` | Laptop screen displayed a synthetic green-and-red circular emblem resembling an official government seal | Replaced synthetic seal with a restrained non-governmental BCP Navy & Gold corporate building badge | Visually inspected (`1672×941`) |
| `course-entrepreneurship-sme.webp` | Typo `"Enterpreneurship &"` on wide `825×221` banner | Corrected spelling cleanly to `"Entrepreneurship &"`, cleared residual ascender specks, and centered inside `960×540` `16:9` Periwinkle canvas | Visually inspected (`960×540`) |

---

## 2. Architectural & Placeholder Cleanup Verified

1. **Zero Duplicate Hero Text Overlays**: Replaced heavy floating gradient boxes and duplicate logo medallions inside `PromotionalHeroSlider.tsx` with clean full-bleed campaign artwork + compact bottom frosted CTA strip (`[data-hero-cta-strip]`), preserving a single semantic `<h1>` visually accessible for screen readers and crawlers.
2. **Unified `16:9` Course Row Geometry**: Framed all 5 wide (`825×221–223`) course banners onto cohesive `960×540` Periwinkle studio canvases so mixed-resolution rows never clip badge arcs or shift card height.
3. **Strict Book Cover Isolation**: Removed `BOOK_CATEGORY_TO_DEFAULT_SLUG` cross-book inheritance in `src/lib/config/media-manifest.ts` so newly created or unknown books never falsely display another title's front cover; they cleanly fall back to `book-default.webp`.
4. **Honest Division Empty States**: Replaced generic fallback blocks on `/courses`, `/services`, `/licensing`, `/books`, `PopularCoursesSection`, and `BooksShowcaseSection` with division-specific V8.3 illustrations (`courses-empty-state.webp`, `services-empty-state.webp`, `books-empty-state.webp`) paired with contextual `"no-results"`, `"unpublished"`, and `"unavailable"` states.
5. **Truthful Upcoming Publication Framing**: Preserved `"আসন্ন প্রকাশনা"` / `"আগ্রহ নিবন্ধন"` messaging across all 11 preview books with zero invented prices, discounts, ISBNs, or staff bios/portraits.
