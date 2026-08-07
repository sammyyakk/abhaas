"use client";

import { useSimulation } from "@/lib/SimulationContext";
import { ZoneHeatmap } from "./ZoneHeatmap";
import { HouseStatsRow, SensorGrid } from "./SensorGrid";
import { Button } from "../ui/Button";

export function TwinView() {
  const { state, paused, setPaused } = useSimulation();
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Twin View</h2>
        <Button tone={paused ? "green" : "paper"} onClick={() => setPaused(!paused)}>
          {paused ? "▶ Resume" : "❙❙ Pause"}
        </Button>
      </div>
      <HouseStatsRow state={state} />
      <ZoneHeatmap state={state} />
      <SensorGrid state={state} />
    </div>
  );
}
