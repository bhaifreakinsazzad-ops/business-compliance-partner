export type RoadmapGoal = "start" | "comply" | "license" | "learn" | "grow";
export type BusinessStage = "idea" | "starting" | "operating" | "expanding";

export interface RoadmapStep {
  id: string;
  titleBn: string;
  reasonBn: string;
  href: string;
  ctaBn: string;
}

const STEP_LIBRARY: Record<string, RoadmapStep> = {
  clarify: {
    id: "clarify",
    titleBn: "লক্ষ্য ও বর্তমান অবস্থা পরিষ্কার করুন",
    reasonBn: "সঠিক সেবা বা তথ্য বাছাইয়ের আগে ব্যবসার ধরন, কার্যক্রম ও সমস্যার সীমা নির্ধারণ দরকার।",
    href: "/consultancy",
    ctaBn: "প্রয়োজন জানান",
  },
  structure: {
    id: "structure",
    titleBn: "ব্যবসার কাঠামো ও নিবন্ধন বিকল্প পর্যালোচনা করুন",
    reasonBn: "মালিকানা, কার্যক্রম ও ভবিষ্যৎ পরিকল্পনার সঙ্গে কাঠামো ও নিবন্ধনের পথ সামঞ্জস্য করা প্রয়োজন।",
    href: "/services",
    ctaBn: "সেবা দেখুন",
  },
  compliance: {
    id: "compliance",
    titleBn: "নিয়মিত কমপ্লায়েন্স দায়িত্বের তালিকা তৈরি করুন",
    reasonBn: "কর, VAT, হিসাব ও অন্যান্য সময়সীমা দৃশ্যমান থাকলে দায়িত্ব ও অনুসরণ সহজ হয়।",
    href: "/services",
    ctaBn: "কমপ্লায়েন্স সেবা দেখুন",
  },
  licensing: {
    id: "licensing",
    titleBn: "কর্তৃপক্ষভিত্তিক লাইসেন্সিং তথ্য যাচাই করুন",
    reasonBn: "প্রযোজ্য অনুমতি ব্যবসার কার্যক্রম, অবস্থান ও সংশ্লিষ্ট কর্তৃপক্ষের বর্তমান নিয়মের ওপর নির্ভর করে।",
    href: "/licensing",
    ctaBn: "লাইসেন্সিং দেখুন",
  },
  learn: {
    id: "learn",
    titleBn: "প্রয়োজনীয় দক্ষতা ও শেখার পথ বেছে নিন",
    reasonBn: "দায়িত্বপ্রাপ্ত ব্যক্তি প্রাসঙ্গিক বিষয় বুঝলে নথি প্রস্তুতি ও পেশাদারের সঙ্গে সমন্বয় উন্নত হয়।",
    href: "/courses",
    ctaBn: "কোর্স দেখুন",
  },
  review: {
    id: "review",
    titleBn: "বিশেষজ্ঞ পর্যালোচনা ও পরবর্তী পদক্ষেপ নির্ধারণ করুন",
    reasonBn: "উন্মুক্ত প্রশ্ন, সীমাবদ্ধতা ও দায়িত্ব একসঙ্গে পর্যালোচনা করলে বাস্তবসম্মত কাজের পরিধি নির্ধারণ করা যায়।",
    href: "/consultancy",
    ctaBn: "পরামর্শের অনুরোধ করুন",
  },
};

const GOAL_PATHS: Record<RoadmapGoal, readonly string[]> = {
  start: ["clarify", "structure", "licensing", "compliance", "review"],
  comply: ["clarify", "compliance", "learn", "review"],
  license: ["clarify", "licensing", "compliance", "review"],
  learn: ["clarify", "learn", "review"],
  grow: ["clarify", "structure", "compliance", "licensing", "review"],
};

export function buildRoadmap(goal: RoadmapGoal, stage: BusinessStage): RoadmapStep[] {
  const ids = [...GOAL_PATHS[goal]];
  if ((stage === "operating" || stage === "expanding") && !ids.includes("compliance")) {
    ids.splice(Math.max(1, ids.length - 1), 0, "compliance");
  }
  return ids.map((id) => STEP_LIBRARY[id]!).filter(Boolean);
}
