import { z } from "zod";

export const CATALOGUE_TARGETS = {
  COURSE: { entries: 105, categories: 10 },
  SERVICE: { entries: 247, categories: 11 },
  LICENSING: { entries: 85, categories: 6 },
} as const;

export const catalogueTypeSchema = z.enum(["COURSE", "SERVICE", "LICENSING"]);
export type CatalogueType = z.infer<typeof catalogueTypeSchema>;

const nullableTrimmed = z.string().trim().min(1).max(2_000).nullable().default(null);
const stringList = z.array(z.string().trim().min(1).max(500)).default([]);

export const authoritativeCatalogueEntrySchema = z
  .object({
    stableSourceReference: z.string().trim().min(1).max(160),
    canonicalOfferingId: nullableTrimmed,
    type: catalogueTypeSchema,
    originalTitle: z.string().trim().min(1).max(500),
    titleBn: z.string().trim().min(1).max(500),
    titleEn: nullableTrimmed,
    slug: z
      .string()
      .trim()
      .min(1)
      .max(180)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase kebab-case"),
    businessPillar: z.enum(["COURSES", "SERVICES", "LICENSING"]),
    categorySlug: z.string().trim().min(1).max(160),
    tags: stringList,
    aliases: stringList,
    sourceDocument: z.string().trim().min(1).max(500),
    sourcePage: z.union([z.number().int().positive(), z.string().trim().min(1)]).nullable().default(null),
    relatedSourceReferences: stringList,
    duplicateOfSourceReference: nullableTrimmed,
    targetAudience: stringList,
    lifecycleStages: z
      .array(z.enum(["START", "OPERATE", "COMPLY", "GROW"]))
      .default([]),
    description: nullableTrimmed,
    serviceScope: nullableTrimmed,
    limitations: nullableTrimmed,
    documentRequirements: stringList,
    processSteps: stringList,
    governmentAuthority: nullableTrimmed,
    officialSourceUrl: z.string().trim().url().nullable().default(null),
    providerQualificationRequirements: stringList,
    contentVerificationStatus: z
      .enum(["UNVERIFIED", "NEEDS_REVIEW", "VERIFIED"])
      .default("UNVERIFIED"),
    availabilityStatus: z
      .enum(["ACTIVE", "UPCOMING", "INTEREST_ONLY", "INACTIVE"])
      .default("INTEREST_ONLY"),
    pricingStatus: z
      .enum(["UNSPECIFIED", "QUOTE_REQUIRED", "APPROVED_FIXED", "NOT_FOR_SALE"])
      .default("UNSPECIFIED"),
    lastReviewedAt: z.string().datetime().nullable().default(null),
    reviewer: nullableTrimmed,
    publicationStatus: z
      .enum(["DRAFT", "PENDING_REVIEW", "APPROVED", "PUBLISHED"])
      .default("DRAFT"),
  })
  .strict()
  .superRefine((entry, context) => {
    const expectedPillar = {
      COURSE: "COURSES",
      SERVICE: "SERVICES",
      LICENSING: "LICENSING",
    }[entry.type];
    if (entry.businessPillar !== expectedPillar) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["businessPillar"],
        message: `${entry.type} entries must use ${expectedPillar}`,
      });
    }
    if (
      entry.duplicateOfSourceReference &&
      entry.duplicateOfSourceReference === entry.stableSourceReference
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["duplicateOfSourceReference"],
        message: "An entry cannot duplicate itself",
      });
    }
  });

export type AuthoritativeCatalogueEntry = z.infer<
  typeof authoritativeCatalogueEntrySchema
>;

export const authoritativeCatalogueSchema = z
  .object({
    schemaVersion: z.literal("1.0"),
    catalogueVersion: z.string().trim().min(1).max(100),
    sourceName: z.string().trim().min(1).max(500),
    exportedAt: z.string().datetime().nullable().default(null),
    entries: z.array(authoritativeCatalogueEntrySchema).min(1),
  })
  .strict();

export type AuthoritativeCatalogue = z.infer<typeof authoritativeCatalogueSchema>;

export function normalizeCatalogueText(value: string): string {
  return value
    .normalize("NFC")
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizeCatalogueEntry(
  entry: AuthoritativeCatalogueEntry,
): AuthoritativeCatalogueEntry {
  const normalizeNullable = (value: string | null): string | null =>
    value === null ? null : normalizeCatalogueText(value);
  const normalizeList = (values: string[]): string[] =>
    [...new Set(values.map(normalizeCatalogueText).filter(Boolean))];

  return {
    ...entry,
    stableSourceReference: normalizeCatalogueText(entry.stableSourceReference),
    canonicalOfferingId: normalizeNullable(entry.canonicalOfferingId),
    originalTitle: normalizeCatalogueText(entry.originalTitle),
    titleBn: normalizeCatalogueText(entry.titleBn),
    titleEn: normalizeNullable(entry.titleEn),
    slug: entry.slug.trim(),
    categorySlug: entry.categorySlug.trim(),
    tags: normalizeList(entry.tags),
    aliases: normalizeList(entry.aliases),
    sourceDocument: normalizeCatalogueText(entry.sourceDocument),
    relatedSourceReferences: normalizeList(entry.relatedSourceReferences),
    duplicateOfSourceReference: normalizeNullable(entry.duplicateOfSourceReference),
    targetAudience: normalizeList(entry.targetAudience),
    description: normalizeNullable(entry.description),
    serviceScope: normalizeNullable(entry.serviceScope),
    limitations: normalizeNullable(entry.limitations),
    documentRequirements: normalizeList(entry.documentRequirements),
    processSteps: normalizeList(entry.processSteps),
    governmentAuthority: normalizeNullable(entry.governmentAuthority),
    providerQualificationRequirements: normalizeList(
      entry.providerQualificationRequirements,
    ),
    reviewer: normalizeNullable(entry.reviewer),
  };
}
