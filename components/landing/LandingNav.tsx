"use client";

import Link from "next/link";
import { Sprout, ArrowRight } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

export function LandingNav() {
  return (
    <nav className="sticky top-0 z-40 flex items-center justify-between border-b-[3px] border-green-1 bg-shell/90 backdrop-blur px-4 md:px-8 py-3">
      <span className="flex items-center gap-2">
        <Sprout size={18} className="text-green-1 shrink-0" />
        <span className="font-wordmark text-lg md:text-xl">
          <span className="text-green-1">ABH</span>
          <span className="text-purple-1">AAS</span>
        </span>
      </span>
      <div className="flex items-center gap-3 md:gap-5">
        <ThemeToggle />
        <Link
          href="/dashboard/twin"
          className="bg-green-1 text-ink border-[3px] border-shell-invert px-3 md:px-4 py-1.5 md:py-2 text-[11px] md:text-xs font-bold uppercase tracking-widest shadow-[3px_3px_0_var(--shadow-ink)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_var(--shadow-ink)] transition-transform flex items-center gap-1.5"
        >
          Enter Twin <ArrowRight size={14} />
        </Link>
      </div>
    </nav>
  );
}
