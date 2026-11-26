# Business Compliance Partner (BCP) — Design & Motion Report (V7.3)

**Directive:** Master Client Revision Directive V7.3  
**Visual Theme:** Approved Executive Lavender (`#F2EFF8` surface canvas, `#DDD6EB` muted lavender cards, `#51406F` deep executive plum accents, `#D4CCE3` crisp hairline borders) + Official Navy (`#081838`) & Gold (`#C59028`) Brand Identity + Functional WhatsApp Emerald (`#00865A`).

---

## 1. Visual Identity & Executive Lavender Governance

- **Untouched Circular Master Logo:** `public/brand/bcp-master-logo.png` is preserved across `AppHeader`, `PromotionalHeroSlider`, `Footer`, and `Portal` login views using Next.js `<Image>` with `referrerPolicy="no-referrer"` and zero redrawing or distortion.
- **Flagship Card Color Parity (`rgb(221, 214, 235)`):** All three flagship cards in `src/components/home/PrimaryBusinessActions.tsx` (`01 · Courses`, `02 · Services`, `03 · Books`) strictly maintain the unified Muted Lavender `#DDD6EB` surface (`bcp-flagship-card`) in exact sequence, avoiding unapproved color divergence across cards.
- **Typography & Bilingual Rhythm:**
  - Latin UI & Pillar Labels (`Courses`, `Services`, `Books`, `Explore Courses`, `Explore Services`, `Explore Books`): `Inter` / `Cormorant Garamond` with controlled tracking (`tracking-wide`) and crisp contrast.
  - Bengali Editorial & Descriptions: `Noto Sans Bengali` / `Noto Serif Bengali` with comfortable `1.24–1.6` line-heights and balanced wrapping (`[text-wrap:balance]`) on headings.
- **Responsive Container Discipline:** `header` uses `min-w-0 flex-1 lg:flex-initial` and compact bilingual pill links (`Courses · কোর্সসমূহ`, `Services · সেবাসমূহ`, `Books · বইসমূহ`) so desktop `1024px–1920px` avoids wrapping while `320px–430px` mobile viewports render cleanly with `scrollWidth <= clientWidth`.

---

## 2. Motion Choreography & Interaction Discipline

1. **Flagship Card Staggered Entrance (`PrimaryBusinessActions.tsx`):**
   - Uses Anime.js v4 (`animate`, `stagger(55)`) for crisp, low-amplitude entrance choreography (`opacity: [0.85, 1]`, `translateY: [10, 0]`, `MOTION_DURATIONS.standard`, `MOTION_EASES.crisp`).
   - Strictly respects `window.matchMedia("(prefers-reduced-motion: reduce)")` and cleans up animations on unmount.
2. **Hero Carousel Transition (`PromotionalHeroSlider.tsx`):**
   - Slide text panels animate cleanly on user interaction (`hasInteractedRef.current === true`), ensuring initial SSR/hydration paint is instant (`LCP`-friendly) and reduced-motion users experience zero unexpected movement.
   - Auto-advance pauses automatically on hover, focus-within, manual pause button (`aria-pressed`), or `prefers-reduced-motion: reduce`.
3. **Motion Hover & Focus Discipline:**
   - Interactive cards use `CARD_HOVER_PROPS` (`motion/react` via `AppMotionProvider`) without stacking conflicting CSS `transform` transitions on the exact same DOM node (`transition-colors` / `transition-shadow` only).
   - `Motion` `LazyMotion` / reduced-motion configuration is centralized in `AppMotionProvider.tsx`.

---

## 3. Three.js / WebGL Technical Hygiene (`AGENTS.md` Rule 6)

- **Hero Canvas Upgrade (`src/components/ui/HeroCanvas3D.tsx`):**
  - Replaced deprecated `new THREE.Clock()` with `createDeltaTimer()` (`src/components/three/threeUtils.ts` / monotonic `performance.now()` delta helper).
  - Replaced raw `setTimeout(..., 48)` synchronization with `awaitWebGLFrameFence()` (`gl.fenceSync` + fallback micro-frame yield) matching `HeroKnowledgeStudio3D.tsx`.
  - Coalesced on-demand rendering (`requestRender()`) prevents unbounded 60Hz `requestAnimationFrame` spinning when idle, conserving battery and CPU on mobile devices.
  - Zero `backdrop-blur-*` overlays are placed directly over WebGL `<canvas>` elements.

---

## 4. Interactive Components Added / Enhanced

- **`ConnectedEcosystemShowcase.tsx`:** Interactive 5-domain switcher (`Income Tax`, `VAT & Mushak`, `e-GP & Tender`, `Smart RJSC`, `E-commerce & DBID`) demonstrating how one business domain spans **01 · Courses → 02 · Services → 03 · Books** inside a single cohesive institution.
- **Unified Search & Quick Search Filter Tabs:** Accessible WAI-ARIA `tablist` (`All | Courses | Services | Books`) providing instant client-side division filtering without extra network round-trips.
