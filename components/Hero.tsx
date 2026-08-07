import Image from "next/image";
import { Badge } from "./ui/Badge";

const TICKER = [
  "ZONED",
  "PHYSIOLOGICAL",
  "STAGE-AWARE",
  "PREDICTIVE",
  "OPTIMISED",
  "RISK-FORECASTING",
  "FAULT-AWARE",
  "REHEARSABLE",
];

export function Hero() {
  return (
    <header className="relative overflow-hidden border-b-[6px] border-green-1 bg-ink">
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(#67cf00 1px, transparent 1px), linear-gradient(90deg, #67cf00 1px, transparent 1px)",
          backgroundSize: "42px 42px",
        }}
      />
      <div className="relative mx-auto max-w-6xl px-5 md:px-10 pt-10 md:pt-16 pb-10">
        <div className="flex flex-wrap items-center gap-2 mb-8">
          <Badge tone="nominal">Team Nirvaah</Badge>
          <Badge tone="info">PS3 · Smart Polyhouse Management</Badge>
          <Badge tone="paper">Avinya 2026</Badge>
        </div>

        <div className="flex flex-col md:flex-row md:items-center gap-8 md:gap-12">
          <Image
            src="/abhaas_logo.png"
            alt="Abhaas logo"
            width={220}
            height={220}
            priority
            className="w-32 h-32 md:w-56 md:h-56 border-[3px] border-paper shrink-0 object-cover"
          />
          <div className="min-w-0">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight">
              <span className="text-green-1">ABHA</span>
              <span className="text-purple-1">AS</span>
            </h1>
            <p className="mt-4 text-base md:text-xl font-mono text-paper/80 max-w-2xl">
              A growth-stage-aware digital twin for smart polyhouse management. Live simulated
              temperature, soil moisture &amp; humidity — turned into ventilation and watering
              decisions, automatically.
            </p>
            <blockquote className="mt-5 border-l-4 border-purple-1 pl-4 text-sm md:text-base text-paper/60 italic max-w-xl">
              Every other team tells you when to water. We show you what happens if you do.
            </blockquote>
            <div className="mt-7">
              <a
                href="#dashboard"
                className="inline-block bg-green-1 text-ink border-[3px] border-paper px-6 py-3 text-sm font-bold uppercase tracking-widest shadow-[6px_6px_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0_#000] transition-transform"
              >
                Enter the Twin ↓
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="relative border-t-[3px] border-paper/20 bg-paper text-ink overflow-hidden py-2">
        <div className="flex whitespace-nowrap animate-marquee w-max">
          {[...TICKER, ...TICKER].map((word, i) => (
            <span key={i} className="mx-4 text-xs font-bold uppercase tracking-widest font-mono">
              {word} <span className="text-purple-3 mx-3">/</span>
            </span>
          ))}
        </div>
      </div>
    </header>
  );
}
