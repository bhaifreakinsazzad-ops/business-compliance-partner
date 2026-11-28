# Three-Gateway Commercial Architecture — BCP V8.0

**Mandatory Sequence:** `1. Courses` → `2. Services` → `3. Books`  
**Authoritative Config:** `src/lib/config/pillars.ts` (`MASTER_THREE_PILLARS`)

---

## 1. Unified Navigation & Gateway Order

Every navigation menu, gateway button bar, homepage section band, and footer column follows the identical sequence:

1. **`Courses` (`আমাদের সকল কোর্সসমূহ`)** — Route: `/courses` (`GraduationCap`, `data-*-pillar="courses"`)
2. **`Services` (`আমাদের সকল সেবাসমূহ`)** — Route: `/services` (`BriefcaseBusiness`, `data-*-pillar="services"`; Licensing `/licensing` and Consultancy `/consultancy` operate as Services extensions)
3. **`Books` (`আমাদের সকল বইসমূহ`)** — Route: `/books` (`BookOpen`, `data-*-pillar="books"`, dedicated e-commerce publication storefront)

---

## 2. Homepage Section Architecture (`src/app/page.tsx`)

1. **`AppHeader`:** Slim `#081838` WhatsApp utility strip (`+880 1521-537864`) + white sticky header (`হোম`, `Courses`, `Services`, `Books`, `আমাদের সম্পর্কে`, `যোগাযোগ`, `Ctrl+K` quick search, Customer Portal, Consultancy button).
2. **`PromotionalHeroSlider`:** Compact 4-slide promotional showcase inside `.bcp-periwinkle-hero-gradient` with centered `01 — 04` segmented bar, pause/prev/next controls, and `One Partner · Complete Solutions · Confident Growth` tagline divider.
3. **`PrimaryBusinessActions`:** Three unified `#E2E3FF` Periwinkle gateway buttons (`Courses → Services → Books`).
4. **`PopularCoursesSection` (`#pillar-courses`):** Centered heading (`আমাদের জনপ্রিয় কোর্সসমূহ`), interactive category tabs (`src/lib/home/popular-courses.ts`), 4-column desktop cards with 16:9 BCP-owned track graphics, fee/availability badge, and `বিস্তারিত >`.
5. **`ServicesGatewaySection` (`#pillar-services`):** Rounded `.bcp-periwinkle-service-frame` with centered heading (`আমাদের পেশাদার সেবাসমূহ`), 4 interactive compliance track tabs (`আয়কর ও ট্যাক্স`, `ভ্যাট ও মূসক ৯.১`, `Smart RJSC ও কোম্পানি`, `লাইসেন্সিং ও e-GP`), 5-bullet overview + WhatsApp CTA on left, and compact `ConsultancyForm` white card on right.
6. **`BooksShowcaseSection` (`#pillar-books`):** Soft periwinkle e-commerce publication storefront (`আমাদের সকল বইসমূহ`), category tabs, 4-column `aspect-[3/4]` hardcover showcase cards, honest `প্রকাশনা আসন্ন` / BDT pricing badge, and direct `/books/[slug]` navigation.
7. **`InstitutionalProfileSection`:** Midnight Navy (`#081838`) 2-column institutional credential block displaying the official circular BCP badge (`public/brand/bcp-master-logo.png`) on the left and 4 numbered (`১–৪`) regulatory focus areas on the right.
8. **Contact & Regulatory Transparency Band + `AuthorityNote` + `Footer`.**

---

## 3. Books E-Commerce Storefront & Detail Flow

- Homepage (`BooksShowcaseSection`) and `/books` catalog present books as a clean, trustworthy publication marketplace with category filtering, search (`SearchBox`), and portrait hardcover covers (`BookCard`).
- Each `/books/[slug]` page pairs an interactive 3D hardcover preview (`BookPreview3D` with monotonic timing and WebGL fence synchronization), verified publication details, `BookCheckoutPanel` (active when published & priced in DB), WhatsApp order/enquiry support, and cross-division links to related Courses and Services.
- Pre-launch books remain honestly marked `প্রকাশনা আসন্ন` with zero fabricated prices or publication dates.
