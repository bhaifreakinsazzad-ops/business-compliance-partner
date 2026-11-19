import type { PublicSiteConfig } from "@/types/domain";
import { isDatabaseConfigured, prisma } from "@/lib/db/prisma";

export const INDEPENDENT_DISCLAIMER_BN =
  "Paperwork Squad একটি স্বাধীন পেশাদার সহায়তা প্ল্যাটফর্ম; এটি কোনো সরকারি প্রতিষ্ঠান বা সরকারি পোর্টাল নয়। সকল নিবন্ধন, লাইসেন্স ও অনুমোদন সংশ্লিষ্ট কর্তৃপক্ষের বিধিমালা ও চূড়ান্ত সিদ্ধান্তসাপেক্ষ।";

export const INDEPENDENT_DISCLAIMER_EN =
  "Paperwork Squad is an independent professional learning and business compliance assistance platform; it is not a government institution or official portal.";

export const DEFAULT_PUBLIC_SITE_CONFIG: PublicSiteConfig = {
  brandName: "Paperwork Squad",
  brandDisplayName: "PAPERWORK SQUAD",
  brandNameBn: "পেপারওয়ার্ক স্কোয়াড",
  taglineBn: "শিখুন, সেবা নিন, এগিয়ে যান।",
  taglineEn: "Learn. Grow. Stay Compliant.",
  logoAssetPath: "/brand/proposed-logo-concept.jpg",
  isIdentityProvisional: true,
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
    "Paperwork Squad | পেশাদার কোর্স, ব্যবসায়িক সেবা, লাইসেন্সিং ও কনসালটেন্সি",
  defaultSeoDescBn:
    "বাংলাদেশের উদ্যোক্তা ও পেশাজীবীদের জন্য কোর্স, ব্যবসায়িক কমপ্লায়েন্স সেবা, লাইসেন্সিং তথ্য ও পরামর্শ সহায়তার একটি সুসংগঠিত প্ল্যাটফর্ম।",
  legalDisclaimerBn: INDEPENDENT_DISCLAIMER_BN,
  legalDisclaimerEn: INDEPENDENT_DISCLAIMER_EN,
  privacyPolicyVersion: "v1.0-2026-11",
  stagingNoticeBn:
    "প্রস্তাবিত ব্র্যান্ড কনসেপ্ট ও স্টেজিং সংস্করণ — চূড়ান্ত ব্যবসা ও যোগাযোগের তথ্য অনুমোদনসাপেক্ষ।",
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
