"use client";

import { useSimulation } from "@/lib/SimulationContext";
import { AdvisoryCard } from "./AdvisoryCard";
import { Panel } from "../ui/Panel";

export function AdvisoryFeed() {
  const { state } = useSimulation();
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-2xl font-bold">Advisory Feed</h2>
        <p className="text-sm text-paper/60 font-mono mt-1">
          Plain language. Zone-tagged. A number and a deadline — never a raw metric.
        </p>
      </div>
      {state.advisories.length === 0 ? (
        <Panel className="p-6 text-center">
          <p className="font-mono text-sm text-ink/60">No active advisories — house nominal.</p>
        </Panel>
      ) : (
        <div className="flex flex-col gap-3">
          {state.advisories.map((a) => (
            <AdvisoryCard key={a.id} advisory={a} />
          ))}
        </div>
      )}
    </div>
  );
}
