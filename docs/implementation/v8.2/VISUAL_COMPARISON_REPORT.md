# Business Compliance Partner (BCP) — V8.2 Visual Comparison Report

**Reference Anchors:**
- Layout, Coverflow Carousel, Browsing Rhythm & Card Flow: Bunyanum Marsus (`Recording 2026-11-28 115516.mp4`)
- Color Grading & Surface Atmosphere: AKIJ iBOS White-to-Periwinkle Palette (`#FFFFFF` → `#FBFAFF` → `#E2E3FF` → `#B8BBFF` + `#243FBA` / `#202D72`)
- Brand Authority & Structure: BCP Official Master Badge (`/brand/bcp-master-logo.png`), `Courses → Services → Books`

---

## 1. Visual Evolution: V8.1 Baseline → V8.2 Production Finishing

| Area | V8.1 Baseline Observation | V8.2 Finished Outcome | Evidence |
|---|---|---|---|
| **Hero Coverflow Slides (01–04)** | Used flat CSS gradients, SVG circles/arcs, and a right-side 3-card checklist block causing visual clutter. | Art-directed `1280×720` campaign `.webp` photography with directional contrast scrims, clean left typography safe zones, zero checklist clutter, and crisp tilted 3D wings. | `screenshots/home-hero-slide-01-1440.png` through `04-1440.png` |
| **Compact Gateways** | Three Periwinkle gateways (`rgb(226, 227, 255)`) ordered `Courses → Services → Books`. | Preserved exact order, color (`rgb(226, 227, 255)`), height (`<= 80px`), and crisp horizontal rhythm on desktop + vertical stack on 320–390px mobile. | `screenshots/home-hero-slide-01-1440.png`, `screenshots/home-320.png` |
| **Course Cards (`Courses`)** | Category cards displayed repetitive SVG circle templates and Lucide box icons. | Replaced with 10 bespoke `16:9` subject-specific `.webp` thumbnails featuring track schematics, photographic textures, and restrained BCP seals. | `screenshots/home-courses-1440.png`, `screenshots/courses-1440.png` |
| **Services Gateway (`Services`)** | Left column held heading + checklist only; right column held `ConsultancyForm`. | Added dynamic `960×360` editorial track visual headers synchronized with each tab (`tax`, `vat`, `rjsc`, `licensing`) while preserving `ConsultancyForm` alignment. | `screenshots/home-services-1440.png`, `screenshots/services-1440.png` |
| **Books Storefront (`Books`)** | CSS-simulated colored `div` rectangles + `"Client Approval Pending"` on 3D back cover. | Replaced with 11 portrait `3:4` concept hardcover `.webp` covers displaying linen binding, BCP crest medallion, and transparent `"প্রস্তাবিত কনসেপ্ট প্রচ্ছদ"` labeling synced across 2D cards and WebGL 3D preview. | `screenshots/home-books-1440.png`, `screenshots/books-1440.png`, `screenshots/book-detail-1440.png` |
| **Institutional Profile** | Repeated the circular BCP logo at large scale inside a bordered box. | Upgraded to modern corporate boardroom studio imagery (`bcp-studio-editorial.webp`) paired with a restrained `48×48` official medallion and numbered `১–৪` credential timeline. | `screenshots/home-institutional-1440.png` |
| **Contact & Customer Copy** | Public fallback notices mentioned internal pending client approval. | Replaced with customer-ready guidance featuring official WhatsApp (`+880 1521-537864`), quick-connect `#202D72` card, and online consultation form. | `screenshots/contact-1440.png` |
| **Mobile & Responsive Fidelity** | Needed verification across compact screens (`320px`, `360px`, `390px`, `430px`). | Zero horizontal overflow (`scrollWidth === clientWidth`) verified across mobile, tablet (`768px`, `1024px`), and desktop (`1440px`, `1866px`, `1920px`). | `screenshots/home-320.png`, `screenshots/home-390.png`, `screenshots/home-768.png`, `screenshots/home-1920.png` |
