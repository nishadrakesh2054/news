import Link from "next/link";
import { NavAuthButtons } from "@/components/web/NavAuthButtons";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-xl font-bold tracking-tight text-primary">DAILY NEWS</span>
        </Link>
        
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          <Link href="/" className="transition-colors hover:text-foreground/80 text-foreground">Home</Link>
          <Link href="/#world" className="transition-colors hover:text-foreground/80 text-foreground/60">World</Link>
          <Link href="/#tech" className="transition-colors hover:text-foreground/80 text-foreground/60">Technology</Link>
          <Link href="/#business" className="transition-colors hover:text-foreground/80 text-foreground/60">Business</Link>
        </nav>

        <NavAuthButtons />
      </div>
    </header>
  );
}
