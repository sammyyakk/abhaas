"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, Bell, FlaskConical, Droplets, ShieldAlert, HeartPulse, Bug, Wheat, Leaf, AlertTriangle } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export const DASHBOARD_TABS = [
  { href: "/dashboard/twin", labelKey: "nav.twinView", icon: LayoutGrid },
  { href: "/dashboard/advisories", labelKey: "nav.advisories", icon: Bell },
  { href: "/dashboard/sandbox", labelKey: "nav.sandbox", icon: FlaskConical },
  { href: "/dashboard/ledger", labelKey: "nav.waterLedger", icon: Droplets },
  { href: "/dashboard/harvest", labelKey: "nav.harvest", icon: Wheat },
  { href: "/dashboard/risk", labelKey: "nav.riskBoard", icon: ShieldAlert },
  { href: "/dashboard/health", labelKey: "nav.healthMonitor", icon: HeartPulse },
  { href: "/dashboard/pest-id", labelKey: "nav.pestId", icon: Bug },
  { href: "/dashboard/nutrient", labelKey: "nav.nutrientAi", icon: Leaf },
];

export function DashboardNav() {
  const pathname = usePathname();
  const { t } = useLanguage();

  return (
    <nav className="sticky top-0 z-30 bg-shell border-b-[3px] border-green-1">
      <div className="bg-warn text-ink border-b-[3px] border-ink px-3 py-1.5 flex items-center justify-center gap-1.5 text-center">
        <AlertTriangle size={13} className="shrink-0" />
        <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider">{t("disclaimer.simulationOnly")}</span>
      </div>
      <div className="overflow-x-auto">
        <div className="flex min-w-max mx-auto max-w-6xl px-2">
          {DASHBOARD_TABS.map((tab) => {
            const isActive = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`px-4 md:px-5 py-3 text-xs md:text-sm font-bold uppercase tracking-wider border-r-[3px] border-shell whitespace-nowrap transition-colors flex items-center gap-2 ${
                  isActive
                    ? "bg-green-1 text-ink"
                    : "bg-shell text-shell-invert/70 hover:text-shell-invert hover:bg-shell-invert/10"
                }`}
              >
                <tab.icon size={16} />
                {t(tab.labelKey)}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
