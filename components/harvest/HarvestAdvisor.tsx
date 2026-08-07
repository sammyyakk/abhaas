"use client";

import { Wheat, IndianRupee, CalendarClock, CheckCircle2, AlertTriangle, Minus, TrendingUp, TrendingDown } from "lucide-react";
import { useSimulation } from "@/lib/SimulationContext";
import { computeHarvestAdvisory, priceSeries, type HarvestAction } from "@/lib/market";
import { Panel } from "../ui/Panel";
import { StatTile } from "../ui/StatTile";
import { Badge } from "../ui/Badge";

const ACTION_META: Record<HarvestAction, { accent: "green" | "purple" | "danger" | "ink"; icon: typeof CheckCircle2; label: string }> = {
  harvest_now: { accent: "green", icon: CheckCircle2, label: "Harvest Now" },
  delay: { accent: "purple", icon: CalendarClock, label: "Delay Harvest" },
  harvest_early: { accent: "danger", icon: AlertTriangle, label: "Price Pressure" },
  on_track: { accent: "ink", icon: Minus, label: "On Track" },
};

function PriceChart({ dayIndex, ripenDay }: { dayIndex: number; ripenDay: number }) {
  const series = priceSeries(dayIndex);
  const prices = series.map((p) => p.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const pad = (max - min) * 0.15 || 1;
  const yMin = min - pad;
  const yMax = max + pad;

  const width = 640;
  const height = 180;
  const marginL = 34;
  const marginB = 20;
  const dayStart = series[0].day;
  const dayEnd = series[series.length - 1].day;

  const x = (day: number) => marginL + ((day - dayStart) / (dayEnd - dayStart)) * (width - marginL - 10);
  const y = (price: number) => 10 + (1 - (price - yMin) / (yMax - yMin)) * (height - marginB - 10);

  const historical = series.filter((p) => p.day <= dayIndex);
  const forecast = series.filter((p) => p.day >= dayIndex);
  const toPoints = (pts: typeof series) => pts.map((p) => `${x(p.day).toFixed(1)},${y(p.price).toFixed(1)}`).join(" ");
  const ripenInRange = ripenDay >= dayStart && ripenDay <= dayEnd;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" role="img" aria-label="Mandi price forecast chart">
      <line x1={marginL} y1={10} x2={marginL} y2={height - marginB} stroke="currentColor" strokeOpacity={0.25} strokeWidth={1.5} />
      <line x1={marginL} y1={height - marginB} x2={width - 10} y2={height - marginB} stroke="currentColor" strokeOpacity={0.25} strokeWidth={1.5} />
      <text x={2} y={y(yMax) + 4} fontSize={10} fontFamily="var(--font-mono)" fill="currentColor" opacity={0.6}>
        ₹{yMax.toFixed(0)}
      </text>
      <text x={2} y={y(yMin) + 4} fontSize={10} fontFamily="var(--font-mono)" fill="currentColor" opacity={0.6}>
        ₹{yMin.toFixed(0)}
      </text>

      {ripenInRange && (
        <>
          <line x1={x(ripenDay)} y1={10} x2={x(ripenDay)} y2={height - marginB} stroke="var(--color-danger)" strokeWidth={2} strokeDasharray="4 3" />
          <text x={x(ripenDay) + 4} y={18} fontSize={10} fontFamily="var(--font-mono)" fill="var(--color-danger)" fontWeight={700}>
            RIPE
          </text>
        </>
      )}

      <line x1={x(dayIndex)} y1={10} x2={x(dayIndex)} y2={height - marginB} stroke="currentColor" strokeOpacity={0.3} strokeWidth={1.5} />
      <text x={x(dayIndex) + 4} y={height - marginB + 14} fontSize={10} fontFamily="var(--font-mono)" fill="currentColor" opacity={0.6}>
        today
      </text>

      <polyline points={toPoints(historical)} fill="none" stroke="var(--color-green-1)" strokeWidth={2.5} />
      <polyline points={toPoints(forecast)} fill="none" stroke="var(--color-purple-1)" strokeWidth={2.5} strokeDasharray="6 4" />
    </svg>
  );
}

export function HarvestAdvisor() {
  const { state } = useSimulation();
  const advisory = computeHarvestAdvisory(state.gddSum, state.dayIndex);
  const meta = ACTION_META[advisory.action];
  const TrendIcon = advisory.pctChange > 0.5 ? TrendingUp : advisory.pctChange < -0.5 ? TrendingDown : Minus;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Wheat size={22} /> Harvest Advisor
        </h2>
        <p className="text-sm text-shell-invert/60 font-mono mt-1">
          GDD-based maturity forecast crossed with local mandi price trend, market-linked ripening, not a
          calendar date.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatTile label="Growth Stage" value={state.stage} sub={`ΣGDD ${state.gddSum.toFixed(0)}`} />
        <StatTile
          label="Days to Ripeness"
          value={advisory.atPeak ? "Now" : advisory.daysToRipen}
          unit={advisory.atPeak ? "" : "d"}
        />
        <StatTile label="Mandi Price Today" value={advisory.priceNow.toFixed(1)} unit="₹/kg" color="#59931c" />
        <StatTile
          label="Price at Ripeness"
          value={advisory.priceAtRipeness.toFixed(1)}
          unit="₹/kg"
          color={advisory.pctChange >= 0 ? "#59931c" : "#ff2d2d"}
        />
      </div>

      <Panel accent={meta.accent} className="p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-start gap-3">
            <meta.icon size={28} className="shrink-0 mt-0.5" />
            <div>
              <Badge tone={meta.accent === "danger" ? "danger" : meta.accent === "green" ? "nominal" : meta.accent === "purple" ? "info" : "neutral"}>
                {meta.label}
              </Badge>
              <p className="text-xl md:text-2xl font-bold mt-2">{advisory.headline}</p>
              <p className="text-sm text-ink/70 mt-2 leading-relaxed max-w-xl">{advisory.rationale}</p>
            </div>
          </div>
          <div className="border-[3px] border-ink bg-paper-dim px-4 py-3 text-center flex items-center gap-2">
            <TrendIcon size={20} className={advisory.pctChange >= 0 ? "text-green-3" : "text-danger"} />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-ink/60">7d Trend</p>
              <p className="font-mono text-xl font-bold" style={{ color: advisory.pctChange >= 0 ? "#59931c" : "#ff2d2d" }}>
                {advisory.pctChange > 0 ? "+" : ""}
                {advisory.pctChange.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      </Panel>

      <Panel className="p-5">
        <h3 className="text-sm font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
          <IndianRupee size={16} /> Mandi price: historical &amp; forecast
        </h3>
        <PriceChart dayIndex={state.dayIndex} ripenDay={state.dayIndex + advisory.daysToRipen} />
        <div className="flex flex-wrap gap-4 mt-2 text-[11px] font-mono text-ink/60">
          <span className="flex items-center gap-1.5">
            <span className="w-4 h-0.5 bg-green-1 inline-block" /> historical
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-4 h-0.5 bg-purple-1 inline-block opacity-70" /> forecast (dashed on chart)
          </span>
        </div>
      </Panel>

      <Panel className="p-4 flex items-center gap-3" accent="ink">
        <IndianRupee size={18} className="text-ink/50 shrink-0" />
        <p className="text-xs font-mono text-ink/60">
          Mandi prices are a modelled placeholder, the roadmap item is wiring the real Agmarknet (Govt. of
          India) feed. GDD maturity projection reuses the same crop-stage accumulator driving the VPD bands.
        </p>
      </Panel>
    </div>
  );
}
