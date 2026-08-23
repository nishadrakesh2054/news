"use client";

import { signOut, useSession } from "next-auth/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { MESSAGES } from "@/constants/messages";

export function AdminUserMenu() {
  const { data: session } = useSession();

  if (!session?.user) return null;

  const handleLogout = () => {
    toast.info(MESSAGES.AUTH.LOGOUT_SUCCESS);
    signOut({ callbackUrl: "/login" });
  };

  return (
    <div className="flex items-center space-x-3">
      <div className="flex flex-col text-right">
        <span className="text-sm font-semibold">{session.user.name}</span>
        <span className="text-xs text-muted-foreground">{session.user.email}</span>
      </div>
      <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary uppercase">
        {session.user.role}
      </span>
      <Button variant="outline" size="sm" onClick={handleLogout}>
        Sign Out
      </Button>
    </div>
  );
}
