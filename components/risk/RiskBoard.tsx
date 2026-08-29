"use client";

import Link from "next/link";
import { ShieldAlert, Eye, Bug, Camera, Leaf } from "lucide-react";
import { useSimulation } from "@/lib/SimulationContext";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { DSV_THRESHOLD, PEST_THRESHOLD, isZoneFlagged } from "@/lib/risk";
import { Panel } from "../ui/Panel";
import { Badge } from "../ui/Badge";

function barColor(pct: number) {
  if (pct >= 100) return "#ff2d2d";
  if (pct >= 65) return "#ffcc00";
  return "#67cf00";
}

function RiskBar({ label, value, threshold, unit }: { label: string; value: number; threshold: number; unit: string }) {
  const pct = Math.min(130, (value / threshold) * 100);
  const color = barColor(pct);
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between text-[11px] font-mono">
        <span className="font-bold uppercase tracking-wider">{label}</span>
        <span style={{ color }}>
          {value.toFixed(0)} / {threshold} {unit}
        </span>
      </div>
      <div className="h-4 border-[3px] border-ink bg-paper-dim relative overflow-hidden">
        <div className="h-full transition-all" style={{ width: `${Math.min(100, pct)}%`, background: color }} />
        <div className="absolute top-0 bottom-0 border-l-2 border-ink" style={{ left: "76.9%" }} />
      </div>
    </div>
  );
}

export function RiskBoard() {
  const { state } = useSimulation();
  const { t } = useLanguage();
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <ShieldAlert size={22} /> {t("risk.title")}
        </h2>
        <p className="text-sm text-shell-invert/60 font-mono mt-1">{t("risk.subtitle")}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {state.zones.map((z) => {
          const flagged = isZoneFlagged(z);
          return (
            <Panel key={z.id} accent={flagged ? "danger" : "ink"} className="p-4 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm">{t(`zone.${z.id}.label`)}</h4>
                {flagged ? <Badge tone="danger">{t("risk.scoutZone")}</Badge> : <Badge tone="nominal">{t("risk.clear")}</Badge>}
              </div>
              <RiskBar label={t("risk.diseaseSeverity")} value={z.dsv} threshold={DSV_THRESHOLD} unit="DSV" />
              <RiskBar label={t("risk.pestDegreeDays")} value={z.pestDD} threshold={PEST_THRESHOLD} unit="DD" />
              {flagged && (
                <div className="border-t-[3px] border-ink pt-3 -mx-4 -mb-4 px-4 pb-4 bg-danger/10">
                  <p className="text-[11px] font-mono text-ink/70 mb-2">{t("risk.riskThresholdReached")}</p>
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href="/dashboard/pest-id"
                      className="inline-flex items-center gap-1.5 bg-ink text-paper border-[3px] border-ink px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider shadow-[3px_3px_0_var(--shadow-danger)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_var(--shadow-danger)] transition-transform"
                    >
                      <Camera size={12} /> {t("risk.scanForPest")}
                    </Link>
                    <Link
                      href="/dashboard/nutrient"
                      className="inline-flex items-center gap-1.5 bg-paper text-ink border-[3px] border-ink px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider shadow-[3px_3px_0_#000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_#000] transition-transform"
                    >
                      <Leaf size={12} /> {t("risk.scanForDeficiency")}
                    </Link>
                  </div>
                </div>
              )}
            </Panel>
          );
        })}
      </div>

      <Panel className="p-5" accent="purple">
        <h3 className="text-sm font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
          <Eye size={16} /> {t("risk.whatsBeingWatched")}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono text-ink/70">
          <p>
            <span className="font-bold text-purple-3">{t("risk.diseaseWatchedLabel")}</span> {t("risk.diseaseWatchedBody")}
          </p>
          <p>
            <span className="font-bold text-purple-3 inline-flex items-center gap-1.5">
              <Bug size={14} /> {t("risk.pestWatchedLabel")}
            </span>{" "}
            {t("risk.pestWatchedBody")}
          </p>
        </div>
      </Panel>
    </div>
  );
}
