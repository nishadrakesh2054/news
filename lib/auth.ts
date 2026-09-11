import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { checkRateLimit, getClientIpFromHeaders } from "@/lib/rate-limit";

/** Re-check role / sessionVersion from DB (was 60s — too long after demotion). */
const JWT_REFRESH_MS = 5_000;

async function clientIpFromHeaders(): Promise<string> {
  try {
    const h = await headers();
    return getClientIpFromHeaders(h);
  } catch {
    return "unknown";
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing email or password");
        }

        const email = credentials.email.trim().toLowerCase();
        const ip = await clientIpFromHeaders();
        const ipLimit = checkRateLimit(`login:ip:${ip}`, 20, 15 * 60 * 1000);
        const emailLimit = checkRateLimit(`login:email:${email}`, 10, 15 * 60 * 1000);
        if (!ipLimit.allowed || !emailLimit.allowed) {
          throw new Error("Too many login attempts. Please try again later.");
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email },
          });

          if (!user || !user.password) {
            throw new Error("Invalid credentials");
          }

          if (user.isActive === false) {
            throw new Error("Invalid credentials");
          }

          const isValidPassword = await bcrypt.compare(credentials.password, user.password);

          if (!isValidPassword) {
            throw new Error("Invalid credentials");
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            role: user.role,
            sessionVersion: user.sessionVersion,
            mustChangePassword: user.mustChangePassword,
          };
        } catch (err) {
          if (
            err instanceof Error &&
            (err.message === "Invalid credentials" ||
              err.message === "Too many login attempts. Please try again later.")
          ) {
            throw err;
          }
          console.error(
            "[auth] authorize failed",
            err instanceof Error ? err.message : String(err)
          );
          throw new Error("Database unavailable. Please try again.");
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id;
        token.role = user.role as Role;
        token.picture = user.image ?? undefined;
        token.name = user.name;
        token.email = user.email;
        token.sessionVersion =
          "sessionVersion" in user && typeof user.sessionVersion === "number"
            ? user.sessionVersion
            : 0;
        token.mustChangePassword = Boolean(
          "mustChangePassword" in user && user.mustChangePassword
        );
        token.roleCheckedAt = Date.now();
        return token;
      }

      if (!token.id) return token;

      const lastRefresh = typeof token.roleCheckedAt === "number" ? token.roleCheckedAt : 0;
      const now = Date.now();
      const mustRefresh =
        trigger === "update" ||
        token.mustChangePassword ||
        now - lastRefresh >= JWT_REFRESH_MS ||
        !token.role ||
        typeof token.sessionVersion !== "number" ||
        token.sessionVersion < 0;

      if (!mustRefresh) {
        return token;
      }

      try {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: {
            role: true,
            sessionVersion: true,
            mustChangePassword: true,
            name: true,
            email: true,
            image: true,
            isActive: true,
          },
        });

        if (!dbUser || dbUser.isActive === false) {
          return {
            ...token,
            id: undefined,
            role: undefined,
            sessionVersion: -1,
            mustChangePassword: false,
          };
        }

        if (
          typeof token.sessionVersion === "number" &&
          token.sessionVersion !== dbUser.sessionVersion
        ) {
          return {
            ...token,
            id: undefined,
            role: undefined,
            sessionVersion: -1,
            mustChangePassword: false,
          };
        }

        // Always trust DB for profile fields (ignore client session.update payload).
        token.role = dbUser.role;
        token.sessionVersion = dbUser.sessionVersion;
        token.mustChangePassword = dbUser.mustChangePassword;
        token.name = dbUser.name;
        token.email = dbUser.email;
        token.picture = dbUser.image ?? undefined;
        token.roleCheckedAt = now;
        return token;
      } catch (err) {
        console.error("[auth] jwt role refresh failed", err instanceof Error ? err.message : err);
        // Fail closed for privileged sessions if we cannot re-validate.
        return {
          ...token,
          id: undefined,
          role: undefined,
          sessionVersion: -1,
          mustChangePassword: false,
        };
      }
    },
    async session({ session, token }) {
      if (!token.id || token.sessionVersion === -1) {
        return {
          ...session,
          expires: new Date(0).toISOString(),
          user: {
            id: "",
            role: Role.READER,
            name: null,
            email: null,
            image: null,
            mustChangePassword: false,
          },
        };
      }
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
        session.user.mustChangePassword = Boolean(token.mustChangePassword);
        session.user.name = (token.name as string | null | undefined) ?? session.user.name;
        session.user.email =
          (token.email as string | null | undefined) ?? session.user.email;
        session.user.image =
          (token.picture as string | null | undefined) ?? session.user.image;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60,
  },
  cookies: {
    sessionToken: {
      name:
        process.env.NODE_ENV === "production"
          ? `__Secure-next-auth.session-token`
          : `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
