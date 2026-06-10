import { NextRequest, NextResponse } from "next/server";
import { verifyTokenSafe } from "@/lib/auth/jwt";

const COOKIE_NAME = "whisperlink_session";

// Pages that do NOT require a session
const publicRoutes = [
  "/",
  "/login",
  "/register",
  "/verify-email",
  "/forgot-password",
  "/reset-password",
];

// Pages that a logged-in user should be redirected AWAY from
const authRoutes = ["/login", "/register"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );

  const token = request.cookies.get(COOKIE_NAME)?.value;

  // No session — redirect to login if trying to access protected page
  if (!token) {
    if (!isPublicRoute) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // Validate the token
  const session = await verifyTokenSafe(token);

  // Bad/expired token — clear cookie and redirect to login
  if (!session) {
    const response = NextResponse.redirect(
      new URL("/login", request.url)
    );
    response.cookies.delete(COOKIE_NAME);
    return response;
  }

  // Logged-in users should not see auth pages — redirect to dashboard
  if (authRoutes.some((route) => pathname === route)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public folder files (images, etc.)
     * - API routes (auth handled inside each route)
     */
    "/((?!_next/static|_next/image|favicon.ico|public/|api/).*)",
  ],
};