import type { AdminRoleValue } from "@/types/domain";

export type AdminPermission =
  | "dashboard:view"
  | "leads:view"
  | "leads:update"
  | "leads:assign"
  | "leads:export"
  | "content:read"
  | "content:write"
  | "content:publish"
  | "faqs:manage"
  | "settings:manage"
  | "users:manage"
  | "audit:view";

const ROLE_PERMISSIONS: Record<AdminRoleValue, ReadonlySet<AdminPermission>> = {
  ADMIN: new Set<AdminPermission>([
    "dashboard:view",
    "leads:view",
    "leads:update",
    "leads:assign",
    "leads:export",
    "content:read",
    "content:write",
    "content:publish",
    "faqs:manage",
    "settings:manage",
    "users:manage",
    "audit:view",
  ]),
  EDITOR: new Set<AdminPermission>([
    "dashboard:view",
    "content:read",
    "content:write",
    "content:publish",
    "faqs:manage",
  ]),
  LEAD_MANAGER: new Set<AdminPermission>([
    "dashboard:view",
    "leads:view",
    "leads:update",
    "leads:assign",
    "leads:export",
  ]),
};

export class AuthenticationError extends Error {
  public readonly statusCode = 401;
  constructor(message = "Authentication required.") {
    super(message);
    this.name = "AuthenticationError";
  }
}

export class AuthorizationError extends Error {
  public readonly statusCode = 403;
  constructor(message = "Insufficient permissions for this action.") {
    super(message);
    this.name = "AuthorizationError";
  }
}

export function hasPermission(
  role: AdminRoleValue,
  permission: AdminPermission,
): boolean {
  return ROLE_PERMISSIONS[role]?.has(permission) ?? false;
}

export function assertPermission(
  role: AdminRoleValue,
  permission: AdminPermission,
): void {
  if (!hasPermission(role, permission)) {
    throw new AuthorizationError();
  }
}

export function getPermissionsForRole(
  role: AdminRoleValue,
): AdminPermission[] {
  return Array.from(ROLE_PERMISSIONS[role] ?? []);
}
