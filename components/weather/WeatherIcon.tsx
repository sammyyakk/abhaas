import { Sun, CloudSun, MoonStar } from "lucide-react";

export function WeatherIcon({ solarWm2, size = 18, className = "" }: { solarWm2: number; size?: number; className?: string }) {
  if (solarWm2 <= 5) return <MoonStar size={size} className={className} />;
  if (solarWm2 < 300) return <CloudSun size={size} className={className} />;
  return <Sun size={size} className={className} />;
}
