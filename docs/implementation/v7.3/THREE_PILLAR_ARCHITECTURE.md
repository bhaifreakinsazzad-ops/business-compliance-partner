# Three-Pillar Architecture — Business Compliance Partner (V7.3)

## 1. Master Configuration (`src/lib/config/pillars.ts`)

All public navigation, flagship action cards, footer primary links, and analytics identifiers derive from `MASTER_THREE_PILLARS` in `src/lib/config/pillars.ts`:

| Order | ID | English Label | Bengali Label | Customer Intent | Route | Icon (`lucide-react`) | Analytics Event |
|---|---|---|---|---|---|---|---|
| `01` | `courses` | `Courses` | `আমাদের সকল কোর্সসমূহ` | পেশাদার দক্ষতা অর্জন করুন এবং নিজেকে প্রস্তুত করুন। | `/courses` | `GraduationCap` | `click_pillar_courses` |
| `02` | `services` | `Services` | `আমাদের সকল সেবাসমূহ` | ব্যবসার প্রয়োজনীয় পেশাদার সহায়তা ও সমাধান নিন। | `/services` | `BriefcaseBusiness` | `click_pillar_services` |
| `03` | `books` | `Books` | `আমাদের সকল বইসমূহ` | প্রয়োজনীয় বই ও প্রকাশনার মাধ্যমে জ্ঞান সমৃদ্ধ করুন। | `/books` | `BookOpen` | `click_pillar_books` |

Supporting platform links live separately in `SUPPORTING_NAVIGATION`:
- **Services Extensions (`parentAssociation: "services"`):** `/licensing` (`লাইসেন্সিং ও নিবন্ধন`), `/consultancy` (`কনসালটেন্সি ও পরামর্শ`)
- **Platform Utilities (`parentAssociation: "platform"`):** `/tools` (`বিজনেস টুলস`), `/faq` (`সচরাচর জিজ্ঞাসা`), `/about` (`আমাদের সম্পর্কে`), `/contact` (`যোগাযোগ`), `/portal` (`কাস্টমার পোর্টাল`)

---

## 2. Exact Naming Contract Enforcement

The primary English words **`Courses`**, **`Services`**, and **`Books`** are always rendered visibly paired with their Bengali titles:
- **Never substituted** with `Academy`, `Solutions`, `Marketplace`, `Knowledge Hub`, `Learn`, or `Store` as primary destination labels.
- **Desktop Header (`NavLinksClient.tsx`):** Each top-level item pairs a direct `<Link href="/courses|/services|/books">` showing `Courses` / `Services` / `Books` (plus `· কোর্সসমূহ` / `· সেবাসমূহ` / `· বইসমূহ` at `xl`) with an accessible chevron `<button>` (`aria-expanded`, `aria-controls="bcp-desktop-mega-menu"`).
- **Mobile Drawer (`MobileNavigation.tsx`):** Opens with a dedicated `Courses · Services · Books` group rendering `01. Courses`, `02. Services`, `03. Books` before supporting routes.
- **Flagship Cards (`PrimaryBusinessActions.tsx`):** All three cards share `.bcp-flagship-card` (`#DDD6EB` Muted Lavender surface, `#D4CCE3` border, `#51406F` Deep Plum icons and arrows) in exact `1 -> 2 -> 3` DOM order.
- **Footer (`Footer.tsx`):** Column 2 renders `01. Courses — আমাদের সকল কোর্সসমূহ`, `02. Services — আমাদের সকল সেবাসমূহ`, `03. Books — আমাদের সকল বইসমূহ`, followed by a clear visual divider for supporting Services extensions and tools.

---

## 3. Homepage Section Hierarchy (`src/app/page.tsx`)

1. **Header (`AppHeader`):** Announcement bar + single-line Executive Lavender sticky navigation + search dialog (`Ctrl+K`) + Portal + Consultancy CTA.
2. **Hero Slider (`PromotionalHeroSlider`):** Slide 1 introduces BCP's three-pillar value proposition alongside the interactive 3D Executive Knowledge Studio (`HeroKnowledgeStudio3D`).
3. **Three Flagship Cards (`PrimaryBusinessActions`):** Immediate above-the-fold routing to `/courses`, `/services`, `/books`.
4. **Pillar 01 — Courses (`#pillar-courses`):** Academic banner, 5 priority track tiles (`Income Tax`, `VAT & Mushak`, `e-GP & Tender`, `E-commerce`, `Company Secretarial`), and featured courses grid.
5. **Pillar 02 — Services (`#pillar-services`):** Consultancy banner, Services-associated **Licensing & Consultancy Gateway**, service categories, and featured services with direct Emerald WhatsApp CTAs.
6. **Pillar 03 — Books (`#pillar-books`):** Editorial publication showcase, 9-domain book index pills/buttons, honest pre-launch messaging, and hardcover mockup cards (`BookCard`).
7. **Connected Ecosystem (`ConnectedEcosystemShowcase` + `LazyCompliance3D` + `StatCounters`):** Domain selector (`Income Tax`, `VAT & Mushak`, `e-GP & Tender`, `Smart RJSC`, `E-commerce & DBID`) connecting Course → Service → Book side by side.
8. **Unified Search & Guided Discovery (`UnifiedSearchSection` + `BusinessSolutionFinder`):** Search with `All | Courses | Services | Books` filter tabs and rule-based solution routing.
9. **Credibility, 4-Step Journey, Consultancy Split Block, FAQ, Three-Pillar Closing CTA (`CTASection`), and Footer.**
