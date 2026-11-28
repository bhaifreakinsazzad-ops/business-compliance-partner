# Visual Comparison Report — BCP V8.0 vs. Client References

**Structural Reference:** `https://www.bunyanummarsus.com/` + Client Screenshots (`231239`, `231321`, `231335`, `231359`)  
**Color Reference:** `https://ibos.io/managerium/` + `WhatsApp Image 2026-11-26 at 23.05.45.jpeg`  
**Captured BCP Screenshots:** `docs/implementation/v8/screenshots/`

---

## 1. Side-by-Side Structural Fidelity Audit

| Page Region | Client Reference Pattern | BCP V8.0 Implementation (`screenshots/`) | Verified Result |
|---|---|---|---|
| **Top Utility Bar + Header** | Slim dark bar above clean white sticky bar, left brand lockup, centered single-row links, right action buttons | `#081838` WhatsApp utility strip (`+880 1521-537864`) + sticky `h-20` white header (`home-desktop-1440.png`, `home-mobile-390.png`), full `BUSINESS COMPLIANCE PARTNER` branding without ellipsis truncation | **Matched** |
| **Hero Slideshow + `01 — 04` Control Bar** | Compact hero banner + centered segmented pill (`01 — 04`, 4 horizontal segments, prev/pause/next) + hairline tagline divider | `PromotionalHeroSlider.tsx` inside `.bcp-periwinkle-hero-gradient` + single-row `01 — 04` control pill on desktop (`1440px`) and mobile (`390px`) + `ONE PARTNER · COMPLETE SOLUTIONS · CONFIDENT GROWTH` | **Matched** |
| **Three Commercial Gateways** | Clean centered multi-column gateway strip directly below hero divider | `PrimaryBusinessActions.tsx`: 3 equal `#E2E3FF` Periwinkle cards (`01 · COURSES`, `02 · SERVICES`, `03 · BOOKS`), full Bengali labels visible on 1–2 lines without truncation | **Matched** |
| **Popular Courses (`#pillar-courses`)** | Centered title + underline bar + filter pills (`সব` active blue) + 4-column white card grid with 16:9 visual top banner & `বিস্তারিত >` button | `PopularCoursesSection.tsx` + `src/lib/home/popular-courses.ts`: interactive category tabs, 16:9 BCP-owned course headers, honest availability/fee labels (`popular-courses-1440.png`) | **Matched** |
| **Services Gateway (`#pillar-services`)** | Rounded outer section with centered badge, dual-tone title, track tabs, left icon + checklist + WhatsApp CTA, right white elevated form card | `ServicesGatewaySection.tsx` inside `.bcp-periwinkle-service-frame` with 4 compliance tracks (`আয়কর ও ট্যাক্স`, `ভ্যাট ও মূসক ৯.১`, `Smart RJSC ও কোম্পানি`, `লাইসেন্সিং ও e-GP`), `#F5F6FA` form inputs, `#243FBA` CTA (`services-gateway-1440.png`) | **Matched** |
| **Books E-Commerce Storefront (`#pillar-books`)** | Dedicated product grid with category filters & portrait product cards | `BooksShowcaseSection.tsx`: category filter buttons + 4-column `aspect-[3/4]` hardcover BCP editions (`books-storefront-1440.png`), linked to interactive 3D `/books/[slug]` detail page (`book-detail-1440.png`) | **Matched** |
| **Institutional Profile** | Dark `#081838` 2-column card: left framed showcase card, right gold-numbered vertical timeline (`১–৪`) | `InstitutionalProfileSection.tsx`: `#081838` container, left card presenting official circular `public/brand/bcp-master-logo.png`, right 4 gold-numbered BCP capabilities (`institutional-profile-1440.png`, `home-desktop-full-1440.png`) | **Matched (Truthful Adaptation)** |
| **Contact Page (`/contact`)** | Centered header (`আমাদের সাথে যোগাযোগ করুন`), left contact cards + dark blue connect box, right elevated white form card | `src/app/contact/page.tsx`: `.bcp-periwinkle-contact-header`, verified WhatsApp card, `#202D72` quick-connect card, right `ConsultancyForm` (`contact-1440.png`) | **Matched** |

---

## 2. Browser QA Defects Caught & Resolved During Visual Inspection

1. **Gateway Card Bengali Title Truncation (Round 1 → Round 2 Fix):**
   - *Observed:* `আমাদের সকল কোর্সসমূহ` and `আমাদের সকল সেবাসমূহ` truncated with ellipsis inside `max-w-5xl` gateway cards.
   - *Fix (`PrimaryBusinessActions.tsx`):* Widened grid to `max-w-6xl`, refined icon/padding balance, and removed CSS `truncate` so complete Bengali headings render cleanly.
2. **Header Brand Ellipsis Clipping (Round 1 → Round 2 Fix):**
   - *Observed:* `BUSINESS COMPLIANCE PARTNER` truncated slightly at `1440px` due to desktop nav flex pressure.
   - *Fix (`AppHeader.tsx`, `NavLinksClient.tsx`):* Added `lg:shrink-0`, responsive typography scaling (`text-[11px] min-[380px]:text-[11.5px] sm:text-[15px] xl:text-[16px] lg:whitespace-nowrap`), and balanced link spacing (`gap-2 xl:gap-3`).
3. **Mobile `01 — 04` Slider Bar Wrapping at `390px` (Round 1 → Round 2 Fix):**
   - *Observed:* Segmented hero indicator wrapped onto two lines on `390px` mobile screens.
   - *Fix (`PromotionalHeroSlider.tsx`):* Tightened segment and button widths (`w-7 sm:w-12`, `w-3.5 sm:w-8`, `w-7 h-7 sm:w-8 sm:h-8`) so the entire indicator pill fits cleanly on a single row (`home-mobile-390.png`).
4. **Full-Page Below-the-Fold Image Capture Timing (Round 2 Verification):**
   - *Observed:* Lazy-loaded footer/profile circular logo images required scroll activation before full-page PNG capture.
   - *Verified:* Scrolled document sequentially and waited for image decode before capturing `docs/implementation/v8/screenshots/home-desktop-full-1440.png`; confirmed all BCP circular logos render cleanly across Header, Institutional Profile, and Footer.

---

## 3. Evidence Screenshot Index (`docs/implementation/v8/screenshots/`)

- `home-desktop-1440.png` — Above-the-fold Hero, `01 — 04` control bar, and 3 Periwinkle Gateways (`1440×900`)
- `popular-courses-1440.png` — Popular Courses grid & category tabs (`1440×900`)
- `services-gateway-1440.png` — Services Gateway split frame & Consultancy Form (`1440×900`)
- `books-storefront-1440.png` — Dedicated Books e-commerce showcase (`1440×900`)
- `institutional-profile-1440.png` — Midnight Navy 2-column Institutional Profile (`1440×900`)
- `home-desktop-full-1440.png` — Complete top-to-bottom desktop homepage (`1440px`)
- `contact-1440.png` — Periwinkle Contact page (`1440×900`)
- `book-detail-1440.png` — Interactive 3D hardcover detail & interest capture (`1440×900`)
- `home-mobile-390.png` — Mobile hero, single-row `01 — 04` pill, and stacked Periwinkle Gateways (`390×844`)
- `mobile-nav-390.png` — Mobile drawer menu (`390×844`)
