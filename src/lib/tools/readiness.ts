export type ReadinessAnswer = "yes" | "no" | "unsure";

export interface ReadinessQuestion {
  id: string;
  area: "registration" | "tax" | "vat" | "records" | "licensing" | "operations";
  promptBn: string;
  reviewBn: string;
  href: string;
}

export const READINESS_QUESTIONS: readonly ReadinessQuestion[] = [
  {
    id: "business-structure",
    area: "registration",
    promptBn: "আপনার ব্যবসার কাঠামো ও মালিকানার ধরন লিখিতভাবে নির্ধারিত আছে?",
    reviewBn: "ব্যবসার কাঠামো ও প্রযোজ্য নিবন্ধন একজন উপযুক্ত পেশাজীবীর সঙ্গে পর্যালোচনা করুন।",
    href: "/services",
  },
  {
    id: "tax-profile",
    area: "tax",
    promptBn: "ব্যবসার কর-সংক্রান্ত দায়িত্ব, সময়সীমা ও দায়িত্বপ্রাপ্ত ব্যক্তি চিহ্নিত আছে?",
    reviewBn: "কর-সংক্রান্ত দায়িত্ব ও সময়সীমার একটি পর্যালোচনা তালিকা তৈরি করুন।",
    href: "/services?category=income-tax-and-tax-compliance",
  },
  {
    id: "vat-scope",
    area: "vat",
    promptBn: "আপনার কার্যক্রমে VAT/BIN প্রযোজ্য কি না—এ বিষয়ে যাচাইকৃত সিদ্ধান্ত আছে?",
    reviewBn: "আপনার পণ্য, সেবা ও টার্নওভারের ভিত্তিতে VAT/BIN প্রযোজ্যতা যাচাই করুন।",
    href: "/services?category=vat-and-mushak-management",
  },
  {
    id: "record-keeping",
    area: "records",
    promptBn: "আয়, ব্যয়, চালান ও প্রয়োজনীয় ব্যবসায়িক রেকর্ড নিয়মিত সংরক্ষণ করা হয়?",
    reviewBn: "নিয়মিত হিসাব ও নথি সংরক্ষণের দায়িত্ব, পদ্ধতি ও সময়সূচি নির্ধারণ করুন।",
    href: "/services?category=accounting-and-finance",
  },
  {
    id: "license-register",
    area: "licensing",
    promptBn: "প্রযোজ্য লাইসেন্স, নিবন্ধন ও নবায়নের একটি হালনাগাদ তালিকা আছে?",
    reviewBn: "ব্যবসার অবস্থান ও কার্যক্রম অনুযায়ী লাইসেন্স ও নবায়ন তালিকা পর্যালোচনা করুন।",
    href: "/licensing",
  },
  {
    id: "responsibility-owner",
    area: "operations",
    promptBn: "কমপ্লায়েন্স কাজের দায়িত্বপ্রাপ্ত ব্যক্তি ও অভ্যন্তরীণ অনুসরণ পদ্ধতি নির্ধারিত আছে?",
    reviewBn: "দায়িত্ব, অনুসরণ তারিখ ও প্রমাণ সংরক্ষণের একটি সহজ অভ্যন্তরীণ প্রক্রিয়া তৈরি করুন।",
    href: "/consultancy",
  },
] as const;

export interface ReadinessResult {
  answered: number;
  total: number;
  preparedCount: number;
  reviewCount: number;
  progressPercent: number;
  summaryBn: string;
  recommendations: Array<Pick<ReadinessQuestion, "id" | "reviewBn" | "href">>;
}

export function evaluateReadiness(
  answers: Readonly<Record<string, ReadinessAnswer | undefined>>,
): ReadinessResult {
  const answeredQuestions = READINESS_QUESTIONS.filter((question) => answers[question.id]);
  const preparedCount = answeredQuestions.filter(
    (question) => answers[question.id] === "yes",
  ).length;
  const reviewItems = READINESS_QUESTIONS.filter(
    (question) => answers[question.id] === "no" || answers[question.id] === "unsure",
  );
  const answered = answeredQuestions.length;
  const progressPercent = Math.round((answered / READINESS_QUESTIONS.length) * 100);

  let summaryBn = "সব প্রশ্নের উত্তর দিলে অগ্রাধিকারভিত্তিক প্রস্তুতি নির্দেশনা দেখা যাবে।";
  if (answered === READINESS_QUESTIONS.length) {
    summaryBn =
      reviewItems.length === 0
        ? "আপনার দেওয়া তথ্য অনুযায়ী প্রতিটি ক্ষেত্রেই একটি প্রক্রিয়া আছে। তথ্য ও সময়সীমা নিয়মিত পুনরায় যাচাই করুন।"
        : `${reviewItems.length}টি ক্ষেত্রে আরও তথ্য যাচাই বা পেশাদার পর্যালোচনা বিবেচনা করুন।`;
  }

  return {
    answered,
    total: READINESS_QUESTIONS.length,
    preparedCount,
    reviewCount: reviewItems.length,
    progressPercent,
    summaryBn,
    recommendations: reviewItems.map(({ id, reviewBn, href }) => ({ id, reviewBn, href })),
  };
}
