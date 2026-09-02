import Link from "next/link";
import { ArrowLeft, Construction } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AdminNavStatus } from "@/constants/admin-navigation";

type AdminPlaceholderProps = {
  title: string;
  description: string;
  status: AdminNavStatus;
  apiRoute?: string;
  models?: string[];
  backHref?: string;
  backLabel?: string;
};

const STATUS_LABELS: Record<AdminNavStatus, string> = {
  live: "Live",
  partial: "Partial",
  planned: "Planned",
};

const STATUS_STYLES: Record<AdminNavStatus, string> = {
  live: "bg-emerald-50 text-emerald-700 border-emerald-200",
  partial: "bg-amber-50 text-amber-700 border-amber-200",
  planned: "bg-slate-100 text-slate-600 border-slate-200",
};

export function AdminPlaceholder({
  title,
  description,
  status,
  apiRoute,
  models = [],
  backHref = "/admin",
  backLabel = "Back to dashboard",
}: AdminPlaceholderProps) {
  return (
    <div className="mx-auto max-w-3xl space-y-6 px-6 py-8">
      <Link href={backHref}>
        <Button variant="ghost" className="h-8 gap-2 px-2 text-xs text-muted-foreground">
          <ArrowLeft className="h-3.5 w-3.5" />
          {backLabel}
        </Button>
      </Link>

      <div className="rounded-xl border bg-card p-8 shadow-sm space-y-5">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#0C4EA0]/10 text-[#0C4EA0]">
            <Construction className="h-6 w-6" />
          </div>
          <div className="space-y-2 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight">{title}</h1>
              <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${STATUS_STYLES[status]}`}>
                {STATUS_LABELS[status]}
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border bg-muted/30 p-4 space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Planned API</p>
            <p className="font-mono text-xs text-foreground">{apiRoute ?? "Not defined yet"}</p>
          </div>
          <div className="rounded-lg border bg-muted/30 p-4 space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Data models</p>
            <p className="text-xs text-foreground">{models.length > 0 ? models.join(", ") : "TBD"}</p>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          Dashboard and API work is in progress. Public frontend routes are deferred.
        </p>
      </div>
    </div>
  );
}
