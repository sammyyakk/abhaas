"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, Bell, FlaskConical, Droplets, ShieldAlert, HeartPulse, Bug, Wheat, Leaf, AlertTriangle } from "lucide-react";

export const DASHBOARD_TABS = [
  { href: "/dashboard/twin", label: "Twin View", icon: LayoutGrid },
  { href: "/dashboard/advisories", label: "Advisories", icon: Bell },
  { href: "/dashboard/sandbox", label: "Sandbox", icon: FlaskConical },
  { href: "/dashboard/ledger", label: "Water Ledger", icon: Droplets },
  { href: "/dashboard/harvest", label: "Harvest", icon: Wheat },
  { href: "/dashboard/risk", label: "Risk Board", icon: ShieldAlert },
  { href: "/dashboard/health", label: "Health Monitor", icon: HeartPulse },
  { href: "/dashboard/pest-id", label: "Pest ID", icon: Bug },
  { href: "/dashboard/nutrient", label: "Nutrient AI", icon: Leaf },
];

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-30 bg-shell border-b-[3px] border-green-1">
      <div className="bg-warn text-ink border-b-[3px] border-ink px-3 py-1.5 flex items-center justify-center gap-1.5 text-center">
        <AlertTriangle size={13} className="shrink-0" />
        <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider">
          Simulation only, not the complete project: all sensor data, hardware, and control loops shown here are
          modelled, not live.
        </span>
      </div>
      <div className="overflow-x-auto">
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
      </div>
    </nav>
  );
}
