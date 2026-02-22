import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;
  const userRole = req.auth?.user?.role;

  // Public routes
  const publicRoutes = ["/login", "/verify"];
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL("/", req.url));
    }
    return NextResponse.next();
  }

  // API auth & utility routes are public
  if (pathname.startsWith("/api/auth") || pathname.startsWith("/api/test-email")) {
    return NextResponse.next();
  }

  // Protected routes
  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Admin routes
  if (pathname.startsWith("/admin")) {
    if (userRole !== "admin" && userRole !== "dept_manager") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/auth).*)",
  ],
};
