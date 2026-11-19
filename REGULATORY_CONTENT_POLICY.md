# Regulatory Content Policy — Bangladesh Jurisdictional Accuracy

**Effective Baseline Reviewed:** 19 November 2026

---

## 1. Mandatory Independent-Platform Notice

Every Licensing & Registration page, Consultancy block, and public footer must display the clear disclosure:

> *"Paperwork Squad একটি স্বাধীন পেশাদার সহায়তা প্ল্যাটফর্ম; এটি কোনো সরকারি প্রতিষ্ঠান বা সরকারি পোর্টাল নয়। সকল নিবন্ধন, লাইসেন্স ও অনুমোদন সংশ্লিষ্ট কর্তৃপক্ষের বিধিমালা ও চূড়ান্ত সিদ্ধান্তসাপেক্ষ।"*

Forbidden patterns across all public routes & CMS entries:
- Never imply official government affiliation, partnership, or portal status.
- Never display government logos without documentary written permission.
- Never promise "100% approval", "guaranteed licence", or fixed government processing timelines.

---

## 2. Verified Regulatory References (Checked 19 Nov 2026)

| Authority / Domain | Official System | Governance Note |
|---|---|---|
| **RJSC** | Smart RJSC (`https://ebrs.rjsc.gov.bd/public/home`) | Handles name clearance, incorporation, status & statutory fee calculation. |
| **NBR (Tax & VAT)** | NBR eServices (`https://nbr.gov.bd/all-eservices/eng`) | 12-digit e-TIN, e-Return, 13-digit BIN, eVAT/Mushak 9.1, Customs & ePayment. |
| **BPPA / e-GP** | Public Procurement (`https://www.bppa.gov.bd/`) | PPR 2025 took effect 28 September 2025. Draft amendments (e.g., 3 Nov 2026 notices) must **never** be presented as enacted law until formally gazetted. |
| **DIFE** | LIMA Portal (`https://lima.dife.gov.bd/help`) | Factory vs. Establishment registration, layout approval & renewals. |
| **Fire Service** | e-Fire Licence (`https://elicense.fireservice.gov.bd/`) | Digital e-Fire Licence system launched 1 May 2026; subject to physical inspection. |
| **DoE / CCI&E / BIDA / DPDT** | Departmental Portals | Environmental Clearance (ECC), IRC/ERC, BIDA OSS, Trademark/IP filings (`https://dpdt.gov.bd/`). |

---

## 3. Metadata & Fee Separation Requirements

1. Every regulatory entry (`Service`, `LicensingEntry`, regulatory `Faq`) records `authorityName`, `officialSourceLabel`, `lastVerifiedAt`, and `verifiedBy`.
2. Documents listed on public pages must state clearly that requirements are **indicative and subject to specialist verification** (`পেশাদার পর্যালোচনা সাপেক্ষ`).
3. If fee information is approved for display in future releases, `serviceFeeNoteBn` (Paperwork Squad fee) and `govtFeeNoteBn` (government treasury/challan fee) **must stay strictly separate** — never merged into a single misleading figure.
