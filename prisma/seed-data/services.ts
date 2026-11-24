import { AvailabilityStatus, ContentStatus } from "@prisma/client";

export interface ProcessStepSeed {
  stepNumber: number;
  titleBn: string;
  descriptionBn: string;
}

export interface SeedService {
  slug: string;
  categorySlug: string;
  titleBn: string;
  titleEn: string;
  summaryBn: string;
  summaryEn: string;
  whoNeedsItBn: string;
  assistanceScopeBn: string;
  limitationsBn: string;
  documentsSummary: string[];
  processSteps: ProcessStepSeed[];
  authorityName: string | null;
  officialSourceLabel: string | null;
  officialSourceUrl: string | null;
  requiresSpecialist: boolean;
  aliases: string[];
  serviceFeeNoteBn: string | null;
  govtFeeNoteBn: string | null;
  contentStatus: ContentStatus;
  availabilityStatus: AvailabilityStatus;
  featured: boolean;
  sortOrder: number;
  lastVerifiedAt: Date | null;
  verifiedBy: string | null;
}

const VERIFIED_DATE = new Date("2026-11-19T00:00:00.000Z");
const REVIEWER = "Regulatory Baseline Check (Bangladesh Nov 2026)";

const STANDARD_LIMITATION_BN =
  "Business Compliance Partner (BCP) একটি স্বাধীন পেশাদার ডকুমেন্টেশন ও পরামর্শ সহায়তা প্ল্যাটফর্ম। চূড়ান্ত নিবন্ধন, মূল্যায়ন বা অনুমোদন সম্পূর্ণভাবে সংশ্লিষ্ট সরকারি কর্তৃপক্ষের বিধিমালা ও এখতিয়ারের ওপর নির্ভরশীল; কোনো সরকারি অনুমোদনের নিশ্চয়তা দেওয়া হয় না।";

const PUBLISHED_SERVICES: SeedService[] = [
  {
    slug: "etin-individual-corporate-tax-return",
    categorySlug: "income-tax-solutions",
    titleBn: "e-TIN ও আয়কর রিটার্ন প্রস্তুতি সহায়তা",
    titleEn: "e-TIN & Income Tax Return Support",
    summaryBn:
      "১২-ডিজিট e-TIN নিবন্ধন, ব্যক্তিগত ও প্রাতিষ্ঠানিক আয়কর রিটার্ন প্রস্তুতি এবং IT-10B/সম্পদ বিবরণী ডকুমেন্টেশন সহায়তা।",
    summaryEn:
      "12-digit e-TIN registration, individual/corporate income tax return preparation, and IT-10B documentation support.",
    whoNeedsItBn: "ব্যক্তিগত করদাতা, প্রোপ্রাইটরশিপ ব্যবসায়ী, পার্টনারশিপ ও প্রাইভেট লিমিটেড কোম্পানি।",
    assistanceScopeBn:
      "প্রযোজ্য আয়ের নথি তালিকাভুক্ত করা, প্রাথমিক কর হিসাব পর্যালোচনা, রিটার্ন ফর্ম পূরণ ও দাখিল প্রক্রিয়ায় পেশাদার সহায়তা।",
    limitationsBn: STANDARD_LIMITATION_BN,
    documentsSummary: [
      "জাতীয় পরিচয়পত্র / কোম্পানি নিবন্ধন তথ্য (প্রযোজ্য ক্ষেত্রে; প্রাথমিক ফর্মে আপলোড নিষিদ্ধ)",
      "বার্ষিক আয়, বেতন সনদ, ব্যাংক বিবরণী ও TDS/AIT প্রমাণপত্র (পেশাদার পর্যালোচনা সাপেক্ষ)",
    ],
    processSteps: [
      { stepNumber: 1, titleBn: "প্রাথমিক তথ্য যাচাই", descriptionBn: "করদাতার ধরন ও আয়ের উৎস নির্ধারণ।" },
      { stepNumber: 2, titleBn: "নথিপত্র সমন্বয়", descriptionBn: "প্রাথমিক চেকলিস্ট অনুযায়ী কাগজপত্র সংগ্রহ ও যাচাই।" },
      { stepNumber: 3, titleBn: "হিসাব ও রিটার্ন প্রস্তুতি", descriptionBn: "NBR বিধিমালা অনুযায়ী কর হিসাব ও রিটার্ন খসড়া তৈরি।" },
      { stepNumber: 4, titleBn: "দাখিল ও প্রাপ্তি স্বীকার", descriptionBn: "সংশ্লিষ্ট পোর্টাল বা সার্কেলে দাখিল সহায়তা এবং রসিদ সংরক্ষণ।" },
    ],
    authorityName: "National Board of Revenue (NBR)",
    officialSourceLabel: "NBR eServices Portal",
    officialSourceUrl: "https://nbr.gov.bd/all-eservices/eng",
    requiresSpecialist: true,
    aliases: ["e-tin", "income tax return", "corporate tax", "it-10b", "zero return"],
    serviceFeeNoteBn: null,
    govtFeeNoteBn: null,
    contentStatus: ContentStatus.PUBLISHED,
    availabilityStatus: AvailabilityStatus.INTEREST_ONLY,
    featured: true,
    sortOrder: 1,
    lastVerifiedAt: VERIFIED_DATE,
    verifiedBy: REVIEWER,
  },
  {
    slug: "bin-registration-mushak-9-1-vat",
    categorySlug: "vat-mushak-solutions",
    titleBn: "১৩-ডিজিট BIN নিবন্ধন ও মাসিক মূসক ৯.১ সহায়তা",
    titleEn: "13-Digit BIN Registration & Monthly VAT (Mushak 9.1)",
    summaryBn:
      "ভ্যাট/মূসক নিবন্ধন (BIN), মাসিক মূসক ৯.১ রিটার্ন প্রস্তুতি, মূসক ৬.৩ চালান এবং VDS সমন্বয় সহায়তা।",
    summaryEn:
      "VAT BIN registration, monthly Mushak 9.1 filing assistance, Mushak 6.3 invoicing, and VDS compliance.",
    whoNeedsItBn: "পণ্য ও সেবা সরবরাহকারী প্রতিষ্ঠান, আমদানিকারক, ট্রেডিং ও কর্পোরেট ব্যবসা।",
    assistanceScopeBn:
      "ব্যবসার ধরন অনুযায়ী BIN নিবন্ধন বা সংশোধন, ক্রয়-বিক্রয় খাতা (মূসক ৬.১/৬.২) সমন্বয় ও মাসিক রিটার্ন দাখিলে সহায়তা।",
    limitationsBn: STANDARD_LIMITATION_BN,
    documentsSummary: [
      "ট্রেড লাইসেন্স, e-TIN ও প্রযোজ্য ব্যাংক তথ্য (পেশাদার পর্যালোচনা সাপেক্ষ)",
      "ক্রয়-বিক্রয় ইনভয়েস, VDS সনদ (মূসক ৬.৬) ও পূর্ববর্তী দাখিলের তথ্য",
    ],
    processSteps: [
      { stepNumber: 1, titleBn: "যোগ্যতা ও শ্রেণি নির্ধারণ", descriptionBn: "টার্নওভার ও ভ্যাট প্রযোজ্যতা যাচাই।" },
      { stepNumber: 2, titleBn: "নথি ও হিসাব পর্যালোচনা", descriptionBn: "মূসক রেজিস্টার ও চালান নথি সমন্বয়।" },
      { stepNumber: 3, titleBn: "BIN / রিটার্ন প্রস্তুতি", descriptionBn: "অনলাইন মূসক সিস্টেমে খসড়া প্রস্তুত ও যাচাই।" },
    ],
    authorityName: "National Board of Revenue (NBR — VAT Wing)",
    officialSourceLabel: "NBR eVAT & eServices",
    officialSourceUrl: "https://nbr.gov.bd/all-eservices/eng",
    requiresSpecialist: true,
    aliases: ["bin", "vat", "mushak 9.1", "mushak 6.3", "vds"],
    serviceFeeNoteBn: null,
    govtFeeNoteBn: null,
    contentStatus: ContentStatus.PUBLISHED,
    availabilityStatus: AvailabilityStatus.INTEREST_ONLY,
    featured: true,
    sortOrder: 2,
    lastVerifiedAt: VERIFIED_DATE,
    verifiedBy: REVIEWER,
  },
  {
    slug: "egp-registration-tender-compliance",
    categorySlug: "egp-government-tender",
    titleBn: "e-GP নিবন্ধন, প্রোফাইল আপডেট ও দরপত্র নথি সহায়তা",
    titleEn: "e-GP Registration & Tender Compliance Support",
    summaryBn:
      "নতুন ঠিকাদার ও সরবরাহকারীদের জন্য e-GP নিবন্ধন, নবায়ন ও PPR 2025 অনুসারে দরপত্র নথি প্রস্তুতি সহায়তা।",
    summaryEn:
      "Support for e-GP registration, profile renewals, eligibility review, and tender compliance under PPR 2025.",
    whoNeedsItBn: "সরকারি ক্রয়ে অংশগ্রহণে আগ্রহী ঠিকাদার, সরবরাহকারী ও পরামর্শক প্রতিষ্ঠান।",
    assistanceScopeBn:
      "e-GP প্রোফাইল প্রস্তুতি, দরপত্রের যোগ্যতার শর্তাবলি বিশ্লেষণ এবং নথিপত্রের তালিকা যাচাইয়ে সহায়তা।",
    limitationsBn:
      "Business Compliance Partner (BCP) কোনো সরকারি ক্রয় সংস্থা (PE) নয় এবং টেন্ডার মূল্যায়ন বা কার্যাদেশ প্রাপ্তির নিশ্চয়তা দেয় না। সরকারি ক্রয় বিধিমালা সময়ে সময়ে পরিবর্তিত হতে পারে।",
    documentsSummary: [
      "হালনাগাদ ট্রেড লাইসেন্স, e-TIN/আয়কর প্রাপ্তি স্বীকার ও BIN",
      "অভিজ্ঞতার সনদ, ব্যাংক সলভেন্সি ও টার্নওভার বিবরণী (পেশাদার পর্যালোচনা সাপেক্ষ)",
    ],
    processSteps: [
      { stepNumber: 1, titleBn: "প্রাথমিক নথি নিরীক্ষা", descriptionBn: "নিবন্ধন বা দরপত্রের শর্তানুযায়ী নথি যাচাই।" },
      { stepNumber: 2, titleBn: "প্রোফাইল / দরপত্র প্রস্তুতি", descriptionBn: "প্রয়োজনীয় ফর্ম ও সংযুক্তি সাজানো।" },
      { stepNumber: 3, titleBn: "চূড়ান্ত রিভিউ", descriptionBn: "সাবমিশনের পূর্বে কমপ্লায়েন্স যাচাই।" },
    ],
    authorityName: "Bangladesh Public Procurement Authority (BPPA)",
    officialSourceLabel: "BPPA Official Notices (PPR 2025)",
    officialSourceUrl: "https://www.bppa.gov.bd/",
    requiresSpecialist: true,
    aliases: ["egp", "e-gp", "bppa", "tender", "noa", "ppr 2025"],
    serviceFeeNoteBn: null,
    govtFeeNoteBn: null,
    contentStatus: ContentStatus.PUBLISHED,
    availabilityStatus: AvailabilityStatus.INTEREST_ONLY,
    featured: true,
    sortOrder: 3,
    lastVerifiedAt: VERIFIED_DATE,
    verifiedBy: REVIEWER,
  },
  {
    slug: "smart-rjsc-company-secretarial-support",
    categorySlug: "company-secretarial-compliance",
    titleBn: "Smart RJSC নিবন্ধন ও কোম্পানি সেক্রেটারিয়াল সহায়তা",
    titleEn: "Smart RJSC Formation & Corporate Secretarial Support",
    summaryBn:
      "কোম্পানির নাম ছাড়পত্র, MOA/AOA খসড়া প্রস্তুতি, বার্ষিক রিটার্ন (Form X/XII/XV) ও বোর্ড রেজোলিউশন ডকুমেন্টেশন।",
    summaryEn:
      "RJSC name clearance, MOA/AOA preparation, annual return filings, director updates, and statutory registers.",
    whoNeedsItBn: "নতুন প্রাইভেট লিমিটেড/OPC উদ্যোক্তা ও বিদ্যমান নিবন্ধিত কোম্পানিসমূহ।",
    assistanceScopeBn:
      "Smart RJSC প্রক্রিয়ার প্রয়োজনীয় কাগজপত্র প্রস্তুত, নাম ছাড়পত্র আবেদন প্রস্তুতি, AGM/বোর্ড মিনিটস এবং ফাইলিং সমন্বয়।",
    limitationsBn: STANDARD_LIMITATION_BN,
    documentsSummary: [
      "প্রস্তাবিত কোম্পানির নামসমূহ ও ব্যবসায়িক উদ্দেশ্য বিবরণী",
      "পরিচালক ও শেয়ারহোল্ডারদের মৌলিক পরিচিতি ও শেয়ার বণ্টন তথ্য (পর্যালোচনা সাপেক্ষ)",
    ],
    processSteps: [
      { stepNumber: 1, titleBn: "নাম ছাড়পত্র প্রস্তুতি", descriptionBn: "Smart RJSC পোর্টালে নামের প্রাপ্যতা ও আবেদন।" },
      { stepNumber: 2, titleBn: "MOA ও AOA খসড়া", descriptionBn: "ব্যবসায়িক কাঠামো অনুযায়ী দলিল প্রণয়ন।" },
      { stepNumber: 3, titleBn: "নিবন্ধন ও বিধিবদ্ধ ফাইলিং", descriptionBn: "সার্টিফিকেট অব ইনকর্পোরেশন বা বার্ষিক রিটার্ন সমন্বয়।" },
    ],
    authorityName: "Office of the Registrar of Joint Stock Companies and Firms (RJSC)",
    officialSourceLabel: "Smart RJSC Portal",
    officialSourceUrl: "https://ebrs.rjsc.gov.bd/public/home",
    requiresSpecialist: true,
    aliases: ["rjsc", "company registration", "moa", "aoa", "annual return", "agm", "opc"],
    serviceFeeNoteBn: null,
    govtFeeNoteBn: null,
    contentStatus: ContentStatus.PUBLISHED,
    availabilityStatus: AvailabilityStatus.INTEREST_ONLY,
    featured: true,
    sortOrder: 4,
    lastVerifiedAt: VERIFIED_DATE,
    verifiedBy: REVIEWER,
  },
  {
    slug: "import-export-irc-erc-customs-documentation",
    categorySlug: "customs-international-trade",
    titleBn: "আমদানি-রপ্তানি (IRC/ERC) ও কাস্টমস ডকুমেন্টেশন সহায়তা",
    titleEn: "IRC/ERC & Customs Documentation Support",
    summaryBn:
      "IRC ও ERC নথি প্রস্তুতি, HS কোড ও শুল্ক বিশ্লেষণ, LC নথি পর্যালোচনা এবং আমদানি কস্টিং সহায়তা।",
    summaryEn:
      "IRC/ERC documentation guidance, HS code tariff analysis, LC document review, and landed cost calculations.",
    whoNeedsItBn: "আমদানিকারক, রপ্তানিকারক, ট্রেডিং হাউস ও শিল্প প্রতিষ্ঠান।",
    assistanceScopeBn:
      "প্রাথমিক নথি প্রস্তুতি, প্রফরমা/কমার্শিয়াল ইনভয়েস পর্যালোচনা এবং শুল্ক-কর প্রাক্কলন সহায়তা।",
    limitationsBn:
      "বাস্তব শুল্কায়ন ও পণ্য খালাস কাস্টমস কর্তৃপক্ষ এবং লাইসেন্সধারী C&F এজেন্টের প্রক্রিয়ার অধীন। চূড়ান্ত HS কোড বা শুল্ক মূল্যায়ন কাস্টমস কর্তৃপক্ষ কর্তৃক নির্ধারিত হয়।",
    documentsSummary: [
      "ট্রেড লাইসেন্স, BIN, e-TIN ও চেম্বার/অ্যাসোসিয়েশন সদস্যপদ তথ্য",
      "Proforma Invoice, পণ্যের ক্যাটালগ ও LC সংক্রান্ত তথ্য (পর্যালোচনা সাপেক্ষ)",
    ],
    processSteps: [
      { stepNumber: 1, titleBn: "নথি ও নীতি যাচাই", descriptionBn: "আমদানি/রপ্তানি নীতি অনুযায়ী প্রযোজ্যতা পরীক্ষা।" },
      { stepNumber: 2, titleBn: "HS কোড ও কস্টিং বিশ্লেষণ", descriptionBn: "প্রাথমিক শুল্ক-কর হিসাব প্রস্তুত।" },
      { stepNumber: 3, titleBn: "আবেদন ও ডকুমেন্টেশন সমন্বয়", descriptionBn: "নথিপত্র সাজানো ও সংশোধন সহায়তা।" },
    ],
    authorityName: "CCI&E & Bangladesh Customs (NBR)",
    officialSourceLabel: "NBR Customs & CCI&E Guidelines",
    officialSourceUrl: "https://nbr.gov.bd/all-eservices/eng",
    requiresSpecialist: true,
    aliases: ["irc", "erc", "customs", "hs code", "landed cost", "asycuda", "lc"],
    serviceFeeNoteBn: null,
    govtFeeNoteBn: null,
    contentStatus: ContentStatus.PUBLISHED,
    availabilityStatus: AvailabilityStatus.INTEREST_ONLY,
    featured: true,
    sortOrder: 5,
    lastVerifiedAt: VERIFIED_DATE,
    verifiedBy: REVIEWER,
  },
  {
    slug: "monthly-bookkeeping-financial-statements",
    categorySlug: "accounting-financial-management",
    titleBn: "মাসিক বুককিপিং, আর্থিক বিবরণী ও অডিট সমন্বয়",
    titleEn: "Monthly Bookkeeping, Financial Statements & Audit Coordination",
    summaryBn:
      "দৈনন্দিন হিসাবরক্ষণ, ব্যাংক রিকনসিলিয়েশন, P&L, ব্যালেন্স শিট প্রস্তুতি এবং অ্যাকাউন্টিং সফটওয়্যার সেটআপ সহায়তা।",
    summaryEn:
      "Structured bookkeeping, bank reconciliation, P&L & balance sheet preparation, and external audit coordination.",
    whoNeedsItBn: "এসএমই ব্যবসা, স্টার্টআপ, ই-কমার্স প্রতিষ্ঠান ও কর্পোরেট সংস্থা।",
    assistanceScopeBn:
      "লেনদেন রেকর্ডিং, লেজার সমন্বয়, ব্যবস্থাপনা রিপোর্ট তৈরি এবং ট্যাক্স/ভ্যাট ও অডিটের জন্য হিসাব প্রস্তুত করা।",
    limitationsBn:
      "বিধিবদ্ধ অডিট রিপোর্ট কেবল নিবন্ধিত চার্টার্ড অ্যাকাউন্ট্যান্ট (ICAB সদস্য) ফার্ম কর্তৃক সম্পাদিত ও স্বাক্ষরিত হতে হয়।",
    documentsSummary: [
      "দৈনন্দিন ক্যাশ/ব্যাংক লেনদেন, ইনভয়েস ও ভাউচার তথ্য",
      "পূর্ববর্তী হিসাব বা সফটওয়্যার ডাটা ব্যাকআপ (যদি থাকে)",
    ],
    processSteps: [
      { stepNumber: 1, titleBn: "হিসাব কাঠামো পর্যালোচনা", descriptionBn: "Chart of Accounts ও লেনদেনের ধরন বোঝা।" },
      { stepNumber: 2, titleBn: "রিকনসিলিয়েশন ও পোস্টিং", descriptionBn: "ক্যাশ, ব্যাংক ও মূসক/ট্যাক্স তথ্যের সমন্বয়।" },
      { stepNumber: 3, titleBn: "মাসিক/বার্ষিক বিবরণী", descriptionBn: "P&L, ব্যালেন্স শিট ও ক্যাশ ফ্লো রিপোর্ট তৈরি।" },
    ],
    authorityName: null,
    officialSourceLabel: "Internal Financial & Tax Compliance Standards",
    officialSourceUrl: null,
    requiresSpecialist: true,
    aliases: ["bookkeeping", "accounting", "balance sheet", "audit", "payroll", "quickbooks"],
    serviceFeeNoteBn: null,
    govtFeeNoteBn: null,
    contentStatus: ContentStatus.PUBLISHED,
    availabilityStatus: AvailabilityStatus.INTEREST_ONLY,
    featured: true,
    sortOrder: 6,
    lastVerifiedAt: VERIFIED_DATE,
    verifiedBy: REVIEWER,
  },
  {
    slug: "hr-policy-labour-law-compliance-review",
    categorySlug: "hr-labour-compliance",
    titleBn: "এইচআর নীতিমালা ও বাংলাদেশ শ্রম আইন কমপ্লায়েন্স সহায়তা",
    titleEn: "HR Policy & Bangladesh Labour Law Compliance Support",
    summaryBn:
      "নিয়োগপত্র, কর্মসংস্থান চুক্তি, HR ম্যানুয়াল, বেতন কাঠামো ও ফ্যাক্টরি শ্রম আইন কমপ্লায়েন্স ডকুমেন্টেশন।",
    summaryEn:
      "Appointment letters, employment contracts, HR handbook drafting, salary structure, and Labour Law compliance.",
    whoNeedsItBn: "উদীয়মান কোম্পানি, সার্ভিস প্রতিষ্ঠান, কারখানা ও কর্পোরেট HR বিভাগ।",
    assistanceScopeBn:
      "বাংলাদেশ শ্রম আইনের সাথে সামঞ্জস্যপূর্ণ নথিপত্র খসড়া, উপস্থিতি/ছুটি নীতি ও ফাইনাল সেটেলমেন্ট হিসাব প্রস্তুতি।",
    limitationsBn: STANDARD_LIMITATION_BN,
    documentsSummary: [
      "প্রতিষ্ঠানের কর্মী সংখ্যা, পদবি কাঠামো ও বর্তমান HR নীতি (যদি থাকে)",
      "কারখানা বা প্রতিষ্ঠানের DIFE নিবন্ধনের ধরন সংক্রান্ত তথ্য",
    ],
    processSteps: [
      { stepNumber: 1, titleBn: "বিদ্যমান অবস্থা মূল্যায়ন", descriptionBn: "বর্তমান নিয়োগ ও বেতন নথির ঘাটতি চিহ্নিতকরণ।" },
      { stepNumber: 2, titleBn: "নীতিমালা ও চুক্তি খসড়া", descriptionBn: "প্রতিষ্ঠানের উপযোগী HR ম্যানুয়াল ও চুক্তি প্রণয়ন।" },
    ],
    authorityName: "Department of Inspection for Factories and Establishments (DIFE)",
    officialSourceLabel: "DIFE LIMA Help & Labour Framework",
    officialSourceUrl: "https://lima.dife.gov.bd/help",
    requiresSpecialist: true,
    aliases: ["hr policy", "labour law", "appointment letter", "payroll", "dife"],
    serviceFeeNoteBn: null,
    govtFeeNoteBn: null,
    contentStatus: ContentStatus.PUBLISHED,
    availabilityStatus: AvailabilityStatus.INTEREST_ONLY,
    featured: false,
    sortOrder: 7,
    lastVerifiedAt: VERIFIED_DATE,
    verifiedBy: REVIEWER,
  },
  {
    slug: "digital-business-legal-policy-ecommerce-setup",
    categorySlug: "digital-business-setup",
    titleBn: "ই-কমার্স ব্যবসার আইনি কাঠামো ও নীতিমালা ডকুমেন্টেশন",
    titleEn: "Digital Business & E-commerce Compliance Setup",
    summaryBn:
      "নতুন অনলাইন ব্যবসার নিবন্ধন পরিকল্পনা, প্রাইভেসি পলিসি, টার্মস অব সার্ভিস, রিফান্ড পলিসি ও ট্যাক্স-ভ্যাট প্রস্তুতি।",
    summaryEn:
      "Compliance roadmap, privacy policy, terms, return/refund policy drafting, and tax/VAT readiness for digital businesses.",
    whoNeedsItBn: "ই-কমার্স স্টোর, ডিজিটাল সার্ভিস এজেন্সি, সফটওয়্যার কোম্পানি ও অনলাইন উদ্যোক্তা।",
    assistanceScopeBn:
      "DBID/ট্রেড লাইসেন্স নির্দেশনা, প্রযোজ্য ওয়েবসাইট নীতিমালা খসড়া এবং পেমেন্ট গেটওয়ে নথি সমন্বয়।",
    limitationsBn: STANDARD_LIMITATION_BN,
    documentsSummary: [
      "ব্যবসায়িক মডেল ও বিক্রয় পণ্যের বিবরণ",
      "ডোমেইন ও প্রাথমিক ব্যবসায়িক কাঠামোর তথ্য",
    ],
    processSteps: [
      { stepNumber: 1, titleBn: "মডেল ও নিবন্ধন পরিকল্পনা", descriptionBn: "প্রয়োজনীয় লাইসেন্স ও কর কাঠামো নির্ধারণ।" },
      { stepNumber: 2, titleBn: "পলিসি ও কমপ্লায়েন্স নথি", descriptionBn: "গোপনীয়তা, শর্তাবলি ও রিটার্ন নীতিমালা প্রণয়ন।" },
    ],
    authorityName: "Ministry of Commerce / NBR",
    officialSourceLabel: "Digital Commerce Operational Guidelines",
    officialSourceUrl: null,
    requiresSpecialist: false,
    aliases: ["ecommerce", "digital business", "privacy policy", "startup setup"],
    serviceFeeNoteBn: null,
    govtFeeNoteBn: null,
    contentStatus: ContentStatus.PUBLISHED,
    availabilityStatus: AvailabilityStatus.INTEREST_ONLY,
    featured: false,
    sortOrder: 8,
    lastVerifiedAt: VERIFIED_DATE,
    verifiedBy: REVIEWER,
  },
];

// Deduplicated PDF candidate services stored as DRAFT for staff curation in /admin
const DRAFT_SERVICE_SPECS: Array<{
  slug: string;
  categorySlug: string;
  titleEn: string;
  titleBn: string;
  authorityName?: string;
  requiresSpecialist?: boolean;
}> = [
  { slug: "tax-audit-appeal-notice-reply", categorySlug: "income-tax-solutions", titleEn: "Tax Audit, Appeal & Notice Reply Support", titleBn: "ট্যাক্স অডিট, আপিল ও নোটিশ জবাব সহায়তা", authorityName: "NBR", requiresSpecialist: true },
  { slug: "tds-ait-withholding-tax-management", categorySlug: "income-tax-solutions", titleEn: "TDS, AIT & Withholding Tax Management", titleBn: "TDS, AIT ও উইথহোল্ডিং ট্যাক্স ব্যবস্থাপনা", authorityName: "NBR", requiresSpecialist: true },
  { slug: "tax-clearance-certificate-support", categorySlug: "income-tax-solutions", titleEn: "Tax Clearance & Certificate Assistance", titleBn: "আয়কর ক্লিয়ারেন্স ও সনদ সহায়তা", authorityName: "NBR", requiresSpecialist: true },
  { slug: "vat-audit-appeal-notice-management", categorySlug: "vat-mushak-solutions", titleEn: "VAT Audit, Appeal & Reconciliation", titleBn: "ভ্যাট অডিট, আপিল ও রিকনসিলিয়েশন সহায়তা", authorityName: "NBR", requiresSpecialist: true },
  { slug: "branch-central-bin-vat-amendment", categorySlug: "vat-mushak-solutions", titleEn: "Branch/Central BIN & VAT Amendment", titleBn: "শাখা/সেন্ট্রাল BIN ও ভ্যাট নিবন্ধন সংশোধন", authorityName: "NBR", requiresSpecialist: true },
  { slug: "bonded-warehouse-ud-up-support", categorySlug: "customs-international-trade", titleEn: "Bond Licence, UD & UP Documentation Assistance", titleBn: "বন্ড লাইসেন্স, UD ও UP ডকুমেন্টেশন সহায়তা", authorityName: "Bangladesh Customs (NBR)", requiresSpecialist: true },
  { slug: "customs-assessment-dispute-support", categorySlug: "customs-international-trade", titleEn: "Customs Assessment & Valuation Dispute Assistance", titleBn: "কাস্টমস অ্যাসেসমেন্ট ও ভ্যালুয়েশন বিরোধ সহায়তা", authorityName: "Bangladesh Customs (NBR)", requiresSpecialist: true },
  { slug: "tender-eligibility-noa-contract-support", categorySlug: "egp-government-tender", titleEn: "Tender Eligibility, NOA & Contract Documentation", titleBn: "দরপত্র যোগ্যতা যাচাই, NOA ও চুক্তি নথি সহায়তা", authorityName: "BPPA / Procuring Entities", requiresSpecialist: true },
  { slug: "financial-forecasting-budgeting-healthcheck", categorySlug: "accounting-financial-management", titleEn: "Budgeting, Financial Forecasting & Health Checkup", titleBn: "বাজেট, ফিন্যান্সিয়াল ফোরকাস্টিং ও আর্থিক স্বাস্থ্য পরীক্ষা", requiresSpecialist: true },
  { slug: "share-transfer-capital-increase-rjsc", categorySlug: "company-secretarial-compliance", titleEn: "Share Transfer, Capital Increase & MOA/AOA Amendment", titleBn: "শেয়ার হস্তান্তর, মূলধন বৃদ্ধি ও MOA/AOA সংশোধন", authorityName: "Smart RJSC", requiresSpecialist: true },
  { slug: "company-winding-up-liquidation-support", categorySlug: "company-secretarial-compliance", titleEn: "Company Closure & Liquidation Guidance", titleBn: "কোম্পানি বন্ধ ও অবসায়ন প্রক্রিয়া নির্দেশনা", authorityName: "Smart RJSC", requiresSpecialist: true },
  { slug: "international-supplier-sourcing-verification", categorySlug: "import-export-trade-ops", titleEn: "Supplier Sourcing & Trade Coordination Support", titleBn: "আন্তর্জাতিক সাপ্লায়ার যাচাই ও ট্রেড সমন্বয়", requiresSpecialist: false },
  { slug: "factory-hr-audit-labour-settlement", categorySlug: "hr-labour-compliance", titleEn: "HR Audit & Final Settlement Documentation", titleBn: "এইচআর অডিট ও চূড়ান্ত নিষ্পত্তি নথি প্রস্তুতি", authorityName: "DIFE", requiresSpecialist: true },
  { slug: "business-feasibility-pitch-investor-plan", categorySlug: "business-startup-advisory", titleEn: "Business Plan, Feasibility Study & Startup Advisory", titleBn: "বিজনেস প্ল্যান, ফিজিবিলিটি স্টাডি ও স্টার্টআপ পরামর্শ", requiresSpecialist: true },
  { slug: "business-compliance-risk-audit", categorySlug: "business-startup-advisory", titleEn: "Business Compliance Audit & Risk Assessment", titleBn: "ব্যবসায়িক কমপ্লায়েন্স অডিট ও ঝুঁকি মূল্যায়ন", requiresSpecialist: true },
  { slug: "iso-quality-environment-safety-docs", categorySlug: "specialized-compliance", titleEn: "ISO 9001 / 14001 / 45001 Documentation Consultancy", titleBn: "ISO মানদণ্ড ডকুমেন্টেশন ও সিস্টেম প্রস্তুতি পরামর্শ", requiresSpecialist: true },
  { slug: "rmg-social-compliance-rsc-bsci", categorySlug: "specialized-compliance", titleEn: "RSC / Social Compliance (BSCI / SEDEX) Readiness Support", titleBn: "গার্মেন্টস ও সোশ্যাল কমপ্লায়েন্স প্রস্তুতি সহায়তা", requiresSpecialist: true },
  { slug: "ip-trademark-patent-copyright-filing", categorySlug: "specialized-compliance", titleEn: "Trademark, Patent & Copyright Filing Assistance", titleBn: "ট্রেডমার্ক, পেটেন্ট ও কপিরাইট আবেদন নথি সহায়তা", authorityName: "DPDT", requiresSpecialist: true },
  { slug: "contract-drafting-data-protection-policy", categorySlug: "specialized-compliance", titleEn: "Contract Drafting & Data Protection Policy Guidance", titleBn: "চুক্তিপত্র খসড়া ও ডেটা সুরক্ষা নীতিমালা নির্দেশনা", requiresSpecialist: true },
];

const DRAFT_SERVICES: SeedService[] = DRAFT_SERVICE_SPECS.map((spec, idx) => ({
  slug: spec.slug,
  categorySlug: spec.categorySlug,
  titleBn: spec.titleBn,
  titleEn: spec.titleEn,
  summaryBn: `${spec.titleEn} বিষয়ক প্রস্তাবিত পেশাদার সেবা — চূড়ান্ত পরিধি ও ডেলিভারি সক্ষমতা টিম অনুমোদনসাপেক্ষ।`,
  summaryEn: `Candidate professional service (${spec.titleEn}). Pending operational confirmation before public launch.`,
  whoNeedsItBn: "বাংলাদেশে পরিচালিত সংশ্লিষ্ট ব্যবসা ও কর্পোরেট প্রতিষ্ঠান।",
  assistanceScopeBn: "প্রাথমিক তথ্য পর্যালোচনা ও নথিপত্র প্রস্তুতিতে নির্দেশনা।",
  limitationsBn: STANDARD_LIMITATION_BN,
  documentsSummary: ["প্রাথমিক ব্যবসায়িক নিবন্ধন ও সংশ্লিষ্ট নথি (পেশাদার পর্যালোচনা সাপেক্ষ)"],
  processSteps: [
    { stepNumber: 1, titleBn: "প্রাথমিক পর্যালোচনা", descriptionBn: "প্রয়োজনীয় নথি ও প্রযোজ্য বিধিমালা যাচাই।" },
    { stepNumber: 2, titleBn: "সমন্বয় ও সহায়তা", descriptionBn: "অনুমোদিত কর্মপরিকল্পনা অনুযায়ী সহায়তা।" },
  ],
  authorityName: spec.authorityName ?? null,
  officialSourceLabel: spec.authorityName ? `${spec.authorityName} Official Guidelines` : null,
  officialSourceUrl: null,
  requiresSpecialist: spec.requiresSpecialist ?? true,
  aliases: [spec.titleEn.toLowerCase()],
  serviceFeeNoteBn: null,
  govtFeeNoteBn: null,
  contentStatus: ContentStatus.DRAFT,
  availabilityStatus: AvailabilityStatus.INTEREST_ONLY,
  featured: false,
  sortOrder: 100 + idx,
  lastVerifiedAt: null,
  verifiedBy: null,
}));

export const SEED_SERVICES: SeedService[] = [...PUBLISHED_SERVICES, ...DRAFT_SERVICES];
