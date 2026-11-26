import type { AnalyticsEventName } from "@/lib/analytics/events";

export type MasterPillarId = "courses" | "services" | "books";

export type PillarIconName =
  | "GraduationCap"
  | "BriefcaseBusiness"
  | "BookOpen";

export interface MasterPillarSpec {
  id: MasterPillarId;
  order: 1 | 2 | 3;
  orderLabel: string;
  labelEn: "Courses" | "Services" | "Books";
  navLabelBn: string;
  labelBn: string;
  customerIntentEn: string;
  customerIntentBn: string;
  summaryBn: string;
  href: "/courses" | "/services" | "/books";
  iconName: PillarIconName;
  ctaLabelEn: string;
  ctaLabelBn: string;
  ariaLabel: string;
  dataFlagshipCta: MasterPillarId;
  analyticsEvent: AnalyticsEventName;
}

export interface SupportingNavigationSpec {
  id:
    | "licensing"
    | "consultancy"
    | "tools"
    | "faq"
    | "about"
    | "contact"
    | "portal";
  labelEn: string;
  labelBn: string;
  href: string;
  parentAssociation?: "services" | "platform";
}

/**
 * Authoritative Master Three-Pillar Configuration (V7.3 Client Revision 01)
 * Canonical mandated sequence: 1. Courses -> 2. Services -> 3. Books.
 */
export const MASTER_THREE_PILLARS: readonly MasterPillarSpec[] = [
  {
    id: "courses",
    order: 1,
    orderLabel: "01",
    labelEn: "Courses",
    navLabelBn: "কোর্সসমূহ",
    labelBn: "আমাদের সকল কোর্সসমূহ",
    customerIntentEn: "I want to learn.",
    customerIntentBn: "পেশাদার দক্ষতা অর্জন করুন এবং নিজেকে প্রস্তুত করুন।",
    summaryBn:
      "Tax, VAT, e-GP, E-commerce, RJSC সহ ১০টি ব্যবহারিক প্রশিক্ষণ ট্র্যাক",
    href: "/courses",
    iconName: "GraduationCap",
    ctaLabelEn: "Explore Courses",
    ctaLabelBn: "কোর্সসমূহ দেখুন",
    ariaLabel: "Courses — আমাদের সকল কোর্সসমূহ: পেশাদার দক্ষতা অর্জন করুন",
    dataFlagshipCta: "courses",
    analyticsEvent: "click_pillar_courses",
  },
  {
    id: "services",
    order: 2,
    orderLabel: "02",
    labelEn: "Services",
    navLabelBn: "সেবাসমূহ",
    labelBn: "আমাদের সকল সেবাসমূহ",
    customerIntentEn: "I need professional assistance.",
    customerIntentBn: "ব্যবসার প্রয়োজনীয় পেশাদার সহায়তা ও সমাধান নিন।",
    summaryBn:
      "ট্যাক্স, ভ্যাট, লাইসেন্সিং, কনসালটেন্সি ও সরাসরি WhatsApp সহায়তা",
    href: "/services",
    iconName: "BriefcaseBusiness",
    ctaLabelEn: "Explore Services",
    ctaLabelBn: "সেবাসমূহ দেখুন",
    ariaLabel: "Services — আমাদের সকল সেবাসমূহ: পেশাদার ব্যবসায়িক সহায়তা নিন",
    dataFlagshipCta: "services",
    analyticsEvent: "click_pillar_services",
  },
  {
    id: "books",
    order: 3,
    orderLabel: "03",
    labelEn: "Books",
    navLabelBn: "বইসমূহ",
    labelBn: "আমাদের সকল বইসমূহ",
    customerIntentEn:
      "I want to acquire practical knowledge and publications.",
    customerIntentBn: "প্রয়োজনীয় বই ও প্রকাশনার মাধ্যমে জ্ঞান সমৃদ্ধ করুন।",
    summaryBn:
      "ট্যাক্স, ভ্যাট, কর্পোরেট আইন ও ব্যবসা বিষয়ক প্র্যাকটিক্যাল প্রকাশনা",
    href: "/books",
    iconName: "BookOpen",
    ctaLabelEn: "Explore Books",
    ctaLabelBn: "বইসমূহ দেখুন",
    ariaLabel: "Books — আমাদের সকল বইসমূহ: ব্যবহারিক জ্ঞান ও প্রকাশনা দেখুন",
    dataFlagshipCta: "books",
    analyticsEvent: "click_pillar_books",
  },
] as const;

export const SUPPORTING_NAVIGATION: readonly SupportingNavigationSpec[] = [
  {
    id: "licensing",
    labelEn: "Licensing & Registration",
    labelBn: "লাইসেন্সিং ও নিবন্ধন",
    href: "/licensing",
    parentAssociation: "services",
  },
  {
    id: "consultancy",
    labelEn: "Consultancy",
    labelBn: "কনসালটেন্সি ও পরামর্শ",
    href: "/consultancy",
    parentAssociation: "services",
  },
  {
    id: "tools",
    labelEn: "Business Tools",
    labelBn: "বিজনেস টুলস",
    href: "/tools",
    parentAssociation: "platform",
  },
  {
    id: "faq",
    labelEn: "FAQ",
    labelBn: "সচরাচর জিজ্ঞাসা (FAQ)",
    href: "/faq",
    parentAssociation: "platform",
  },
  {
    id: "about",
    labelEn: "About",
    labelBn: "আমাদের সম্পর্কে",
    href: "/about",
    parentAssociation: "platform",
  },
  {
    id: "contact",
    labelEn: "Contact",
    labelBn: "যোগাযোগ",
    href: "/contact",
    parentAssociation: "platform",
  },
  {
    id: "portal",
    labelEn: "Customer Portal",
    labelBn: "কাস্টমার পোর্টাল",
    href: "/portal",
    parentAssociation: "platform",
  },
] as const;

export function getMasterPillarById(id: MasterPillarId): MasterPillarSpec {
  return (
    MASTER_THREE_PILLARS.find((pillar) => pillar.id === id) ??
    MASTER_THREE_PILLARS[0]!
  );
}
