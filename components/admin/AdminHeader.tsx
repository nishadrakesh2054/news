"use client";

import { useState } from "react";
// import Image from "next/image";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { toast } from "sonner";
import { Search, Bell, LogOut, ChevronDown } from "lucide-react";
import { MESSAGES } from "@/constants/messages";

export function AdminHeader() {
  const { data: session } = useSession();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    toast.info(MESSAGES.AUTH.LOGOUT_SUCCESS);
    signOut({ callbackUrl: "/login" });
  };

  const userInitials = session?.user?.name
    ? session.user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "NN";

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between bg-[#027081] px-6 py-2 text-white select-none">
      {/* Top Left Text Logo */}
      <div className="flex items-center space-x-3">
        <Link href="/admin" className="flex items-center group">
          <span className="font-extrabold text-base tracking-widest uppercase text-white hover:text-white/90 transition-colors">
            ADMIN LOGO
          </span>
        </Link>
      </div>

      {/* Center Search Bar */}
      <div className="hidden md:flex flex-1 max-w-lg mx-8 items-center">
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/70" />
          <input
            type="text"
            placeholder="Search articles, categories, users..."
            className="w-full rounded-lg border border-white/20 bg-white/10 pl-10 pr-10 py-2 text-xs placeholder:text-white/70 outline-none transition-all duration-200"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 rounded border border-white/30 bg-white/20 px-1.5 py-0.5 text-xs font-mono font-medium text-white/90">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-3">
        {/* Notifications Icon */}
        <button
          className="relative flex h-9 w-9 items-center justify-center rounded-full border border-white/30 text-white hover:bg-white/15 transition-all"
          title="Notifications"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-emerald-400 ring-2 ring-[#027081]" />
        </button>

        {/* Profile Menu Dropdown - Larger Size */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center space-x-2 rounded-full p-0.5 outline-none focus:ring-2 focus:ring-white/30 transition-all"
          >
            <div className="flex h-9.5 w-9.5 items-center justify-center rounded-full bg-white font-extrabold text-sm text-[#027081] shadow-sm">
              {userInitials}
            </div>
            <ChevronDown className="h-4 w-4 text-white/90" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-64 rounded-xl border bg-card p-2 shadow-xl z-50 text-foreground animate-in fade-in-50 zoom-in-95">
              <div className="px-3 py-2.5 border-b">
                <p className="text-sm font-bold">{session?.user?.name}</p>
                <p className="text-xs text-muted-foreground truncate mt-0.5">
                  {session?.user?.email}
                </p>
                <span className="mt-1.5 inline-block rounded bg-[#027081]/10 px-2 py-0.5 text-[10px] font-bold text-[#027081] uppercase">
                  {session?.user?.role}
                </span>
              </div>
              <div className="pt-1">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-2.5 rounded-lg px-3 py-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
