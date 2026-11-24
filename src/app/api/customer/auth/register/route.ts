import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isDatabaseConfigured, prisma } from "@/lib/db/prisma";
import { hashPassword } from "@/lib/security/password";
import {
  createCustomerSession,
  setCustomerSessionCookie,
} from "@/lib/customer/auth";

const registerSchema = z.object({
  name: z.string().min(2, "নাম ন্যূনতম ২ অক্ষরের হতে হবে।"),
  email: z.string().email("সঠিক ইমেইল ঠিকানা লিখুন।"),
  mobile: z.string().min(11, "১১ সংখ্যার মোবাইল নম্বর লিখুন।").optional(),
  password: z.string().min(8, "পাসওয়ার্ড ন্যূনতম ৮ অক্ষরের হতে হবে।"),
  organizationName: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || "ভুল তথ্য প্রদান করা হয়েছে।" },
        { status: 400 }
      );
    }

    const { name, email, mobile, password, organizationName } = parsed.data;

    if (!isDatabaseConfigured()) {
      return NextResponse.json(
        { error: "ডাটাবেজ বর্তমানে অফলাইনে রয়েছে। অনুগ্রহ করে পরে চেষ্টা করুন।" },
        { status: 503 }
      );
    }

    const existing = await prisma.customer.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existing) {
      return NextResponse.json(
        { error: "এই ইমেইল দিয়ে ইতোমধ্যে একটি অ্যাকাউন্ট রয়েছে।" },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);

    const customer = await prisma.customer.create({
      data: {
        name,
        email: email.toLowerCase(),
        mobile: mobile || null,
        passwordHash,
        isVerified: false,
      },
    });

    // Create default organization if supplied
    if (organizationName && organizationName.trim()) {
      const org = await prisma.organization.create({
        data: { name: organizationName.trim() },
      });
      await prisma.organizationMembership.create({
        data: {
          organizationId: org.id,
          customerId: customer.id,
          role: "OWNER",
        },
      });
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
    console.error("[customer/register] Error:", err);
    return NextResponse.json(
      { error: "অ্যাকাউন্ট তৈরি করতে সমস্যা হয়েছে।" },
      { status: 500 }
    );
  }
}
