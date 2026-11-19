import { describe, expect, it } from "vitest";
import {
  BD_MOBILE_ERROR_BN,
  convertBengaliDigits,
  isValidBangladeshMobile,
  normalizeBangladeshMobile,
} from "@/lib/validation/phone";

describe("Bangladesh mobile normalization & validation", () => {
  it("converts Bengali numerals to ASCII digits", () => {
    expect(convertBengaliDigits("০১৭১২৩৪৫৬৭৮")).toBe("01712345678");
    expect(convertBengaliDigits("+৮৮০১৮১৯-১২৩৪৫৬")).toBe("+8801819-123456");
  });

  it("normalizes common valid Bangladesh mobile formats to 01XXXXXXXXX", () => {
    expect(normalizeBangladeshMobile("01712345678")).toBe("01712345678");
    expect(normalizeBangladeshMobile("+8801712345678")).toBe("01712345678");
    expect(normalizeBangladeshMobile("8801812345678")).toBe("01812345678");
    expect(normalizeBangladeshMobile("008801912345678")).toBe("01912345678");
    expect(normalizeBangladeshMobile("+880 1612-345 678")).toBe("01612345678");
    expect(normalizeBangladeshMobile("০১৭১১-২২৩৩৪৪")).toBe("01711223344");
    expect(normalizeBangladeshMobile("01312345678")).toBe("01312345678");
    expect(normalizeBangladeshMobile("01412345678")).toBe("01412345678");
    expect(normalizeBangladeshMobile("01512345678")).toBe("01512345678");
  });

  it("rejects invalid prefixes, lengths, and non-numeric strings", () => {
    expect(normalizeBangladeshMobile("")).toBeNull();
    expect(normalizeBangladeshMobile("01112345678")).toBeNull();
    expect(normalizeBangladeshMobile("01212345678")).toBeNull();
    expect(normalizeBangladeshMobile("0171234567")).toBeNull();
    expect(normalizeBangladeshMobile("017123456789")).toBeNull();
    expect(normalizeBangladeshMobile("+880171234abc")).toBeNull();
    expect(isValidBangladeshMobile("01712345678")).toBe(true);
    expect(isValidBangladeshMobile("01012345678")).toBe(false);
    expect(BD_MOBILE_ERROR_BN).toContain("01XXXXXXXXX");
  });
});
