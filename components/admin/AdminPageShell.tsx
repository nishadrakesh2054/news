"use client";

import { RefreshCw } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  adminBtnSecondary,
  adminPageContainer,
  adminPageDescription,
  adminPageHeader,
  adminPageTitle,
} from "@/constants/admin-layout";

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
  description,
  onRefresh,
  isRefreshing,
  actions,
  children,
}: AdminPageShellProps) {
  return (
    <div className={adminPageContainer}>
      <header className={adminPageHeader}>
        <div>
          <h1 className={adminPageTitle}>{title}</h1>
          {description ? (
            <p className={adminPageDescription}>{description}</p>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          {onRefresh ? (
            <button
              type="button"
              onClick={onRefresh}
              className={adminBtnSecondary}
            >
              <RefreshCw
                className={`h-3 w-3 ${isRefreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          ) : null}
          {actions}
        </div>
      </header>
      {children}
    </div>
  );
}
