"use client";

import { useSimulation } from "@/lib/SimulationContext";
import type { FaultKind, ZoneId } from "@/lib/types";
import { Panel } from "../ui/Panel";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { formatClock } from "@/lib/format";

const FAULT_LABEL: Record<FaultKind, string> = {
  stuck: "Stuck Sensor",
  drift: "Sensor Drift",
  actuator: "Actuator Fault",
};

export function FaultFeed() {
  const { state, injectFault, clearFault } = useSimulation();

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-2xl font-bold">Health Monitor</h2>
        <p className="text-sm text-paper/60 font-mono mt-1">
          residual(t) = sensor(t) − twin(t). Divergence is diagnostic — faults render on a separate channel
          from agronomic advice, so a dead probe never produces a watering instruction.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {state.zones.map((z) => (
          <Panel key={z.id} accent={z.faultActive ? "danger" : "ink"} className="p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm">{z.label}</h4>
              {z.faultActive ? (
                <Badge tone="danger">{FAULT_LABEL[z.faultActive]}</Badge>
              ) : (
                <Badge tone="nominal">HEALTHY</Badge>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {(["stuck", "drift", "actuator"] as FaultKind[]).map((kind) => (
                <Button
                  key={kind}
                  tone="danger"
                  className="text-[10px] px-2 py-1.5"
                  disabled={!!z.faultActive}
                  onClick={() => injectFault(z.id as ZoneId, kind)}
                >
                  Inject {FAULT_LABEL[kind]}
                </Button>
              ))}
            </div>
            {z.faultActive && (
              <Button tone="green" className="text-[10px] px-2 py-1.5" onClick={() => clearFault(z.id as ZoneId)}>
                Clear fault
              </Button>
            )}
          </Panel>
        ))}
      </div>

      <div>
        <h3 className="text-sm font-bold uppercase tracking-wider text-paper/70 mb-2">Fault Channel</h3>
        {state.faults.length === 0 ? (
          <Panel className="p-6 text-center">
            <p className="font-mono text-sm text-ink/60">No faults detected. All residuals within ±3σ.</p>
          </Panel>
        ) : (
          <div className="flex flex-col gap-3">
            {state.faults.map((f) => (
              <div key={f.id} className="bg-ink border-[3px] border-danger p-4">
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <Badge tone="danger">FAULT</Badge>
                  <span className="text-[10px] font-mono text-paper/40">@ {formatClock(f.timestamp)}</span>
                </div>
                <p className="font-mono font-bold text-sm text-paper">{f.message}</p>
                <p className="font-mono text-xs text-paper/50 mt-1">{f.detail}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
