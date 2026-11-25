import { convertBengaliDigits } from "@/lib/validation/phone";

const FORBIDDEN_NUMBER_MARKERS = /(?:fixxer|dhandabuzz|example|1xxx|xxxx)/i;

/**
 * Normalizes a verified WhatsApp phone number into digits-only international format
 * suitable for `https://wa.me/{number}`.
 *
 * - Supports Bangladesh mobile formats: `01XXXXXXXXX`, `+8801XXXXXXXXX`,
 *   `8801XXXXXXXXX`, `008801XXXXXXXXX` (including Bengali numerals ০–৯).
 * - Supports valid E.164 international numbers (8 to 15 digits, non-zero leading digit).
 * - Rejects malformed numbers, placeholder strings, and invalid BD operator prefixes.
 */
export function normalizeWhatsAppNumber(
  rawInput: string | null | undefined,
): string | null {
  if (typeof rawInput !== "string") return null;

  const ascii = convertBengaliDigits(rawInput).trim();
  if (!ascii || FORBIDDEN_NUMBER_MARKERS.test(ascii)) return null;

  const stripped = ascii.replace(/[\s\-().]/g, "");
  if (!/^\+?\d+$/.test(stripped)) return null;

  // Detect Bangladesh-prefixed inputs explicitly so malformed BD numbers fail closed
  const isBdCandidate =
    stripped.startsWith("01") ||
    stripped.startsWith("+880") ||
    stripped.startsWith("880") ||
    stripped.startsWith("00880");

  if (isBdCandidate) {
    let local = stripped;
    if (local.startsWith("+880")) {
      local = local.slice(3);
    } else if (local.startsWith("00880")) {
      local = local.slice(4);
    } else if (local.startsWith("880")) {
      local = local.slice(2);
    }

    if (!/^01[3-9]\d{8}$/.test(local)) {
      return null;
    }

    return `88${local}`;
  }

  // International E.164 fallback (8 to 15 digits)
  let intl = stripped;
  if (intl.startsWith("+")) {
    intl = intl.slice(1);
  } else if (intl.startsWith("00")) {
    intl = intl.slice(2);
  }

  if (!/^[1-9]\d{7,14}$/.test(intl)) {
    return null;
  }

  // Reject trivial repeated digits like 111111111
  if (/^(\d)\1+$/.test(intl)) {
    return null;
  }

  return intl;
}

/**
 * Returns true only when `baseUrl` is a trusted HTTPS production canonical origin
 * (never localhost, 127.0.0.1, or plain HTTP).
 */
export function isTrustedCanonicalUrl(baseUrl?: string | null): boolean {
  if (!baseUrl || typeof baseUrl !== "string") return false;
  try {
    const parsed = new URL(baseUrl.trim());
    if (parsed.protocol !== "https:") return false;
    const host = parsed.hostname.toLowerCase();
    if (
      host === "localhost" ||
      host === "127.0.0.1" ||
      host === "0.0.0.0" ||
      host.endsWith(".local")
    ) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export function buildWhatsAppServiceMessage(params: {
  serviceName: string;
  servicePath?: string;
  canonicalBaseUrl?: string | null;
}): string {
  const cleanName = params.serviceName.trim() || "পেশাদার সেবা";
  const lines = [
    "আসসালামু আলাইকুম।",
    "",
    `আমি Business Compliance Partner-এর ${cleanName} সেবাটি সম্পর্কে বিস্তারিত জানতে আগ্রহী।`,
    "",
    "অনুগ্রহ করে সেবার প্রক্রিয়া ও সম্ভাব্য খরচ সম্পর্কে জানাবেন।",
  ];

  if (params.servicePath && isTrustedCanonicalUrl(params.canonicalBaseUrl)) {
    const base = params.canonicalBaseUrl!.trim().replace(/\/+$/, "");
    const path = params.servicePath.startsWith("/")
      ? params.servicePath
      : `/${params.servicePath}`;
    lines.push("", `সেবার লিংক: ${base}${path}`);
  }

  return lines.join("\n");
}

export function buildWhatsAppGeneralMessage(topic?: string): string {
  const cleanTopic = topic?.trim();
  if (cleanTopic) {
    return [
      "আসসালামু আলাইকুম।",
      "",
      `আমি Business Compliance Partner-এর ${cleanTopic} বিষয়ে বিস্তারিত জানতে আগ্রহী।`,
      "",
      "অনুগ্রহ করে করণীয় ও পরামর্শের সময় সম্পর্কে জানাবেন।",
    ].join("\n");
  }

  return [
    "আসসালামু আলাইকুম।",
    "",
    "আমি Business Compliance Partner-এর কোর্স ও ব্যবসায়িক সেবা সম্পর্কে বিস্তারিত জানতে আগ্রহী।",
  ].join("\n");
}

export function buildWhatsAppUrl(
  rawNumber: string | null | undefined,
  message: string,
): string | null {
  const normalized = normalizeWhatsAppNumber(rawNumber);
  if (!normalized) return null;
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${normalized}?text=${encoded}`;
}
