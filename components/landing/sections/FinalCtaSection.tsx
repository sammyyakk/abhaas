import Link from "next/link";
import { ArrowDown } from "lucide-react";

export function FinalCtaSection() {
  return (
    <section className="border-t-[6px] border-green-1 bg-ink text-paper px-5 md:px-10 py-20 md:py-28 flex flex-col items-center text-center gap-8">
      <p data-reveal className="text-2xl md:text-4xl lg:text-5xl font-bold max-w-3xl leading-tight">
        Abhaas turns a polyhouse from something you monitor into something you can rehearse.
      </p>
      <Link
        data-reveal
        href="/dashboard/twin"
        className="inline-flex items-center gap-2 bg-green-1 text-ink border-[3px] border-paper px-8 py-4 text-base font-bold uppercase tracking-widest shadow-[8px_8px_0_#000] hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-[5px_5px_0_#000] transition-transform"
      >
        Enter Twin <ArrowDown size={18} />
      </Link>
      <p data-reveal className="text-[11px] font-mono text-paper/40 mt-6">
        ABHAAS · Team Nirvaah · PS3 Smart Polyhouse Management Interface · Avinya 2026 · Prakriti ×
        Techniche · IIT Guwahati
      </p>
    </section>
  );
}
