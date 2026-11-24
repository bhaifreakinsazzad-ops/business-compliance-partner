import { AvailabilityStatus, ContentStatus } from "@prisma/client";

export interface SeedLicensingEntry {
  slug: string;
  categorySlug: string;
  titleBn: string;
  titleEn: string;
  summaryBn: string;
  summaryEn: string;
  authorityName: string;
  authorityType: string;
  officialSourceLabel: string;
  officialSourceUrl: string | null;
  serviceScopeBn: string;
  limitationsBn: string;
  documentsSummary: string[];
  processSummaryBn: string;
  aliases: string[];
  contentStatus: ContentStatus;
  availabilityStatus: AvailabilityStatus;
  featured: boolean;
  sortOrder: number;
  lastVerifiedAt: Date | null;
  verifiedBy: string | null;
}

const VERIFIED_DATE = new Date("2026-11-19T00:00:00.000Z");
const REVIEWER = "Regulatory Baseline Check (Bangladesh Nov 2026)";

const LICENSING_LIMITATION_BN =
  "Business Compliance Partner (BCP) একটি স্বাধীন সহায়তা প্ল্যাটফর্ম, কোনো সরকারি পোর্টাল বা অনুমোদনকারী কর্তৃপক্ষ নয়। সকল লাইসেন্স, সনদ ও নবায়ন সিদ্ধান্ত সংশ্লিষ্ট কর্তৃপক্ষের নিয়ম, পরিদর্শন ও অনুমোদনের ওপর নির্ভরশীল।";

const PUBLISHED_LICENSING: SeedLicensingEntry[] = [
  {
    slug: "trade-license-new-renewal",
    categorySlug: "general-business-registration",
    titleBn: "ট্রেড লাইসেন্স (নতুন নিবন্ধন ও নবায়ন) সহায়তা",
    titleEn: "Trade Licence — New & Renewal Assistance",
    summaryBn:
      "সিটি কর্পোরেশন, পৌরসভা বা ইউনিয়ন পরিষদের অধীনে ট্রেড লাইসেন্স আবেদন ও নবায়নের জন্য প্রয়োজনীয় নথি প্রস্তুতি নির্দেশনা।",
    summaryEn:
      "Documentation guidance for City Corporation, Pourashava, or Union Parishad trade licence applications and renewals.",
    authorityName: "City Corporation / Pourashava / Union Parishad",
    authorityType: "LOCAL_GOVERNMENT",
    officialSourceLabel: "Respective Local Government Trade Licence Guidelines",
    officialSourceUrl: null,
    serviceScopeBn:
      "ব্যবসার ধরন অনুযায়ী সঠিক শ্রেণি চিহ্নিতকরণ, ভাড়া/মালিকানা নথি সমন্বয় এবং আবেদন ফর্ম প্রস্তুতি সহায়তা।",
    limitationsBn: LICENSING_LIMITATION_BN,
    documentsSummary: [
      "দোকান/অফিস ভাড়ার চুক্তিপত্র বা মালিকানা প্রমাণপত্র ও হোল্ডিং ট্যাক্স রসিদ",
      "আবেদনকারীর পরিচয় ও ব্যবসার ধরন সম্পর্কিত তথ্য (পেশাদার পর্যালোচনা সাপেক্ষ)",
    ],
    processSummaryBn:
      "১) অবস্থান অনুযায়ী কর্তৃপক্ষ চিহ্নিতকরণ → ২) প্রযোজ্য নথি সমন্বয় → ৩) আবেদন দাখিল ও ফি পরিশোধ সমন্বয় → ৪) সনদ সংগ্রহ।",
    aliases: ["trade license", "trade licence", "ট্রেড লাইসেন্স"],
    contentStatus: ContentStatus.PUBLISHED,
    availabilityStatus: AvailabilityStatus.INTEREST_ONLY,
    featured: true,
    sortOrder: 1,
    lastVerifiedAt: VERIFIED_DATE,
    verifiedBy: REVIEWER,
  },
  {
    slug: "rjsc-company-partnership-incorporation",
    categorySlug: "general-business-registration",
    titleBn: "Smart RJSC কোম্পানি ও পার্টনারশিপ ফার্ম নিবন্ধন",
    titleEn: "Smart RJSC Company & Partnership Registration",
    summaryBn:
      "প্রাইভেট লিমিটেড, OPC, পাবলিক লিমিটেড বা পার্টনারশিপ ফার্ম নিবন্ধনের নাম ছাড়পত্র ও ডকুমেন্টেশন সহায়তা।",
    summaryEn:
      "Assistance with Smart RJSC name clearance, MOA/AOA preparation, incorporation, and partnership registration.",
    authorityName: "Office of the Registrar of Joint Stock Companies and Firms (RJSC)",
    authorityType: "STATUTORY_AUTHORITY",
    officialSourceLabel: "Smart RJSC Portal",
    officialSourceUrl: "https://ebrs.rjsc.gov.bd/public/home",
    serviceScopeBn:
      "নাম ছাড়পত্র, মেমোরেন্ডাম (MOA) ও আর্টিকেলস (AOA) খসড়া প্রস্তুতি এবং নিবন্ধন আবেদন সমন্বয়।",
    limitationsBn: LICENSING_LIMITATION_BN,
    documentsSummary: [
      "প্রস্তাবিত নামসমূহ ও ব্যবসায়িক উদ্দেশ্য তালিকা",
      "শেয়ারহোল্ডার ও পরিচালকদের তথ্য এবং নিবন্ধিত অফিসের ঠিকানা (পর্যালোচনা সাপেক্ষ)",
    ],
    processSummaryBn:
      "১) নাম ছাড়পত্র → ২) MOA/AOA খসড়া → ৩) ব্যাংকিং/স্ট্যাম্প ফি নির্দেশনা → ৪) Smart RJSC সাবমিশন ও সনদ যাচাই।",
    aliases: ["rjsc", "private limited", "opc", "partnership", "moa", "aoa"],
    contentStatus: ContentStatus.PUBLISHED,
    availabilityStatus: AvailabilityStatus.INTEREST_ONLY,
    featured: true,
    sortOrder: 2,
    lastVerifiedAt: VERIFIED_DATE,
    verifiedBy: REVIEWER,
  },
  {
    slug: "nbr-etin-bin-tax-vat-registration",
    categorySlug: "general-business-registration",
    titleBn: "NBR e-TIN ও ১৩-ডিজিট BIN (ভ্যাট) নিবন্ধন",
    titleEn: "NBR e-TIN & 13-Digit BIN Registration",
    summaryBn:
      "আয়কর নিবন্ধন (e-TIN) এবং মূসক নিবন্ধন/তালিকাভুক্তি (BIN) সংক্রান্ত নথি প্রস্তুতি ও আবেদন সহায়তা।",
    summaryEn: "Documentation assistance for 12-digit e-TIN and 13-digit VAT BIN registration via NBR.",
    authorityName: "National Board of Revenue (NBR)",
    authorityType: "MINISTRY_DEPARTMENT",
    officialSourceLabel: "NBR eServices Portal",
    officialSourceUrl: "https://nbr.gov.bd/all-eservices/eng",
    serviceScopeBn:
      "ব্যক্তি বা প্রতিষ্ঠানের ধরন অনুযায়ী সঠিক নিবন্ধন বিভাগ যাচাই এবং অনলাইন আবেদন প্রস্তুতি।",
    limitationsBn: LICENSING_LIMITATION_BN,
    documentsSummary: [
      "ট্রেড লাইসেন্স / ইনকর্পোরেশন তথ্য ও ব্যাংক হিসাব প্রমাণ",
      "ব্যবসায়িক ঠিকানা ও পরিচালনাকারীর পরিচিতি তথ্য (পর্যালোচনা সাপেক্ষ)",
    ],
    processSummaryBn:
      "১) ব্যবসার ধরন যাচাই → ২) নথি প্রস্তুত → ৩) NBR অনলাইন সিস্টেমে আবেদন ও ভেরিফিকেশন সমন্বয়।",
    aliases: ["etin", "e-tin", "bin", "vat registration", "nbr"],
    contentStatus: ContentStatus.PUBLISHED,
    availabilityStatus: AvailabilityStatus.INTEREST_ONLY,
    featured: true,
    sortOrder: 3,
    lastVerifiedAt: VERIFIED_DATE,
    verifiedBy: REVIEWER,
  },
  {
    slug: "dife-lima-factory-establishment-licence",
    categorySlug: "factory-labour-registration",
    titleBn: "DIFE LIMA ফ্যাক্টরি লাইসেন্স ও প্রতিষ্ঠান নিবন্ধন",
    titleEn: "DIFE LIMA Factory Licence & Establishment Registration",
    summaryBn:
      "কলকারখানা ও প্রতিষ্ঠান পরিদর্শন অধিদপ্তরের (DIFE) LIMA সিস্টেমে লে-আউট অনুমোদন, নিবন্ধন ও লাইসেন্স নবায়ন সহায়তা।",
    summaryEn:
      "Assistance for DIFE LIMA factory layout plan approval, factory/establishment registration, and renewals.",
    authorityName: "Department of Inspection for Factories and Establishments (DIFE)",
    authorityType: "MINISTRY_DEPARTMENT",
    officialSourceLabel: "DIFE LIMA Help Portal",
    officialSourceUrl: "https://lima.dife.gov.bd/help",
    serviceScopeBn:
      "ফ্যাক্টরি বা বাণিজ্যিক প্রতিষ্ঠান শ্রেণি যাচাই, লে-আউট প্ল্যান নথি তালিকা ও LIMA আবেদন প্রস্তুতিতে সহায়তা।",
    limitationsBn: LICENSING_LIMITATION_BN,
    documentsSummary: [
      "ট্রেড লাইসেন্স, কারখানার স্থাপত্য লে-আউট প্ল্যান ও ভাড়া/মালিকানা দলিল",
      "যন্ত্রপাতির তালিকা, জনবল কাঠামো ও নিরাপত্তা ব্যবস্থা তথ্য (পর্যালোচনা সাপেক্ষ)",
    ],
    processSummaryBn:
      "১) প্রতিষ্ঠানের শ্রেণি নির্ধারণ → ২) লে-আউট ও নিরাপত্তা নথি যাচাই → ৩) LIMA পোর্টালে আবেদন ও পরিদর্শন প্রস্তুতি।",
    aliases: ["dife", "lima", "factory licence", "establishment registration", "labour"],
    contentStatus: ContentStatus.PUBLISHED,
    availabilityStatus: AvailabilityStatus.INTEREST_ONLY,
    featured: true,
    sortOrder: 4,
    lastVerifiedAt: VERIFIED_DATE,
    verifiedBy: REVIEWER,
  },
  {
    slug: "fire-service-e-fire-licence",
    categorySlug: "environment-fire-safety",
    titleBn: "ফায়ার সার্ভিস e-Fire লাইসেন্স ও অগ্নি নিরাপত্তা ছাড়পত্র",
    titleEn: "Fire Service e-Fire Licence & Fire Safety Clearance",
    summaryBn:
      "ফায়ার সার্ভিস ও সিভিল ডিফেন্স-এর e-Fire Licence (১ মে ২০২৬ থেকে চালুকৃত) আবেদন, নিরাপত্তা সরঞ্জাম চেকলিস্ট ও নবায়ন সহায়তা।",
    summaryEn:
      "Guidance and documentation support for Bangladesh Fire Service e-Fire Licence applications and safety readiness.",
    authorityName: "Bangladesh Fire Service & Civil Defence",
    authorityType: "MINISTRY_DEPARTMENT",
    officialSourceLabel: "e-Fire Licence Portal",
    officialSourceUrl: "https://elicense.fireservice.gov.bd/",
    serviceScopeBn:
      "প্রাথমিক স্থাপনার ধরন অনুযায়ী ফায়ার সেফটি ডকুমেন্টেশন প্রস্তুত এবং পরিদর্শন-পূর্ব প্রস্তুতি নির্দেশনা।",
    limitationsBn:
      "অগ্নি নিরাপত্তা পরিদর্শন ও লাইসেন্স ইস্যু সম্পূর্ণভাবে ফায়ার সার্ভিস ও সিভিল ডিফেন্স কর্তৃপক্ষের সরেজমিন যাচাইয়ের ওপর নির্ভরশীল।",
    documentsSummary: [
      "ট্রেড লাইসেন্স, ভবনের অনুমোদিত নকশা বা ভাড়া চুক্তি",
      "অগ্নিনির্বাপণ সরঞ্জামের বিবরণ ও স্থাপনার ফ্লোর-এরিয়া তথ্য (পর্যালোচনা সাপেক্ষ)",
    ],
    processSummaryBn:
      "১) ঝুঁকির শ্রেণি ও নথি যাচাই → ২) নিরাপত্তা সরঞ্জাম প্রস্তুতি নির্দেশনা → ৩) e-Fire পোর্টালে আবেদন সমন্বয়।",
    aliases: ["fire licence", "e-fire", "fire noc", "ফায়ার লাইসেন্স"],
    contentStatus: ContentStatus.PUBLISHED,
    availabilityStatus: AvailabilityStatus.INTEREST_ONLY,
    featured: true,
    sortOrder: 5,
    lastVerifiedAt: VERIFIED_DATE,
    verifiedBy: REVIEWER,
  },
  {
    slug: "ccie-irc-erc-import-export-licence",
    categorySlug: "import-export-licences",
    titleBn: "CCI&E আমদানি-রপ্তানি নিবন্ধন সনদ (IRC & ERC)",
    titleEn: "CCI&E Import (IRC) & Export (ERC) Registration Certificate",
    summaryBn:
      "আমদানি নিবন্ধন সনদ (IRC) এবং রপ্তানি নিবন্ধন সনদ (ERC) নতুন আবেদন, নবায়ন ও চেম্বার সদস্যপদ সমন্বয় নির্দেশনা।",
    summaryEn:
      "Documentation support for CCI&E Import Registration Certificate (IRC) and Export Registration Certificate (ERC).",
    authorityName: "Office of the Chief Controller of Imports and Exports (CCI&E)",
    authorityType: "MINISTRY_DEPARTMENT",
    officialSourceLabel: "CCI&E Licensing Guidelines",
    officialSourceUrl: null,
    serviceScopeBn:
      "বাণিজ্যিক বা শিল্প IRC শ্রেণী যাচাই, নথিপত্রের প্রাক-যাচাই এবং আবেদন প্রক্রিয়ায় ডকুমেন্টেশন সহায়তা।",
    limitationsBn: LICENSING_LIMITATION_BN,
    documentsSummary: [
      "হালনাগাদ ট্রেড লাইসেন্স, চেম্বার অব কমার্স/অ্যাসোসিয়েশন সদস্যপদ, e-TIN ও BIN",
      "ব্যাংক সলভেন্সি সনদ ও প্রযোজ্য কোম্পানি নথি (পেশাদার পর্যালোচনা সাপেক্ষ)",
    ],
    processSummaryBn:
      "১) আমদানি/রপ্তানি ধরন নির্ধারণ → ২) চেম্বার ও ব্যাংক নথি সমন্বয় → ৩) অনলাইন OLM আবেদন প্রস্তুতি ও নবায়ন সহায়তা।",
    aliases: ["irc", "erc", "ccie", "import registration", "export registration"],
    contentStatus: ContentStatus.PUBLISHED,
    availabilityStatus: AvailabilityStatus.INTEREST_ONLY,
    featured: true,
    sortOrder: 6,
    lastVerifiedAt: VERIFIED_DATE,
    verifiedBy: REVIEWER,
  },
];

// Remaining PDF pp. 15-18 licensing candidates seeded as DRAFT for admin curation
const DRAFT_LICENSING_SPECS: Array<{
  slug: string;
  categorySlug: string;
  titleEn: string;
  titleBn: string;
  authorityName: string;
  authorityType: string;
}> = [
  { slug: "ngo-society-trust-registration-guidance", categorySlug: "general-business-registration", titleEn: "NGO, Society & Trust Registration Guidance", titleBn: "এনজিও, সোসাইটি ও ট্রাস্ট নিবন্ধন নির্দেশনা", authorityName: "RJSC / NGO Affairs Bureau / Social Services", authorityType: "REGULATOR" },
  { slug: "doe-environmental-clearance-ecc", categorySlug: "environment-fire-safety", titleEn: "DoE Environmental Clearance Certificate (ECC) & EIA/EMP", titleBn: "পরিবেশ অধিদপ্তরের ছাড়পত্র (ECC), সাইট ক্লিয়ারেন্স ও ETP সহায়তা", authorityName: "Department of Environment (DoE)", authorityType: "MINISTRY_DEPARTMENT" },
  { slug: "boiler-registration-licence-support", categorySlug: "environment-fire-safety", titleEn: "Boiler Registration & Operator Documentation", titleBn: "বয়লার নিবন্ধন ও লাইসেন্স ডকুমেন্টেশন", authorityName: "Office of the Chief Inspector of Boilers", authorityType: "MINISTRY_DEPARTMENT" },
  { slug: "bsti-cm-licence-certification", categorySlug: "sector-product-approvals", titleEn: "BSTI Certification Mark (CM Licence) & Weights Compliance", titleBn: "BSTI সার্টিফিকেশন মার্ক (CM লাইসেন্স) সহায়তা", authorityName: "Bangladesh Standards and Testing Institution (BSTI)", authorityType: "STATUTORY_AUTHORITY" },
  { slug: "dgda-drug-licence-approval", categorySlug: "sector-product-approvals", titleEn: "DGDA Drug & Healthcare Licence Guidance", titleBn: "ঔষধ প্রশাসন (DGDA) ড্রাগ লাইসেন্স নির্দেশনা", authorityName: "Directorate General of Drug Administration (DGDA)", authorityType: "MINISTRY_DEPARTMENT" },
  { slug: "bfsa-food-safety-registration", categorySlug: "sector-product-approvals", titleEn: "BFSA Food Safety Registration & Hospitality Permissions", titleBn: "বাংলাদেশ নিরাপদ খাদ্য কর্তৃপক্ষ (BFSA) ও রেস্তোরাঁ অনুমোদন", authorityName: "Bangladesh Food Safety Authority (BFSA)", authorityType: "STATUTORY_AUTHORITY" },
  { slug: "dae-plant-animal-quarantine-certificate", categorySlug: "sector-product-approvals", titleEn: "DAE Plant & Animal Quarantine Approvals", titleBn: "কৃষি সম্প্রসারণ (DAE) কোয়ারেন্টাইন ও অনুমোদন নির্দেশনা", authorityName: "Department of Agricultural Extension (DAE) / DLS", authorityType: "MINISTRY_DEPARTMENT" },
  { slug: "explosives-petroleum-lpg-licence", categorySlug: "sector-product-approvals", titleEn: "Department of Explosives / Petroleum / LPG Approval Guidance", titleBn: "বিস্ফোরক অধিদপ্তর, পেট্রোলিয়াম ও LPG লাইসেন্স নির্দেশনা", authorityName: "Department of Explosives / BERC", authorityType: "MINISTRY_DEPARTMENT" },
  { slug: "btrc-bangladesh-bank-sector-approvals", categorySlug: "sector-product-approvals", titleEn: "BTRC & Sector-Specific Regulatory Approvals", titleBn: "BTRC ও খাতভিত্তিক বিশেষায়িত নিয়ন্ত্রক অনুমোদন", authorityName: "BTRC / Relevant Sector Regulator", authorityType: "REGULATOR" },
  { slug: "bond-indenting-epb-chamber-registrations", categorySlug: "import-export-licences", titleEn: "Bond Licence, Indenting, EPB & Chamber Memberships", titleBn: "বন্ড লাইসেন্স, ইন্ডেন্টিং, EPB ও চেম্বার অব কমার্স নিবন্ধন", authorityName: "Bangladesh Customs / EPB / CCI&E", authorityType: "MINISTRY_DEPARTMENT" },
  { slug: "bida-beza-bepza-hitech-park-registration", categorySlug: "investment-other-approvals", titleEn: "BIDA OSS, BEZA, BEPZA & Hi-Tech Park Registration", titleBn: "BIDA OSS, BEZA, BEPZA ও হাই-টেক পার্ক নিবন্ধন সহায়তা", authorityName: "BIDA / BEZA / BEPZA / BHTPA", authorityType: "STATUTORY_AUTHORITY" },
  { slug: "local-noc-building-occupancy-warehouse", categorySlug: "investment-other-approvals", titleEn: "Local Authority NOC, Building Plan, Occupancy & Warehouse", titleBn: "স্থানীয় NOC, ভবন ও অকুপ্যান্সি সনদ, সাইনবোর্ড ও ওয়্যারহাউস অনুমতি", authorityName: "RAJUK / CDA / Local Authorities", authorityType: "LOCAL_GOVERNMENT" },
];

const DRAFT_LICENSING: SeedLicensingEntry[] = DRAFT_LICENSING_SPECS.map((spec, idx) => ({
  slug: spec.slug,
  categorySlug: spec.categorySlug,
  titleBn: spec.titleBn,
  titleEn: spec.titleEn,
  summaryBn: `${spec.titleEn} সংক্রান্ত প্রস্তাবিত লাইসেন্সিং তথ্য — চূড়ান্ত নথি ও ফি যাচাইয়ের পর প্রকাশিত হবে।`,
  summaryEn: `Candidate licensing guide (${spec.titleEn}). Pending verification of current authority rules before public release.`,
  authorityName: spec.authorityName,
  authorityType: spec.authorityType,
  officialSourceLabel: `${spec.authorityName} Official Framework`,
  officialSourceUrl: null,
  serviceScopeBn: "প্রাথমিক তথ্য ও ডকুমেন্টেশন প্রস্তুতিতে নির্দেশনা (পর্যালোচনাধীন)।",
  limitationsBn: LICENSING_LIMITATION_BN,
  documentsSummary: ["প্রাথমিক ব্যবসায়িক লাইসেন্স ও স্থাপনার নথি (পেশাদার পর্যালোচনা সাপেক্ষ)"],
  processSummaryBn: "সংশ্লিষ্ট কর্তৃপক্ষের বর্তমান প্রজ্ঞাপন অনুযায়ী নথি যাচাই ও আবেদন প্রস্তুতি।",
  aliases: [spec.titleEn.toLowerCase()],
  contentStatus: ContentStatus.DRAFT,
  availabilityStatus: AvailabilityStatus.INTEREST_ONLY,
  featured: false,
  sortOrder: 100 + idx,
  lastVerifiedAt: null,
  verifiedBy: null,
}));

export const SEED_LICENSING: SeedLicensingEntry[] = [...PUBLISHED_LICENSING, ...DRAFT_LICENSING];
