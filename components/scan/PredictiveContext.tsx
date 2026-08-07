import { Activity } from "lucide-react";
import type { ZoneState } from "@/lib/types";
import { StatTile } from "@/components/ui/StatTile";

/**
 * Left column of the Dual Diagnostic Card, the predictive-environmental
 * half. Every number here already exists in the engine (pestDD/EDD, DSV,
 * leaf wetness, VPD, csiBreakdown risk %), this panel surfaces it
 * alongside the CV inference rather than computing anything new.
 */
export function PredictiveContext({ zone }: { zone: ZoneState }) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs font-bold uppercase tracking-widest text-ink/60 flex items-center gap-2">
        <Activity size={14} /> Predictive context: {zone.label}
      </p>
      <div className="grid grid-cols-2 gap-2">
        <StatTile label="Pest EDD (ΣDD)" value={zone.pestDD.toFixed(0)} unit="DD" />
        <StatTile label="Disease (ΣDSV)" value={zone.dsv.toFixed(0)} unit="DSV" />
        <StatTile label="Leaf Wetness" value={zone.leafWetHoursToday.toFixed(1)} unit="h today" />
        <StatTile label="Leaf VPD" value={zone.vpdLeaf.toFixed(2)} unit="kPa" color="#7d559c" />
        <StatTile
          label="Pest Risk"
          value={zone.csiBreakdown.pest.toFixed(0)}
          unit="%"
          color={zone.csiBreakdown.pest > 50 ? "#ff2d2d" : "#59931c"}
        />
        <StatTile
          label="Disease Risk"
          value={zone.csiBreakdown.disease.toFixed(0)}
          unit="%"
          color={zone.csiBreakdown.disease > 50 ? "#ff2d2d" : "#59931c"}
        />
      </div>
    </div>
  );
}
