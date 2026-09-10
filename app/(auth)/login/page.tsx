"use client";

import { Suspense, useState } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Role } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { MESSAGES } from "@/constants/messages";

const STAFF_ROLES: Role[] = [Role.ADMIN, Role.EDITOR, Role.AUTHOR];

function safeCallbackPath(raw: string | null): string | null {
  if (!raw) return null;
  // Only allow same-origin relative paths (block open redirects).
  if (!raw.startsWith("/") || raw.startsWith("//")) return null;
  return raw;
}

async function waitForSession(retries = 5) {
  for (let i = 0; i < retries; i++) {
    const session = await getSession();
    if (session?.user?.id) return session;
    await new Promise((r) => setTimeout(r, 100));
  }
  return getSession();
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const callbackPath = safeCallbackPath(searchParams.get("callbackUrl"));

      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        const err = MESSAGES.AUTH.LOGIN_ERROR;
        setError(err);
        toast.error(err);
        return;
      }

      toast.success(MESSAGES.AUTH.LOGIN_SUCCESS);
      const session = await waitForSession();
      const role = session?.user?.role as Role | undefined;
      const isStaff = Boolean(role && STAFF_ROLES.includes(role));

      if (!isStaff) {
        const err = "This account does not have admin access.";
        setError(err);
        toast.error(err);
        return;
      }

      const nextPath =
        callbackPath && (callbackPath === "/admin" || callbackPath.startsWith("/admin/"))
          ? callbackPath
          : "/admin";

      router.replace(nextPath);
      router.refresh();
    } catch {
      const err = MESSAGES.SYSTEM.SERVER_ERROR;
      setError(err);
      toast.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main id="main-content" className="w-full max-w-md space-y-6 rounded-2xl border bg-card p-8 shadow-sm">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Sign in</h1>
        <p className="text-sm text-muted-foreground">Staff and reader accounts</p>
      </div>

      {error ? (
        <div
          role="alert"
          aria-live="polite"
          className="rounded-lg bg-destructive/10 p-3 text-sm font-medium text-destructive"
        >
          {error}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="space-y-2">
          <label htmlFor="login-email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Email address
          </label>
          <input
            id="login-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="login-password" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Password
            </label>
            <Link href="/forgot-password" className="text-xs font-medium text-primary hover:underline">
              Forgot password?
            </Link>
          </div>
          <input
            id="login-password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
          />
        </div>

        <Button type="submit" className="w-full" disabled={loading} aria-busy={loading}>
          {loading ? "Signing in..." : "Sign in"}
        </Button>
      </form>

      <div className="text-center text-xs text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-semibold text-primary hover:underline">
          Register
        </Link>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<main className="w-full max-w-md rounded-2xl border bg-card p-8 text-sm text-muted-foreground">Loading…</main>}>
      <LoginForm />
    </Suspense>
  );
}
