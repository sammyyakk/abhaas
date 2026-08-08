"use client";

import { useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const BOOT_LINES = [
  "> INIT ABHAAS_TWIN",
  "> ZONE[VENT] ... OK",
  "> ZONE[CENTRE] ... OK",
  "> ZONE[FAR] ... OK",
  "> VPD ENGINE ... OK",
  "> GDD ACCUMULATOR ... OK",
  "> FAULT DETECTOR ... ARMED",
  "> STATUS: NOMINAL",
];

const HUD_STATS = [
  { key: "vpd", label: "VPD", rest: "0.86", unit: "kPa" },
  { key: "csi", label: "CSI", rest: "61", unit: "" },
  { key: "gdd", label: "GDD", rest: "742", unit: "" },
  { key: "dsv", label: "DSV", rest: "9", unit: "" },
] as const;

const CORNER_POS: Record<string, string> = {
  vpd: "top-6 left-6 md:top-10 md:left-10 items-start text-left",
  csi: "top-6 right-6 md:top-10 md:right-10 items-end text-right",
  gdd: "bottom-6 left-6 md:bottom-10 md:left-10 items-start text-left",
  dsv: "bottom-6 right-6 md:bottom-10 md:right-10 items-end text-right",
};

function randomDigits(rest: string) {
  const n = rest.includes(".") ? Math.random() * 3 : Math.floor(Math.random() * 999);
  return rest.includes(".") ? n.toFixed(2) : String(n);
}

export function IntroLoader() {
  const [finished, setFinished] = useState(false);
  const [lines, setLines] = useState<string[]>([]);
  const [hud, setHud] = useState<Record<string, string>>(() =>
    Object.fromEntries(HUD_STATS.map((s) => [s.key, s.rest]))
  );
  const [glitching, setGlitching] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);
  const leftPanelRef = useRef<HTMLDivElement>(null);
  const rightPanelRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const dividerARef = useRef<HTMLDivElement>(null);
  const dividerBRef = useRef<HTMLDivElement>(null);
  const wordmarkRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  useLayoutEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function finish() {
      document.body.style.overflow = prevOverflow;
      ScrollTrigger.refresh();
      setFinished(true);
    }

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion) {
      const tl = gsap.timeline({ delay: 0.1, onComplete: finish });
      tl.to(rootRef.current, { opacity: 0, duration: 0.3, ease: "power1.out" });
      return () => {
        tl.kill();
        document.body.style.overflow = prevOverflow;
      };
    }

    const hudInterval = window.setInterval(() => {
      setHud((prev) => {
        const next = { ...prev };
        HUD_STATS.forEach((s) => {
          next[s.key] = randomDigits(s.rest);
        });
        return next;
      });
    }, 60);

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ onComplete: finish });
      timelineRef.current = tl;

      tl.fromTo(frameRef.current, { scaleX: 0 }, { scaleX: 1, duration: 0.3, ease: "power2.out" }, 0);

      BOOT_LINES.forEach((line, i) => {
        tl.call(() => setLines((prev) => [...prev, line]), undefined, 0.3 + i * 0.09);
      });

      tl.call(
        () => {
          window.clearInterval(hudInterval);
          setHud(Object.fromEntries(HUD_STATS.map((s) => [s.key, s.rest])));
        },
        undefined,
        1.5
      );

      tl.fromTo(
        [dividerARef.current, dividerBRef.current],
        { scaleY: 0 },
        { scaleY: 1, duration: 0.35, stagger: 0.12, ease: "power2.out", transformOrigin: "top" },
        1.0
      );

      tl.fromTo(
        wordmarkRef.current,
        { opacity: 0, scale: 0.82 },
        { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(2)" },
        1.55
      );
      tl.call(() => setGlitching(true), undefined, 1.55);
      tl.call(() => setGlitching(false), undefined, 1.85);

      tl.set(leftPanelRef.current, { backgroundColor: "#67cf00" }, 2.2);
      tl.set(rightPanelRef.current, { backgroundColor: "#ce69ea" }, 2.2);
      tl.to(contentRef.current, { opacity: 0, duration: 0.15 }, 2.2);
      tl.to(leftPanelRef.current, { xPercent: -100, duration: 0.5, ease: "power4.inOut" }, 2.35);
      tl.to(rightPanelRef.current, { xPercent: 100, duration: 0.5, ease: "power4.inOut" }, 2.35);
    }, rootRef);

    function skip() {
      const tl = timelineRef.current;
      if (!tl || tl.progress() === 1) return;
      tl.tweenTo(tl.duration(), { duration: 0.4, ease: "power2.out" });
    }
    window.addEventListener("pointerdown", skip);
    window.addEventListener("keydown", skip);

    return () => {
      window.clearInterval(hudInterval);
      window.removeEventListener("pointerdown", skip);
      window.removeEventListener("keydown", skip);
      ctx.revert();
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  if (finished) return null;

  return (
    <div ref={rootRef} className="fixed inset-0 z-[999] font-mono" role="presentation" aria-hidden>
      <div ref={leftPanelRef} className="fixed top-0 left-0 h-full w-1/2 bg-ink" />
      <div ref={rightPanelRef} className="fixed top-0 right-0 h-full w-1/2 bg-ink" />

      <div ref={contentRef} className="fixed inset-0 pointer-events-none">
        <div
          ref={frameRef}
          className="absolute inset-4 md:inset-8 border-2 border-green-1"
          style={{ transformOrigin: "center" }}
        />

        <div className="absolute top-10 left-10 md:top-14 md:left-14 text-[11px] md:text-xs text-green-1 uppercase tracking-widest flex flex-col gap-1">
          {lines.map((line, i) => (
            <span key={i}>{line}</span>
          ))}
          <span className="animate-blink">_</span>
        </div>

        {HUD_STATS.map((s) => (
          <div
            key={s.key}
            className={`absolute flex flex-col gap-0.5 text-[10px] md:text-xs text-purple-1 uppercase tracking-widest ${CORNER_POS[s.key]}`}
          >
            <span className="opacity-60">{s.label}</span>
            <span className="text-lg md:text-xl font-bold text-shell-invert">
              {hud[s.key]}
              {s.unit ? <span className="text-xs opacity-60 ml-1">{s.unit}</span> : null}
            </span>
          </div>
        ))}

        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-[280px] h-[160px] md:w-[380px] md:h-[200px] border-2 border-purple-2/70">
            <div ref={dividerARef} className="absolute top-0 left-1/3 w-px h-full bg-purple-2/70" />
            <div ref={dividerBRef} className="absolute top-0 left-2/3 w-px h-full bg-purple-2/70" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                ref={wordmarkRef}
                className={`font-wordmark text-4xl md:text-6xl flex ${glitching ? "animate-glitch-jitter" : ""}`}
                style={{ opacity: 0 }}
              >
                <span className="text-green-1">ABH</span>
                <span className="text-purple-1">AAS</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
