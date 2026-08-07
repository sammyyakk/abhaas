"use client";

import { useSimulation } from "@/lib/SimulationContext";
import { Panel } from "../ui/Panel";
import { Badge } from "../ui/Badge";

const DSV_THRESHOLD = 15;
const PEST_THRESHOLD = 150;

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
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-2xl font-bold">Risk Board</h2>
        <p className="text-sm text-paper/60 font-mono mt-1">
          Disease &amp; pest risk forecast from signals already computed — no camera, no extra sensor.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {state.zones.map((z) => {
          const flagged = z.dsv >= DSV_THRESHOLD || z.pestDD >= PEST_THRESHOLD;
          return (
            <Panel key={z.id} accent={flagged ? "danger" : "ink"} className="p-4 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm">{z.label}</h4>
                {flagged ? <Badge tone="danger">SCOUT ZONE</Badge> : <Badge tone="nominal">CLEAR</Badge>}
              </div>
              <RiskBar label="Disease severity (ΣDSV)" value={z.dsv} threshold={DSV_THRESHOLD} unit="DSV" />
              <RiskBar label="Pest degree-days (ΣDD)" value={z.pestDD} threshold={PEST_THRESHOLD} unit="DD" />
            </Panel>
          );
        })}
      </div>

      <Panel className="p-5" accent="purple">
        <h3 className="text-sm font-bold uppercase tracking-wider mb-2">What&apos;s being watched</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono text-ink/70">
          <p>
            <span className="font-bold text-purple-3">Disease (leaf wetness → DSV):</span> Botrytis cinerea ·
            powdery mildew · early blight. Crossing the threshold flags a zone for scouting — never for
            automatic spraying.
          </p>
          <p>
            <span className="font-bold text-purple-3">Pests (degree-day phenology):</span> whiteflies · thrips ·
            spider mites · aphids · leafminers · borers. Spider mites thrive in exactly the high-VPD conditions
            the controller already manages for plant stress.
          </p>
        </div>
      </Panel>
    </div>
  );
}
