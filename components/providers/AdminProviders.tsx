"use client";

import type { Session } from "next-auth";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { QueryProvider } from "@/components/providers/QueryProvider";

export function AdminProviders({
  children,
  session,
}: {
  children: React.ReactNode;
  session: Session | null;
}) {
  return (
    <SessionProvider session={session}>
      <QueryProvider>{children}</QueryProvider>
    </SessionProvider>
  );
}
