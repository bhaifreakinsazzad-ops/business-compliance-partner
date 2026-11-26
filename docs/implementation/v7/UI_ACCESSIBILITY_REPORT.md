# UI & Accessibility Engineering Report — BCP V7.0

## 1. Executive Lavender Client Requirements Compliance

- **Homepage Flagship Order & Color Uniformity:** Confirmed via live Chromium DOM inspection (`PrimaryBusinessActions.tsx`):
  1. `/courses` — **আমাদের সকল কোর্সসমূহ** (`rgb(221, 214, 235)` / `#DDD6EB`)
  2. `/services` — **আমাদের সকল সেবাসমূহ** (`rgb(221, 214, 235)` / `#DDD6EB`)
  3. `/books` — **আমাদের সকল বইসমূহ** (`rgb(221, 214, 235)` / `#DDD6EB`)
- **Mobile Header Responsive Fix (`src/components/layout/AppHeader.tsx`):** Replaced `shrink-0` on the brand `<Link>` with `min-w-0 flex-1 lg:flex-initial` and `text-[13px] sm:text-lg`, fixing right-edge crowding on narrow mobile screens (`390px` and `320px`).
- **Clean Badge Discipline:** Replaced pill-rounded icon wrappers inside flagship cards and WebGL scene HUD strips with crisp editorial radius (`rounded-[10px]`), zero glowing/backdrop-blurred overlays over canvases, and zero corner badge clutter.

## 2. Accessibility & Responsive Geometry Checks

- Native semantic landmarks (`<header>`, `<nav aria-label="...">`, `<main>`, `<dialog>` with focus return in `MobileNavigation.tsx` and `QuickSearchDialog.tsx`), descriptive `aria-label` controls, and `alt` attributes on brand images.
- Google Fonts loaded via static `<link>` in `src/app/layout.tsx` rather than `next/font/google`, ensuring deterministic builds in offline/restricted environments.
- Measured viewport bounds in Playwright headless Chromium:
  - `1440×900`: `scrollWidth === clientWidth` (`desktopOverflow: false`)
  - `390×844`: `scrollWidth === 390`, `headerRightMax390: 374` (`mobile390Overflow: false`)
  - `320×568`: `scrollWidth === 320`, `headerRightMax320: 304` (`mobile320Overflow: false`)
