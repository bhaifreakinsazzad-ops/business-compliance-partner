const DEFAULT_ADMIN_REDIRECT = "/admin/dashboard";
const CONTROL_CHARS_REGEX = /[\u0000-\u001F\u007F]/;

/**
 * Sanitizes an admin post-login redirect target so only safe internal `/admin`
 * paths (excluding `/admin/login` to avoid redirect loops) are accepted.
 */
export function sanitizeAdminRedirectPath(
  nextPath: string | null | undefined,
  fallback: string = DEFAULT_ADMIN_REDIRECT,
): string {
  if (!nextPath) return fallback;

  const trimmed = nextPath.trim();
  if (
    !trimmed.startsWith("/") ||
    trimmed.startsWith("//") ||
    trimmed.includes("\\") ||
    CONTROL_CHARS_REGEX.test(trimmed)
  ) {
    return fallback;
  }

  try {
    const parsed = new URL(trimmed, "http://localhost");
    if (parsed.origin !== "http://localhost") {
      return fallback;
    }

    const isAdminRoute =
      parsed.pathname === "/admin" || parsed.pathname.startsWith("/admin/");
    if (!isAdminRoute || parsed.pathname === "/admin/login") {
      return fallback;
    }

    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return fallback;
  }
}
