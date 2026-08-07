import { ArrowRightLeft, Activity, Droplets, ShieldAlert, Sun } from "lucide-react";

const DELTAS = [
  { label: "Crop Stress Index", value: "−18", color: "#59931c", icon: Activity },
  { label: "Water Used", value: "−12 L", color: "#59931c", icon: Droplets },
  { label: "Fungal Risk Z2", value: "Low → Mod", color: "#ff2d2d", icon: ShieldAlert },
  { label: "DLI Today", value: "unchanged", color: "#0a0a0a", icon: Sun },
];

export function SandboxTeaserSection() {
  return (
    <section className="border-b-[3px] border-shell-invert/15 py-20 md:py-28 px-5 md:px-10">
      <div className="mx-auto max-w-5xl">
        <div data-reveal>
          <span className="text-[11px] font-bold uppercase tracking-widest text-purple-2 flex items-center gap-2">
            <ArrowRightLeft size={14} /> Alerting tool → decision support
          </span>
          <h2 className="mt-3 text-3xl md:text-5xl font-bold max-w-2xl">
            Drag a slider. See the consequence you didn&apos;t ask about.
          </h2>
          <p className="mt-4 font-mono text-sm md:text-base text-shell-invert/70 max-w-2xl">
            The twin forks, fast-forwards 24 simulated hours under your proposed change, and returns a
            delta versus doing nothing, including the trade-off a threshold system would never show you.
          </p>
        </div>

        <div
          data-reveal
          className="mt-10 border-[3px] border-shell-invert bg-paper text-ink p-5 md:p-7"
          style={{ boxShadow: "10px 10px 0 var(--shadow-purple)" }}
        >
          <p className="font-mono text-xs md:text-sm text-ink/60 mb-4">
            &quot;Misting 6 min brings Zone 2 into band and saves 12 L...&quot;
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {DELTAS.map((c) => (
              <div key={c.label} className="border-[3px] border-ink bg-paper-dim p-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-ink/60 flex items-center gap-1.5">
                  <c.icon size={12} /> {c.label}
                </p>
                <p className="font-mono text-xl md:text-2xl font-bold mt-1" style={{ color: c.color }}>
                  {c.value}
                </p>
              </div>
            ))}
          </div>
          <p className="font-mono text-xs md:text-sm text-ink/60 mt-4">
            ...and raises Zone 2 fungal risk. That trade-off is invisible in every threshold system.
          </p>
        </div>
      </div>
    </section>
  );
}
