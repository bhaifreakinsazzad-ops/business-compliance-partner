# Swarm Worker Brief 01 — `ui-system` (Wave 1 Author)

- **Role:** Design System & Accessible UI Component Architect
- **Wave:** 1 (runs in parallel with `backend-core`)
- **Workspace Mode:** `"share"` (git worktree off `main`)

## Strict File Ownership
You ONLY create or edit files inside:
- `src/components/ui/**`
- `src/components/layout/**`
- `src/components/shared/**`
- `src/components/forms/**`
- `src/components/illustrations/**`

**DO NOT touch** `package.json`, `prisma/**`, `src/types/**`, `src/lib/**`, `src/app/**`, or `src/middleware.ts`.

## Required Deliverables (Master Prompt Section AB)
Build all reusable, Quiet Confidence UI components styled strictly to `src/styles/tokens.json` and `src/app/globals.css`:

1. **Layout (`src/components/layout/`):**
   - `AppHeader.tsx`: Sticky header using `PublicSiteConfig`, controlled proposed logo image (`/brand/proposed-logo-concept.jpg` via `next/image` with explicit width/height and provisional badge if `isIdentityProvisional`), semantic `<nav aria-label="প্রধান নেভিগেশন">`, 6 concise links (Home, Courses, Services, Licensing & Registration, Consultancy, About/Contact), primary CTA button `"পরামর্শের অনুরোধ"`, and mobile drawer trigger.
   - `MobileNavigation.tsx`: Accessible mobile menu drawer/dialog using native `<dialog>` (with `.showModal()`, visible close button, focus return, `48px` touch targets, stacked cleanly at `320px`/`360px`). No simultaneous floating clutter (no floating WhatsApp + chat + call widgets).
   - `Footer.tsx`: Deep `#0B1726` midnight background, four-pillar links, secondary legal links (`/about`, `/faq`, `/contact`, `/privacy`, `/terms`, `/disclaimer`), ONLY verified contact channels from `PublicSiteConfig` (hide phone/WhatsApp/email/social when `null`!), plus prominent `legalDisclaimerBn`.
   - `Breadcrumbs.tsx`: Semantic `<nav aria-label="Breadcrumb">` + optional helper to emit valid `BreadcrumbList` JSON-LD data.

2. **UI & Editorial Primitives (`src/components/ui/` & `src/components/shared/`):**
   - `Badge.tsx`, `StatusBadge.tsx` (renders `আসন্ন / আগ্রহ নিবন্ধন`, `আগ্রহ নিবন্ধন`, `চালু রয়েছে`, `যাচাইকৃত`), `SectionHeading.tsx`
   - `PillarCard.tsx` (supports `priority="primary"` vs `"secondary"` so Courses & Services visually dominate)
   - `CourseCard.tsx` (Mode A only: never render fake fee/instructor/duration/certificate when `null`)
   - `ServiceCard.tsx` & `LicensingCard.tsx` (with clear authority attribution badge)
   - `SearchBox.tsx` (`<search>` wrapper + `<form method="GET">` or controlled callback), `FilterBar.tsx`, `PaginationControls.tsx`
   - `AuthorityNote.tsx` (renders independent platform notice + authority link attribution)
   - `VerificationMeta.tsx` (`lastVerifiedAt` + `verifiedBy` in restrained editorial box)
   - `ProcessSteps.tsx` (ordered numbered steps), `TrustCard.tsx` (evidence-based trust only: process transparency, official references, privacy, review date — zero fabricated counts/stars)
   - `FAQAccordion.tsx` (native `<details className="ps-disclosure">` & `<summary>` — NEVER put `<h2>`/`<h3>` inside `<summary>`; place chevron marker cleanly aligned with accessible focus style)
   - `CTASection.tsx`, `EmptyState.tsx`, `ErrorState.tsx`, `Skeleton.tsx`, `ConfirmDialog.tsx` (native `<dialog>`), `ToastNotice.tsx` (`role="status"` / `role="alert"`)
   - Lightweight bespoke SVG editorial dossier artwork in `src/components/illustrations/EditorialDossierSvg.tsx` (`aria-hidden="true"`, zero heavy canvas/WebGL/video).

3. **Forms (`src/components/forms/`):**
   - `ConsultancyForm.tsx`: Client component calling `POST /api/leads`.
     - Required visible `<label for>` fields: Full name (`autocomplete="name"`), Bangladesh mobile (`type="tel"`, `inputmode="tel"`, `autocomplete="tel"`), Address/Area (`autocomplete="street-address"`), Category/Context, Problem description (`<textarea>`).
     - Optional: Email (`type="email"`, `autocomplete="email"`), WhatsApp (`type="tel"`), Preferred contact method (`<fieldset><legend>` + radio buttons for 4 options).
     - Hidden honeypot input (`tabIndex={-1}`, `aria-hidden="true"`, offscreen/visually hidden).
     - Explicit purpose notice: `"আপনার অনুরোধ পর্যালোচনা ও যোগাযোগের জন্য এই তথ্য ব্যবহার করা হবে।"`
     - Explicitly **unchecked** privacy consent checkbox with link to `/privacy`.
     - Native `:user-invalid` + `aria-invalid` sync (error only shown/linked via `aria-describedby` after blur/submit), polite live region announcements, focus moved to first invalid input on failed submit.
     - Generate client `idempotencyKey` once per form session (reset only after confirmed success), disable button while `pending`, **preserve all inputs on API failure**, never synthesize fake `PS-DEMO` IDs.
   - `LeadSuccessReceipt.tsx`: Renders server-confirmed `publicReference` (`PS-YYYY-XXXXXXXX`) + clear message stating team will contact at an appropriate time (NO promised SLA time).

4. **Shared Admin UI Primitives (`src/components/shared/` or exported from `src/components/ui/` as documented in `SWARM_PLAN.md`):**
   - Clean props-driven `AdminSidebar.tsx`, `AdminTable.tsx`, `AdminEditorFrame.tsx`, `AdminLeadPanel.tsx` so Wave 2 `admin-cms` stays fast and cohesive. *(Keep these pure presentational/props-driven inside `src/components/shared/` so `admin-cms` retains sole ownership of `src/components/admin/**`!)*

## Mandatory Guardrails
- WCAG 2.2 AA contrast: NEVER use `#C7A45D` champagne gold for body text on `#FFFFFF` or `#F7F4ED`.
- Zero `FIXXER`, `DhandaBuzz`, `NotRealEngine`, `PS-DEMO`, placeholder phone/email, or CDN scripts (`anime.js`, Three.js).
- Run `npm run typecheck && npm run lint && npm run test` before reporting done.
