import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isDatabaseConfigured, prisma } from "@/lib/db/prisma";
import { verifyPassword } from "@/lib/security/password";
import {
  createCustomerSession,
  setCustomerSessionCookie,
} from "@/lib/customer/auth";

const loginSchema = z.object({
  email: z.string().email("সঠিক ইমেইল ঠিকানা লিখুন।"),
  password: z.string().min(1, "পাসওয়ার্ড লিখুন।"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || "ভুল তথ্য প্রদান করা হয়েছে।" },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;

    if (!isDatabaseConfigured()) {
      return NextResponse.json(
        { error: "ডাটাবেজ সংযোগ সক্রিয় নেই।" },
        { status: 503 }
      );
    }

    const customer = await prisma.customer.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!customer) {
      return NextResponse.json(
        { error: "ইমেইল বা পাসওয়ার্ড ভুল হয়েছে।" },
        { status: 401 }
      );
    }

    const isMatch = await verifyPassword(password, customer.passwordHash);
    if (!isMatch) {
      return NextResponse.json(
        { error: "ইমেইল বা পাসওয়ার্ড ভুল হয়েছে।" },
        { status: 401 }
      );
    }

    const session = await createCustomerSession(customer.id);
    await setCustomerSessionCookie(session.token, session.expiresAt);

    return NextResponse.json({
      success: true,
      customer: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
      },
    });
  } catch (err) {
    console.error("[customer/login] Error:", err);
    return NextResponse.json(
      { error: "লগইন প্রক্রিয়ায় ত্রুটি ঘটেছে।" },
      { status: 500 }
    );
  }
}
