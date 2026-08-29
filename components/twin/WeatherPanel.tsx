import type { ReactNode } from "react";
import { Thermometer, Droplets, Wind, CloudDrizzle, CloudSun, Satellite } from "lucide-react";
import type { HouseState } from "@/lib/types";
import { vpd, dewPointC } from "@/lib/simulation";
import { useSimulation } from "@/lib/SimulationContext";
import { vpdForecastSeries, findBandCrossing } from "@/lib/vpdForecast";
import { useLanguage } from "@/lib/i18n/LanguageContext";
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
    <div className="border-2 border-ink bg-paper-dim text-ink p-2 flex flex-col gap-0.5 min-w-0">
      <span className="text-[9px] font-bold uppercase tracking-widest text-ink/60 flex items-center gap-1">
        {icon} {label}
      </span>
      <span className="font-mono text-lg md:text-xl font-bold leading-none truncate" style={color ? { color } : undefined}>
        {value}
        {unit ? <span className="text-[10px] ml-1 align-top">{unit}</span> : null}
      </span>
    </div>
  );
}

export function WeatherPanel({ state }: { state: HouseState }) {
  const { getOutdoorForecast, liveWeatherActive } = useSimulation();
  const { t } = useLanguage();
  const { tempC, rh, solarWm2 } = state.outdoor;
  const outdoorVpd = vpd(tempC, rh);
  const outdoorDewPoint = dewPointC(tempC, rh);

  const series = vpdForecastSeries(getOutdoorForecast, state.gddSum);
  const crossing = findBandCrossing(series);

  return (
    <Panel className="p-3 md:p-4" accent="purple">
      <div className="flex items-center justify-between flex-wrap gap-2 mb-2.5">
        <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2 text-purple-3">
          <CloudSun size={16} /> {t("weather.title")}
        </h3>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <Badge tone={liveWeatherActive ? "nominal" : "paper"}>
            <Satellite size={11} /> {liveWeatherActive ? t("weather.liveForecast") : t("weather.modelledOffline")}
          </Badge>
          {crossing ? (
            <Badge tone={crossing.direction === "above" ? "danger" : "info"}>
              {t("weather.bandCrossingIn", { hours: crossing.hoursFromNow, direction: t(`weather.${crossing.direction}`) })}
            </Badge>
          ) : (
            <Badge tone="nominal">{t("weather.noBandCrossing", { hours: 18 })}</Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-2.5">
        <ConditionTile icon={<Thermometer size={11} />} label={t("weather.outdoorTemp")} value={tempC.toFixed(1)} unit="°C" />
        <ConditionTile icon={<Droplets size={11} />} label={t("weather.outdoorRh")} value={rh.toFixed(0)} unit="%" />
        <ConditionTile icon={<WeatherIcon solarWm2={solarWm2} size={11} />} label={t("weather.solar")} value={solarWm2.toFixed(0)} unit="W/m²" />
        <ConditionTile icon={<Wind size={11} />} label={t("weather.outdoorVpd")} value={outdoorVpd.toFixed(2)} unit="kPa" color="#7d559c" />
        <ConditionTile icon={<CloudDrizzle size={11} />} label={t("weather.dewPoint")} value={outdoorDewPoint.toFixed(1)} unit="°C" />
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-1 mb-2.5">
        {OUTLOOK_STEPS_HRS.map((h) => {
          const o = getOutdoorForecast(h);
          const v = vpd(o.tempC, o.rh);
          return (
            <div key={h} className="border-2 border-ink bg-paper p-1.5 flex flex-col items-center gap-0.5 min-w-[52px] shrink-0">
              <span className="text-[9px] font-mono text-ink/60">{h === 0 ? t("weather.now") : clockAt(state.dayFraction, h)}</span>
              <WeatherIcon solarWm2={o.solarWm2} size={13} className="text-purple-3" />
              <span className="text-[11px] font-mono font-bold">{o.tempC.toFixed(0)}°C</span>
              <span className="text-[9px] font-mono text-ink/50">{v.toFixed(2)} kPa</span>
            </div>
          );
        })}
      </div>

      <VpdForecastChart series={series} crossing={crossing} height={130} />
      <p className="text-[10px] font-mono text-ink/50 mt-1.5">
        {liveWeatherActive ? t("weather.captionLive") : t("weather.captionModelled")}
      </p>
    </Panel>
  );
}
