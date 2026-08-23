"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function NavAuthButtons() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div className="h-8 w-20 animate-pulse rounded bg-muted" />;
  }

  if (session?.user) {
    return (
      <div className="flex items-center space-x-3">
        <Link href="/admin">
          <Button variant="outline" size="sm">
            Dashboard ({session.user.role})
          </Button>
        </Link>
        <Button variant="ghost" size="sm" onClick={() => signOut({ callbackUrl: "/login" })}>
          Logout
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <Link href="/login">
        <Button variant="ghost" size="sm">Login</Button>
      </Link>
      <Link href="/register">
        <Button size="sm">Register</Button>
      </Link>
    </div>
  );
}
