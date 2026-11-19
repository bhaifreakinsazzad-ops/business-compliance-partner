import { NextResponse } from "next/server";
import {
  revokeCurrentAdminSession,
  SESSION_COOKIE_NAME,
} from "@/lib/security/session";

export async function POST() {
  await revokeCurrentAdminSession();
  const response = NextResponse.json({ success: true });
  response.cookies.delete(SESSION_COOKIE_NAME);
  return response;
}
