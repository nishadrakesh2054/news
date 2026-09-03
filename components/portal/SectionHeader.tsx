import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { PORTAL } from "@/constants/portal";

type SectionHeaderProps = {
  title: string;
  href?: string;
  linkLabel?: string;
  accent?: "brand" | "accent";
  className?: string;
};

export function SectionHeader({
  title,
  href,
  linkLabel,
  accent = "accent",
  className = "",
}: SectionHeaderProps) {
  const color = accent === "brand" ? PORTAL.brand : PORTAL.accent;
  return (
    <div
      className={`mb-4 flex items-end justify-between gap-3 border-b-2 pb-2 ${className}`}
      style={{ borderColor: color }}
    >
      <h2 className="text-lg font-extrabold tracking-tight text-gray-900 sm:text-xl">{title}</h2>
      {href ? (
        <Link
          href={href}
          className="inline-flex shrink-0 items-center gap-0.5 text-xs font-bold hover:underline"
          style={{ color: PORTAL.brand }}
        >
          {linkLabel ?? "सबै"}
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      ) : null}
    </div>
  );
}

export function PortalContainer({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`${PORTAL.container} ${className}`}>{children}</div>;
}
