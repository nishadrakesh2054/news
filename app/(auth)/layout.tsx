import type { ReactNode } from "react";
import Link from "next/link";
import { SITE_CONFIG } from "@/constants/site";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 px-4 py-12">
      <Link
        href="/"
        className="mb-8 text-center text-2xl font-black tracking-tight text-[#0C4EA0] hover:opacity-90"
      >
        {SITE_CONFIG.name}
      </Link>
      {children}
    </div>
  );
}
