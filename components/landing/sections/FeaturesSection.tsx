import { Map, Activity, Sprout, Radar, SlidersHorizontal, ShieldAlert, Wrench, RotateCcw, Bug, Layers } from "lucide-react";

const FEATURES = [
  { label: "Zoned", icon: Map, body: "3-4 coupled micro-zones with a heatmap, not one global reading." },
  { label: "Physiological", icon: Activity, body: "Leaf VPD, CWSI and dew point, derived, not raw temperature." },
  { label: "Stage-Aware", icon: Sprout, body: "GDD-driven bands shift automatically as the crop matures." },
  { label: "Predictive", icon: Radar, body: "A short-horizon VPD forecast feeds the controller before the spike." },
  { label: "Optimised", icon: SlidersHorizontal, body: "A fixed daily water budget allocated by marginal return, not rules." },
  { label: "Risk-Forecasting", icon: ShieldAlert, body: "Disease & pest risk from signals already computed, zero new sensors." },
  { label: "Fault-Aware", icon: Wrench, body: "The twin is a reference model, sensor faults never trigger bad advice." },
  { label: "Rehearsable", icon: RotateCcw, body: "Drag a slider, see 24h of consequence before you commit to it." },
  { label: "Pest ID", icon: Bug, body: "Snap a leaf photo, classify whiteflies, mites, thrips, on-device." },
];

export function FeaturesSection() {
  return (
    <section id="features-pin" className="relative min-h-screen border-b-[6px] border-green-1 flex flex-col items-center justify-center px-5 md:px-10 py-16">
      <div className="text-center mb-10 md:mb-14">
        <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-green-1 inline-flex items-center gap-1.5">
          <Layers size={12} /> Beyond the brief
        </span>
        <h2 className="mt-2 text-3xl md:text-5xl font-bold">One physics engine, eight consequences.</h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 max-w-5xl w-full">
        {FEATURES.map((f) => (
          <div
            key={f.label}
            data-card
            className="border-[3px] border-shell-invert bg-paper text-ink p-4 md:p-5"
            style={{ boxShadow: "6px 6px 0 var(--shadow-purple)", opacity: 0 }}
          >
            <f.icon className="text-purple-3 mb-2" size={26} strokeWidth={2} />
            <p className="font-bold text-sm md:text-base uppercase tracking-wide text-purple-3">{f.label}</p>
            <p className="text-xs md:text-sm text-ink/70 mt-2 leading-snug">{f.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
