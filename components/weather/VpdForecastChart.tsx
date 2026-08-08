import type { VpdForecastPoint } from "@/lib/vpdForecast";

export function VpdForecastChart({
  series,
  crossing,
  responseDelayHrs,
}: {
  series: VpdForecastPoint[];
  crossing: { hoursFromNow: number; direction: "above" | "below" } | null;
  responseDelayHrs?: number;
}) {
  const values = series.flatMap((p) => [p.vpdOutdoor, p.bandLo, p.bandHi]);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const pad = (max - min) * 0.15 || 0.1;
  const yMin = Math.max(0, min - pad);
  const yMax = max + pad;

  const width = 640;
  const height = 180;
  const marginL = 34;
  const marginB = 20;
  const hStart = series[0].hoursFromNow;
  const hEnd = series[series.length - 1].hoursFromNow;

  const x = (h: number) => marginL + ((h - hStart) / (hEnd - hStart)) * (width - marginL - 10);
  const y = (v: number) => 10 + (1 - (v - yMin) / (yMax - yMin)) * (height - marginB - 10);

  const historical = series.filter((p) => p.hoursFromNow <= 0);
  const forecast = series.filter((p) => p.hoursFromNow >= 0);
  const toPoints = (pts: VpdForecastPoint[]) =>
    pts.map((p) => `${x(p.hoursFromNow).toFixed(1)},${y(p.vpdOutdoor).toFixed(1)}`).join(" ");

  const bandTop = series.map((p) => `${x(p.hoursFromNow).toFixed(1)},${y(p.bandHi).toFixed(1)}`).join(" ");
  const bandBottom = series
    .slice()
    .reverse()
    .map((p) => `${x(p.hoursFromNow).toFixed(1)},${y(p.bandLo).toFixed(1)}`)
    .join(" ");

  const responseHour = crossing && responseDelayHrs != null ? crossing.hoursFromNow + responseDelayHrs : null;
  const responseInRange = responseHour != null && responseHour >= hStart && responseHour <= hEnd;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" role="img" aria-label="Outdoor VPD forecast chart">
      <polygon points={`${bandTop} ${bandBottom}`} fill="var(--color-green-1)" opacity={0.12} />

      <line x1={marginL} y1={10} x2={marginL} y2={height - marginB} stroke="currentColor" strokeOpacity={0.25} strokeWidth={1.5} />
      <line x1={marginL} y1={height - marginB} x2={width - 10} y2={height - marginB} stroke="currentColor" strokeOpacity={0.25} strokeWidth={1.5} />
      <text x={2} y={y(yMax) + 4} fontSize={10} fontFamily="var(--font-mono)" fill="currentColor" opacity={0.6}>
        {yMax.toFixed(1)}
      </text>
      <text x={2} y={y(yMin) + 4} fontSize={10} fontFamily="var(--font-mono)" fill="currentColor" opacity={0.6}>
        {yMin.toFixed(1)}
      </text>

      <line x1={x(0)} y1={10} x2={x(0)} y2={height - marginB} stroke="currentColor" strokeOpacity={0.3} strokeWidth={1.5} />
      <text x={x(0) + 4} y={height - marginB + 14} fontSize={10} fontFamily="var(--font-mono)" fill="currentColor" opacity={0.6}>
        now
      </text>

      {crossing && (
        <>
          <line
            x1={x(crossing.hoursFromNow)}
            y1={10}
            x2={x(crossing.hoursFromNow)}
            y2={height - marginB}
            stroke="var(--color-danger)"
            strokeWidth={2}
            strokeDasharray="4 3"
          />
          <text x={x(crossing.hoursFromNow) + 4} y={18} fontSize={10} fontFamily="var(--font-mono)" fill="var(--color-danger)" fontWeight={700}>
            {crossing.direction === "above" ? "OUT (HIGH)" : "OUT (LOW)"}
          </text>
        </>
      )}

      {responseInRange && (
        <>
          <line
            x1={x(responseHour!)}
            y1={10}
            x2={x(responseHour!)}
            y2={height - marginB}
            stroke="var(--color-purple-1)"
            strokeWidth={2}
            strokeDasharray="4 3"
          />
          <text x={x(responseHour!) + 4} y={30} fontSize={10} fontFamily="var(--font-mono)" fill="var(--color-purple-1)" fontWeight={700}>
            RESPONSE
          </text>
        </>
      )}

      <polyline points={toPoints(historical)} fill="none" stroke="var(--color-green-1)" strokeWidth={2.5} />
      <polyline points={toPoints(forecast)} fill="none" stroke="var(--color-purple-1)" strokeWidth={2.5} strokeDasharray="6 4" />
    </svg>
  );
}
