import { NextResponse, type NextRequest } from "next/server";
import type { Prisma } from "@prisma/client";
import { DEFAULT_PUBLIC_SITE_CONFIG } from "@/lib/config/site";
import { normalizeWhatsAppNumber } from "@/lib/contact/whatsapp";
import { isDatabaseConfigured, prisma } from "@/lib/db/prisma";
import { requireAdminSession } from "@/lib/security/session";
import {
  assertNoForbiddenContent,
  emptyToNull,
  getAuditIpHash,
  handleAdminApiError,
  parseJsonBody,
  recordRevisionAndAudit,
  requireDbConfigured,
  revalidateSettingsPaths,
  validatePatchSchema,
} from "@/lib/services/admin-content";
import { siteSettingUpdateSchema } from "@/lib/validation/content";

export const dynamic = "force-dynamic";

const siteSettingPatchSchema = siteSettingUpdateSchema.partial();

function buildDefaultSettingsPayload() {
  return {
    id: "default",
    ...DEFAULT_PUBLIC_SITE_CONFIG,
    leadRetentionDays: 365,
    updatedAt: null,
    updatedBy: null,
  };
}

export async function GET() {
  try {
    await requireAdminSession("settings:manage");

    const defaultRow = buildDefaultSettingsPayload();

    if (!isDatabaseConfigured()) {
      return NextResponse.json({
        success: true,
        data: defaultRow,
        meta: {
          source: "default",
          databaseConnected: false,
        },
      });
    }

    const setting = await prisma.siteSetting.findUnique({
      where: { id: "default" },
    });

    return NextResponse.json({
      success: true,
      data: setting ?? defaultRow,
      meta: {
        source: setting ? "database" : "default",
        databaseConnected: true,
      },
    });
  } catch (error: unknown) {
    return handleAdminApiError(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const admin = await requireAdminSession("settings:manage");
    requireDbConfigured();

    const body = await parseJsonBody(request);
    assertNoForbiddenContent(body);
    const data = validatePatchSchema(siteSettingPatchSchema, body);

    const updateData: Prisma.SiteSettingUpdateInput = {
      updatedBy: admin.email,
    };

    if (data.brandName !== undefined) updateData.brandName = data.brandName;
    if (data.brandDisplayName !== undefined) {
      updateData.brandDisplayName = data.brandDisplayName;
    }
    if (data.brandNameBn !== undefined) {
      updateData.brandNameBn = data.brandNameBn;
    }
    if (data.taglineBn !== undefined) updateData.taglineBn = data.taglineBn;
    if (data.taglineEn !== undefined) updateData.taglineEn = data.taglineEn;
    if (data.logoAssetPath !== undefined) {
      updateData.logoAssetPath = data.logoAssetPath;
    }
    if (data.isIdentityProvisional !== undefined) {
      updateData.isIdentityProvisional = data.isIdentityProvisional;
    }
    if (data.verifiedPhone !== undefined) {
      updateData.verifiedPhone = emptyToNull(data.verifiedPhone);
    }
    if (data.verifiedWhatsapp !== undefined) {
      const cleaned = emptyToNull(data.verifiedWhatsapp);
      updateData.verifiedWhatsapp = cleaned
        ? normalizeWhatsAppNumber(cleaned)
        : null;
    }
    if (data.verifiedEmail !== undefined) {
      updateData.verifiedEmail = emptyToNull(data.verifiedEmail);
    }
    if (data.verifiedAddressBn !== undefined) {
      updateData.verifiedAddressBn = emptyToNull(data.verifiedAddressBn);
    }
    if (data.verifiedAddressEn !== undefined) {
      updateData.verifiedAddressEn = emptyToNull(data.verifiedAddressEn);
    }
    if (data.facebookUrl !== undefined) {
      updateData.facebookUrl = emptyToNull(data.facebookUrl);
    }
    if (data.linkedinUrl !== undefined) {
      updateData.linkedinUrl = emptyToNull(data.linkedinUrl);
    }
    if (data.youtubeUrl !== undefined) {
      updateData.youtubeUrl = emptyToNull(data.youtubeUrl);
    }
    if (data.defaultSeoTitleBn !== undefined) {
      updateData.defaultSeoTitleBn = data.defaultSeoTitleBn;
    }
    if (data.defaultSeoDescBn !== undefined) {
      updateData.defaultSeoDescBn = data.defaultSeoDescBn;
    }
    if (data.legalDisclaimerBn !== undefined) {
      updateData.legalDisclaimerBn = data.legalDisclaimerBn;
    }
    if (data.legalDisclaimerEn !== undefined) {
      updateData.legalDisclaimerEn = data.legalDisclaimerEn;
    }
    if (data.privacyPolicyVersion !== undefined) {
      updateData.privacyPolicyVersion = data.privacyPolicyVersion;
    }
    if (data.leadRetentionDays !== undefined) {
      updateData.leadRetentionDays = data.leadRetentionDays;
    }
    if (data.stagingNoticeBn !== undefined) {
      updateData.stagingNoticeBn = emptyToNull(data.stagingNoticeBn);
    }

    const createData: Prisma.SiteSettingCreateInput = {
      id: "default",
      brandName: data.brandName ?? DEFAULT_PUBLIC_SITE_CONFIG.brandName,
      brandDisplayName:
        data.brandDisplayName ?? DEFAULT_PUBLIC_SITE_CONFIG.brandDisplayName,
      brandNameBn: data.brandNameBn ?? DEFAULT_PUBLIC_SITE_CONFIG.brandNameBn,
      taglineBn: data.taglineBn ?? DEFAULT_PUBLIC_SITE_CONFIG.taglineBn,
      taglineEn: data.taglineEn ?? DEFAULT_PUBLIC_SITE_CONFIG.taglineEn,
      logoAssetPath:
        data.logoAssetPath ?? DEFAULT_PUBLIC_SITE_CONFIG.logoAssetPath,
      isIdentityProvisional:
        data.isIdentityProvisional ??
        DEFAULT_PUBLIC_SITE_CONFIG.isIdentityProvisional,
      verifiedPhone:
        data.verifiedPhone !== undefined
          ? (emptyToNull(data.verifiedPhone) ?? null)
          : DEFAULT_PUBLIC_SITE_CONFIG.verifiedPhone,
      verifiedWhatsapp:
        data.verifiedWhatsapp !== undefined
          ? ((emptyToNull(data.verifiedWhatsapp)
              ? normalizeWhatsAppNumber(data.verifiedWhatsapp)
              : null) ?? null)
          : DEFAULT_PUBLIC_SITE_CONFIG.verifiedWhatsapp,
      verifiedEmail:
        data.verifiedEmail !== undefined
          ? (emptyToNull(data.verifiedEmail) ?? null)
          : DEFAULT_PUBLIC_SITE_CONFIG.verifiedEmail,
      verifiedAddressBn:
        data.verifiedAddressBn !== undefined
          ? (emptyToNull(data.verifiedAddressBn) ?? null)
          : DEFAULT_PUBLIC_SITE_CONFIG.verifiedAddressBn,
      verifiedAddressEn:
        data.verifiedAddressEn !== undefined
          ? (emptyToNull(data.verifiedAddressEn) ?? null)
          : DEFAULT_PUBLIC_SITE_CONFIG.verifiedAddressEn,
      facebookUrl:
        data.facebookUrl !== undefined
          ? (emptyToNull(data.facebookUrl) ?? null)
          : DEFAULT_PUBLIC_SITE_CONFIG.facebookUrl,
      linkedinUrl:
        data.linkedinUrl !== undefined
          ? (emptyToNull(data.linkedinUrl) ?? null)
          : DEFAULT_PUBLIC_SITE_CONFIG.linkedinUrl,
      youtubeUrl:
        data.youtubeUrl !== undefined
          ? (emptyToNull(data.youtubeUrl) ?? null)
          : DEFAULT_PUBLIC_SITE_CONFIG.youtubeUrl,
      defaultSeoTitleBn:
        data.defaultSeoTitleBn ?? DEFAULT_PUBLIC_SITE_CONFIG.defaultSeoTitleBn,
      defaultSeoDescBn:
        data.defaultSeoDescBn ?? DEFAULT_PUBLIC_SITE_CONFIG.defaultSeoDescBn,
      legalDisclaimerBn:
        data.legalDisclaimerBn ?? DEFAULT_PUBLIC_SITE_CONFIG.legalDisclaimerBn,
      legalDisclaimerEn:
        data.legalDisclaimerEn ?? DEFAULT_PUBLIC_SITE_CONFIG.legalDisclaimerEn,
      privacyPolicyVersion:
        data.privacyPolicyVersion ??
        DEFAULT_PUBLIC_SITE_CONFIG.privacyPolicyVersion,
      leadRetentionDays: data.leadRetentionDays ?? 365,
      stagingNoticeBn:
        data.stagingNoticeBn !== undefined
          ? (emptyToNull(data.stagingNoticeBn) ?? null)
          : DEFAULT_PUBLIC_SITE_CONFIG.stagingNoticeBn,
      updatedBy: admin.email,
    };

    const ipHash = getAuditIpHash(request);

    const updated = await prisma.$transaction(async (tx) => {
      const setting = await tx.siteSetting.upsert({
        where: { id: "default" },
        create: createData,
        update: updateData,
      });

      await recordRevisionAndAudit(tx, {
        admin,
        entityType: "SiteSetting",
        entityId: "default",
        revisionAction: "UPDATE",
        auditAction: "UPDATE_SITE_SETTINGS",
        snapshot: setting,
        summary: "Updated site settings",
        metadata: {
          updatedFields: Object.keys(data),
        },
        ipHash,
      });

      return setting;
    });

    revalidateSettingsPaths();

    return NextResponse.json({ success: true, data: updated });
  } catch (error: unknown) {
    return handleAdminApiError(error);
  }
}
