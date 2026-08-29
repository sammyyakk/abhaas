"use client";

import { HeartPulse, Radio, TrendingUp, Wrench, CheckCircle2, AlertTriangle } from "lucide-react";
import { useSimulation } from "@/lib/SimulationContext";
import type { FaultKind, ZoneId } from "@/lib/types";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { resolveParams } from "@/lib/i18n/resolveParams";
import { Panel } from "../ui/Panel";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { formatClock } from "@/lib/format";

const FAULT_LABEL_KEY: Record<FaultKind, string> = {
  stuck: "health.stuckSensor",
  drift: "health.sensorDrift",
  actuator: "health.actuatorFault",
};

const FAULT_ICON: Record<FaultKind, typeof Radio> = {
  stuck: Radio,
  drift: TrendingUp,
  actuator: Wrench,
};

export function FaultFeed() {
  const { state, injectFault, clearFault } = useSimulation();
  const { t } = useLanguage();

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <HeartPulse size={22} /> {t("health.title")}
        </h2>
        <p className="text-sm text-shell-invert/60 font-mono mt-1">{t("health.subtitle")}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {state.zones.map((z) => (
          <Panel key={z.id} accent={z.faultActive ? "danger" : "ink"} className="p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm">{t(`zone.${z.id}.label`)}</h4>
              {z.faultActive ? (
                <Badge tone="danger">{t(FAULT_LABEL_KEY[z.faultActive])}</Badge>
              ) : (
                <Badge tone="nominal">{t("health.healthy")}</Badge>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {(["stuck", "drift", "actuator"] as FaultKind[]).map((kind) => {
                const Icon = FAULT_ICON[kind];
                return (
                  <Button
                    key={kind}
                    tone="danger"
                    className="text-[10px] px-2 py-1.5 flex items-center gap-1.5"
                    disabled={!!z.faultActive}
                    onClick={() => injectFault(z.id as ZoneId, kind)}
                  >
                    <Icon size={12} /> {t("health.inject", { label: t(FAULT_LABEL_KEY[kind]) })}
                  </Button>
                );
              })}
            </div>
            {z.faultActive && (
              <Button
                tone="green"
                className="text-[10px] px-2 py-1.5 flex items-center gap-1.5 self-start"
                onClick={() => clearFault(z.id as ZoneId)}
              >
                <CheckCircle2 size={12} /> {t("health.clearFault")}
              </Button>
            )}
          </Panel>
        ))}
      </div>

      <div>
        <h3 className="text-sm font-bold uppercase tracking-wider text-shell-invert/70 mb-2 flex items-center gap-2">
          <AlertTriangle size={16} /> {t("health.faultChannel")}
        </h3>
        {state.faults.length === 0 ? (
          <Panel className="p-6 text-center">
            <p className="font-mono text-sm text-ink/60">{t("health.noFaultsDetected")}</p>
          </Panel>
        ) : (
          <div className="flex flex-col gap-3">
            {state.faults.map((f) => (
              <div key={f.id} className="bg-ink border-[3px] border-danger p-4">
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <Badge tone="danger">{t("health.fault")}</Badge>
                  <span className="text-[10px] font-mono text-paper/40">@ {formatClock(f.timestamp)}</span>
                </div>
                <p className="font-mono font-bold text-sm text-paper">
                  {t(f.messageKey, resolveParams(t, f.zoneId, f.messageParams))}
                </p>
                <p className="font-mono text-xs text-paper/50 mt-1">
                  {t(f.detailKey, resolveParams(t, f.zoneId, f.detailParams))}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
