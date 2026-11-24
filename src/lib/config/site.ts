import type { PublicSiteConfig } from "@/types/domain";
import { isDatabaseConfigured, prisma } from "@/lib/db/prisma";

export const INDEPENDENT_DISCLAIMER_BN =
  "Business Compliance Partner (BCP) একটি স্বাধীন পেশাদার সহায়তা প্ল্যাটফর্ম; এটি কোনো সরকারি প্রতিষ্ঠান বা সরকারি পোর্টাল নয়। সকল নিবন্ধন, লাইসেন্স ও অনুমোদন সংশ্লিষ্ট কর্তৃপক্ষের বিধিমালা ও চূড়ান্ত সিদ্ধান্তসাপেক্ষ।";

export const INDEPENDENT_DISCLAIMER_EN =
  "Business Compliance Partner (BCP) is an independent professional learning and business compliance assistance platform; it is not a government institution or official portal.";

export const DEFAULT_PUBLIC_SITE_CONFIG: PublicSiteConfig = {
  brandName: "Business Compliance Partner",
  brandDisplayName: "BUSINESS COMPLIANCE PARTNER",
  brandNameBn: "বিজনেস কমপ্লায়েন্স পার্টনার",
  taglineBn: "এক অংশীদার। সম্পূর্ণ সমাধান। আত্মবিশ্বাসী প্রবৃদ্ধি।",
  taglineEn: "One Partner. Complete Solutions. Confident Growth.",
  // The approved master badge was not supplied in this workspace. An empty path
  // intentionally renders a text identity instead of inventing or reusing a logo.
  logoAssetPath: "",
  isIdentityProvisional: false,
  // Never ship placeholder phone numbers, emails, WhatsApp numbers, or social links.
  verifiedPhone: null,
  verifiedWhatsapp: null,
  verifiedEmail: null,
  verifiedAddressBn: null,
  verifiedAddressEn: null,
  facebookUrl: null,
  linkedinUrl: null,
  youtubeUrl: null,
  defaultSeoTitleBn:
    "Business Compliance Partner | ব্যবসা, কমপ্লায়েন্স, প্রশিক্ষণ ও পরামর্শ",
  defaultSeoDescBn:
    "বাংলাদেশের উদ্যোক্তা ও পেশাজীবীদের জন্য কোর্স, ব্যবসায়িক কমপ্লায়েন্স সেবা, লাইসেন্সিং তথ্য ও পরামর্শ সহায়তার একটি সুসংগঠিত প্ল্যাটফর্ম।",
  legalDisclaimerBn: INDEPENDENT_DISCLAIMER_BN,
  legalDisclaimerEn: INDEPENDENT_DISCLAIMER_EN,
  privacyPolicyVersion: "v1.0-2026-11",
  stagingNoticeBn:
    "স্টেজিং সংস্করণ — যোগাযোগের তথ্য, মূল্য ও সক্রিয় অফার অনুমোদনসাপেক্ষ।",
};

export function isStagingEnvironment(): boolean {
  return process.env.NEXT_PUBLIC_APP_ENV !== "production";
}

export function getCanonicalBaseUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!configured) return "http://localhost:3000";
  return configured.replace(/\/+$/, "");
}

export async function getPublicSiteConfig(): Promise<PublicSiteConfig> {
  if (!isDatabaseConfigured()) {
    return DEFAULT_PUBLIC_SITE_CONFIG;
  }

  try {
    const row = await prisma.siteSetting.findUnique({
      where: { id: "default" },
    });
    if (!row) {
      return DEFAULT_PUBLIC_SITE_CONFIG;
    }

    return {
      brandName: row.brandName,
      brandDisplayName: row.brandDisplayName,
      brandNameBn: row.brandNameBn,
      taglineBn: row.taglineBn,
      taglineEn: row.taglineEn,
      logoAssetPath: row.logoAssetPath,
      isIdentityProvisional: row.isIdentityProvisional,
      verifiedPhone: row.verifiedPhone,
      verifiedWhatsapp: row.verifiedWhatsapp,
      verifiedEmail: row.verifiedEmail,
      verifiedAddressBn: row.verifiedAddressBn,
      verifiedAddressEn: row.verifiedAddressEn,
      facebookUrl: row.facebookUrl,
      linkedinUrl: row.linkedinUrl,
      youtubeUrl: row.youtubeUrl,
      defaultSeoTitleBn: row.defaultSeoTitleBn,
      defaultSeoDescBn: row.defaultSeoDescBn,
      legalDisclaimerBn: row.legalDisclaimerBn,
      legalDisclaimerEn: row.legalDisclaimerEn,
      privacyPolicyVersion: row.privacyPolicyVersion,
      stagingNoticeBn: isStagingEnvironment() ? row.stagingNoticeBn : null,
    };
  } catch {
    return DEFAULT_PUBLIC_SITE_CONFIG;
  }
}
