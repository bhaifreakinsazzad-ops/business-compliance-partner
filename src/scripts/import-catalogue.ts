/**
 * BCP 437-Record Governed Inventory & Provenance Ingestion Script
 *
 * Implements authoritative ingestion of all 437 source records from
 * prisma/seed-data/bcp-catalogue-v1.1.json into persistent database models
 * (CatalogueSourceRecord, CatalogueOfferingMapping, ImportBatch).
 *
 * Usage:
 *   npx tsx src/scripts/import-catalogue.ts [--dry-run]
 */

import fs from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";

interface SourceEntry {
  id: string; // "A-001", "B-001", "C-001"
  title: string;
  pillar: string;
  category: string;
  source_document: string;
  source_pages: string;
  documented_status: string;
  live_availability: string;
  proposed_domain?: string;
  proposed_audience?: string;
  proposed_journey?: string;
  price_bdt?: number | null;
  authorized_provider?: string | null;
  approved_scope?: string | null;
  turnaround?: string | null;
  source_page_exact?: number;
  title_match_status?: string;
  source_page_reference?: number;
  same_title_ids?: string[];
}

interface CatalogueData {
  version: string;
  source_sha256: string;
  status: string;
  counts: {
    Learn: number;
    Services: number;
    "Licensing & Registration": number;
  };
  entries: SourceEntry[];
}

export interface IngestionResult {
  dryRun: boolean;
  totalRecords: number;
  learnCount: number;
  servicesCount: number;
  licensingCount: number;
  distinctCategories: number;
  imported: number;
  skipped: number;
  errors: string[];
}

export async function ingestAuthoritativeCatalogue(
  prisma: PrismaClient,
  options: { dryRun?: boolean } = {}
): Promise<IngestionResult> {
  const isDryRun = Boolean(options.dryRun);
  const filePath = path.resolve(
    process.cwd(),
    "prisma/seed-data/bcp-catalogue-v1.1.json"
  );

  if (!fs.existsSync(filePath)) {
    throw new Error(`Catalogue JSON file not found at: ${filePath}`);
  }

  const raw = fs.readFileSync(filePath, "utf8");
  const data = JSON.parse(raw) as CatalogueData;

  const result: IngestionResult = {
    dryRun: isDryRun,
    totalRecords: data.entries.length,
    learnCount: 0,
    servicesCount: 0,
    licensingCount: 0,
    distinctCategories: 0,
    imported: 0,
    skipped: 0,
    errors: [],
  };

  const categories = new Set<string>();

  for (const entry of data.entries) {
    categories.add(entry.category);
    if (entry.pillar === "Learn") result.learnCount++;
    else if (entry.pillar === "Services") result.servicesCount++;
    else if (entry.pillar === "Licensing & Registration")
      result.licensingCount++;
  }

  result.distinctCategories = categories.size;

  if (isDryRun) {
    console.log(
      `[catalogue:import] DRY RUN: Validated ${result.totalRecords} entries across ${result.distinctCategories} categories.`
    );
    return result;
  }

  // Create Import Batch
  const batchNumber = `BATCH-${Date.now()}`;
  let batchId: string | null = null;

  try {
    const batch = await prisma.importBatch.create({
      data: {
        batchNumber,
        sourceFile: "bcp-catalogue-v1.1.json",
        totalRecords: result.totalRecords,
        importedRecords: 0,
        skippedRecords: 0,
        status: "IN_PROGRESS",
      },
    });
    batchId = batch.id;
  } catch (err) {
    console.warn("[catalogue:import] Could not create ImportBatch record:", err);
  }

  // Ingest Source Records & Mappings
  for (const entry of data.entries) {
    try {
      const sourceRecord = await prisma.catalogueSourceRecord.upsert({
        where: { sourceId: entry.id },
        update: {
          title: entry.title,
          pillar: entry.pillar,
          category: entry.category,
          sourceDocument: entry.source_document,
          sourcePages: entry.source_pages,
          sourcePageExact: entry.source_page_exact ?? null,
          documentedStatus: entry.documented_status,
          liveAvailability: entry.live_availability,
          proposedDomain: entry.proposed_domain ?? null,
          proposedAudience: entry.proposed_audience ?? null,
          proposedJourney: entry.proposed_journey ?? null,
          priceBdt: entry.price_bdt ?? null,
          authorizedProvider: entry.authorized_provider ?? null,
          approvedScope: entry.approved_scope ?? null,
          turnaround: entry.turnaround ?? null,
        },
        create: {
          sourceId: entry.id,
          title: entry.title,
          pillar: entry.pillar,
          category: entry.category,
          sourceDocument: entry.source_document,
          sourcePages: entry.source_pages,
          sourcePageExact: entry.source_page_exact ?? null,
          documentedStatus: entry.documented_status,
          liveAvailability: entry.live_availability,
          proposedDomain: entry.proposed_domain ?? null,
          proposedAudience: entry.proposed_audience ?? null,
          proposedJourney: entry.proposed_journey ?? null,
          priceBdt: entry.price_bdt ?? null,
          authorizedProvider: entry.authorized_provider ?? null,
          approvedScope: entry.approved_scope ?? null,
          turnaround: entry.turnaround ?? null,
          contentVerificationStatus: "UNVERIFIED",
          publicationStatus: "DRAFT",
        },
      });

      // Maintain Offering Mapping
      const offeringType =
        entry.pillar === "Learn"
          ? "COURSE"
          : entry.pillar === "Services"
          ? "SERVICE"
          : "LICENSING";

      await prisma.catalogueOfferingMapping.create({
        data: {
          sourceRecordId: sourceRecord.id,
          canonicalOfferingType: offeringType,
          canonicalOfferingSlug: entry.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, ""),
          matchConfidence: 1.0,
          mappingNotes: `Source reference ${entry.id} mapped from PDF p.${entry.source_pages}`,
        },
      });

      result.imported++;
    } catch (err) {
      result.skipped++;
      result.errors.push(
        `Failed to import ${entry.id}: ${
          err instanceof Error ? err.message : String(err)
        }`
      );
    }
  }

  if (batchId) {
    await prisma.importBatch.update({
      where: { id: batchId },
      data: {
        importedRecords: result.imported,
        skippedRecords: result.skipped,
        status: result.skipped === 0 ? "COMPLETED" : "COMPLETED_WITH_WARNINGS",
        log: { errors: result.errors },
      },
    });
  }

  return result;
}

// CLI Execution Support
if (require.main === module || process.argv[1]?.includes("import-catalogue")) {
  const isDryRun = process.argv.includes("--dry-run");
  const prisma = new PrismaClient();

  ingestAuthoritativeCatalogue(prisma, { dryRun: isDryRun })
    .then((res) => {
      console.log("====================================================");
      console.log("BCP 437-RECORD CATALOGUE INGESTION REPORT");
      console.log("====================================================");
      console.log(`Execution Mode:       ${res.dryRun ? "DRY RUN" : "PERSISTENT DB INGESTION"}`);
      console.log(`Total Source Records: ${res.totalRecords}`);
      console.log(`- Learn (Courses):    ${res.learnCount}`);
      console.log(`- Services:           ${res.servicesCount}`);
      console.log(`- Licensing & Reg:    ${res.licensingCount}`);
      console.log(`Distinct Categories:  ${res.distinctCategories}`);
      console.log(`Imported Successfully:${res.imported}`);
      console.log(`Skipped / Errors:     ${res.skipped}`);
      console.log("====================================================");
    })
    .catch((err) => {
      console.error("[catalogue:import] Failed:", err);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
