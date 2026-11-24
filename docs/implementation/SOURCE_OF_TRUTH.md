# Source of Truth

Last reconciled: 2026-11-25 (Asia/Dhaka)

## Precedence

1. Project-owner instructions in the current Codex chat, including the confirmed GitHub and Vercel links.
2. `pasted-text-1.txt` — Master Implementation Directive, BCP Digital Platform V2.0.
3. Approved BCP source artefacts listed in that directive, when supplied.
4. Existing repository implementation and historical discovery records.

## Available and verified

| Source | Status | Use |
|---|---|---|
| Master Implementation Directive V2.0 | AVAILABLE | Governing delivery, safety and release requirements |
| GitHub repository `bhaifreakinsazzad-ops/business-compliance-partner` | VERIFIED read-only | Intended source repository; `main` is `7665bc3` |
| Local repository | VERIFIED | Local `main` started at `1d64426`, containing the newer admin CMS implementation |
| Vercel project `w9h-engineering/business-compliance-partner` | VERIFIED read-only | Existing deployment target; still sourced from legacy `notrealenginellc/Paperwork-Squad` |
| Existing BCP candidate catalogue extracted in seed files | AVAILABLE, PARTIAL | 96 offerings across 27 categories; staging-only until authoritative reconciliation |

## Missing sources and impact

The current attachment contains only the directive. The following named artefacts are not in the attachment or repository:

- BCP Client Business Overview / Implementation Plan V2.0
- BCP Client and Master Knowledge Bases
- BCP Service Catalogue V1.1 JSON (437 source records)
- BCP Official Brand Book and Brand Configuration
- approved circular Navy–Gold master logo binary
- original BCP catalogue PDF

Consequences:

- The official business name, tagline, promise and palette from the directive are implemented.
- A text identity is rendered until the approved logo binary is supplied. The legacy concept image is not rendered and no substitute logo is fabricated.
- The 437-record catalogue cannot be truthfully reconciled. Existing verified seed records remain staging-only; no missing prices, legal facts or offerings are invented.
- Complete English translations cannot be certified without the approved bilingual content source.

## Conflicts resolved

- BCP V2.0 identity overrides legacy Paperwork Squad presentation.
- The newer local `1d64426` admin CMS is preserved because it contains approved useful functionality absent from requested repository `main`; history is not rewritten.
- New enquiry references use `BCP-YYYY-XXXXXXXX`; existing `PS-YYYY-XXXXXXXX` references remain valid and searchable.
- Production catalogue reads fail closed when PostgreSQL is unavailable. Seed fallback is limited to development/staging.

## Approval-dependent requirements

Production release, database migration, payment activation, customer accounts, sensitive document uploads, LMS sales, AI, verified contacts, prices, policies and domain changes remain gated by the directive's explicit approvals and unavailable infrastructure.
