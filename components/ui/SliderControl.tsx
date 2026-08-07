export function SliderControl({
  label,
  value,
  min,
  max,
  step = 1,
  unit = "",
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-baseline">
        <span className="text-xs font-bold uppercase tracking-wider">{label}</span>
        <span className="font-mono text-sm font-bold text-purple-3 bg-purple-1/20 px-1.5 border-2 border-ink">
          {value > 0 ? "+" : ""}
          {value}
          {unit}
        </span>
      </div>
      <input
        type="range"
        className="brutal-range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <div className="flex justify-between text-[10px] font-mono text-paper/50">
        <span>
          {min}
          {unit}
        </span>
        <span>
          {max}
          {unit}
        </span>
      </div>
    </div>
  );
}
