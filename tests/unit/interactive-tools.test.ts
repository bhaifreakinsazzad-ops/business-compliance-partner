import { describe, expect, it } from "vitest";
import {
  CHECKLIST_TEMPLATES,
  calculateChecklistProgress,
  getChecklistTemplate,
} from "@/lib/tools/checklist";
import {
  READINESS_QUESTIONS,
  evaluateReadiness,
} from "@/lib/tools/readiness";
import { buildRoadmap } from "@/lib/tools/roadmap";

describe("Interactive Business Tools", () => {
  describe("Readiness Assessment", () => {
    it("evaluates readiness with all questions answered yes", () => {
      const answers = Object.fromEntries(
        READINESS_QUESTIONS.map((q) => [q.id, "yes" as const]),
      );
      const result = evaluateReadiness(answers);
      expect(result.answered).toBe(READINESS_QUESTIONS.length);
      expect(result.total).toBe(READINESS_QUESTIONS.length);
      expect(result.preparedCount).toBe(READINESS_QUESTIONS.length);
      expect(result.reviewCount).toBe(0);
      expect(result.progressPercent).toBe(100);
      expect(result.recommendations).toHaveLength(0);
      expect(result.summaryBn).toContain("প্রতিটি ক্ষেত্রেই একটি প্রক্রিয়া আছে");
    });

    it("evaluates readiness with review items when answers are no or unsure", () => {
      const answers = {
        [READINESS_QUESTIONS[0]!.id]: "yes" as const,
        [READINESS_QUESTIONS[1]!.id]: "no" as const,
        [READINESS_QUESTIONS[2]!.id]: "unsure" as const,
      };
      const result = evaluateReadiness(answers);
      expect(result.answered).toBe(3);
      expect(result.preparedCount).toBe(1);
      expect(result.reviewCount).toBe(2);
      expect(result.recommendations).toHaveLength(2);
      expect(result.recommendations[0]?.id).toBe(READINESS_QUESTIONS[1]!.id);
    });
  });

  describe("Smart Checklists", () => {
    it("retrieves template by ID and falls back to default safely", () => {
      const template = getChecklistTemplate("business-start");
      expect(template.id).toBe("business-start");
      expect(template.items.length).toBeGreaterThan(0);

      const fallback = getChecklistTemplate("nonexistent-template-id");
      expect(fallback.id).toBe(CHECKLIST_TEMPLATES[0]!.id);
    });

    it("calculates checklist progress correctly", () => {
      const template = getChecklistTemplate("business-start");
      const firstItemId = template.items[0]!.id;
      const progress = calculateChecklistProgress(template, new Set([firstItemId]));
      expect(progress.completed).toBe(1);
      expect(progress.total).toBe(template.items.length);
      expect(progress.percent).toBe(
        Math.round((1 / template.items.length) * 100),
      );
    });
  });

  describe("Business Roadmap", () => {
    it("builds roadmap for start goal", () => {
      const roadmap = buildRoadmap("start", "idea");
      expect(roadmap.length).toBeGreaterThanOrEqual(4);
      expect(roadmap.map((s) => s.id)).toContain("structure");
      expect(roadmap.map((s) => s.id)).toContain("licensing");
    });

    it("injects compliance step for operating stage if not already present", () => {
      const roadmap = buildRoadmap("learn", "operating");
      expect(roadmap.map((s) => s.id)).toContain("compliance");
    });
  });
});
