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
    await prisma.customerSession.create({
      data: {
        tokenHash,
        customerId,
        expiresAt,
      },
    });
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
    // Graceful demo customer for offline / non-db environment
    return {
      id: "demo-customer",
      name: "মোহাম্মদ রফিক",
      email: "rafiq@example.com",
      mobile: "01711000000",
      isVerified: true,
      organizations: [
        {
          id: "org-1",
          name: "রফিক এন্টারপ্রাইজ লিমিটেড",
          role: "OWNER",
        },
      ],
    };
  }

  const tokenHash = hashToken(rawToken);
  const session = await prisma.customerSession.findUnique({
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
