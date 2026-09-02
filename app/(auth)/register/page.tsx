"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { MESSAGES } from "@/constants/messages";
import { PASSWORD_MIN_LENGTH } from "@/lib/password-policy";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        const err = data.error || MESSAGES.AUTH.REGISTER_ERROR;
        setError(err);
        toast.error(err);
      } else {
        toast.success(MESSAGES.AUTH.REGISTER_SUCCESS);
        router.push("/login?registered=true");
      }
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
        <h1 className="text-2xl font-bold tracking-tight">Create account</h1>
        <p className="text-sm text-muted-foreground">Register to comment and subscribe</p>
      </div>

      {error ? (
        <div role="alert" className="rounded-lg bg-destructive/10 p-3 text-sm font-medium text-destructive">
          {error}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="space-y-2">
          <label htmlFor="register-name" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Full name
          </label>
          <input
            id="register-name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="register-email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Email address
          </label>
          <input
            id="register-email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="register-password" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Password
          </label>
          <input
            id="register-password"
            type="password"
            required
            minLength={PASSWORD_MIN_LENGTH}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
          />
          <p className="text-xs text-muted-foreground">At least {PASSWORD_MIN_LENGTH} characters</p>
        </div>

        <Button type="submit" className="w-full" disabled={loading} aria-busy={loading}>
          {loading ? "Creating account..." : "Register"}
        </Button>
      </form>

      <div className="text-center text-xs text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-primary hover:underline">
          Sign in
        </Link>
      </div>
    </main>
  );
}
