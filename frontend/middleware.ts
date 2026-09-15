import { NextRequest, NextResponse } from "next/server";

// Cheap presence-only guards. The backend is the real authority on session
// validity — client code catches 401s from the API and redirects as needed.
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/dashboard")) {
    const hasSession =
      request.cookies.has("access_token") || request.cookies.has("refresh_token");
    if (!hasSession) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
  }

  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const hasAdminSession = request.cookies.has("admin_access_token");
    if (!hasAdminSession) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};
