export const ANALYTICS_EVENTS = [
  "view_home",
  "click_pillar_courses",
  "click_pillar_services",
  "search_catalogue",
  "view_course",
  "course_enquiry_start",
  "course_enquiry_submit_success",
  "view_service",
  "service_enquiry_start",
  "service_enquiry_submit_success",
  "view_licensing",
  "consultancy_form_start",
  "consultancy_form_submit_success",
  "contact_click_phone",
  "contact_click_whatsapp",
] as const;

export type AnalyticsEventName = (typeof ANALYTICS_EVENTS)[number];

const ALLOWED_ANALYTICS_KEYS = new Set([
  "pillar",
  "slug",
  "category",
  "availability",
  "resultCount",
  "preferredContact",
  "sourcePage",
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
  "problem",
  "problemdescription",
  "reference",
  "publicreference",
  "nid",
  "tin",
  "bin",
  "bank",
]);

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

export function trackEvent(
  eventName: AnalyticsEventName,
  payload: Record<string, unknown> = {},
): void {
  if (typeof window === "undefined") return;
  const provider = process.env.NEXT_PUBLIC_ANALYTICS_PROVIDER;
  if (!provider || provider === "none") return;

  const safePayload = sanitizeAnalyticsPayload(payload);
  window.dispatchEvent(
    new CustomEvent("ps:analytics", {
      detail: { eventName, payload: safePayload },
    }),
  );
}
