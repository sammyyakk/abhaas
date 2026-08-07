"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { LandingNav } from "./LandingNav";
import { HeroSection } from "./sections/HeroSection";
import { ProblemSection } from "./sections/ProblemSection";
import { InsightSection } from "./sections/InsightSection";
import { FeaturesSection } from "./sections/FeaturesSection";
import { SandboxTeaserSection } from "./sections/SandboxTeaserSection";
import { FinalCtaSection } from "./sections/FinalCtaSection";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 36 },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            ease: "power2.out",
            scrollTrigger: { trigger: el, start: "top 88%", toggleActions: "play none none reverse" },
          }
        );
      });

      const insightSteps = gsap.utils.toArray<HTMLElement>("#insight-pin [data-step]");
      if (insightSteps.length) {
        gsap.set(insightSteps, { opacity: 0, y: 30 });
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: "#insight-pin",
            start: "top top",
            end: "+=1800",
            scrub: 1,
            pin: true,
            anticipatePin: 1,
          },
        });
        insightSteps.forEach((step, i) => {
          tl.to(step, { opacity: 1, y: 0, duration: 0.4 });
          tl.to({}, { duration: 0.5 });
          if (i < insightSteps.length - 1) tl.to(step, { opacity: 0, y: -30, duration: 0.4 });
        });
      }

      const featureCards = gsap.utils.toArray<HTMLElement>("#features-pin [data-card]");
      if (featureCards.length) {
        gsap.set(featureCards, { opacity: 0, y: 50, scale: 0.92 });
        gsap.timeline({
          scrollTrigger: {
            trigger: "#features-pin",
            start: "top top",
            end: "+=" + featureCards.length * 180,
            scrub: 1,
            pin: true,
            anticipatePin: 1,
          },
        }).to(featureCards, { opacity: 1, y: 0, scale: 1, stagger: 0.5, ease: "power2.out" }, 0);
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="bg-shell text-shell-invert">
      <LandingNav />
      <HeroSection />
      <ProblemSection />
      <InsightSection />
      <FeaturesSection />
      <SandboxTeaserSection />
      <FinalCtaSection />
    </div>
  );
}
