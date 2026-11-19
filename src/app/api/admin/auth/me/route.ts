import { NextResponse } from "next/server";
import { getCurrentAdminSession } from "@/lib/security/session";

export async function GET() {
  const admin = await getCurrentAdminSession();
  if (!admin) {
    return NextResponse.json(
      { success: false, error: "অননুমোদিত অ্যাক্সেস" },
      { status: 401 },
    );
  }

  return NextResponse.json({
    success: true,
    user: {
      id: admin.userId,
      email: admin.email,
      name: admin.name,
      role: admin.role,
    },
  });
}
