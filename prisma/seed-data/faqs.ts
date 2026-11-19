import { ContentStatus, PillarType } from "@prisma/client";

export interface SeedFaq {
  questionBn: string;
  answerBn: string;
  pillar: PillarType | null;
  isRegulatory: boolean;
  contentStatus: ContentStatus;
  sortOrder: number;
  lastVerifiedAt: Date | null;
  verifiedBy: string | null;
}

const VERIFIED_AT = new Date("2026-11-19T00:00:00.000Z");
const REVIEWER = "Platform Policy Baseline";

export const SEED_FAQS: SeedFaq[] = [
  {
    questionBn: "Paperwork Squad কি কোনো সরকারি প্রতিষ্ঠান বা সরকারি পোর্টাল?",
    answerBn:
      "না। Paperwork Squad একটি স্বাধীন পেশাদার শিক্ষা ও ব্যবসায়িক কমপ্লায়েন্স সহায়তা প্ল্যাটফর্ম। ট্রেড লাইসেন্স, RJSC, NBR, DIFE, ফায়ার সার্ভিস বা যেকোনো সরকারি নিবন্ধনের চূড়ান্ত অনুমোদন সম্পূর্ণভাবে সংশ্লিষ্ট সরকারি কর্তৃপক্ষের বিধিমালা ও সিদ্ধান্তের ওপর নির্ভরশীল।",
    pillar: PillarType.LICENSING,
    isRegulatory: true,
    contentStatus: ContentStatus.PUBLISHED,
    sortOrder: 1,
    lastVerifiedAt: VERIFIED_AT,
    verifiedBy: REVIEWER,
  },
  {
    questionBn: "কনসালটেন্সি ফর্ম জমা দিলে কীভাবে যোগাযোগ করা হবে?",
    answerBn:
      "আপনি নাম, বাংলাদেশি মোবাইল নম্বর, এলাকা/ঠিকানা এবং আপনার ব্যবসার সমস্যাটি লিখে অনুরোধ পাঠালে আমাদের ডাটাবেজে একটি স্থায়ী রেফারেন্স নম্বর (যেমন PS-2026-XXXXXXXX) সংরক্ষিত হবে। আমাদের টিম তথ্য পর্যালোচনা করে উপযুক্ত সময়ে আপনার সাথে যোগাযোগ করবে। কোনো তাৎক্ষণিক কলের সময়সূচি এখানে অগ্রীম প্রতিশ্রুতি দেওয়া হয় না।",
    pillar: PillarType.CONSULTANCY,
    isRegulatory: false,
    contentStatus: ContentStatus.PUBLISHED,
    sortOrder: 2,
    lastVerifiedAt: VERIFIED_AT,
    verifiedBy: REVIEWER,
  },
  {
    questionBn: "কোর্সগুলোতে কি এখনই অনলাইনে ভিডিও দেখা বা পেমেন্ট করা যাবে?",
    answerBn:
      "প্রাথমিক ধাপে আমাদের কোর্স ক্যাটালগ ও আগ্রহ নিবন্ধন (Course Catalogue + Enquiry) চালু রয়েছে। এখানে কোনো অনলাইন পেমেন্ট, ভিডিও স্ট্রিমিং বা অটোমেটেড সার্টিফিকেট সিস্টেম নেই। আপনি যেকোনো কোর্সের বিস্তারিত ও প্রস্তাবিত সিলেবাস দেখে আগ্রহ জানাতে পারেন; ব্যাচ ও মাধ্যম চূড়ান্ত হলে আমাদের টিম যোগাযোগ করবে।",
    pillar: PillarType.COURSES,
    isRegulatory: false,
    contentStatus: ContentStatus.PUBLISHED,
    sortOrder: 3,
    lastVerifiedAt: VERIFIED_AT,
    verifiedBy: REVIEWER,
  },
  {
    questionBn: "পরামর্শের অনুরোধ পাঠানোর সময় কি জাতীয় পরিচয়পত্র (NID) বা ব্যাংক স্টেটমেন্ট আপলোড করতে হবে?",
    answerBn:
      "না। প্রাথমিক পর্যায়ের অনুরোধে NID, পাসপোর্ট, আয়কর নথি বা ব্যাংক স্টেটমেন্টের মতো সংবেদনশীল ফাইল আপলোড করার কোনো ব্যবস্থা রাখা হয়নি এবং আমরা তা সংগ্রহ করি না। প্রাথমিক যোগাযোগের পর প্রয়োজনীয় নথি যাচাইয়ের প্রক্রিয়া আলাদাভাবে জানানো হবে।",
    pillar: PillarType.CONSULTANCY,
    isRegulatory: true,
    contentStatus: ContentStatus.PUBLISHED,
    sortOrder: 4,
    lastVerifiedAt: VERIFIED_AT,
    verifiedBy: REVIEWER,
  },
  {
    questionBn: "সরকারি ফি এবং পেশাদার সার্ভিস চার্জ কি আলাদা?",
    answerBn:
      "হ্যাঁ। কোনো অনুমোদিত সেবার ক্ষেত্রে প্রযোজ্য সরকারি ফি/চালান এবং আমাদের পেশাদার সহায়তা চার্জ সর্বদা আলাদাভাবে উল্লেখ ও ব্যাখ্যা করা হয়। সংশ্লিষ্ট সরকারি কর্তৃপক্ষ নির্ধারিত ফি যেকোনো সময় হালনাগাদ করতে পারে।",
    pillar: PillarType.SERVICES,
    isRegulatory: true,
    contentStatus: ContentStatus.PUBLISHED,
    sortOrder: 5,
    lastVerifiedAt: VERIFIED_AT,
    verifiedBy: REVIEWER,
  },
  {
    questionBn: "লাইসেন্সিং পাতায় উল্লেখিত কাগজপত্রের তালিকা কি চূড়ান্ত?",
    answerBn:
      "ওয়েবসাইটে দেখানো কাগজপত্রের তালিকা প্রাথমিক নির্দেশিকা হিসেবে দেওয়া হয়েছে। ব্যবসার ধরন, অবস্থান এবং সর্বশেষ সরকারি প্রজ্ঞাপন অনুযায়ী অতিরিক্ত নথির প্রয়োজন হতে পারে—যা পেশাদার পর্যালোচনার পর নিশ্চিত করা হয়।",
    pillar: PillarType.LICENSING,
    isRegulatory: true,
    contentStatus: ContentStatus.PUBLISHED,
    sortOrder: 6,
    lastVerifiedAt: VERIFIED_AT,
    verifiedBy: REVIEWER,
  },
];
