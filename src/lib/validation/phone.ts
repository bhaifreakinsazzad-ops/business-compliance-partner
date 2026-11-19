const BENGALI_DIGITS: Record<string, string> = {
  "০": "0",
  "১": "1",
  "২": "2",
  "৩": "3",
  "৪": "4",
  "৫": "5",
  "৬": "6",
  "৭": "7",
  "৮": "8",
  "৯": "9",
};

export const BD_MOBILE_ERROR_BN = "সঠিক মোবাইল নম্বর লিখুন, যেমন 01XXXXXXXXX";

/**
 * Converts Bengali numerals (০–৯) in user input into ASCII digits (0–9).
 */
export function convertBengaliDigits(input: string): string {
  return input.replace(/[০-৯]/g, (digit) => BENGALI_DIGITS[digit] ?? digit);
}

/**
 * Normalizes Bangladesh mobile numbers across common user inputs:
 * - 01XXXXXXXXX
 * - +8801XXXXXXXXX
 * - 8801XXXXXXXXX
 * - 008801XXXXXXXXX
 * Ignores formatting spaces, hyphens, dots, and parentheses before checking.
 * Returns normalized 11-digit "01XXXXXXXXX" or null when invalid.
 */
export function normalizeBangladeshMobile(rawInput: string): string | null {
  if (typeof rawInput !== "string") return null;

  const ascii = convertBengaliDigits(rawInput).trim();
  if (!ascii) return null;

  const stripped = ascii.replace(/[\s\-().]/g, "");
  if (!/^\+?\d+$/.test(stripped)) return null;

  let candidate = stripped;
  if (candidate.startsWith("+880")) {
    candidate = candidate.slice(3);
  } else if (candidate.startsWith("00880")) {
    candidate = candidate.slice(4);
  } else if (candidate.startsWith("880")) {
    candidate = candidate.slice(2);
  }

  if (!/^01[3-9]\d{8}$/.test(candidate)) {
    return null;
  }

  return candidate;
}

export function isValidBangladeshMobile(rawInput: string): boolean {
  return normalizeBangladeshMobile(rawInput) !== null;
}
