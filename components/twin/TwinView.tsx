"use client";

import { LayoutGrid, Play, Pause, Zap } from "lucide-react";
import { useSimulation } from "@/lib/SimulationContext";
import { isZoneFlagged } from "@/lib/risk";
import { ZoneHeatmap } from "./ZoneHeatmap";
import { HouseStatsRow, SensorGrid } from "./SensorGrid";
import { Button } from "../ui/Button";
import { Panel } from "../ui/Panel";

const MINUTES_SAVED_PER_INTERVENTION = 15;

function LaborStrip({ interventionsToday, scoutCount }: { interventionsToday: number; scoutCount: number }) {
  const hoursSaved = (interventionsToday * MINUTES_SAVED_PER_INTERVENTION) / 60;
  return (
    <Panel className="p-4" accent="green">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-mono">
        <span className="flex items-center gap-2 font-bold uppercase tracking-wider text-green-3">
          <Zap size={14} /> Automation
        </span>
        <span>
          Interventions today: <span className="font-mono font-bold text-sm">{interventionsToday}</span>
        </span>
        <span>
          Hours saved (modelled): <span className="font-mono font-bold text-sm">{hoursSaved.toFixed(1)}h</span>
        </span>
        <span>
          Manual scouting required:{" "}
          <span className={`font-mono font-bold text-sm ${scoutCount > 0 ? "text-danger" : "text-green-3"}`}>
            {scoutCount} zone{scoutCount === 1 ? "" : "s"}
          </span>
        </span>
      </div>
    </Panel>
  );
}

export function TwinView() {
  const { state, paused, setPaused } = useSimulation();
  const scoutCount = state.zones.filter(isZoneFlagged).length;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <LayoutGrid size={22} /> Twin View
        </h2>
        <Button tone={paused ? "green" : "paper"} onClick={() => setPaused(!paused)} className="flex items-center gap-2">
          {paused ? <Play size={14} /> : <Pause size={14} />} {paused ? "Resume" : "Pause"}
        </Button>
      </div>
      <HouseStatsRow state={state} />
      <LaborStrip interventionsToday={state.interventionsToday} scoutCount={scoutCount} />
      <ZoneHeatmap state={state} />
      <SensorGrid state={state} />
    </div>
  );
}
