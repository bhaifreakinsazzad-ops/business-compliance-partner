export const ANALYTICS_EVENTS = [
  "view_home",
  "click_pillar_courses",
  "click_pillar_services",
  "click_pillar_books",
  "select_course_category",
  "select_service_category",
  "select_book_category",
  "search_catalogue",
  "view_course",
  "course_enquiry_start",
  "course_enquiry_submit_success",
  "view_service",
  "service_enquiry_start",
  "service_enquiry_submit_success",
  "view_book",
  "book_interest_submit_success",
  "view_licensing",
  "consultancy_form_start",
  "consultancy_form_submit_success",
  "contact_click_phone",
  "contact_click_whatsapp",
  "click_service_whatsapp",
  "click_book_whatsapp",
  "checkout_start",
  "order_created",
  "payment_verified",
  "enrollment_completed",
] as const;

export type AnalyticsEventName = (typeof ANALYTICS_EVENTS)[number];

export type AnalyticsVerificationLevel = "client_observed" | "server_verified";

const SERVER_VERIFIED_EVENTS = new Set<AnalyticsEventName>([
  "order_created",
  "payment_verified",
  "enrollment_completed",
]);

const ALLOWED_ANALYTICS_KEYS = new Set([
  "pillar",
  "slug",
  "category",
  "availability",
  "resultCount",
  "preferredContact",
  "sourcePage",
  "quantity",
  "orderKind",
  "verificationLevel",
]);

const FORBIDDEN_PII_KEYS = new Set([
  "name",
  "fullname",
  "phone",
  "mobile",
  "whatsapp",
  "email",
  "address",
  "addressarea",
  "shippingaddress",
  "problem",
  "problemdescription",
  "reference",
  "publicreference",
  "nid",
  "tin",
  "bin",
  "bank",
]);

const recentEventCache = new Map<string, number>();
const DEDUPE_WINDOW_MS = 1200;

/**
 * Strips any PII keys so client analytics can never accidentally leak personal data.
 */
export function sanitizeAnalyticsPayload(
  payload: Record<string, unknown>,
): Record<string, string | number | boolean> {
  const clean: Record<string, string | number | boolean> = {};
  for (const [key, value] of Object.entries(payload)) {
    const lowerKey = key.toLowerCase();
    if (FORBIDDEN_PII_KEYS.has(lowerKey)) continue;
    if (!ALLOWED_ANALYTICS_KEYS.has(key)) continue;
    if (
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean"
    ) {
      clean[key] = value;
    }
  }
  return clean;
}

export function getAnalyticsVerificationLevel(
  eventName: AnalyticsEventName,
): AnalyticsVerificationLevel {
  return SERVER_VERIFIED_EVENTS.has(eventName)
    ? "server_verified"
    : "client_observed";
}

export function trackEvent(
  eventName: AnalyticsEventName,
  payload: Record<string, unknown> = {},
): void {
  if (typeof window === "undefined") return;
  const provider = process.env.NEXT_PUBLIC_ANALYTICS_PROVIDER;
  if (!provider || provider === "none") return;

  const safePayload = sanitizeAnalyticsPayload(payload);
  const dedupeKey = `${eventName}:${JSON.stringify(safePayload)}`;
  const now = Date.now();
  const lastFired = recentEventCache.get(dedupeKey);
  if (lastFired && now - lastFired < DEDUPE_WINDOW_MS) {
    return;
  }
  recentEventCache.set(dedupeKey, now);

  window.dispatchEvent(
    new CustomEvent("bcp:analytics", {
      detail: {
        eventName,
        verificationLevel: getAnalyticsVerificationLevel(eventName),
        payload: safePayload,
      },
    }),
  );
}
