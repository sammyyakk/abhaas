"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, Bell, FlaskConical, Droplets, ShieldAlert, HeartPulse, Bug } from "lucide-react";

export const DASHBOARD_TABS = [
  { href: "/dashboard/twin", label: "Twin View", icon: LayoutGrid },
  { href: "/dashboard/advisories", label: "Advisories", icon: Bell },
  { href: "/dashboard/sandbox", label: "Sandbox", icon: FlaskConical },
  { href: "/dashboard/ledger", label: "Water Ledger", icon: Droplets },
  { href: "/dashboard/risk", label: "Risk Board", icon: ShieldAlert },
  { href: "/dashboard/health", label: "Health Monitor", icon: HeartPulse },
  { href: "/dashboard/pest-id", label: "Pest ID", icon: Bug },
];

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-30 bg-shell border-b-[3px] border-green-1 overflow-x-auto">
      <div className="flex min-w-max mx-auto max-w-6xl px-2">
        {DASHBOARD_TABS.map((t) => {
          const isActive = pathname === t.href;
          return (
            <Link
              key={t.href}
              href={t.href}
              className={`px-4 md:px-5 py-3 text-xs md:text-sm font-bold uppercase tracking-wider border-r-[3px] border-shell whitespace-nowrap transition-colors flex items-center gap-2 ${
                isActive
                  ? "bg-green-1 text-ink"
                  : "bg-shell text-shell-invert/70 hover:text-shell-invert hover:bg-shell-invert/10"
              }`}
            >
              <t.icon size={16} />
              {t.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
