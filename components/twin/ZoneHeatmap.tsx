import { HouseState } from "@/lib/types";
import { stageForGdd } from "@/lib/simulation";
import { Badge } from "../ui/Badge";
import { Panel } from "../ui/Panel";

function zoneStatus(vpdLeaf: number, band: readonly [number, number]) {
  if (vpdLeaf < band[0] - 0.05) return { label: "↓ LOW VPD", tone: "info" as const, tint: "#b273e9" };
  if (vpdLeaf > band[1] + 0.05) return { label: "↑ HIGH VPD", tone: "warn" as const, tint: "#ffcc00" };
  return { label: "✓ IN BAND", tone: "nominal" as const, tint: "#67cf00" };
}

export function ZoneHeatmap({ state }: { state: HouseState }) {
  const stage = stageForGdd(state.gddSum);
  const isDay = state.outdoor.solarWm2 > 5;
  const band = (isDay ? stage.day : stage.night) as unknown as [number, number];

  return (
    <Panel>
      <div className="p-3 md:p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-bold">Polyhouse Plan View</h3>
          <span className="text-[10px] font-mono text-ink/50">
            {isDay ? "DAY" : "NIGHT"} MODE · TARGET {band[0].toFixed(1)}-{band[1].toFixed(1)} kPa
          </span>
        </div>

        <div className="border-[3px] border-ink relative">
          <div className="flex items-center justify-around bg-ink text-green-1 text-[10px] font-mono py-0.5 tracking-widest">
            <span>↑ VENT ↑</span>
            <span>↑ VENT ↑</span>
          </div>
          <div className="flex flex-col md:flex-row">
            {state.zones.map((z) => {
              const s = zoneStatus(z.vpdLeaf, band);
              return (
                <div
                  key={z.id}
                  className="flex-1 border-ink md:border-r-[3px] last:border-r-0 border-b-[3px] md:border-b-0 last:border-b-0 p-3 flex flex-col gap-1.5 min-w-0"
                  style={{ background: `${s.tint}22` }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase">{z.label}</span>
                    <Badge tone={s.tone}>{s.label}</Badge>
                  </div>
                  <span className="text-[10px] font-mono text-ink/50 uppercase">{z.sublabel}</span>
                  <div className="flex items-baseline gap-1">
                    <span className="font-mono text-2xl font-bold">{z.vpdLeaf.toFixed(2)}</span>
                    <span className="text-xs font-mono text-ink/60">kPa leaf VPD</span>
                  </div>
                  <div className="flex gap-3 text-[11px] font-mono text-ink/70">
                    <span>CSI {z.csi.toFixed(0)}</span>
                    <span>VENT {z.ventPct.toFixed(0)}%</span>
                    {z.misting ? <span className="text-purple-3 font-bold">MISTING</span> : null}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-3 text-[10px] font-mono text-ink/50">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 border-2 border-ink inline-block" style={{ background: "#67cf0022" }} /> in band
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 border-2 border-ink inline-block" style={{ background: "#b273e922" }} /> low VPD
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 border-2 border-ink inline-block" style={{ background: "#ffcc0022" }} /> high VPD
          </span>
        </div>
      </div>
    </Panel>
  );
}
