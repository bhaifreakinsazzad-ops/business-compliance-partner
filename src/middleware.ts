import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE_NAME = "ps_admin_session";

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const hasSessionCookie = Boolean(
    request.cookies.get(SESSION_COOKIE_NAME)?.value,
  );

  // Protect staff-only /admin/* routes (excluding /admin/login).
  // Authoritative DB session & RBAC enforcement always runs server-side
  // inside route handlers and server components.
  if (
    pathname.startsWith("/admin") &&
    !pathname.startsWith("/admin/login") &&
    !hasSessionCookie
  ) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("next", `${pathname}${search}`);
    const redirectResponse = NextResponse.redirect(loginUrl);
    redirectResponse.headers.set("Cache-Control", "no-store");
    return redirectResponse;
  }

  const response = NextResponse.next();
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    response.headers.set("Cache-Control", "no-store, private");
  }
  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
