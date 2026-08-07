import { HouseState } from "@/lib/types";
import { Panel } from "../ui/Panel";
import { StatTile } from "../ui/StatTile";
import { Badge } from "../ui/Badge";

export function HouseStatsRow({ state }: { state: HouseState }) {
  const clock = (() => {
    const total = Math.round(state.dayFraction * 1440);
    const h = Math.floor(total / 60).toString().padStart(2, "0");
    const m = (total % 60).toString().padStart(2, "0");
    return `${h}:${m}`;
  })();

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      <StatTile label="Sim Clock" value={clock} sub={`Day ${state.dayIndex + 1}`} />
      <StatTile label="Outdoor Temp" value={state.outdoor.tempC.toFixed(1)} unit="°C" />
      <StatTile label="Outdoor RH" value={state.outdoor.rh.toFixed(0)} unit="%" />
      <StatTile label="Growth Stage" value={state.stage} sub={`ΣGDD ${state.gddSum.toFixed(0)}`} />
      <StatTile
        label="Contradictory Cmds"
        value={state.contradictoryCommands}
        color="#59931c"
        sub="structural guarantee: 0"
      />
    </div>
  );
}

export function SensorGrid({ state }: { state: HouseState }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {state.zones.map((z) => (
        <Panel key={z.id} accent={z.faultActive ? "danger" : "ink"} className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="font-bold text-sm">
                {z.label} <span className="text-ink/50 font-normal">· {z.sublabel}</span>
              </h4>
            </div>
            {z.faultActive ? (
              <Badge tone="danger">FAULT: {z.faultActive.toUpperCase()}</Badge>
            ) : (
              <Badge tone="nominal">NOMINAL</Badge>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <StatTile label="Air Temp" value={z.airTemp.toFixed(1)} unit="°C" />
            <StatTile label="RH" value={z.rh.toFixed(0)} unit="%" />
            <StatTile label="Soil θ" value={z.soilMoisture.toFixed(2)} unit="m³/m³" />
            <StatTile label="Leaf Temp" value={z.leafTemp.toFixed(1)} unit="°C" />
            <StatTile label="VPD Leaf" value={z.vpdLeaf.toFixed(2)} unit="kPa" color="#7d559c" />
            <StatTile label="CWSI" value={z.cwsi.toFixed(2)} color={z.cwsi > 0.5 ? "#ff2d2d" : "#59931c"} />
            <StatTile label="Vent" value={z.ventPct.toFixed(0)} unit="%" />
            <StatTile label="Shade" value={z.shadePct.toFixed(0)} unit="%" />
          </div>
          <div className="mt-2 flex gap-2 text-[11px] font-mono text-ink/60">
            <span>Water today: {z.waterUsedTodayL.toFixed(1)} L</span>
            {z.misting && <span className="text-purple-3 font-bold">· MISTING</span>}
          </div>
        </Panel>
      ))}
    </div>
  );
}
