import type { PublicSiteConfig } from "@/types/domain";
import {
  normalizeWhatsAppNumber,
  OFFICIAL_ADMIN_WHATSAPP_DISPLAY,
  OFFICIAL_ADMIN_WHATSAPP_E164,
} from "@/lib/contact/whatsapp";
import { isDatabaseConfigured, prisma } from "@/lib/db/prisma";
import { isPublicSchemaReady } from "@/lib/db/schema-ready";

export { OFFICIAL_ADMIN_WHATSAPP_DISPLAY, OFFICIAL_ADMIN_WHATSAPP_E164 };

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
  // Official circular master badge integrated from approved Brand Book v1.0
  logoAssetPath: "/brand/bcp-master-logo.png",
  isIdentityProvisional: false,
  // Client-verified official admin WhatsApp channel (+880 1521-537864); other unverified channels remain null.
  verifiedPhone: null,
  verifiedWhatsapp: OFFICIAL_ADMIN_WHATSAPP_DISPLAY,
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

/**
 * Reads an optional verified WhatsApp number from environment variables and
 * validates it strictly via `normalizeWhatsAppNumber` so placeholders or
 * malformed numbers fail closed to `null`.
 */
export function getEnvVerifiedWhatsapp(): string | null {
  const raw =
    process.env.VERIFIED_WHATSAPP_NUMBER ??
    process.env.NEXT_PUBLIC_VERIFIED_WHATSAPP ??
    null;
  return normalizeWhatsAppNumber(raw);
}

/**
 * Resolves the active admin WhatsApp number in priority order:
 * 1. Verified Admin SiteSetting value from database
 * 2. Validated environment variable override (`VERIFIED_WHATSAPP_NUMBER` / `NEXT_PUBLIC_VERIFIED_WHATSAPP`)
 * 3. Client-authorized official admin WhatsApp account (`+880 1521-537864`)
 */
export function resolveVerifiedWhatsapp(
  dbValue?: string | null,
): string {
  const fromDb = normalizeWhatsAppNumber(dbValue);
  if (fromDb) return fromDb;
  const fromEnv = getEnvVerifiedWhatsapp();
  if (fromEnv) return fromEnv;
  return OFFICIAL_ADMIN_WHATSAPP_E164;
}

export async function getPublicSiteConfig(): Promise<PublicSiteConfig> {
  const fallbackWhatsapp =
    getEnvVerifiedWhatsapp() ?? DEFAULT_PUBLIC_SITE_CONFIG.verifiedWhatsapp;

  if (!isDatabaseConfigured() || !(await isPublicSchemaReady())) {
    return {
      ...DEFAULT_PUBLIC_SITE_CONFIG,
      verifiedWhatsapp: fallbackWhatsapp,
    };
  }

  try {
    const row = await prisma.siteSetting.findUnique({
      where: { id: "default" },
    });
    if (!row) {
      return {
        ...DEFAULT_PUBLIC_SITE_CONFIG,
        verifiedWhatsapp: fallbackWhatsapp,
      };
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
      verifiedWhatsapp: resolveVerifiedWhatsapp(row.verifiedWhatsapp),
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
    return {
      ...DEFAULT_PUBLIC_SITE_CONFIG,
      verifiedWhatsapp: fallbackWhatsapp,
    };
  }
}
