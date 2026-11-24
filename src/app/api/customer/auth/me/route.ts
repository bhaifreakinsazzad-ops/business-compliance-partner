import { NextResponse } from "next/server";
import { getCurrentCustomer } from "@/lib/customer/auth";

export async function GET() {
  const customer = await getCurrentCustomer();
  if (!customer) {
    return NextResponse.json({ customer: null, authenticated: false }, { status: 401 });
  }

  return NextResponse.json({ customer, authenticated: true });
}
