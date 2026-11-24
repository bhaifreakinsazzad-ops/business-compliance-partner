import { describe, expect, it } from "vitest";
import { reconcileCatalogue, titleSimilarity } from "@/lib/catalogue-import/reconcile";

describe("Catalogue Import and Reconciliation", () => {
  it("calculates title similarity accurately using character bigrams", () => {
    expect(titleSimilarity("ট্রেড লাইসেন্স আবেদন", "ট্রেড লাইসেন্স আবেদন")).toBe(1);
    expect(titleSimilarity("ট্রেড লাইসেন্স", "টিন সার্টিফিকেট")).toBeLessThan(0.7);
    expect(titleSimilarity("English Title", "বাংলা শিরোনাম")).toBe(0);
    expect(titleSimilarity("", "")).toBe(1);
  });

  it("rejects invalid catalogue schema and returns validation errors", () => {
    const invalidCatalogue = {
      schemaVersion: "2.0", // invalid version
      catalogueVersion: "1.0",
      sourceName: "Test",
      entries: [],
    };
    const report = reconcileCatalogue(invalidCatalogue, []);
    expect(report.valid).toBe(false);
    expect(report.findings.length).toBeGreaterThan(0);
    expect(report.findings[0]?.code).toBe("SCHEMA_VALIDATION");
  });

  it("detects unverified published entry and flags it as error", () => {
    const raw = {
      schemaVersion: "1.0",
      catalogueVersion: "1.0",
      sourceName: "BCP Master Source",
      entries: [
        {
          stableSourceReference: "BCP-SRC-001",
          canonicalOfferingId: null,
          type: "SERVICE",
          originalTitle: "Test Service",
          titleBn: "পরীক্ষামূলক সেবা",
          titleEn: "Test Service",
          slug: "test-service",
          businessPillar: "SERVICES",
          categorySlug: "general",
          tags: ["test"],
          aliases: [],
          sourceDocument: "BCP Master Doc",
          sourcePage: 1,
          relatedSourceReferences: [],
          duplicateOfSourceReference: null,
          targetAudience: ["SMEs"],
          lifecycleStages: ["START"],
          description: "Test description",
          serviceScope: null,
          limitations: null,
          documentRequirements: [],
          processSteps: [],
          governmentAuthority: null,
          officialSourceUrl: null,
          providerQualificationRequirements: [],
          contentVerificationStatus: "UNVERIFIED",
          availabilityStatus: "ACTIVE",
          pricingStatus: "QUOTE_REQUIRED",
          lastReviewedAt: null,
          reviewer: null,
          publicationStatus: "PUBLISHED", // Published but UNVERIFIED
        },
      ],
    };
    const report = reconcileCatalogue(raw, []);
    expect(report.valid).toBe(false);
    expect(report.findings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "UNVERIFIED_PUBLISHED_ENTRY",
          severity: "ERROR",
        }),
      ]),
    );
  });

  it("reconciles entries against existing records without overwriting IDs", () => {
    const raw = {
      schemaVersion: "1.0",
      catalogueVersion: "1.0",
      sourceName: "BCP Master Source",
      entries: [
        {
          stableSourceReference: "BCP-SRC-001",
          canonicalOfferingId: null,
          type: "COURSE",
          originalTitle: "Accounting Basics",
          titleBn: "হিসাববিজ্ঞান প্রাথমিক কোর্স",
          titleEn: "Accounting Basics",
          slug: "accounting-basics",
          businessPillar: "COURSES",
          categorySlug: "accounting",
          tags: [],
          aliases: [],
          sourceDocument: "BCP Master Doc",
          sourcePage: null,
          relatedSourceReferences: [],
          duplicateOfSourceReference: null,
          targetAudience: [],
          lifecycleStages: ["OPERATE"],
          description: "Course desc",
          serviceScope: null,
          limitations: null,
          documentRequirements: [],
          processSteps: [],
          governmentAuthority: null,
          officialSourceUrl: null,
          providerQualificationRequirements: [],
          contentVerificationStatus: "VERIFIED",
          availabilityStatus: "UPCOMING",
          pricingStatus: "QUOTE_REQUIRED",
          lastReviewedAt: null,
          reviewer: "Admin",
          publicationStatus: "DRAFT",
        },
      ],
    };

    const existingRecords = [
      {
        id: "existing-c-1",
        type: "COURSE" as const,
        slug: "accounting-basics",
        sourceReference: "BCP-SRC-001",
        titleBn: "হিসাববিজ্ঞান প্রাথমিক কোর্স",
        titleEn: "Accounting Basics",
        categorySlug: "accounting",
        contentStatus: "DRAFT",
        availabilityStatus: "UPCOMING",
      },
    ];

    const report = reconcileCatalogue(raw, existingRecords);
    expect(report.valid).toBe(true);
    expect(report.actions.UNCHANGED).toBe(1);
    expect(report.items[0]?.existingId).toBe("existing-c-1");
  });

  it("validates the authoritative 437-record inventory breakdown across 27 categories", async () => {
    const { ingestAuthoritativeCatalogue } = await import(
      "../../src/scripts/import-catalogue"
    );
    // Mock minimal prisma client for dry-run
    const mockPrisma = {} as unknown as import("@prisma/client").PrismaClient;
    const res = await ingestAuthoritativeCatalogue(mockPrisma, { dryRun: true });

    expect(res.totalRecords).toBe(437);
    expect(res.learnCount).toBe(105);
    expect(res.servicesCount).toBe(247);
    expect(res.licensingCount).toBe(85);
    expect(res.distinctCategories).toBe(27);
    expect(res.dryRun).toBe(true);
  });
});
