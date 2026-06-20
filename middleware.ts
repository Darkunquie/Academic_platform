import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/auth.config";
import { cacheExists } from "@/lib/cache";

const { auth } = NextAuth(authConfig);

const PUBLIC_PATHS = ["/", "/login", "/signup"];
const PUBLIC_PREFIXES = [
  "/api/auth",
  "/api/health",
  "/api/signup",
  // signup form dropdowns (sections/boards/grades) load pre-auth
  "/api/curriculum",
];

function isPublic(pathname: string): boolean {
  if (PUBLIC_PATHS.includes(pathname)) return true;
  return PUBLIC_PREFIXES.some((p) => pathname.startsWith(p));
}

export default auth(async (req) => {
  const { pathname } = req.nextUrl;

  if (isPublic(pathname)) return NextResponse.next();

  const user = req.auth?.user;
  if (!user) {
    const url = new URL("/login", req.url);
    return NextResponse.redirect(url);
  }

  if (user.jti) {
    const revoked = await cacheExists(`sess:revoke:${user.jti}`);
    if (revoked) {
      const url = new URL("/login?revoked=1", req.url);
      return NextResponse.redirect(url);
    }
  }

  if (user.role === "student") {
    if (user.status !== "approved" && pathname !== "/pending") {
      return NextResponse.redirect(new URL("/pending", req.url));
    }
    if (pathname.startsWith("/admin")) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  if (pathname.startsWith("/admin")) {
    if (user.role !== "admin" && user.role !== "super_admin") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static, _next/image, favicon.ico, public/
     * - api routes already protected at handler level
     */
    "/((?!_next/static|_next/image|favicon.ico|icon.svg|apple-icon|opengraph-image|twitter-image|robots.txt|sitemap.xml|public/|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|woff2?|ttf|otf|mp4|webm|pdf)).*)",
  ],
};
