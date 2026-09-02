"use client";

import { RefreshCw } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

type AdminPageShellProps = {
  title: string;
  icon?: LucideIcon;
  description?: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  actions?: React.ReactNode;
  children: React.ReactNode;
};

export function AdminPageShell({
  title,
  icon: Icon,
  description,
  onRefresh,
  isRefreshing,
  actions,
  children,
}: AdminPageShellProps) {
  return (
    <div className="w-full space-y-3 px-6 py-2 pb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-2">
        <div>
          <h1 className="text-lg font-bold tracking-tight text-foreground font-serif flex items-center gap-2">
            {Icon ? <Icon className="h-5 w-5 text-[#027081]" /> : null}
            <span>{title}</span>
          </h1>
          {description ? <p className="text-xs text-muted-foreground mt-0.5">{description}</p> : null}
        </div>
        <div className="flex items-center gap-2">
          {onRefresh ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onRefresh}
              className="h-8 px-2.5 text-xs rounded-lg"
            >
              <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isRefreshing ? "animate-spin text-[#027081]" : ""}`} />
              Refresh
            </Button>
          ) : null}
          {actions}
        </div>
      </div>
      {children}
    </div>
  );
}
