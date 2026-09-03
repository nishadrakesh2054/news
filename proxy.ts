import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
import { Role } from "@prisma/client";

const STAFF_ROLES = new Set<Role>([Role.ADMIN, Role.EDITOR, Role.AUTHOR]);

export async function proxy(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const role = token?.role as Role | undefined;
  const isStaff = role !== undefined && STAFF_ROLES.has(role);

  if (request.nextUrl.pathname.startsWith("/api/admin")) {
    if (!isStaff) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Staff access required" },
        { status: 401 }
      );
    }
    return NextResponse.next();
  }

  if (!isStaff) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/api/admin/:path*"],
};
