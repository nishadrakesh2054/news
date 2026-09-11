import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { resolveLanguageFromRequest } from "@/lib/language";
import { SITE_LANG_HEADER } from "@/lib/seo";
import { resolvePublicRedirect } from "@/lib/redirects";

const STAFF_ROLES = new Set<Role>([
  Role.SUPER_ADMIN,
  Role.ADMIN,
  Role.EDITOR,
  Role.AUTHOR,
]);

function withLangHeader(request: NextRequest, response: NextResponse) {
  const lang = resolveLanguageFromRequest(request);
  response.headers.set(SITE_LANG_HEADER, lang);
  return response;
}

function nextWithLang(request: NextRequest) {
  const lang = resolveLanguageFromRequest(request);
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(SITE_LANG_HEADER, lang);
  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

function buildRedirectUrl(request: NextRequest, destination: string): URL {
  if (/^https?:\/\//i.test(destination)) {
    return new URL(destination);
  }
  const target = new URL(destination, request.url);
  // Preserve original query params when target has none
  if (!target.search && request.nextUrl.search) {
    target.search = request.nextUrl.search;
  }
  return target;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAdminPath =
    pathname.startsWith("/admin") || pathname.startsWith("/api/admin");

  // Public CMS redirects (301) — skip admin/API
  if (!isAdminPath) {
    try {
      const destination = await resolvePublicRedirect(pathname);
      if (destination) {
        const target = buildRedirectUrl(request, destination);
        // Avoid redirecting to the exact same URL
        if (
          target.pathname !== pathname ||
          target.origin !== request.nextUrl.origin ||
          target.search !== request.nextUrl.search
        ) {
          return withLangHeader(
            request,
            NextResponse.redirect(target, 301)
          );
        }
      }
    } catch {
      // Fail open — never block the site if redirect lookup fails
    }
    return nextWithLang(request);
  }

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const role = token?.role as Role | undefined;
  const isStaff = role !== undefined && STAFF_ROLES.has(role);

  if (pathname.startsWith("/api/admin")) {
    if (!isStaff) {
      return withLangHeader(
        request,
        NextResponse.json(
          { success: false, error: "Unauthorized: Staff access required" },
          { status: 401 }
        )
      );
    }
    if (
      Boolean(token?.mustChangePassword) &&
      pathname !== "/api/admin/account/profile" &&
      !(pathname === "/api/admin/media" && request.method === "POST")
    ) {
      return withLangHeader(
        request,
        NextResponse.json(
          {
            success: false,
            error: "You must change your password before continuing",
            code: "MUST_CHANGE_PASSWORD",
          },
          { status: 403 }
        )
      );
    }
    return nextWithLang(request);
  }

  if (!isStaff) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return withLangHeader(request, NextResponse.redirect(loginUrl));
  }

  if (
    Boolean(token?.mustChangePassword) &&
    pathname !== "/admin/account/profile"
  ) {
    const profileUrl = new URL("/admin/account/profile", request.url);
    profileUrl.searchParams.set("forcePassword", "1");
    return withLangHeader(request, NextResponse.redirect(profileUrl));
  }

  return nextWithLang(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map|xml|txt)$).*)",
  ],
};
