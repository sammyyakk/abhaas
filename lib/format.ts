export function formatClock(simMinutes: number) {
  const total = Math.round(simMinutes) % 1440;
  const h = Math.floor(total / 60).toString().padStart(2, "0");
  const m = (total % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}
