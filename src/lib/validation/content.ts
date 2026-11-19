import { z } from "zod";
import { PILLAR_ENUM } from "@/lib/validation/lead";

export const CONTENT_STATUS_ENUM = z.enum([
  "DRAFT",
  "PENDING_REVIEW",
  "APPROVED",
  "PUBLISHED",
]);

export const AVAILABILITY_STATUS_ENUM = z.enum([
  "ACTIVE",
  "UPCOMING",
  "INTEREST_ONLY",
  "INACTIVE",
]);

export const LEAD_STATUS_ENUM = z.enum([
  "NEW",
  "REVIEWED",
  "CONTACTED",
  "QUALIFIED",
  "CONVERTED",
  "CLOSED",
  "SPAM",
]);

const FORBIDDEN_PUBLIC_PATTERNS = [
  /fixxer/i,
  /dhandabuzz/i,
  /notrealengine/i,
  /leadconnector/i,
  /ps-demo-/i,
  /example\.com/i,
  /1xxx-xxxxxx/i,
];

/**
 * Checks whether any string values inside a payload contain legacy demo/vendor
 * markers or unverified placeholder contacts.
 */
export function findForbiddenContentMatch(value: unknown): string | null {
  if (typeof value === "string") {
    for (const pattern of FORBIDDEN_PUBLIC_PATTERNS) {
      if (pattern.test(value)) {
        return pattern.source;
      }
    }
    return null;
  }
  if (Array.isArray(value)) {
    for (const item of value) {
      const hit = findForbiddenContentMatch(item);
      if (hit) return hit;
    }
  } else if (value && typeof value === "object") {
    for (const entry of Object.values(value)) {
      const hit = findForbiddenContentMatch(entry);
      if (hit) return hit;
    }
  }
  return null;
}

const slugSchema = z
  .string()
  .trim()
  .min(2)
  .max(140)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase kebab-case.");

export const courseUpsertSchema = z.object({
  slug: slugSchema,
  categoryId: z.string().trim().min(1),
  titleBn: z.string().trim().min(3).max(200),
  titleEn: z.string().trim().max(200).optional().nullable(),
  summaryBn: z.string().trim().min(10).max(800),
  summaryEn: z.string().trim().max(800).optional().nullable(),
  audienceBn: z.string().trim().min(5).max(800),
  outcomes: z.array(z.string().trim().min(2).max(300)).min(1),
  syllabus: z
    .array(
      z.object({
        titleBn: z.string().trim().min(2).max(200),
        topicsBn: z.array(z.string().trim().min(1).max(200)).min(1),
      }),
    )
    .min(1),
  aliases: z.array(z.string().trim().max(80)).default([]),
  deliveryMode: z.string().trim().max(120).optional().nullable(),
  duration: z.string().trim().max(120).optional().nullable(),
  feeDisplay: z.string().trim().max(120).optional().nullable(),
  instructorId: z.string().trim().optional().nullable(),
  contentStatus: CONTENT_STATUS_ENUM.default("DRAFT"),
  availabilityStatus: AVAILABILITY_STATUS_ENUM.default("INTEREST_ONLY"),
  featured: z.boolean().default(false),
  sortOrder: z.number().int().min(0).max(9999).default(0),
  seoTitle: z.string().trim().max(160).optional().nullable(),
  seoDescription: z.string().trim().max(320).optional().nullable(),
  verifiedBy: z.string().trim().max(140).optional().nullable(),
  lastVerifiedAt: z.string().datetime().optional().nullable(),
});

export const serviceUpsertSchema = z.object({
  slug: slugSchema,
  categoryId: z.string().trim().min(1),
  titleBn: z.string().trim().min(3).max(200),
  titleEn: z.string().trim().max(200).optional().nullable(),
  summaryBn: z.string().trim().min(10).max(800),
  summaryEn: z.string().trim().max(800).optional().nullable(),
  whoNeedsItBn: z.string().trim().min(5).max(800),
  assistanceScopeBn: z.string().trim().min(10).max(1500),
  limitationsBn: z.string().trim().min(10).max(1500),
  documentsSummary: z.array(z.string().trim().min(2).max(300)).min(1),
  processSteps: z
    .array(
      z.object({
        stepNumber: z.number().int().min(1).max(20),
        titleBn: z.string().trim().min(2).max(160),
        descriptionBn: z.string().trim().min(2).max(500),
      }),
    )
    .min(1),
  authorityName: z.string().trim().max(200).optional().nullable(),
  officialSourceLabel: z.string().trim().max(200).optional().nullable(),
  officialSourceUrl: z.string().trim().url().optional().nullable().or(z.literal("")),
  requiresSpecialist: z.boolean().default(false),
  aliases: z.array(z.string().trim().max(80)).default([]),
  serviceFeeNoteBn: z.string().trim().max(240).optional().nullable(),
  govtFeeNoteBn: z.string().trim().max(240).optional().nullable(),
  contentStatus: CONTENT_STATUS_ENUM.default("DRAFT"),
  availabilityStatus: AVAILABILITY_STATUS_ENUM.default("INTEREST_ONLY"),
  featured: z.boolean().default(false),
  sortOrder: z.number().int().min(0).max(9999).default(0),
  seoTitle: z.string().trim().max(160).optional().nullable(),
  seoDescription: z.string().trim().max(320).optional().nullable(),
  verifiedBy: z.string().trim().max(140).optional().nullable(),
  lastVerifiedAt: z.string().datetime().optional().nullable(),
});

export const licensingUpsertSchema = z.object({
  slug: slugSchema,
  categoryId: z.string().trim().min(1),
  titleBn: z.string().trim().min(3).max(200),
  titleEn: z.string().trim().max(200).optional().nullable(),
  summaryBn: z.string().trim().min(10).max(800),
  summaryEn: z.string().trim().max(800).optional().nullable(),
  authorityName: z.string().trim().min(2).max(200),
  authorityType: z.string().trim().min(2).max(100),
  officialSourceLabel: z.string().trim().min(2).max(200),
  officialSourceUrl: z.string().trim().url().optional().nullable().or(z.literal("")),
  serviceScopeBn: z.string().trim().min(10).max(1500),
  limitationsBn: z.string().trim().min(10).max(1500),
  documentsSummary: z.array(z.string().trim().min(2).max(300)).min(1),
  processSummaryBn: z.string().trim().min(5).max(1500),
  aliases: z.array(z.string().trim().max(80)).default([]),
  contentStatus: CONTENT_STATUS_ENUM.default("DRAFT"),
  availabilityStatus: AVAILABILITY_STATUS_ENUM.default("INTEREST_ONLY"),
  featured: z.boolean().default(false),
  sortOrder: z.number().int().min(0).max(9999).default(0),
  seoTitle: z.string().trim().max(160).optional().nullable(),
  seoDescription: z.string().trim().max(320).optional().nullable(),
  verifiedBy: z.string().trim().max(140).optional().nullable(),
  lastVerifiedAt: z.string().datetime().optional().nullable(),
});

export const faqUpsertSchema = z.object({
  questionBn: z.string().trim().min(5).max(300),
  answerBn: z.string().trim().min(10).max(2000),
  pillar: PILLAR_ENUM.optional().nullable(),
  isRegulatory: z.boolean().default(false),
  contentStatus: CONTENT_STATUS_ENUM.default("DRAFT"),
  sortOrder: z.number().int().min(0).max(9999).default(0),
  verifiedBy: z.string().trim().max(140).optional().nullable(),
  lastVerifiedAt: z.string().datetime().optional().nullable(),
});

export const siteSettingUpdateSchema = z.object({
  brandName: z.string().trim().min(2).max(120),
  brandDisplayName: z.string().trim().min(2).max(120),
  brandNameBn: z.string().trim().min(2).max(120),
  taglineBn: z.string().trim().min(3).max(240),
  taglineEn: z.string().trim().min(3).max(240),
  logoAssetPath: z.string().trim().min(1).max(300),
  isIdentityProvisional: z.boolean(),
  verifiedPhone: z.string().trim().max(40).optional().nullable(),
  verifiedWhatsapp: z.string().trim().max(30).optional().nullable(),
  verifiedEmail: z.string().trim().email().optional().nullable().or(z.literal("")),
  verifiedAddressBn: z.string().trim().max(300).optional().nullable(),
  verifiedAddressEn: z.string().trim().max(300).optional().nullable(),
  facebookUrl: z.string().trim().url().optional().nullable().or(z.literal("")),
  linkedinUrl: z.string().trim().url().optional().nullable().or(z.literal("")),
  youtubeUrl: z.string().trim().url().optional().nullable().or(z.literal("")),
  defaultSeoTitleBn: z.string().trim().min(5).max(180),
  defaultSeoDescBn: z.string().trim().min(10).max(360),
  legalDisclaimerBn: z.string().trim().min(15).max(800),
  legalDisclaimerEn: z.string().trim().min(15).max(800),
  privacyPolicyVersion: z.string().trim().min(2).max(40),
  leadRetentionDays: z.number().int().min(30).max(3650),
  stagingNoticeBn: z.string().trim().max(400).optional().nullable(),
});

export const leadStatusUpdateSchema = z.object({
  status: LEAD_STATUS_ENUM,
  assignedToId: z.string().trim().optional().nullable(),
  internalNotes: z.string().trim().max(4000).optional().nullable(),
});
