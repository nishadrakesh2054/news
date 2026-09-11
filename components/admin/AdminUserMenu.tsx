"use client";

import { signOut, useSession } from "next-auth/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { MESSAGES } from "@/constants/messages";
import { optimizeCloudinaryUrl } from "@/lib/cloudinary-url";

function initials(name?: string | null) {
  const parts = (name || "?").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

export function AdminUserMenu() {
  const { data: session } = useSession();

  if (!session?.user) return null;

  const handleLogout = () => {
    toast.info(MESSAGES.AUTH.LOGOUT_SUCCESS);
    signOut({ callbackUrl: "/login" });
  };

  const avatar =
    optimizeCloudinaryUrl(session.user.image, "avatar") ?? session.user.image;

  return (
    <div className="flex items-center space-x-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border/70 bg-muted text-[10px] font-semibold text-muted-foreground">
        {avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatar} alt="" className="h-full w-full object-cover" />
        ) : (
          <span aria-hidden>{initials(session.user.name)}</span>
        )}
      </div>
      <div className="hidden flex-col text-right sm:flex">
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
