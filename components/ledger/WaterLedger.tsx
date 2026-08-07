"use client";

import { Droplets, ArrowRight, CloudRainWind } from "lucide-react";
import { useSimulation } from "@/lib/SimulationContext";
import { Panel } from "../ui/Panel";
import { StatTile } from "../ui/StatTile";

const ZONE_COLORS: Record<string, string> = { vent: "#67cf00", centre: "#6add2b", far: "#59931c" };

export function WaterLedger() {
  const { state } = useSimulation();
  const { budgetL, usedL, recoveredL, allocation } = state.waterLedger;
  const remainingL = Math.max(0, budgetL - usedL);
  const usedPct = Math.min(100, (usedL / budgetL) * 100);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Droplets size={22} /> Water Ledger
        </h2>
        <p className="text-sm text-shell-invert/60 font-mono mt-1">
          A fixed daily budget, allocated by marginal return — not watered reactively.
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
              {z.label} — {(allocation[z.id] ?? 0).toFixed(1)} L today
            </span>
          ))}
        </div>
      </Panel>

      <Panel className="p-4" accent="purple">
        <p className="text-xs font-mono text-ink/70 leading-relaxed">
          <span className="font-bold text-purple-3 inline-flex items-center gap-1.5">
            <CloudRainWind size={14} /> Passive condensation recovery —
          </span>{" "}
          when a zone&apos;s
          cover cools below dew point overnight, moisture condenses and drains through internal gutters at
          zero energy cost. Modelled from the twin&apos;s own dew-point state and credited to tomorrow&apos;s
          budget. Ventilation losses still dominate the moisture balance — this is a modest, honest secondary
          credit, not the headline.
        </p>
      </Panel>
    </div>
  );
}
