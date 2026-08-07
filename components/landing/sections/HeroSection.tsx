import Image from "next/image";
import Link from "next/link";
import { Users, Sprout, Trophy, ArrowDown, ArrowRight } from "lucide-react";

const TICKER = [
  "NO CONTRADICTORY COMMANDS",
  "UNIFIED LEAF VPD",
  "BUDGET OPTIMISED",
  "ZONE-AWARE",
  "STAGE-AWARE",
  "FAULT-AWARE",
  "REHEARSABLE",
];

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden border-b-[6px] border-green-1">
      <div
        className="absolute inset-0 opacity-[0.07] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(#67cf00 1px, transparent 1px), linear-gradient(90deg, #67cf00 1px, transparent 1px)",
          backgroundSize: "42px 42px",
        }}
      />

      <div className="relative mx-auto max-w-6xl w-full px-5 md:px-10 py-16 md:py-24">
        <div className="flex flex-wrap items-center gap-2 mb-10" data-reveal>
          <span className="inline-flex items-center gap-1.5 border-2 border-shell-invert bg-green-1 text-ink px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
            <Users size={12} /> Team Nirvaah
          </span>
          <span className="inline-flex items-center gap-1.5 border-2 border-shell-invert bg-purple-2 text-ink px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
            <Sprout size={12} /> PS3 · Smart Polyhouse Management
          </span>
          <span className="inline-flex items-center gap-1.5 border-2 border-shell-invert bg-shell text-shell-invert px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
            <Trophy size={12} /> Avinya 2026
          </span>
        </div>

        <div className="flex flex-col md:flex-row md:items-center gap-10 md:gap-14">
          <div className="relative shrink-0 mx-auto md:mx-0" data-reveal>
            <div
              className="absolute -inset-3 -z-10 opacity-40 blur-xl"
              style={{ background: "radial-gradient(circle, var(--color-purple-1), transparent 70%)" }}
            />
            <Image
              src="/abhaas_logo.png"
              alt="Abhaas logo"
              width={1084}
              height={1177}
              priority
              className="w-40 md:w-56 aspect-[1084/1177] border-[3px] border-shell-invert object-cover"
              style={{ boxShadow: "8px 8px 0 var(--shadow-purple)" }}
            />
          </div>

          <div className="min-w-0 text-center md:text-left" data-reveal>
            <h1 className="font-wordmark text-7xl md:text-9xl lg:text-[10rem] leading-[0.85]">
              <span className="text-green-1">ABH</span>
              <span className="text-purple-1">AAS</span>
            </h1>
            <p className="mt-6 inline-block bg-purple-1/15 px-2 text-2xl md:text-4xl font-bold uppercase tracking-tight">
              Rehearse before you act.
            </p>
            <p className="mt-4 text-base md:text-lg font-mono text-shell-invert/70 max-w-2xl mx-auto md:mx-0">
              Every other team ships an alerting tool: read a sensor, cross a threshold, print a
              warning. Abhaas is a growth-stage-aware digital twin — it turns that alert into a
              decision you can test first.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center md:justify-start gap-4">
              <Link
                href="/dashboard/twin"
                className="inline-flex items-center gap-2 bg-green-1 text-ink border-[3px] border-shell-invert px-8 py-4 text-base font-bold uppercase tracking-widest shadow-[8px_8px_0_var(--shadow-ink)] hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-[5px_5px_0_var(--shadow-ink)] transition-transform"
              >
                Enter Twin <ArrowDown size={18} />
              </Link>
              <a
                href="#problem"
                className="inline-flex items-center gap-1.5 text-sm font-bold uppercase tracking-widest text-shell-invert/60 hover:text-shell-invert transition-colors"
              >
                See the problem <ArrowRight size={14} />
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="relative border-t-[3px] border-shell-invert/20 bg-ink text-paper overflow-hidden py-2.5 mt-auto">
        <div className="flex whitespace-nowrap animate-marquee w-max">
          {[...TICKER, ...TICKER].map((word, i) => (
            <span key={i} className="mx-4 text-xs font-bold uppercase tracking-widest font-mono">
              {word} <span className="text-purple-2 mx-3">{"//"}</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
