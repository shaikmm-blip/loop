"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Infinity as InfinityIcon, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./theme";

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("group flex items-center gap-1.5", className)}>
      <span className="grid h-7 w-7 place-items-center rounded-lg bg-[#0A0A0F] text-white shadow-[0_4px_14px_-4px_rgba(99,102,241,0.7)] transition-transform group-hover:rotate-180 duration-500">
        <InfinityIcon className="h-4 w-4" strokeWidth={2.5} />
      </span>
      <span className="text-[19px] font-semibold tracking-tight">loop</span>
    </Link>
  );
}

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/new", label: "New chat" },
  { href: "/map", label: "Network Map" },
];

export function AppNav() {
  const path = usePathname();
  return (
    <header className="sticky top-0 z-40 border-b border-black/[0.06] glass">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-6">
          <Logo />
          <nav className="hidden items-center gap-1 sm:flex">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                  path?.startsWith(l.href) ? "bg-black/[0.05] text-[#0A0A0F]" : "text-neutral-500 hover:text-[#0A0A0F]"
                )}
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link href="/new" className="btn-primary !px-3.5 !py-2">
            <Plus className="h-4 w-4" /> <span className="hidden sm:inline">Log a coffee chat</span>
          </Link>
        </div>
      </div>
      <nav className="flex items-center gap-1 overflow-x-auto px-4 pb-2 sm:hidden">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={cn(
              "whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium",
              path?.startsWith(l.href) ? "bg-black/[0.05]" : "text-neutral-500"
            )}
          >
            {l.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
