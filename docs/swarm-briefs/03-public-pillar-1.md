# Swarm Worker Brief 03 — `public-pillar-1` (Wave 2 Author)

- **Role:** Homepage, Courses (Mode A) & Professional Services UI Architect
- **Wave:** 2 (runs in parallel with `public-pillar-2`, `admin-cms`, `docs-qa` AFTER Wave 1 is merged into `main`)
- **Workspace Mode:** `"share"` (git worktree off updated `main`)

## Strict File Ownership
You ONLY create or edit files inside:
- `src/app/page.tsx`
- `src/components/home/**`
- `src/app/courses/**` (`/courses` and `/courses/[slug]`)
- `src/app/services/**` (`/services` and `/services/[slug]`)

**DO NOT touch** frozen libs/types, `src/components/ui|layout|shared|forms/**`, `src/app/api/**`, or routes owned by `public-pillar-2` / `admin-cms`.

## Required Deliverables

### 1. Complete 14-Section Quiet Confidence Homepage (`src/app/page.tsx` + `src/components/home/*`)
Implement the full Desktop & Mobile wireframe from Master Prompt Sections J & K using `AppHeader`, `Footer`, `Hero`, `PillarCard`, `CourseCard`, `ServiceCard`, `SearchBox`, `ProcessSteps`, `AuthorityNote`, `TrustCard`, `FAQAccordion`, `CTASection` from Wave 1 `ui-system`, and `listPublished*` + `listPublishedFaqs` from `backend-core`:
1. Subtle verified Utility/Trust Bar (verified contact only if set; hide missing channels)
2. Sticky `AppHeader`
3. Asymmetric Editorial Hero (`#0B1726` / `#10243A`) with `"শিখুন, সেবা নিন, ব্যবসার প্রয়োজনীয় সমাধান খুঁজুন—এক জায়গায়।"`, primary CTA `"কোর্স দেখুন"`, secondary `"সেবা খুঁজুন"`, tertiary link `"পরামর্শ চাই"`, and lightweight bespoke SVG illustration (`EditorialDossierSvg`) — text first on mobile!
4. Four-Pillar Grid: **Courses** & **Professional Services** visually larger/dominant; **Licensing** & **Consultancy** structured as clean first-class pillars alongside/below
5. Featured Courses (4–6 curated `UPCOMING` / `INTEREST_ONLY` cards, zero fabricated fee/instructor/duration/certificates, CTA `"কোর্স সম্পর্কে জানুন"`)
6. Featured Professional Services (category browser + 4–6 service cards, CTA `"সেবাটি সম্পর্কে জানুন"`)
7. Unified Search Section (`SearchBox` calling `/api/catalogue/search` or navigating cleanly with query, grouping results by pillar)
8. How Paperwork Squad Helps (`ProcessSteps`: প্রয়োজন বুঝুন → সঠিক বিভাগ খুঁজুন → অনুরোধ পাঠান → টিম যোগাযোগ করবে)
9. Licensing Spotlight (curated verified licensing cards + link to `/licensing` + independent disclaimer)
10. Consultancy Conversion Callout (concise entry block linking cleanly to `/consultancy` or embedding compact `ConsultancyForm` drawer/link — keep homepage balanced)
11. Evidence-Based Trust Section (process clarity, verified authorities, review timestamps, privacy care — zero fake counts/stars/logos)
12. Published General & Regulatory FAQs (`FAQAccordion` using `<details>`/`<summary>`)
13. Final Dual CTA Section (`"সেবা খুঁজুন"` + `"পরামর্শের অনুরোধ করুন"`)
14. `Footer`

### 2. Pillar 1: Courses Catalogue & Detail (`src/app/courses/page.tsx` & `src/app/courses/[slug]/page.tsx`)
- `/courses`: Category pills across all 10 course categories, keyword search (`Bangla Unicode` + English acronyms via URL searchParams or instant client filter synced to URL), status clarity badge (`আসন্ন / আগ্রহ নিবন্ধন` vs `চালু`), helpful `EmptyState`.
- `/courses/[slug]`: Dynamic Next.js `generateMetadata()` (canonical, OG, safe JSON-LD `Course` ONLY where non-misleading + `BreadcrumbList`), verified fields ONLY (title, summary, category, intended audience, outcomes, module syllabus `<details>`/`<ul>`, conditional fee/duration/delivery/instructor blocks rendered ONLY when non-null in DB!), CTA `"কোর্স সম্পর্কে জানতে চাই"` opening or linking pre-filled `/consultancy?pillar=COURSES&slug=<slug>` or inline enquiry modal. Strictly ZERO "Buy Now", video players, LMS progress, or fake certificates.

### 3. Pillar 2: Professional Services Catalogue & Detail (`src/app/services/page.tsx` & `src/app/services/[slug]/page.tsx`)
- `/services`: Structured 11-category taxonomy tabs/filter + keyword search (no unstructured 200-item wall of text!).
- `/services/[slug]`: Required detail sections from Master Prompt Section M:
  - What it is & who needs it (`whoNeedsItBn`)
  - Assistance scope (`assistanceScopeBn`)
  - What Paperwork Squad does NOT control (`limitationsBn` + `AuthorityNote`)
  - Indicative documents list (`documentsSummary` explicitly marked `পেশাদার পর্যালোচনা সাপেক্ষ`)
  - Process overview (`ProcessSteps`)
  - Conditional separated Service vs Government Fee blocks (`serviceFeeNoteBn`, `govtFeeNoteBn` rendered ONLY if approved/non-null)
  - Verification metadata (`VerificationMeta`: `lastVerifiedAt`, `verifiedBy`, `officialSourceUrl` link with `rel="noopener noreferrer"`)
  - Related FAQs + CTA `"সেবার অনুরোধ করুন"` linking/submitting enquiry with pre-filled context.

## Verification
Run `npm run typecheck && npm run lint && npm run test` before reporting done.
