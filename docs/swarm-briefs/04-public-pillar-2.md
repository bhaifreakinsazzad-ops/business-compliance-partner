# Swarm Worker Brief 04 — `public-pillar-2` (Wave 2 Author)

- **Role:** Licensing Pillar, Consultancy Flow, Supporting & SEO Routes Architect
- **Wave:** 2 (runs in parallel with `public-pillar-1`, `admin-cms`, `docs-qa` AFTER Wave 1 is merged into `main`)
- **Workspace Mode:** `"share"` (git worktree off updated `main`)

## Strict File Ownership
You ONLY create or edit files inside:
- `src/app/licensing/**` (`/licensing` and `/licensing/[slug]`)
- `src/app/consultancy/**` (`/consultancy`)
- `src/app/about/page.tsx`
- `src/app/faq/page.tsx`
- `src/app/contact/page.tsx`
- `src/app/privacy/page.tsx`
- `src/app/terms/page.tsx`
- `src/app/disclaimer/page.tsx`
- `src/app/sitemap.ts`
- `src/app/robots.ts`

**DO NOT touch** `src/app/page.tsx`, `/courses/**`, `/services/**`, `/admin/**`, `/api/**`, or Wave 1 `src/components/ui|layout|shared|forms/**`.

## Required Deliverables

### 1. Dedicated Licensing & Registration Pillar (`/licensing` & `/licensing/[slug]`)
- `/licensing`: Search + authority/category filter across the 6 Licensing categories, prominent independent-platform banner (`INDEPENDENT_DISCLAIMER_BN`), clean `LicensingCard` grid. Never use government crests/logos or mimic a government portal!
- `/licensing/[slug]`: Dynamic `generateMetadata()` + `BreadcrumbList` JSON-LD, `AuthorityNote` displaying `authorityName`, `authorityType`, `officialSourceLabel`, `officialSourceUrl` (`rel="noopener noreferrer"`), `serviceScopeBn`, `limitationsBn`, indicative `documentsSummary`, `processSummaryBn`, `VerificationMeta` (`lastVerifiedAt`, `verifiedBy`), and CTA `"সহায়তা চাই"` routing to `/consultancy?pillar=LICENSING&slug=<slug>&topic=<title>`.

### 2. Consultancy Conversion Route (`/consultancy`)
- Page heading: `"আপনার ব্যবসার সমস্যাটি জানান"` with supporting Bengali copy: `"আপনার প্রয়োজন সংক্ষেপে লিখুন। আমাদের টিম তথ্য পর্যালোচনা করে উপযুক্ত সময়ে আপনার সঙ্গে যোগাযোগ করবে।"` (NEVER promise instant callback or fixed hours).
- Reads `searchParams` (`pillar`, `slug`, `topic`) cleanly to pre-select initial `pillar`, `categoryContext`, `targetSlug`, `targetTitle` when arriving from a Course, Service, or Licensing detail CTA.
- Renders `ConsultancyForm` (from `ui-system`) + explicit note that NID, passport, tax return files, and bank statements are **NOT** collected in Phase 1.
- Displays 3-step expectation sidebar explaining what happens after submission.

### 3. Editorial, Trust & Legal Routes
- `/about`: Honest positioning of the platform in Bangladesh (why four pillars exist, commitment to process clarity, independent status, provisional brand note where applicable — zero fabricated years of experience, client counts, or fictional team bios).
- `/faq`: Full searchable/filterable Bengali FAQ page grouped by pillar + regulatory verification badges using `FAQAccordion`.
- `/contact`: Renders verified contact methods from `getPublicSiteConfig()` ONLY when non-null (hides broken WhatsApp/phone/social links cleanly, directing visitors to the verified consultancy enquiry form when channels are pending client sign-off).
- `/privacy`: Bengali-first Privacy Policy aligned with Bangladesh Personal Data Protection Act 2026 (Act No. 63, 10 Apr 2026) — purpose limitation, explicit consent, non-collection of NID/bank uploads in Phase 1, configurable retention policy disclosure marked subject to final legal review, privacy policy version (`privacyPolicyVersion`).
- `/terms`: Terms of Use clearly separating platform information/assistance from government statutory outcomes.
- `/disclaimer`: Full Regulatory & Independent Platform Disclaimer explaining Smart RJSC, NBR, BPPA (PPR 2025), DIFE LIMA, Fire Service e-Fire Licence, and DoE independence.

### 4. Technical SEO (`sitemap.ts` & `robots.ts`)
- `src/app/robots.ts`:
  - When `isStagingEnvironment()` is true: `{ rules: [{ userAgent: "*", disallow: "/" }] }` (protects staging from premature indexing!).
  - When `NEXT_PUBLIC_APP_ENV === "production"`: allows `/`, disallows `/admin/`, `/api/`.
- `src/app/sitemap.ts`:
  - Dynamically includes static public routes + ALL currently `PUBLISHED` & non-`INACTIVE` slugs from Courses, Services, and Licensing via `backend-core` read helpers (`getCanonicalBaseUrl()`). Never expose `/admin` or `DRAFT` slugs!

## Verification
Run `npm run typecheck && npm run lint && npm run test` before reporting done.
