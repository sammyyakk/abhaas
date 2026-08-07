"use client";

import { Droplets, ArrowRight, CloudRainWind, Gauge, CalendarClock, Wrench, TrendingUp } from "lucide-react";
import { useSimulation } from "@/lib/SimulationContext";
import { yieldResponse, computeYieldEfficiency, type YieldEfficiency } from "@/lib/yield";
import type { ZoneState } from "@/lib/types";
import { Panel } from "../ui/Panel";
import { StatTile } from "../ui/StatTile";
import { Badge } from "../ui/Badge";
import { clamp } from "@/lib/weather";

const ZONE_COLORS: Record<string, string> = { vent: "#67cf00", centre: "#6add2b", far: "#59931c" };
const GUTTER_CYCLE_DAYS = 5;

function YieldCurve({ zones }: { zones: ZoneState[] }) {
  const width = 400;
  const height = 150;
  const marginL = 34;
  const marginB = 20;
  const xMax = Math.max(60, ...zones.map((z) => z.waterUsedTodayL * 1.4));
  const yMax = yieldResponse(xMax) * 1.1 || 1;

  const x = (w: number) => marginL + (w / xMax) * (width - marginL - 10);
  const y = (v: number) => 10 + (1 - v / yMax) * (height - marginB - 10);

  const steps = 40;
  const points = Array.from({ length: steps + 1 }, (_, i) => {
    const w = (i / steps) * xMax;
    return `${x(w).toFixed(1)},${y(yieldResponse(w)).toFixed(1)}`;
  }).join(" ");

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" role="img" aria-label="Yield response curve">
      <line x1={marginL} y1={10} x2={marginL} y2={height - marginB} stroke="currentColor" strokeOpacity={0.25} strokeWidth={1.5} />
      <line x1={marginL} y1={height - marginB} x2={width - 10} y2={height - marginB} stroke="currentColor" strokeOpacity={0.25} strokeWidth={1.5} />
      <text x={2} y={y(yMax) + 4} fontSize={9} fontFamily="var(--font-mono)" fill="currentColor" opacity={0.6}>
        {yMax.toFixed(1)}kg
      </text>
      <text x={width - 30} y={height - marginB + 14} fontSize={9} fontFamily="var(--font-mono)" fill="currentColor" opacity={0.6}>
        {xMax.toFixed(0)}L
      </text>
      <polyline points={points} fill="none" stroke="var(--color-green-1)" strokeWidth={2.5} />
      {zones.map((z) => (
        <circle
          key={z.id}
          cx={x(z.waterUsedTodayL)}
          cy={y(yieldResponse(z.waterUsedTodayL))}
          r={5}
          fill={ZONE_COLORS[z.id]}
          stroke="var(--color-ink)"
          strokeWidth={1.5}
        />
      ))}
    </svg>
  );
}

function nextLiterCopy(eff: YieldEfficiency, zones: ZoneState[]) {
  const zone = zones.find((z) => z.id === eff.bestMarginalZoneId);
  if (!zone) return null;
  return `Optimized: next liter → ${zone.label} (highest marginal return)`;
}

export function WaterLedger() {
  const { state } = useSimulation();
  const { budgetL, usedL, recoveredL, allocation } = state.waterLedger;
  const remainingL = Math.max(0, budgetL - usedL);
  const usedPct = Math.min(100, (usedL / budgetL) * 100);

  const yieldEff = computeYieldEfficiency(state.zones);

  const avgDewPointNow = state.zones.reduce((s, z) => s + z.dewPoint, 0) / state.zones.length;
  const forecastRecoveryL = clamp(2.5 + (avgDewPointNow - 10) * 0.35, 0, 7);
  const daysSinceInspection = state.dayIndex % GUTTER_CYCLE_DAYS;
  const daysToInspection = daysSinceInspection === 0 && state.dayIndex > 0 ? 0 : GUTTER_CYCLE_DAYS - daysSinceInspection;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Droplets size={22} /> Water Ledger
        </h2>
        <p className="text-sm text-shell-invert/60 font-mono mt-1">
          A fixed daily budget, allocated by marginal return, not watered reactively.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatTile label="Daily Budget" value={budgetL.toFixed(1)} unit="L" />
        <StatTile label="Used Today" value={usedL.toFixed(1)} unit="L" color="#59931c" />
        <StatTile label="Remaining" value={remainingL.toFixed(1)} unit="L" color="#7d559c" />
        <StatTile label="Condensation Credit" value={`+${recoveredL.toFixed(1)}`} unit="L" color="#b273e9" />
      </div>

      <Panel className="p-5">
        <h3 className="text-sm font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
          Budget <ArrowRight size={16} /> Zone allocation
        </h3>
        <div className="border-[3px] border-ink h-10 flex overflow-hidden">
          {state.zones.map((z) => {
            const liters = allocation[z.id] ?? 0;
            const pct = budgetL > 0 ? (liters / budgetL) * 100 : 0;
            return (
              <div
                key={z.id}
                className="h-full flex items-center justify-center text-[10px] font-mono font-bold text-ink border-r-[3px] border-ink last:border-r-0"
                style={{ width: `${pct}%`, background: ZONE_COLORS[z.id] }}
                title={`${z.label}: ${liters.toFixed(1)} L`}
              >
                {pct > 8 ? `${liters.toFixed(1)}L` : ""}
              </div>
            );
          })}
          <div className="h-full flex-1 bg-paper-dim flex items-center justify-center text-[10px] font-mono text-ink/40">
            {usedPct < 92 ? `${remainingL.toFixed(0)}L unallocated` : ""}
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-4">
          {state.zones.map((z) => (
            <span key={z.id} className="flex items-center gap-2 text-xs font-mono text-ink/70">
              <span className="w-3 h-3 border-2 border-ink inline-block" style={{ background: ZONE_COLORS[z.id] }} />
              {z.label}: {(allocation[z.id] ?? 0).toFixed(1)} L today
            </span>
          ))}
        </div>
      </Panel>

      <Panel className="p-5" accent="green">
        <h3 className="text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2 text-green-3">
          <TrendingUp size={16} /> Yield Efficiency Index
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <StatTile
                label="Water Productivity"
                value={yieldEff.waterProductivityGPerL.toFixed(0)}
                unit="g/L"
                color="#59931c"
              />
              <StatTile
                label="Projected Yield Gain"
                value={`${yieldEff.projectedYieldGainPct >= 0 ? "+" : ""}${yieldEff.projectedYieldGainPct.toFixed(1)}`}
                unit="%"
                color="#7d559c"
                sub="vs. equal-split baseline"
              />
            </div>
            {nextLiterCopy(yieldEff, state.zones) && (
              <p className="text-xs font-mono text-ink/70 border-[3px] border-ink bg-paper-dim p-3">
                {nextLiterCopy(yieldEff, state.zones)}
              </p>
            )}
            <p className="text-[11px] font-mono text-ink/50 mt-3">
              Modelled Mitscherlich/Doorenbos-Kassam-style yield-response curve, a defensible scaffold, not
              a fitted agronomic model.
            </p>
          </div>
          <YieldCurve zones={state.zones} />
        </div>
      </Panel>

      <Panel className="p-5" accent="purple">
        <h3 className="text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2 text-purple-3">
          <Gauge size={16} /> Passive Harvesting Helper: dew point &amp; runoff predictor
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <StatTile label="Forecast Tonight" value={`+${forecastRecoveryL.toFixed(1)}`} unit="L" color="#7d559c" />
          <StatTile label="Avg Dew Point" value={avgDewPointNow.toFixed(1)} unit="°C" />
          <StatTile
            label="Next Gutter Check"
            value={daysToInspection === 0 ? "Due" : daysToInspection}
            unit={daysToInspection === 0 ? "" : "d"}
            color={daysToInspection === 0 ? "#ff2d2d" : undefined}
          />
          <StatTile label="Cycle" value={GUTTER_CYCLE_DAYS} unit="days" />
        </div>

        <div className="border-[3px] border-ink bg-paper-dim p-3 flex flex-col gap-2">
          {state.zones.map((z) => {
            const gap = z.airTemp - z.dewPoint;
            const condensing = gap < 1.5;
            return (
              <div key={z.id} className="flex items-center justify-between text-xs font-mono">
                <span className="font-bold uppercase">{z.label}</span>
                <span className="text-ink/60">
                  air {z.airTemp.toFixed(1)}°C · dew {z.dewPoint.toFixed(1)}°C · gap {gap.toFixed(1)}°C
                </span>
                {condensing ? (
                  <Badge tone="info">Condensing</Badge>
                ) : (
                  <Badge tone="paper">Dry</Badge>
                )}
              </div>
            );
          })}
        </div>

        <p className="text-xs font-mono text-ink/70 leading-relaxed mt-4">
          <span className="font-bold text-purple-3 inline-flex items-center gap-1.5">
            <CloudRainWind size={14} /> Passive condensation recovery:
          </span>{" "}
          when a zone&apos;s cover cools below dew point overnight, moisture condenses and drains through
          internal gutters at zero energy cost. Modelled from the twin&apos;s own dew-point state and
          credited to tomorrow&apos;s budget. Ventilation losses still dominate the moisture balance, this
          is a modest, honest secondary credit, not the headline.
        </p>

        <p className="text-xs font-mono text-ink/60 leading-relaxed mt-3 flex items-start gap-1.5">
          <Wrench size={13} className="shrink-0 mt-0.5" /> Gutter maintenance reminders fire automatically
          every {GUTTER_CYCLE_DAYS} days into the Advisory Feed, a blocked or algae-fouled gutter fails
          silently, so the twin checks in on a schedule instead of waiting to be asked.
        </p>
      </Panel>

      <Panel className="p-4 flex items-center gap-3" accent="ink">
        <CalendarClock size={20} className="text-ink/50 shrink-0" />
        <p className="text-xs font-mono text-ink/60">
          Roadmap: real gutter geometry + roof-area-driven yield estimation. Today&apos;s model uses a
          dew-point proxy, directionally correct, not a plumbing simulation.
        </p>
      </Panel>
    </div>
  );
}
