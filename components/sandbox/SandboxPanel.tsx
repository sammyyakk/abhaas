"use client";

import { useState } from "react";
import { FlaskConical, SlidersHorizontal, Cpu, Wind } from "lucide-react";
import { useSimulation } from "@/lib/SimulationContext";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import type { SandboxPolicy, SandboxResult } from "@/lib/types";
import { vpdForecastSeries, findBandCrossing } from "@/lib/vpdForecast";
import { Panel } from "../ui/Panel";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { SliderControl } from "../ui/SliderControl";
import { VpdForecastChart } from "../weather/VpdForecastChart";
import { DeltaCard } from "./DeltaCard";

const DEFAULT_POLICY: SandboxPolicy = { irrigationDeltaPct: 0, ventDelayHrs: 0, shadeShiftHrs: 0 };

const COMPUTE_STAGE_KEYS = [
  "sandbox.forkingState",
  "sandbox.simulatingBaseline",
  "sandbox.simulatingWithChange",
  "sandbox.computingDeltas",
];

const COMPUTE_MS = 1800;

export function SandboxPanel() {
  const { state, runSandbox, getOutdoorForecast, liveWeatherActive } = useSimulation();
  const { t } = useLanguage();
  const [policy, setPolicy] = useState<SandboxPolicy>(DEFAULT_POLICY);
  const [result, setResult] = useState<SandboxResult | null>(null);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [running, setRunning] = useState(false);
  const [stage, setStage] = useState(0);
  const [runId, setRunId] = useState(0);

  function run() {
    setRunning(true);
    setResult(null);
    setStage(0);
    setRunId((n) => n + 1);
    const t0 = performance.now();

    let i = 0;
    const interval = setInterval(() => {
      i += 1;
      setStage(i % COMPUTE_STAGE_KEYS.length);
    }, COMPUTE_MS / COMPUTE_STAGE_KEYS.length);

    setTimeout(() => {
      clearInterval(interval);
      const r = runSandbox(policy);
      const t1 = performance.now();
      setResult(r);
      setLatencyMs(t1 - t0);
      setRunning(false);
    }, COMPUTE_MS);
  }

  const forecastSeries = vpdForecastSeries(getOutdoorForecast, state.gddSum);
  const crossing = findBandCrossing(forecastSeries);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <FlaskConical size={22} /> {t("sandbox.title")}
        </h2>
        <p className="text-sm text-shell-invert/60 font-mono mt-1">{t("sandbox.subtitle")}</p>
      </div>

      <Panel className="p-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SliderControl
            label={t("sandbox.irrigationChange")}
            value={policy.irrigationDeltaPct}
            min={-50}
            max={100}
            step={5}
            unit="%"
            onChange={(v) => setPolicy((p) => ({ ...p, irrigationDeltaPct: v }))}
          />
          <SliderControl
            label={t("sandbox.ventDelay")}
            value={policy.ventDelayHrs}
            min={0}
            max={4}
            step={0.5}
            unit="h"
            onChange={(v) => setPolicy((p) => ({ ...p, ventDelayHrs: v }))}
          />
          <SliderControl
            label={t("sandbox.shadeShift")}
            value={policy.shadeShiftHrs}
            min={-2}
            max={2}
            step={0.5}
            unit="h"
            onChange={(v) => setPolicy((p) => ({ ...p, shadeShiftHrs: v }))}
          />
        </div>
        <div className="mt-5 flex items-center gap-3 flex-wrap">
          <Button tone="purple" onClick={run} disabled={running} className="flex items-center gap-2">
            <SlidersHorizontal size={16} /> {t("sandbox.run24h")}
          </Button>
          <Button tone="paper" onClick={() => setPolicy(DEFAULT_POLICY)} disabled={running}>
            {t("common.reset")}
          </Button>
          {latencyMs != null && !running && (
            <span className="text-[11px] font-mono text-ink/50 ml-1">{t("sandbox.computedIn", { ms: latencyMs.toFixed(0) })}</span>
          )}
        </div>
      </Panel>

      <Panel className="p-5" accent="purple">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
          <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2 text-purple-3">
            <Wind size={16} /> {t("sandbox.vpdForecastTitle")}
          </h3>
          <Badge tone={liveWeatherActive ? "nominal" : "paper"}>
            {liveWeatherActive ? t("weather.liveForecast") : t("weather.modelledOffline")}
          </Badge>
        </div>
        <p className="text-xs font-mono text-ink/60 mb-3">{t("sandbox.vpdForecastCaption")}</p>
        <div className="flex items-center gap-2 mb-3">
          {crossing ? (
            <Badge tone={crossing.direction === "above" ? "danger" : "info"}>
              {t("sandbox.forecastCrossingIn", { hours: crossing.hoursFromNow, direction: t(`weather.${crossing.direction}`) })}
            </Badge>
          ) : (
            <Badge tone="nominal">{t("weather.noBandCrossing", { hours: 18 })}</Badge>
          )}
          {crossing && policy.ventDelayHrs > 0 && (
            <Badge tone="paper">{t("sandbox.responseDelayed", { hours: policy.ventDelayHrs })}</Badge>
          )}
        </div>
        <VpdForecastChart series={forecastSeries} crossing={crossing} responseDelayHrs={policy.ventDelayHrs} />
      </Panel>

      {running && (
        <Panel key={runId} accent="purple" className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <Cpu size={18} className="text-purple-3" />
            <p className="text-xs font-bold uppercase tracking-widest text-purple-3">{t(COMPUTE_STAGE_KEYS[stage])}</p>
          </div>
          <div className="h-4 border-[3px] border-ink bg-paper-dim overflow-hidden">
            <div className="h-full bg-purple-1 animate-scanfill" style={{ animationDuration: `${COMPUTE_MS}ms` }} />
          </div>
        </Panel>
      )}

      {result && !running && (
        <div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <DeltaCard label={t("sandbox.cropStressIndex")} delta={result.delta.csi} unit="pts" lowerIsBetter />
            <DeltaCard label={t("sandbox.waterUsed")} delta={result.delta.waterL} unit="L" lowerIsBetter />
            <DeltaCard label={t("sandbox.fungalRiskDsv")} delta={result.delta.dsv} unit="DSV" lowerIsBetter />
            <DeltaCard label={t("sandbox.dliToday")} delta={result.delta.dli} unit="mol/m²" lowerIsBetter={false} />
          </div>
          <p className="mt-3 text-xs font-mono text-shell-invert/50">
            {t("sandbox.baselineSummary", {
              baseCsi: result.baseline.csi.toFixed(0),
              baseWater: result.baseline.waterL.toFixed(0),
              baseDsv: result.baseline.dsv.toFixed(0),
              changeCsi: result.withChange.csi.toFixed(0),
              changeWater: result.withChange.waterL.toFixed(0),
              changeDsv: result.withChange.dsv.toFixed(0),
            })}
          </p>
        </div>
      )}
    </div>
  );
}
