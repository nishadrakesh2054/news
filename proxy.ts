import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { resolveLanguageFromRequest } from "@/lib/language";
import { SITE_LANG_HEADER } from "@/lib/seo";

const STAFF_ROLES = new Set<Role>([Role.ADMIN, Role.EDITOR, Role.AUTHOR]);

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

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAdminPath =
    pathname.startsWith("/admin") || pathname.startsWith("/api/admin");

  if (!isAdminPath) {
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
    return nextWithLang(request);
  }

  if (!isStaff) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return withLangHeader(request, NextResponse.redirect(loginUrl));
  }

  return nextWithLang(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map|xml|txt)$).*)",
  ],
};
