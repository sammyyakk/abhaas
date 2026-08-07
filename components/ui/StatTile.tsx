export function StatTile({
  label,
  value,
  unit,
  color,
  sub,
  className = "",
}: {
  label: string;
  value: string | number;
  unit?: string;
  color?: string;
  sub?: string;
  className?: string;
}) {
  return (
    <div className={`border-[3px] border-ink bg-paper-dim text-ink p-3 flex flex-col gap-1 min-w-0 ${className}`}>
      <span className="text-[10px] font-bold uppercase tracking-widest text-ink/60">{label}</span>
      <span className="font-mono text-2xl md:text-3xl font-bold leading-none truncate" style={color ? { color } : undefined}>
        {value}
        {unit ? <span className="text-xs ml-1 align-top">{unit}</span> : null}
      </span>
      {sub ? <span className="text-[10px] font-mono text-ink/50 truncate">{sub}</span> : null}
    </div>
  );
}
