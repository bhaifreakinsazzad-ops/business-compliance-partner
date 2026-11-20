import { redirect } from "next/navigation";
import {
  getCurrentAdminSession,
  type AuthenticatedAdmin,
} from "@/lib/security/session";
import { hasPermission, type AdminPermission } from "@/lib/security/rbac";
import { sanitizeAdminRedirectPath } from "@/components/admin/admin-redirect";

export { sanitizeAdminRedirectPath };

export type AdminPageGuardResult =
  | { authorized: true; admin: AuthenticatedAdmin }
  | { authorized: false; reason: "FORBIDDEN"; admin: AuthenticatedAdmin };

/**
 * Server-only guard for Admin RSC pages.
 * - Redirects unauthenticated visitors to `/admin/login` (outside try/catch so NEXT_REDIRECT propagates).
 * - Returns `{ authorized: false, reason: "FORBIDDEN", admin }` when the role lacks `requiredPermission`.
 */
export async function requireAdminPageSession(
  requiredPermission?: AdminPermission,
  nextPath?: string,
): Promise<AdminPageGuardResult> {
  const admin = await getCurrentAdminSession();

  if (!admin) {
    const safeNext = nextPath ? sanitizeAdminRedirectPath(nextPath) : null;
    redirect(
      safeNext
        ? `/admin/login?next=${encodeURIComponent(safeNext)}`
        : "/admin/login",
    );
  }

  if (requiredPermission && !hasPermission(admin.role, requiredPermission)) {
    return {
      authorized: false,
      reason: "FORBIDDEN",
      admin,
    };
  }

  return {
    authorized: true,
    admin,
  };
}
