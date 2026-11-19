import { cookies } from "next/headers";
import type { AdminRoleValue } from "@/types/domain";
import { isDatabaseConfigured, prisma } from "@/lib/db/prisma";
import { generateSessionToken, hashToken } from "@/lib/security/password";
import {
  assertPermission,
  AuthenticationError,
  type AdminPermission,
} from "@/lib/security/rbac";

export const SESSION_COOKIE_NAME = "ps_admin_session";
export const SESSION_TTL_HOURS = 12;

export interface AuthenticatedAdmin {
  sessionId: string;
  userId: string;
  email: string;
  name: string;
  role: AdminRoleValue;
}

export function buildSessionCookieOptions(expiresAt: Date) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    expires: expiresAt,
  };
}

export async function createAdminSession(
  userId: string,
  meta?: { ipHash?: string | null; userAgent?: string | null },
): Promise<{ rawToken: string; expiresAt: Date }> {
  const rawToken = generateSessionToken();
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + SESSION_TTL_HOURS * 60 * 60 * 1000);

  await prisma.adminSession.create({
    data: {
      tokenHash,
      userId,
      expiresAt,
      ipHash: meta?.ipHash ?? null,
      userAgent: meta?.userAgent?.slice(0, 200) ?? null,
    },
  });

  return { rawToken, expiresAt };
}

export async function getCurrentAdminSession(): Promise<AuthenticatedAdmin | null> {
  if (!isDatabaseConfigured()) return null;

  const cookieStore = await cookies();
  const rawToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!rawToken) return null;

  const tokenHash = hashToken(rawToken);
  try {
    const session = await prisma.adminSession.findUnique({
      where: { tokenHash },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            isActive: true,
          },
        },
      },
    });

    if (!session) return null;

    if (session.expiresAt.getTime() <= Date.now()) {
      await prisma.adminSession
        .delete({ where: { id: session.id } })
        .catch(() => undefined);
      return null;
    }

    if (!session.user.isActive) {
      return null;
    }

    return {
      sessionId: session.id,
      userId: session.user.id,
      email: session.user.email,
      name: session.user.name,
      role: session.user.role,
    };
  } catch {
    return null;
  }
}

export async function requireAdminSession(
  requiredPermission?: AdminPermission,
): Promise<AuthenticatedAdmin> {
  const admin = await getCurrentAdminSession();
  if (!admin) {
    throw new AuthenticationError();
  }
  if (requiredPermission) {
    assertPermission(admin.role, requiredPermission);
  }
  return admin;
}

export async function revokeCurrentAdminSession(): Promise<void> {
  if (!isDatabaseConfigured()) return;

  const cookieStore = await cookies();
  const rawToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!rawToken) return;

  const tokenHash = hashToken(rawToken);
  await prisma.adminSession
    .deleteMany({ where: { tokenHash } })
    .catch(() => undefined);
}
