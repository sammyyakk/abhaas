import { Thermometer, Droplets, X, ArrowDown, Sigma, Wind, CloudDrizzle, GitBranch, Lightbulb } from "lucide-react";
import { Latex } from "@/components/ui/Latex";

export function InsightSection() {
  return (
    <section id="insight-pin" className="relative min-h-screen bg-ink text-paper overflow-hidden border-b-[6px] border-purple-1">
      <div className="absolute top-20 md:top-24 left-0 right-0 text-center px-4">
        <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-purple-2 inline-flex items-center gap-1.5">
          <Lightbulb size={12} /> The Insight
        </span>
        <h2 className="mt-2 text-3xl md:text-5xl font-bold px-6">
          Control one variable the plant actually feels.
        </h2>
      </div>

      <div className="relative h-screen flex items-center justify-center px-5 md:px-10">
        {/* Step 1 */}
        <div data-step className="absolute inset-0 flex flex-col items-center justify-center gap-10 px-6" style={{ opacity: 0 }}>
          <p className="font-mono text-base md:text-lg text-paper/60 uppercase tracking-widest">Step 1 — the naive system</p>
          <div className="flex items-center gap-6 md:gap-12 flex-wrap justify-center">
            <div className="border-[3px] border-paper bg-ink px-8 py-10 md:px-10 md:py-12 text-center w-52 md:w-60">
              <Thermometer className="mx-auto mb-2" size={32} strokeWidth={2.2} />
              <p className="text-xs font-mono text-paper/50 uppercase">Sensor</p>
              <p className="text-2xl md:text-3xl font-bold mt-1">Temp</p>
              <ArrowDown className="mx-auto mt-4" size={24} />
              <p className="mt-4 border-2 border-danger text-danger px-3 py-1.5 text-sm font-bold uppercase flex items-center justify-center gap-2">
                <Wind size={16} /> Vent
              </p>
            </div>
            <X className="text-danger" size={40} strokeWidth={3} />
            <div className="border-[3px] border-paper bg-ink px-8 py-10 md:px-10 md:py-12 text-center w-52 md:w-60">
              <Droplets className="mx-auto mb-2" size={32} strokeWidth={2.2} />
              <p className="text-xs font-mono text-paper/50 uppercase">Sensor</p>
              <p className="text-2xl md:text-3xl font-bold mt-1">Humidity</p>
              <ArrowDown className="mx-auto mt-4" size={24} />
              <p className="mt-4 border-2 border-danger text-danger px-3 py-1.5 text-sm font-bold uppercase flex items-center justify-center gap-2">
                <CloudDrizzle size={16} /> Mist
              </p>
            </div>
          </div>
          <p className="font-mono text-sm md:text-base text-danger max-w-xl text-center">
            Vent to cool → humidity drops → the mist controller fires to compensate → temperature rises again.
            Two controllers, fighting.
          </p>
        </div>

        {/* Step 2 */}
        <div data-step className="absolute inset-0 flex flex-col items-center justify-center gap-7 px-6" style={{ opacity: 0 }}>
          <p className="font-mono text-base md:text-lg text-paper/60 uppercase tracking-widest flex items-center gap-2">
            <Sigma size={20} /> Step 2 — one derived quantity already contains both
          </p>
          <div className="border-[3px] border-green-1 bg-ink px-8 md:px-14 py-8 md:py-10 text-center">
            <p className="text-xs font-mono text-paper/50 uppercase mb-4 tracking-widest">Vapour Pressure Deficit</p>
            <Latex display className="text-green-1" math={"e_s(T) = 0.6108 \\cdot \\exp\\!\\left(\\dfrac{17.27\\,T}{T + 237.3}\\right)"} />
            <Latex display className="text-green-1 block mt-3" math={"VPD = e_s(T) - e_s(T) \\cdot \\dfrac{RH}{100}"} />
          </div>
          <p className="font-mono text-sm md:text-base text-paper/70 max-w-xl text-center">
            Stomata don&apos;t sense temperature or humidity. They sense the pull the surrounding air exerts on
            water inside the leaf — exactly what VPD measures.
          </p>
        </div>

        {/* Step 3 */}
        <div data-step className="absolute inset-0 flex flex-col items-center justify-center gap-10 px-6" style={{ opacity: 0 }}>
          <p className="font-mono text-base md:text-lg text-paper/60 uppercase tracking-widest flex items-center gap-2">
            <GitBranch size={20} /> Step 3 — the branch becomes clean
          </p>
          <div className="flex flex-col items-center gap-4">
            <div className="border-[3px] border-purple-1 text-purple-1 px-10 py-5 font-bold text-xl md:text-2xl">VPD</div>
            <ArrowDown size={28} />
            <div className="flex gap-6 md:gap-8 flex-wrap justify-center">
              <div className="border-2 border-green-1 text-green-1 px-5 py-3 text-sm md:text-base font-bold uppercase flex items-center gap-2">
                <Wind size={18} /> Below band → vent / dehumidify
              </div>
              <div className="border-2 border-purple-2 text-purple-2 px-5 py-3 text-sm md:text-base font-bold uppercase flex items-center gap-2">
                <CloudDrizzle size={18} /> Above band → mist / shade
              </div>
            </div>
          </div>
          <p className="font-mono text-sm md:text-base text-paper/70 max-w-xl text-center">
            One controlled variable — two actuators can never be commanded to fight. Contradictory
            commands become impossible by construction.
          </p>
        </div>
      </div>
    </section>
  );
}
