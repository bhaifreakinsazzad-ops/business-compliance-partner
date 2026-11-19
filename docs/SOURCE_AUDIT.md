# Source Audit — Step 2 Discovery & Reuse Map

**Date:** 2026-11-19  
**Workspace Initial State:** Empty folder (`e:\Agentic Work Station\Websites\Paperwork Squad`). No `01_START_HERE/` directory existed on disk; all 13 handoff files were supplied as session attachments in the artifact `.user_uploaded/` directory.

---

## 1. Complete Inventory & Inspection Status

| Artifact | Status | Governing Precedence / Role | Disposition |
|---|---|---|---|
| Latest explicit user & clarified constraints (`/goal` + Q&A) | Observed directly | **1 (Highest)** — Next.js App Router + Prisma/PostgreSQL, Truthful Staging Mode, Strict Quiet Confidence, swarm-ready handoff baseline | **Enforced across codebase** |
| `deep-research-report_(4).md` (Master Prompt v1, 1950 lines) | Inspected in full | Governing technical & product rules (Sections A–AR) | **Enforced via schemas, contracts & tests** |
| `Paperwork_Squad_Client_Requirements_Master_Scope_v2_2026-11-19.md` | Inspected in full | Discovery-ready working baseline (not approved SOW); defines 4 pillars & Course Mode A | **Implemented (Mode A only)** |
| `Paperwork_Squad_Brand_Book_v1_0_2026-11-19.docx` | Inspected XML paragraphs | Proposed 31-page Quiet Confidence identity system | **Implemented tokens & restraint rules** |
| `Paperwork_Squad_Brand_Tokens_v1_0.json` | Inspected in full | Machine-readable brand design tokens | **Copied to `src/styles/tokens.json`** |
| `Paperwork_Squad_Design_Tokens_v1_0.css` | Inspected in full | CSS token baseline & gold WCAG constraint | **Integrated into `src/app/globals.css`** |
| Proposed raster emblem JPG (`media_1795088378788_4a0ff16b.jpg`) | Visually inspected | Concept reference only (navy P + document + gold S swoosh + serif lockup on ivory) | **Copied to `public/brand/proposed-logo-concept.jpg` with provisional notice** |
| Courses visual concept mockup JPG (`media_1795088378745_827addf4.jpg`) | Visually inspected | Layout inspiration for 10-category course grid & hero framing; contains forbidden placeholders | **Layout adapted only; all fake contacts/certificate copy excluded** |
| `Business_Compliance_Partner.pdf` (18 pages) | Inspected visually + OCR checked | Candidate content inventory (pp. 1–18 across Courses, Services, Licensing) | **Deduplicated & seeded in Truthful Staging Mode** |
| `paperwork_squad_corporate_consultancy_website_demo_(1).tsx` (6440 lines) | Audited key modules | Most complete React/TS demo (bilingual structure, checklist UX, service data, BD phone regex) | **Refactor/extract patterns; eliminate demo debt** |
| `paperwork_squad_corporate_consultancy_demo.tsx` (5470 lines) | Audited key modules | Earlier prototype using CDN `anime.js` injection & 6-category service IA | **Exclude CDN `anime.js` & 6-category limit** |
| `paperwork_squad_corporate_consultancy_website_demo.tsx` (4871 lines) | Audited key modules | Alternate React prototype with `UNCONFIRMED_SERVICE_ABBREVIATIONS` (`ISD`, `ASC`) | **Keep `ISD`/`ASC` excluded from public UI** |
| `website_project_discovery_form.html` (636 lines) | Audited | DhandaBuzz dark discovery form (multi-step UX inspiration) | **UX clarity pattern noted; zero DhandaBuzz code/brand** |
| `Welcome_to_the_FIXXER!.html` (2662 lines) | Audited | Legacy GoHighLevel/LeadConnector FIXXER / NotRealEngine landing page | **100% excluded (legacy/vendor blocklisted)** |
| `three_client_website_reports.zip` (cited inside Master Scope/Deep Research) | **Inaccessible** | Not attached in this session's uploaded files | **Explicitly logged as inaccessible; contents not fabricated** |

---

## 2. Keep / Refactor / Remove / Missing Matrix

### Keep (Concept & Validated Structure)
- Four-pillar architecture (`Courses` + `Services` priority 1; `Licensing & Registration` + `Consultancy` priority 2).
- Exact palette (`#0B1726`, `#10243A`, `#C7A45D`, `#F7F4ED`, `#263342`, `#F4F7FA`, `#0B7B62`, `#B42318`) and Bengali-first typography (`Hind Siliguri`, `Manrope`, `EB Garamond`).
- Provisional white-label site config concept (`SiteSetting` DB model + `DEFAULT_PUBLIC_SITE_CONFIG`).
- Curated Bangladesh regulatory context aligned to Nov 2026 baselines (Smart RJSC, NBR eServices, BPPA PPR 2025, DIFE LIMA, Fire Service e-Fire Licence 1 May 2026, DoE ECC, CCI&E IRC/ERC, BIDA OSS, Personal Data Protection Act 2026).

### Refactor
- Replace 6-category custom client History/hash router in the `.tsx` prototypes with Next.js App Router file-system routes (`/courses`, `/services`, `/licensing`, `/consultancy`, `/admin`, etc.).
- Consolidate overlapping PDF topics (`Tax consultancy`, `Import costing`, `Annual Return`, `Payroll`) via deduplicated slugs and `aliases[]` search tags.
- Replace raw OCR text from the PDF with clean UTF-8 Bengali Unicode copy alongside standard English business acronyms.
- Split client-only UI forms from server-side DB persistence, Prisma transactions, Zod validation, rate limits, and audit logs.

### Remove (Strictly Eliminated & Tested Against)
- Empty `inquiryApiEndpoint` and fake client-side `PS-DEMO-YYYY-XXXX` success states.
- CDN `anime.js` and `Three.js` runtime script injection (`cdnjs.cloudflare.com`) — violates Bangladesh low-bandwidth & CSP principles.
- Unverified phone `+880 1XXX-XXXXXX`, `example.com`, dummy emails, fake certificates (`কোর্স সমাপনী সার্টিফিকেট`), fake WhatsApp/social buttons, fake 5-star ratings/client stats.
- Unconfirmed `ISD` and `ASC` service abbreviations from any public UI or seed table.
- All `FIXXER!`, `NotRealEngine`, `DhandaBuzz`, and `LeadConnector / GoHighLevel` branding, tracking pixels, and inline styles.

### Missing (Scoped Into Swarm Wave 1 & Wave 2 Briefs)
- Full reusable component library implementation in `src/components/**` -> **Wave 1 (`ui-system`)**.
- Real transactional API handlers (`POST /api/leads`, `/api/admin/**`, public catalogue search API) -> **Wave 1 (`backend-core`)**.
- Dedicated public catalogue, detail, search, consultancy, and legal routes -> **Wave 2 (`public-pillar-1` & `public-pillar-2`)**.
- Staff Admin CMS UI & Lead Inbox -> **Wave 2 (`admin-cms`)**.
- Full multi-route E2E, Playwright axe-core WCAG, and DoD verification pass -> **Wave 2/3 (`docs-qa` & `verifier`)**.
