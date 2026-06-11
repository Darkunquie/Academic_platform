import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/auth.config";

// Edge-safe instance (no DB) — reads the JWT only.
const { auth } = NextAuth(authConfig);

const PUBLIC_PREFIXES = [
  "/login",
  "/signup",
  "/api/auth",
  "/api/signup",
  "/api/curriculum",
  "/api/health",
];

export default auth((req) => {
  const { nextUrl } = req;
  const path = nextUrl.pathname;
  const user = req.auth?.user;
  const isAuthed = !!user;

  const isPublic =
    path === "/" || PUBLIC_PREFIXES.some((p) => path.startsWith(p));

  // Authed users shouldn't see login/signup.
  if (isAuthed && (path === "/login" || path === "/signup")) {
    const dest = user.role === "student" ? "/dashboard" : "/admin";
    return NextResponse.redirect(new URL(dest, nextUrl));
  }

  if (isPublic) return NextResponse.next();

  // Everything below requires auth.
  if (!isAuthed) {
    const url = new URL("/login", nextUrl);
    url.searchParams.set("from", path);
    return NextResponse.redirect(url);
  }

  // Admin area: admins + super admins only.
  if (path.startsWith("/admin")) {
    if (user.role !== "admin" && user.role !== "super_admin") {
      return NextResponse.redirect(new URL("/dashboard", nextUrl));
    }
    return NextResponse.next();
  }

  // Student dashboard: must be approved.
  if (path.startsWith("/dashboard")) {
    if (user.role === "student" && user.status !== "approved") {
      return NextResponse.redirect(new URL("/pending", nextUrl));
    }
    return NextResponse.next();
  }

  // Pending page: bounce approved users back to the dashboard.
  if (path.startsWith("/pending")) {
    if (user.status === "approved" || user.role !== "student") {
      return NextResponse.redirect(new URL("/dashboard", nextUrl));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
});

export const config = {
  // Skip Next internals, static assets, and generated brand/metadata files.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon.svg|apple-icon|opengraph-image|twitter-image|robots.txt|sitemap.xml).*)",
  ],
};
