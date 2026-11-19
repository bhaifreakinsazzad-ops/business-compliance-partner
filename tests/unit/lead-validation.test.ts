import { describe, expect, it } from "vitest";
import { leadSubmissionSchema } from "@/lib/validation/lead";

const BASE_VALID_PAYLOAD = {
  name: "তানভীর আহমেদ",
  mobile: "+880 1712-345678",
  addressArea: "ধানমন্ডি, ঢাকা",
  categoryContext: "Income Tax",
  pillar: "CONSULTANCY" as const,
  problemDescription: "নতুন কোম্পানির জন্য e-TIN, BIN এবং প্রাথমিক কর কাঠামো বুঝতে পরামর্শ প্রয়োজন।",
  consentAccepted: true as const,
  idempotencyKey: "req_1234567890abcdef",
  sourcePage: "/consultancy",
  websiteHoneypot: "",
};

describe("leadSubmissionSchema", () => {
  it("validates and normalizes a valid consultancy submission", () => {
    const parsed = leadSubmissionSchema.safeParse(BASE_VALID_PAYLOAD);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.mobile).toBe("01712345678");
      expect(parsed.data.email).toBeNull();
      expect(parsed.data.whatsapp).toBeNull();
    }
  });

  it("rejects submissions without explicit unchecked privacy consent", () => {
    const parsed = leadSubmissionSchema.safeParse({
      ...BASE_VALID_PAYLOAD,
      consentAccepted: false,
    });
    expect(parsed.success).toBe(false);
  });

  it("rejects populated honeypot spam submissions", () => {
    const parsed = leadSubmissionSchema.safeParse({
      ...BASE_VALID_PAYLOAD,
      websiteHoneypot: "https://spam.invalid",
    });
    expect(parsed.success).toBe(false);
  });

  it("rejects unexpected strict keys such as sensitive file fields", () => {
    const parsed = leadSubmissionSchema.safeParse({
      ...BASE_VALID_PAYLOAD,
      nidNumber: "1234567890",
    });
    expect(parsed.success).toBe(false);
  });

  it("validates optional email and whatsapp cleanly when supplied", () => {
    const parsed = leadSubmissionSchema.safeParse({
      ...BASE_VALID_PAYLOAD,
      email: "  Tanvir@Company.BD  ",
      whatsapp: "০১৮১১-২২৩৩৪৪",
      preferredContact: "WHATSAPP",
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.email).toBe("tanvir@company.bd");
      expect(parsed.data.whatsapp).toBe("01811223344");
      expect(parsed.data.preferredContact).toBe("WHATSAPP");
    }
  });
});
