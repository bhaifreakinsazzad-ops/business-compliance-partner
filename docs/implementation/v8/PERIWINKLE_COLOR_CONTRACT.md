# BCP V8.0 — AKIJ iBOS Periwinkle Color Contract

**Color Reference:** `https://ibos.io/managerium/` (`WhatsApp Image 2026-11-26 at 23.05.45.jpeg`, red-highlighted hero card region)  
**Design Tokens:** `src/styles/tokens.json` (`v8.0-akij-periwinkle`) & `src/app/globals.css`

---

## 1. Authoritative Palette Tokens

| Token / Role | Hex | RGB / RGBA | Usage |
|---|---|---|---|
| **Periwinkle Mesh Stop** | `#B8BBFF` / `#B3B6FF` | `rgb(184, 187, 255)` / `rgb(179, 182, 255)` | Radial corner highlights in `.bcp-periwinkle-hero-gradient` and `.bcp-periwinkle-service-frame` |
| **Periwinkle Mid Stop** | `#CCCEFF` / `#CFD1FF` | `rgb(204, 206, 255)` | Secondary radial blend & dark-card muted periwinkle copy |
| **Periwinkle Light (Gateway Fill)** | `#E2E3FF` | `rgb(226, 227, 255)` | Unified fill across all 3 Gateway cards (`.bcp-flagship-card`: `Courses -> Services -> Books`), badge pills, hover tints |
| **Frosted Periwinkle White** | `#FBFAFF` | `rgb(251, 250, 255)` | Subtle section bands (`.bcp-periwinkle-soft`), card header tints, secondary surfaces |
| **Pure White Canvas** | `#FFFFFF` | `rgb(255, 255, 255)` | Dominant page canvas, white elevated cards, form cards |
| **Soft Input Surface** | `#F5F6FA` | `rgb(245, 246, 250)` | Form inputs (`ConsultancyForm`, `QuickSearchDialog`), filter button defaults |
| **Cool Periwinkle Border** | `#E1E4F2` | `rgb(225, 228, 242)` | Card borders, section hairlines, table dividers |
| **Functional Action Blue** | `#243FBA` | `rgb(36, 63, 186)` | Primary buttons (`.ps-primary-button`), active filter tabs, active links, gateway icons |
| **Action Blue Hover** | `#1D329B` | `rgb(29, 50, 155)` | Primary button & link hover states |
| **Deep Headline Blue** | `#202D72` | `rgb(32, 45, 114)` | Section headings, price text, Contact page social/connect card |
| **Midnight Navy** | `#081838` | `rgb(8, 24, 56)` | Top utility strip, primary headlines, Institutional Profile card, Footer |
| **Royal Gold / Light Gold** | `#C59028` / `#DFB15B` | `rgb(197, 144, 40)` / `rgb(223, 177, 91)` | Restrained BCP master badge borders, numbered institutional pillar badges (`১–৪`) |
| **WhatsApp / Success Emerald** | `#00865A` | `rgb(0, 134, 90)` | Direct WhatsApp CTAs, verified stock/active indicators |
| **Charcoal Ink / Slate Muted** | `#181D26` / `#596775` | `rgb(24, 29, 38)` / `rgb(89, 103, 117)` | Body prose & secondary captions (WCAG AA compliant contrast) |

---

## 2. CSS Gradient Recipes (`src/app/globals.css`)

- **Hero Gradient (`.bcp-periwinkle-hero-gradient`):** Dual corner radial-gradient mesh derived from `ibos.io/managerium/` (`rgba(179, 182, 255, 0.72)` top-left + `rgba(184, 187, 255, 0.78)` bottom-right over `#F2F2F8` / `#FFFFFF` white core).
- **Gateway Cards (`.bcp-flagship-card`):** Unified `#E2E3FF` (`rgb(226, 227, 255)`) base with subtle corner periwinkle gradient and `#B8BBFF` border across all 3 commercial cards (`Courses → Services → Books`).
- **Services Frame (`.bcp-periwinkle-service-frame`):** Large rounded container (`rounded-[24px]`) combining soft radial periwinkle corners with an elevated inner white/frosted split card.
- **Contact & Page Header (`.bcp-periwinkle-contact-header`):** Crisp white-dominant top header accented by subtle corner periwinkle glow matching the client Contact reference screenshot.

---

## 3. Legacy V7 Palette Sweep Summary

All hardcoded V7 Executive Lavender/Plum UI classes (`#DDD6EB`, `#F2EFF8`, `#D4CCE3`, `#A599C2`, `#51406F`, `#3F315A`, `#ECE7F5`, `#E5DDF2`, `#453561`) were migrated across `src/styles/tokens.json`, `src/app/globals.css`, `src/components/`, `src/app/`, Three.js utilities (`threeUtils.ts`, `HeroKnowledgeStudio3D.tsx`, `HeroCanvas3D.tsx`), and motion progress bars (`ReadingProgressBar.tsx`), leaving zero conflicting lavender UI tokens in public routes.
