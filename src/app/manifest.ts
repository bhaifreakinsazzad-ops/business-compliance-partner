import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Business Compliance Partner",
    short_name: "BCP",
    description:
      "বাংলাদেশের উদ্যোক্তা ও পেশাজীবীদের জন্য ব্যবসা, কমপ্লায়েন্স, প্রশিক্ষণ ও পরামর্শ সহায়তা।",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "any",
    background_color: "#F5F1E8",
    theme_color: "#081838",
    lang: "bn-BD",
    dir: "ltr",
    categories: ["business", "education", "productivity"],
    shortcuts: [
      {
        name: "সেবা খুঁজুন",
        short_name: "সেবা",
        description: "প্রকাশিত ব্যবসায়িক ও কমপ্লায়েন্স সেবা দেখুন",
        url: "/services",
      },
      {
        name: "লাইসেন্সিং নির্দেশিকা",
        short_name: "লাইসেন্সিং",
        description: "কর্তৃপক্ষভিত্তিক লাইসেন্সিং ও নিবন্ধন নির্দেশিকা দেখুন",
        url: "/licensing",
      },
      {
        name: "পরামর্শের অনুরোধ",
        short_name: "পরামর্শ",
        description: "আপনার ব্যবসার প্রয়োজন নিরাপদ ফর্মে জানান",
        url: "/consultancy",
      },
    ],
  };
}
