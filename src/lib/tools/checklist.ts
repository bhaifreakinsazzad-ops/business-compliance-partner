export type ChecklistTemplateId =
  | "business-start"
  | "tax-vat-review"
  | "licensing-review"
  | "consultation-prep";

export interface ChecklistItem {
  id: string;
  labelBn: string;
  noteBn?: string;
}

export interface ChecklistTemplate {
  id: ChecklistTemplateId;
  titleBn: string;
  descriptionBn: string;
  items: readonly ChecklistItem[];
}

const SHARED_ITEMS = {
  activity: {
    id: "activity-summary",
    labelBn: "ব্যবসার কার্যক্রম ও প্রয়োজন এক পাতায় সংক্ষেপ করুন",
  },
  facts: {
    id: "fact-check",
    labelBn: "নাম, ঠিকানা, মালিকানা ও যোগাযোগের তথ্যের বানান মিলিয়ে দেখুন",
    noteBn: "এই টুলে কোনো ব্যক্তিগত তথ্য লিখবেন না বা ফাইল আপলোড করবেন না।",
  },
  source: {
    id: "official-source",
    labelBn: "প্রযোজ্য কর্তৃপক্ষ ও অফিসিয়াল তথ্যসূত্র শনাক্ত করুন",
  },
  questions: {
    id: "open-questions",
    labelBn: "যে বিষয়গুলো নিশ্চিত নন সেগুলোর প্রশ্নের তালিকা তৈরি করুন",
  },
} satisfies Record<string, ChecklistItem>;

export const CHECKLIST_TEMPLATES: readonly ChecklistTemplate[] = [
  {
    id: "business-start",
    titleBn: "নতুন ব্যবসা শুরুর প্রস্তুতি",
    descriptionBn: "কাঠামো, কার্যক্রম ও প্রাথমিক নিবন্ধন আলোচনা গুছিয়ে নেওয়ার সাধারণ প্রস্তুতি।",
    items: [
      SHARED_ITEMS.activity,
      { id: "ownership-options", labelBn: "সম্ভাব্য মালিকানা ও ব্যবসার কাঠামোর বিকল্প লিখে রাখুন" },
      { id: "location-scope", labelBn: "ব্যবসার স্থান ও কার্যক্রমের ভৌগোলিক পরিধি নির্ধারণ করুন" },
      SHARED_ITEMS.source,
      SHARED_ITEMS.questions,
    ],
  },
  {
    id: "tax-vat-review",
    titleBn: "Tax ও VAT পর্যালোচনা প্রস্তুতি",
    descriptionBn: "হিসাব, সময়সীমা ও দায়িত্ব নিয়ে পর্যালোচনার আগে সাধারণ প্রস্তুতি।",
    items: [
      { id: "period", labelBn: "কোন সময়কাল পর্যালোচনা করবেন তা নির্ধারণ করুন" },
      { id: "records-index", labelBn: "আয়, ব্যয়, চালান ও দাখিলের রেকর্ডের একটি সূচি তৈরি করুন" },
      { id: "deadline-list", labelBn: "পরিচিত দাখিল ও পরিশোধের সময়সীমা তালিকাভুক্ত করুন" },
      { id: "responsible-person", labelBn: "তথ্য প্রস্তুত ও পর্যালোচনার দায়িত্বপ্রাপ্ত ব্যক্তি নির্ধারণ করুন" },
      SHARED_ITEMS.questions,
    ],
  },
  {
    id: "licensing-review",
    titleBn: "লাইসেন্স ও নবায়ন পর্যালোচনা",
    descriptionBn: "প্রযোজ্য অনুমতি, কর্তৃপক্ষ ও নবায়ন অবস্থা গুছিয়ে নেওয়ার প্রস্তুতি।",
    items: [
      SHARED_ITEMS.activity,
      { id: "current-register", labelBn: "বর্তমান লাইসেন্স ও নিবন্ধনের নাম, কর্তৃপক্ষ ও মেয়াদের তালিকা করুন" },
      { id: "change-log", labelBn: "ব্যবসার কার্যক্রম, স্থান বা মালিকানার সাম্প্রতিক পরিবর্তন লিখে রাখুন" },
      SHARED_ITEMS.source,
      SHARED_ITEMS.facts,
      SHARED_ITEMS.questions,
    ],
  },
  {
    id: "consultation-prep",
    titleBn: "বিশেষজ্ঞ পরামর্শের প্রস্তুতি",
    descriptionBn: "কম সময়ে প্রয়োজনটি পরিষ্কারভাবে ব্যাখ্যা করার সাধারণ প্রস্তুতি।",
    items: [
      { id: "objective", labelBn: "আলোচনার কাঙ্ক্ষিত ফলাফল এক বাক্যে লিখুন" },
      { id: "timeline", labelBn: "ঘটনার সংক্ষিপ্ত সময়রেখা ও গুরুত্বপূর্ণ তারিখ লিখুন" },
      SHARED_ITEMS.activity,
      SHARED_ITEMS.facts,
      SHARED_ITEMS.questions,
    ],
  },
] as const;

export function getChecklistTemplate(id: string): ChecklistTemplate {
  return (
    CHECKLIST_TEMPLATES.find((template) => template.id === id) ??
    CHECKLIST_TEMPLATES[0]!
  );
}

export function calculateChecklistProgress(
  template: ChecklistTemplate,
  completedIds: ReadonlySet<string>,
): { completed: number; total: number; percent: number } {
  const validIds = new Set(template.items.map((item) => item.id));
  const completed = [...completedIds].filter((id) => validIds.has(id)).length;
  return {
    completed,
    total: template.items.length,
    percent: Math.round((completed / template.items.length) * 100),
  };
}
