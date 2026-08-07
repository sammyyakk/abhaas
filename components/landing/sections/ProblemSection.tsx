import { XCircle, Link2, Sprout, Map, CloudSun } from "lucide-react";

const GENERIC = [
  "Sensor reads temperature or moisture.",
  "If it crosses a fixed threshold —",
  '"water now" or "open vent."',
  "Every other team builds this.",
];

const ACTUAL = [
  { label: "Coupled", icon: Link2, body: "Vent to cool → humidity drops → VPD swings the other way. Two thresholds fight each other." },
  { label: "Living", icon: Sprout, body: "A seedling and a fruiting plant need different bands. A static threshold ignores the crop stage." },
  { label: "Non-uniform", icon: Map, body: "The vent line runs cooler and drier than the centre. One sensor cannot speak for a whole house." },
  { label: "Anticipatable", icon: CloudSun, body: "Weather is forecast hours ahead. A threshold only reacts after the spike has already landed." },
];

export function ProblemSection() {
  return (
    <section id="problem" className="border-b-[3px] border-shell-invert/15 py-20 md:py-28 px-5 md:px-10">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-3xl md:text-5xl font-bold max-w-3xl" data-reveal>
          The generic version fails four ways.
        </h2>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          <div data-reveal>
            <span className="text-[11px] font-bold uppercase tracking-widest text-danger flex items-center gap-2">
              <XCircle size={14} /> The generic version
            </span>
            <div className="mt-3 border-[3px] border-shell-invert bg-paper text-ink p-6" style={{ boxShadow: "8px 8px 0 var(--shadow-danger)" }}>
              {GENERIC.map((line) => (
                <p key={line} className="font-mono text-sm md:text-base leading-relaxed">
                  {line}
                </p>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <span className="text-[11px] font-bold uppercase tracking-widest text-green-1" data-reveal>
              What a polyhouse actually is
            </span>
            {ACTUAL.map((item) => (
              <div
                key={item.label}
                data-reveal
                className="border-[3px] border-shell-invert bg-paper text-ink p-4 flex gap-3"
                style={{ boxShadow: "6px 6px 0 var(--shadow-green)" }}
              >
                <item.icon size={22} className="text-green-1 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-sm uppercase tracking-wide">{item.label}</p>
                  <p className="text-xs md:text-sm text-ink/70 mt-1">{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
