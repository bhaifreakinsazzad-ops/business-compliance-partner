import React from "react";
import { DEFAULT_PUBLIC_SITE_CONFIG } from "@/lib/config/site";
import { isDatabaseConfigured, prisma } from "@/lib/db/prisma";
import { requireAdminPageSession } from "@/lib/security/admin-page-guard";
import { AdminUnauthorizedCard } from "@/components/admin/AdminUnauthorizedCard";
import {
  AdminSettingsForm,
  type SiteSettingsFormValues,
} from "@/components/admin/AdminSettingsForm";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const guard = await requireAdminPageSession("settings:manage", "/admin/settings");
  if (!guard.authorized) {
    return <AdminUnauthorizedCard role={guard.admin.role} />;
  }

  const dbConfigured = isDatabaseConfigured();
  const row = dbConfigured
    ? await prisma.siteSetting.findUnique({ where: { id: "default" } }).catch(() => null)
    : null;

  const initialValues: SiteSettingsFormValues = {
    brandName: row?.brandName ?? DEFAULT_PUBLIC_SITE_CONFIG.brandName,
    brandDisplayName:
      row?.brandDisplayName ?? DEFAULT_PUBLIC_SITE_CONFIG.brandDisplayName,
    brandNameBn: row?.brandNameBn ?? DEFAULT_PUBLIC_SITE_CONFIG.brandNameBn,
    taglineBn: row?.taglineBn ?? DEFAULT_PUBLIC_SITE_CONFIG.taglineBn,
    taglineEn: row?.taglineEn ?? DEFAULT_PUBLIC_SITE_CONFIG.taglineEn,
    logoAssetPath: row?.logoAssetPath ?? DEFAULT_PUBLIC_SITE_CONFIG.logoAssetPath,
    isIdentityProvisional:
      row?.isIdentityProvisional ?? DEFAULT_PUBLIC_SITE_CONFIG.isIdentityProvisional,
    verifiedPhone: row?.verifiedPhone ?? "",
    verifiedWhatsapp:
      row?.verifiedWhatsapp ?? DEFAULT_PUBLIC_SITE_CONFIG.verifiedWhatsapp ?? "",
    verifiedEmail: row?.verifiedEmail ?? "",
    verifiedAddressBn: row?.verifiedAddressBn ?? "",
    verifiedAddressEn: row?.verifiedAddressEn ?? "",
    facebookUrl: row?.facebookUrl ?? "",
    linkedinUrl: row?.linkedinUrl ?? "",
    youtubeUrl: row?.youtubeUrl ?? "",
    defaultSeoTitleBn:
      row?.defaultSeoTitleBn ?? DEFAULT_PUBLIC_SITE_CONFIG.defaultSeoTitleBn,
    defaultSeoDescBn:
      row?.defaultSeoDescBn ?? DEFAULT_PUBLIC_SITE_CONFIG.defaultSeoDescBn,
    legalDisclaimerBn:
      row?.legalDisclaimerBn ?? DEFAULT_PUBLIC_SITE_CONFIG.legalDisclaimerBn,
    legalDisclaimerEn:
      row?.legalDisclaimerEn ?? DEFAULT_PUBLIC_SITE_CONFIG.legalDisclaimerEn,
    privacyPolicyVersion:
      row?.privacyPolicyVersion ?? DEFAULT_PUBLIC_SITE_CONFIG.privacyPolicyVersion,
    leadRetentionDays: row?.leadRetentionDays ?? 365,
    stagingNoticeBn:
      row?.stagingNoticeBn ?? DEFAULT_PUBLIC_SITE_CONFIG.stagingNoticeBn ?? "",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bn font-bold text-ps-white">
          সাইট ও ব্র্যান্ড সেটিংস (Site Settings)
        </h1>
        <p className="text-sm text-ps-ivory/80 mt-1">
          হোয়াইট-লেবেল ব্র্যান্ড পরিচিতি, যাচাইকৃত যোগাযোগ, ডিসক্লেইমার ও তথ্য সংরক্ষণ নীতি।
        </p>
      </div>

      <AdminSettingsForm
        initialValues={initialValues}
        dbConfigured={dbConfigured}
      />
    </div>
  );
}
