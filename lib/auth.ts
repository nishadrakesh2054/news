import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { checkRateLimit, getClientIpFromHeaders } from "@/lib/rate-limit";

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

        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user || !user.password) {
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
          role: user.role,
          sessionVersion: user.sessionVersion,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role as Role;
        token.sessionVersion =
          "sessionVersion" in user && typeof user.sessionVersion === "number"
            ? user.sessionVersion
            : 0;
        return token;
      }

      if (!token.id) return token;

      // Refresh role + sessionVersion from DB (invalidates demoted / password-reset sessions)
      const dbUser = await prisma.user.findUnique({
        where: { id: token.id as string },
        select: { role: true, sessionVersion: true },
      });

      if (!dbUser) {
        return { ...token, id: undefined, role: undefined, sessionVersion: -1 };
      }

      if (
        typeof token.sessionVersion === "number" &&
        token.sessionVersion !== dbUser.sessionVersion
      ) {
        return { ...token, id: undefined, role: undefined, sessionVersion: -1 };
      }

      token.role = dbUser.role;
      token.sessionVersion = dbUser.sessionVersion;
      return token;
    },
    async session({ session, token }) {
      if (!token.id || token.sessionVersion === -1) {
        // Force clients to treat session as unauthenticated
        return {
          ...session,
          expires: new Date(0).toISOString(),
          user: {
            id: "",
            role: Role.READER,
            name: null,
            email: null,
            image: null,
          },
        };
      }
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
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
