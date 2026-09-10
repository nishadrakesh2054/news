import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { PORTAL } from "@/constants/portal";

type SectionHeaderProps = {
  title: string;
  href?: string;
  linkLabel?: string;
  className?: string;
};

/** Title — thin rule — more link (matches प्रदेश समाचार). */
export function SectionHeader({
  title,
  href,
  linkLabel = "थप समाचार",
  className = "",
}: SectionHeaderProps) {
  return (
    <div className={`mb-4 flex items-center gap-3 ${className}`}>
      <h2 className="portal-section-title shrink-0" style={{ color: PORTAL.brand }}>
        {title}
      </h2>
      <div
        className="h-px min-w-4 flex-1"
        style={{ backgroundColor: PORTAL.accent, opacity: 0.35 }}
      />
      {href ? (
        <Link
          href={href}
          className="inline-flex shrink-0 items-center gap-0.5 text-sm font-bold whitespace-nowrap hover:underline sm:text-base"
          style={{ color: PORTAL.brand }}
        >
          {linkLabel}
          <ChevronRight className="h-4 w-4" />
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
