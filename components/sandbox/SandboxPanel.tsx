"use client";

import { useState } from "react";
import { useSimulation } from "@/lib/SimulationContext";
import type { SandboxPolicy, SandboxResult } from "@/lib/types";
import { Panel } from "../ui/Panel";
import { Button } from "../ui/Button";
import { SliderControl } from "../ui/SliderControl";
import { DeltaCard } from "./DeltaCard";

const DEFAULT_POLICY: SandboxPolicy = { irrigationDeltaPct: 0, ventDelayHrs: 0, shadeShiftHrs: 0 };

export function SandboxPanel() {
  const { runSandbox } = useSimulation();
  const [policy, setPolicy] = useState<SandboxPolicy>(DEFAULT_POLICY);
  const [result, setResult] = useState<SandboxResult | null>(null);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [running, setRunning] = useState(false);

  function run() {
    setRunning(true);
    const t0 = performance.now();
    const r = runSandbox(policy);
    const t1 = performance.now();
    setResult(r);
    setLatencyMs(t1 - t0);
    setRunning(false);
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-2xl font-bold">What-If Sandbox</h2>
        <p className="text-sm text-paper/60 font-mono mt-1">
          Drag a slider. The twin forks and fast-forwards 24 simulated hours. Results return as a delta
          versus doing nothing.
        </p>
      </div>

      <Panel className="p-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SliderControl
            label="Irrigation change"
            value={policy.irrigationDeltaPct}
            min={-50}
            max={100}
            step={5}
            unit="%"
            onChange={(v) => setPolicy((p) => ({ ...p, irrigationDeltaPct: v }))}
          />
          <SliderControl
            label="Vent delay"
            value={policy.ventDelayHrs}
            min={0}
            max={4}
            step={0.5}
            unit="h"
            onChange={(v) => setPolicy((p) => ({ ...p, ventDelayHrs: v }))}
          />
          <SliderControl
            label="Shade shift"
            value={policy.shadeShiftHrs}
            min={-2}
            max={2}
            step={0.5}
            unit="h"
            onChange={(v) => setPolicy((p) => ({ ...p, shadeShiftHrs: v }))}
          />
        </div>
        <div className="mt-5 flex items-center gap-3">
          <Button tone="purple" onClick={run} disabled={running}>
            Run 24h Projection
          </Button>
          <Button tone="paper" onClick={() => setPolicy(DEFAULT_POLICY)}>
            Reset
          </Button>
          {latencyMs != null && (
            <span className="text-[11px] font-mono text-ink/50 ml-1">
              computed in {latencyMs.toFixed(0)} ms (target &lt; 2000 ms)
            </span>
          )}
        </div>
      </Panel>

      {result && (
        <div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <DeltaCard label="Crop Stress Index" delta={result.delta.csi} unit="pts" lowerIsBetter />
            <DeltaCard label="Water Used" delta={result.delta.waterL} unit="L" lowerIsBetter />
            <DeltaCard label="Fungal Risk (DSV)" delta={result.delta.dsv} unit="DSV" lowerIsBetter />
            <DeltaCard label="DLI Today" delta={result.delta.dli} unit="mol/m²" lowerIsBetter={false} />
          </div>
          <p className="mt-3 text-xs font-mono text-paper/50">
            Baseline (do nothing): CSI {result.baseline.csi.toFixed(0)} · {result.baseline.waterL.toFixed(0)} L ·
            DSV {result.baseline.dsv.toFixed(0)} — With change: CSI {result.withChange.csi.toFixed(0)} ·{" "}
            {result.withChange.waterL.toFixed(0)} L · DSV {result.withChange.dsv.toFixed(0)}
          </p>
        </div>
      )}
    </div>
  );
}
