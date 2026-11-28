# Functional Test Report — BCP V8.0 (AKIJ Periwinkle Edition)

**Verification Window:** Post-Final UI Polish (`2026-11-28`)  
**Runtime:** Next.js `15.5.0` App Router · React `19.1.0` · TypeScript `5.8.0` · Node.js `v22`

---

## 1. Automated Verification Matrix

| Suite | Command | Scope & Coverage | Result |
|---|---|---|---|
| **TypeScript Check** | `npm run typecheck` (`tsc --noEmit`) | Strict whole-repo static type safety across App Router pages, API routes, Prisma queries, commerce helpers, and UI components | **PASS** (`0` errors) |
| **ESLint Check** | `npm run lint` (`eslint .`) | Next.js Core Web Vitals, TypeScript rules, React hooks rules | **PASS** (`0` errors) |
| **Pure Homepage Logic (`node:test`)** | `npx tsx --test src/lib/home/popular-courses.test.ts` | `buildPopularCourseTabs`, `filterPopularCourses`, `buildPopularBookTabs`, `filterBooksByTab`, visual theme & header helpers | **PASS** (`4/4` subtests passed) |
| **Unit & Route Integration (Vitest)** | `npm test` (`vitest run`) | Security, RBAC, customer auth, admin CMS APIs, Prisma fallback, 437-record ingestion, V6/V7 commerce & integer-paisa math, WhatsApp helpers, SEO/PWA, interactive tools, books commerce, lead validation | **PASS** (`20/20` test files, `125/125` tests in `7.01s`) |
| **437-Record Catalogue Dry-Run** | `npm run catalogue:dry-run` | Authoritative `prisma/seed-data/bcp-catalogue-v1.1.json` validation (`105` Learn + `247` Services + `85` Licensing & Reg across `27` categories) | **PASS** (`437` validated, `0` skipped/errors) |
| **Playwright End-to-End & Accessibility** | `npm run test:e2e` (`playwright test`) | 6 spec files (`accessibility.spec.ts`, `client-v4.spec.ts`, `consultancy-lead.spec.ts`, `smoke.spec.ts`, `v73-three-pillar.spec.ts`, `v8-reference.spec.ts`) across 4 projects (`mobile-320`, `mobile-360`, `tablet-768`, `desktop-1440`) | **PASS** (Exited `0`, `364` total tests across `3.4m`) |
| **Production Build** | `npm run build` (`prisma generate && next build`) | Prisma client generation and Next.js production compilation | **PASS** (Verified via `compile_applet`) |

---

## 2. Key Functional & Behavioral Assertions Verified

1. **Three-Gateway Sequence & Color Parity (`v73-three-pillar.spec.ts`, `v8-reference.spec.ts`):**
   - Header links, primary gateway buttons (`a[data-flagship-cta]`), homepage section order, and footer columns enforce `Courses -> Services -> Books`.
   - All 3 primary gateway cards compute to unified AKIJ Periwinkle Light `rgb(226, 227, 255)` (`#E2E3FF`).
2. **Hero Slideshow & Interactive Homepage Sections (`v8-reference.spec.ts`, `smoke.spec.ts`):**
   - `PromotionalHeroSlider` renders the segmented `01 — 04` control pill and `One Partner · Complete Solutions · Confident Growth` divider.
   - `PopularCoursesSection` category tabs (`সব` + category slugs) filter cards cleanly without reload.
   - `ServicesGatewaySection` track tabs dynamically update the active checklist and pre-selected `ConsultancyForm` subject.
   - `BooksShowcaseSection` category tabs filter the `aspect-[3/4]` hardcover storefront cards and link directly to `/books/[slug]` 3D detail pages.
3. **Contact & Consultancy Lead Flow (`consultancy-lead.spec.ts`, `v8-reference.spec.ts`):**
   - `/contact` renders the Periwinkle header, official WhatsApp link (`https://wa.me/8801521537864`), `#202D72` quick-connect card, and validated `ConsultancyForm`.
4. **Zero Horizontal Overflow & WCAG 2.2 AA (`accessibility.spec.ts`, `smoke.spec.ts`, `v73-three-pillar.spec.ts`):**
   - Verified zero horizontal overflow across `320px`, `360px`, `390px`, `430px`, `768px`, `1024px`, `1440px`, and `1920px`.
   - Zero critical or serious Axe WCAG 2.2 AA violations across `/`, `/courses`, `/services`, and `/books`.
