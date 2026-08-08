import type { ReactNode } from "react";
import { Thermometer, Droplets, Wind, CloudDrizzle, CloudSun } from "lucide-react";
import type { HouseState } from "@/lib/types";
import { vpd, dewPointC } from "@/lib/simulation";
import { outdoorForecast } from "@/lib/weather";
import { vpdForecastSeries, findBandCrossing } from "@/lib/vpdForecast";
import { Panel } from "../ui/Panel";
import { Badge } from "../ui/Badge";
import { WeatherIcon } from "../weather/WeatherIcon";
import { VpdForecastChart } from "../weather/VpdForecastChart";

const OUTLOOK_STEPS_HRS = [0, 3, 6, 9, 12, 15, 18, 21];

function clockAt(dayFraction: number, hoursOffset: number) {
  const total = Math.round((dayFraction * 1440 + hoursOffset * 60) % 1440 + 1440) % 1440;
  const h = Math.floor(total / 60).toString().padStart(2, "0");
  const m = (total % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}

function ConditionTile({
  icon,
  label,
  value,
  unit,
  color,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  unit?: string;
  color?: string;
}) {
  return (
    <div className="border-[3px] border-ink bg-paper-dim text-ink p-3 flex flex-col gap-1 min-w-0">
      <span className="text-[10px] font-bold uppercase tracking-widest text-ink/60 flex items-center gap-1.5">
        {icon} {label}
      </span>
      <span className="font-mono text-2xl md:text-3xl font-bold leading-none truncate" style={color ? { color } : undefined}>
        {value}
        {unit ? <span className="text-xs ml-1 align-top">{unit}</span> : null}
      </span>
    </div>
  );
}

export function WeatherPanel({ state }: { state: HouseState }) {
  const { tempC, rh, solarWm2 } = state.outdoor;
  const outdoorVpd = vpd(tempC, rh);
  const outdoorDewPoint = dewPointC(tempC, rh);

  const series = vpdForecastSeries(state.dayFraction, state.gddSum);
  const crossing = findBandCrossing(series);

  return (
    <Panel className="p-5" accent="purple">
      <h3 className="text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2 text-purple-3">
        <CloudSun size={16} /> Weather
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-5">
        <ConditionTile icon={<Thermometer size={12} />} label="Outdoor Temp" value={tempC.toFixed(1)} unit="°C" />
        <ConditionTile icon={<Droplets size={12} />} label="Outdoor RH" value={rh.toFixed(0)} unit="%" />
        <ConditionTile icon={<WeatherIcon solarWm2={solarWm2} size={12} />} label="Solar" value={solarWm2.toFixed(0)} unit="W/m²" />
        <ConditionTile icon={<Wind size={12} />} label="Outdoor VPD" value={outdoorVpd.toFixed(2)} unit="kPa" color="#7d559c" />
        <ConditionTile icon={<CloudDrizzle size={12} />} label="Dew Point" value={outdoorDewPoint.toFixed(1)} unit="°C" />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 mb-5">
        {OUTLOOK_STEPS_HRS.map((h) => {
          const o = outdoorForecast(state.dayFraction, h);
          const v = vpd(o.tempC, o.rh);
          return (
            <div key={h} className="border-2 border-ink bg-paper p-2 flex flex-col items-center gap-1 min-w-[64px] shrink-0">
              <span className="text-[9px] font-mono text-ink/60">{h === 0 ? "NOW" : clockAt(state.dayFraction, h)}</span>
              <WeatherIcon solarWm2={o.solarWm2} size={16} className="text-purple-3" />
              <span className="text-xs font-mono font-bold">{o.tempC.toFixed(0)}°C</span>
              <span className="text-[10px] font-mono text-ink/50">{v.toFixed(2)} kPa</span>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-2 mb-2">
        {crossing ? (
          <Badge tone={crossing.direction === "above" ? "danger" : "info"}>
            Band crossing in ~{crossing.hoursFromNow}h ({crossing.direction})
          </Badge>
        ) : (
          <Badge tone="nominal">No band crossing forecast (18h)</Badge>
        )}
      </div>
      <VpdForecastChart series={series} crossing={crossing} />
      <p className="text-[11px] font-mono text-ink/50 mt-2">
        Outdoor/ambient VPD forecast, the condition the zone controller works against, not a leaf-VPD
        prediction. Derived from the twin&apos;s own deterministic weather model, not a live feed.
      </p>
    </Panel>
  );
}
