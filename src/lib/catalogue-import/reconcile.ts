import {
  CATALOGUE_TARGETS,
  authoritativeCatalogueSchema,
  normalizeCatalogueEntry,
  normalizeCatalogueText,
  type AuthoritativeCatalogue,
  type AuthoritativeCatalogueEntry,
  type CatalogueType,
} from "./schema";

export interface ExistingCatalogueRecord {
  id: string;
  type: CatalogueType;
  slug: string;
  sourceReference: string | null;
  titleBn: string;
  titleEn: string | null;
  categorySlug: string;
  contentStatus: string;
  availabilityStatus: string;
}

export type ReconciliationAction =
  | "ADD"
  | "UNCHANGED"
  | "UPDATE_PRESERVE_ID"
  | "REVIEW_REQUIRED";

export interface ReconciliationItem {
  sourceReference: string;
  type: CatalogueType;
  slug: string;
  action: ReconciliationAction;
  existingId: string | null;
  reasons: string[];
}

export interface CatalogueFinding {
  severity: "ERROR" | "WARNING" | "INFO";
  code: string;
  message: string;
  sourceReferences: string[];
}

export interface CatalogueCompleteness {
  type: CatalogueType;
  sourceEntries: number;
  targetEntries: number;
  entryGap: number;
  sourceCategories: number;
  targetCategories: number;
  categoryGap: number;
}

export interface CatalogueReconciliationReport {
  valid: boolean;
  catalogueVersion: string | null;
  sourceName: string | null;
  sourceEntries: number;
  actions: Record<ReconciliationAction, number>;
  items: ReconciliationItem[];
  existingOnlyIds: string[];
  completeness: CatalogueCompleteness[];
  findings: CatalogueFinding[];
  normalizedCatalogue: AuthoritativeCatalogue | null;
}

function comparable(value: string | null): string {
  return normalizeCatalogueText(value ?? "").toLocaleLowerCase("en");
}

function titleBigrams(value: string): Set<string> {
  const normalized = comparable(value).replace(/[^\p{L}\p{N}]+/gu, " ");
  const compact = normalized.replace(/\s+/g, " ").trim();
  if (compact.length < 2) return new Set(compact ? [compact] : []);
  const result = new Set<string>();
  for (let index = 0; index < compact.length - 1; index += 1) {
    result.add(compact.slice(index, index + 2));
  }
  return result;
}

export function titleSimilarity(left: string, right: string): number {
  const a = titleBigrams(left);
  const b = titleBigrams(right);
  if (a.size === 0 && b.size === 0) return 1;
  if (a.size === 0 || b.size === 0) return 0;
  let shared = 0;
  for (const item of a) if (b.has(item)) shared += 1;
  return (2 * shared) / (a.size + b.size);
}

function entryChanged(
  source: AuthoritativeCatalogueEntry,
  existing: ExistingCatalogueRecord,
): boolean {
  return (
    comparable(source.titleBn) !== comparable(existing.titleBn) ||
    comparable(source.titleEn) !== comparable(existing.titleEn) ||
    source.categorySlug !== existing.categorySlug ||
    source.slug !== existing.slug
  );
}

function completenessFor(entries: AuthoritativeCatalogueEntry[]): CatalogueCompleteness[] {
  return (Object.keys(CATALOGUE_TARGETS) as CatalogueType[]).map((type) => {
    const target = CATALOGUE_TARGETS[type];
    const typed = entries.filter((entry) => entry.type === type);
    const categories = new Set(typed.map((entry) => entry.categorySlug));
    return {
      type,
      sourceEntries: typed.length,
      targetEntries: target.entries,
      entryGap: target.entries - typed.length,
      sourceCategories: categories.size,
      targetCategories: target.categories,
      categoryGap: target.categories - categories.size,
    };
  });
}

export function reconcileCatalogue(
  rawCatalogue: unknown,
  existingRecords: ExistingCatalogueRecord[],
): CatalogueReconciliationReport {
  const parsed = authoritativeCatalogueSchema.safeParse(rawCatalogue);
  if (!parsed.success) {
    return {
      valid: false,
      catalogueVersion: null,
      sourceName: null,
      sourceEntries: 0,
      actions: { ADD: 0, UNCHANGED: 0, UPDATE_PRESERVE_ID: 0, REVIEW_REQUIRED: 0 },
      items: [],
      existingOnlyIds: existingRecords.map((record) => record.id),
      completeness: completenessFor([]),
      findings: parsed.error.issues.map((issue) => ({
        severity: "ERROR",
        code: "SCHEMA_VALIDATION",
        message: `${issue.path.join(".") || "catalogue"}: ${issue.message}`,
        sourceReferences: [],
      })),
      normalizedCatalogue: null,
    };
  }

  const normalizedCatalogue: AuthoritativeCatalogue = {
    ...parsed.data,
    sourceName: normalizeCatalogueText(parsed.data.sourceName),
    entries: parsed.data.entries.map(normalizeCatalogueEntry),
  };
  const entries = normalizedCatalogue.entries;
  const findings: CatalogueFinding[] = [];
  const sourceReferenceMap = new Map<string, AuthoritativeCatalogueEntry[]>();
  const slugMap = new Map<string, AuthoritativeCatalogueEntry[]>();

  for (const entry of entries) {
    const byReference = sourceReferenceMap.get(entry.stableSourceReference) ?? [];
    byReference.push(entry);
    sourceReferenceMap.set(entry.stableSourceReference, byReference);
    const slugKey = `${entry.type}:${entry.slug}`;
    const bySlug = slugMap.get(slugKey) ?? [];
    bySlug.push(entry);
    slugMap.set(slugKey, bySlug);

    if (entry.publicationStatus === "PUBLISHED") {
      if (entry.contentVerificationStatus !== "VERIFIED") {
        findings.push({
          severity: "ERROR",
          code: "UNVERIFIED_PUBLISHED_ENTRY",
          message: "Published source entry is not verified and must remain unpublished.",
          sourceReferences: [entry.stableSourceReference],
        });
      }
      if (entry.type === "LICENSING" && !entry.governmentAuthority) {
        findings.push({
          severity: "ERROR",
          code: "PUBLISHED_LICENSING_AUTHORITY_MISSING",
          message: "Published licensing entry has no attributed authority.",
          sourceReferences: [entry.stableSourceReference],
        });
      }
    }
    if (entry.pricingStatus === "APPROVED_FIXED" && !entry.reviewer) {
      findings.push({
        severity: "WARNING",
        code: "APPROVED_PRICE_REVIEWER_MISSING",
        message: "Fixed-price status requires an attributable reviewer before import.",
        sourceReferences: [entry.stableSourceReference],
      });
    }
  }

  for (const [sourceReference, group] of sourceReferenceMap) {
    if (group.length > 1) {
      findings.push({
        severity: "ERROR",
        code: "DUPLICATE_SOURCE_REFERENCE",
        message: `Stable source reference ${sourceReference} occurs ${group.length} times.`,
        sourceReferences: group.map((entry) => entry.stableSourceReference),
      });
    }
  }
  for (const [slug, group] of slugMap) {
    if (group.length > 1) {
      findings.push({
        severity: "ERROR",
        code: "DUPLICATE_TYPE_SLUG",
        message: `Type/slug ${slug} occurs ${group.length} times.`,
        sourceReferences: group.map((entry) => entry.stableSourceReference),
      });
    }
  }

  for (let leftIndex = 0; leftIndex < entries.length; leftIndex += 1) {
    const left = entries[leftIndex]!;
    for (let rightIndex = leftIndex + 1; rightIndex < entries.length; rightIndex += 1) {
      const right = entries[rightIndex]!;
      if (left.type !== right.type) continue;
      const exact = comparable(left.originalTitle) === comparable(right.originalTitle);
      const similarity = titleSimilarity(left.originalTitle, right.originalTitle);
      if (exact || similarity >= 0.86) {
        const relationshipDeclared =
          left.duplicateOfSourceReference === right.stableSourceReference ||
          right.duplicateOfSourceReference === left.stableSourceReference ||
          left.canonicalOfferingId !== null &&
            left.canonicalOfferingId === right.canonicalOfferingId;
        findings.push({
          severity: relationshipDeclared ? "INFO" : "WARNING",
          code: exact ? "EXACT_TITLE_DUPLICATE" : "NEAR_TITLE_DUPLICATE",
          message: relationshipDeclared
            ? "Overlapping source titles have an explicit canonical/duplicate relationship."
            : `Potential duplicate titles require editorial review (similarity ${similarity.toFixed(2)}).`,
          sourceReferences: [left.stableSourceReference, right.stableSourceReference],
        });
      }
    }
  }

  const existingByReference = new Map(
    existingRecords
      .filter((record) => record.sourceReference)
      .map((record) => [record.sourceReference!, record]),
  );
  const existingBySlug = new Map(
    existingRecords.map((record) => [`${record.type}:${record.slug}`, record]),
  );
  const matchedExistingIds = new Set<string>();
  const items: ReconciliationItem[] = entries.map((entry) => {
    const byReference = existingByReference.get(entry.stableSourceReference);
    if (byReference) {
      matchedExistingIds.add(byReference.id);
      return {
        sourceReference: entry.stableSourceReference,
        type: entry.type,
        slug: entry.slug,
        action: entryChanged(entry, byReference)
          ? "UPDATE_PRESERVE_ID"
          : "UNCHANGED",
        existingId: byReference.id,
        reasons: entryChanged(entry, byReference)
          ? ["Stable source reference matched; preserve existing ID and review changed fields."]
          : ["Stable source reference and governed fields are unchanged."],
      };
    }

    const bySlug = existingBySlug.get(`${entry.type}:${entry.slug}`);
    if (bySlug) {
      matchedExistingIds.add(bySlug.id);
      return {
        sourceReference: entry.stableSourceReference,
        type: entry.type,
        slug: entry.slug,
        action: "REVIEW_REQUIRED",
        existingId: bySlug.id,
        reasons: [
          "Slug matches an existing record but stable source identity is absent or different; never auto-merge.",
        ],
      };
    }

    return {
      sourceReference: entry.stableSourceReference,
      type: entry.type,
      slug: entry.slug,
      action: "ADD",
      existingId: null,
      reasons: ["No stable-reference or type/slug match exists."],
    };
  });

  const completeness = completenessFor(entries);
  for (const item of completeness) {
    if (item.entryGap !== 0 || item.categoryGap !== 0) {
      findings.push({
        severity: "WARNING",
        code: "TARGET_COUNT_MISMATCH",
        message: `${item.type}: ${item.sourceEntries}/${item.targetEntries} entries and ${item.sourceCategories}/${item.targetCategories} categories.`,
        sourceReferences: [],
      });
    }
  }

  const actions: CatalogueReconciliationReport["actions"] = {
    ADD: 0,
    UNCHANGED: 0,
    UPDATE_PRESERVE_ID: 0,
    REVIEW_REQUIRED: 0,
  };
  for (const item of items) actions[item.action] += 1;

  return {
    valid: findings.every((finding) => finding.severity !== "ERROR"),
    catalogueVersion: normalizedCatalogue.catalogueVersion,
    sourceName: normalizedCatalogue.sourceName,
    sourceEntries: entries.length,
    actions,
    items,
    existingOnlyIds: existingRecords
      .filter((record) => !matchedExistingIds.has(record.id))
      .map((record) => record.id),
    completeness,
    findings,
    normalizedCatalogue,
  };
}

export function formatCatalogueReportMarkdown(
  report: CatalogueReconciliationReport,
): string {
  const lines = [
    "# Catalogue Reconciliation Dry Run",
    "",
    `- Validation: **${report.valid ? "PASS" : "FAIL"}**`,
    `- Catalogue version: ${report.catalogueVersion ?? "unavailable"}`,
    `- Source: ${report.sourceName ?? "unavailable"}`,
    `- Source entries: ${report.sourceEntries}`,
    `- Actions: ADD ${report.actions.ADD}; UNCHANGED ${report.actions.UNCHANGED}; UPDATE_PRESERVE_ID ${report.actions.UPDATE_PRESERVE_ID}; REVIEW_REQUIRED ${report.actions.REVIEW_REQUIRED}`,
    `- Existing-only records: ${report.existingOnlyIds.length}`,
    "",
    "## Completeness",
    "",
    "| Type | Entries | Target | Gap | Categories | Target | Gap |",
    "|---|---:|---:|---:|---:|---:|---:|",
    ...report.completeness.map(
      (item) =>
        `| ${item.type} | ${item.sourceEntries} | ${item.targetEntries} | ${item.entryGap} | ${item.sourceCategories} | ${item.targetCategories} | ${item.categoryGap} |`,
    ),
    "",
    "## Findings",
    "",
  ];

  if (report.findings.length === 0) lines.push("No findings.");
  for (const finding of report.findings) {
    const refs = finding.sourceReferences.length
      ? ` (${finding.sourceReferences.join(", ")})`
      : "";
    lines.push(`- **${finding.severity} ${finding.code}:** ${finding.message}${refs}`);
  }
  lines.push(
    "",
    "> Dry run only. No database writes were attempted. Editorial approval is required before applying any plan.",
    "",
  );
  return lines.join("\n");
}
