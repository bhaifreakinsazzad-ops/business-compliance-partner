import { cookies } from "next/headers";
import { isDatabaseConfigured, prisma } from "@/lib/db/prisma";
import {
  generateSessionToken,
  hashToken,
} from "@/lib/security/password";

export const CUSTOMER_SESSION_COOKIE_NAME = "bcp_customer_session";
const SESSION_EXPIRY_DAYS = 14;

export interface CurrentCustomer {
  id: string;
  name: string;
  email: string;
  mobile: string | null;
  isVerified: boolean;
  organizations: {
    id: string;
    name: string;
    role: string;
  }[];
}

export async function createCustomerSession(
  customerId: string
): Promise<{ token: string; expiresAt: Date }> {
  const rawToken = generateSessionToken();
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(
    Date.now() + SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000
  );

  if (isDatabaseConfigured()) {
    try {
      await prisma.customerSession.create({
        data: {
          tokenHash,
          customerId,
          expiresAt,
        },
      });
    } catch {
      // Session persistence unavailable when database tables are not yet migrated
    }
  }

  return { token: rawToken, expiresAt };
}

export async function setCustomerSessionCookie(
  token: string,
  expiresAt: Date
): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(CUSTOMER_SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function clearCustomerSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(CUSTOMER_SESSION_COOKIE_NAME);
}

export async function getCurrentCustomer(): Promise<CurrentCustomer | null> {
  const cookieStore = await cookies();
  const rawToken = cookieStore.get(CUSTOMER_SESSION_COOKIE_NAME)?.value;
  if (!rawToken) return null;

  if (!isDatabaseConfigured()) {
    return null;
  }

  const tokenHash = hashToken(rawToken);
  let session;
  try {
    session = await prisma.customerSession.findUnique({
      where: { tokenHash },
      include: {
        customer: {
          include: {
            memberships: {
              include: { organization: true },
            },
          },
        },
      },
    });
  } catch {
    return null;
  }

  if (!session || session.expiresAt < new Date()) {
    return null;
  }

  return {
    id: session.customer.id,
    name: session.customer.name,
    email: session.customer.email,
    mobile: session.customer.mobile,
    isVerified: session.customer.isVerified,
    organizations: session.customer.memberships.map((m) => ({
      id: m.organization.id,
      name: m.organization.name,
      role: m.role,
    })),
  };
}
