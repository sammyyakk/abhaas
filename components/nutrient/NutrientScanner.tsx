"use client";

import { useCallback, useRef, useState } from "react";
import Webcam from "react-webcam";
import { Leaf, RotateCcw, Sparkles, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useSimulation } from "@/lib/SimulationContext";
import {
  classifyNutrient,
  dominantLimitingFactor,
  factorLabel,
  type NutrientResult,
} from "@/lib/nutrientClassifier";
import { LeafCaptureStage, type CaptureStage } from "@/components/scan/LeafCapture";
import { PredictiveContext } from "@/components/scan/PredictiveContext";
import { Panel } from "@/components/ui/Panel";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { StatTile } from "@/components/ui/StatTile";

type Stage = CaptureStage | "result";

const WATER_CONFUSABLE_FACTORS = new Set(["soil", "cwsi"]);

export function NutrientScanner() {
  const { state } = useSimulation();
  const webcamRef = useRef<Webcam>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [stage, setStage] = useState<Stage>("idle");
  const [image, setImage] = useState<string | null>(null);
  const [webcamError, setWebcamError] = useState(false);
  const [result, setResult] = useState<NutrientResult | null>(null);

  const capture = useCallback(() => {
    const shot = webcamRef.current?.getScreenshot();
    if (shot) {
      setImage(shot);
      setStage("preview");
    }
  }, []);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setImage(reader.result as string);
      setStage("preview");
    };
    reader.readAsDataURL(file);
  }

  async function runScan() {
    if (!image) return;
    setStage("scanning");
    const r = await classifyNutrient(image);
    setResult(r);
    setStage("result");
  }

  function reset() {
    setStage("idle");
    setImage(null);
    setResult(null);
  }

  const limiting = dominantLimitingFactor(state.zones);
  const waterConfusable = limiting && WATER_CONFUSABLE_FACTORS.has(limiting.factor);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Leaf size={22} /> Nutrient AI
        </h2>
        <p className="text-sm text-shell-invert/60 font-mono mt-1">
          Scan a leaf. A lightweight on-device model flags the probable deficiency, fused against the
          twin&apos;s own limiting-factor state so it doesn&apos;t mistake water stress for nutrition.
        </p>
      </div>

      {stage !== "result" && (
        <LeafCaptureStage
          stage={stage}
          image={image}
          webcamRef={webcamRef}
          fileInputRef={fileInputRef}
          webcamError={webcamError}
          onWebcamError={() => setWebcamError(true)}
          onCapture={capture}
          onFile={handleFile}
          onAnalyze={runScan}
          onRetake={reset}
          captureLabel="Scan Leaf"
          scanningLabel="Analysing leaf morphology..."
        />
      )}

      {stage === "result" && result && (
        <div className="flex flex-col gap-4">
          <Panel accent="purple" className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <PredictiveContext zone={limiting ? limiting.zone : state.zones[0]} />
              <div className="md:border-l-[3px] md:border-ink md:pl-6 flex flex-col gap-1">
                <p className="text-xs font-bold uppercase tracking-widest text-ink/60 flex items-center gap-2">
                  <Leaf size={14} /> CV inference
                </p>
                <div className="flex items-start justify-between gap-4 flex-wrap mt-1">
                  <div>
                    <Badge tone="danger">Deficiency Detected</Badge>
                    <p className="text-2xl md:text-3xl font-bold mt-2">{result.deficiency.name}</p>
                    <p className="text-xs font-mono text-ink/60 mt-1">
                      Symptom: {result.deficiency.symptom} · Confidence {result.confidence}%
                    </p>
                  </div>
                  <div className="border-[3px] border-ink bg-paper-dim px-4 py-3 text-center">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-ink/60">Confidence</p>
                    <p className="font-mono text-3xl font-bold">{result.confidence}%</p>
                  </div>
                </div>
                <p className="text-sm text-ink/70 mt-4 leading-relaxed">
                  <span className="font-bold">Recommended:</span> {result.deficiency.action}
                </p>
                <p className="text-sm text-ink/70 mt-1 leading-relaxed">
                  <span className="font-bold">Expected impact:</span> {result.deficiency.impact}
                </p>
              </div>
            </div>
          </Panel>

          <Panel className="p-5">
            <h3 className="text-sm font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
              <Sparkles size={16} /> Outcome forecasting
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <StatTile label="Est. Yield Recovery" value={`+${result.yieldRecoveryPct}`} unit="%" color="#59931c" />
              <StatTile
                label="Est. Resource Savings"
                value={result.waterSavingsPct > 0 ? `+${result.waterSavingsPct}` : "0"}
                unit="%"
                color="#7d559c"
              />
            </div>
            <p className="text-[11px] font-mono text-ink/50 mt-3">
              Modelled estimates from confidence and deficiency type — not a validated yield model.
            </p>
          </Panel>

          {limiting && (
            <Panel accent={waterConfusable ? "danger" : "green"} className="p-5">
              <p
                className={`text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-2 ${
                  waterConfusable ? "text-danger" : "text-green-3"
                }`}
              >
                {waterConfusable ? <AlertTriangle size={14} /> : <CheckCircle2 size={14} />} Environmental
                fusion
              </p>
              {waterConfusable ? (
                <p className="text-sm text-ink/80 leading-relaxed">
                  <span className="font-bold">{limiting.zone.label}</span>&apos;s dominant crop-stress term
                  right now is <span className="font-bold">{factorLabel(limiting.factor)}</span> — the exact
                  failure mode that gets mistaken for a nutrient deficiency. Rule out water stress in this
                  zone before committing to {result.deficiency.name.toLowerCase()} treatment.
                </p>
              ) : (
                <p className="text-sm text-ink/80 leading-relaxed">
                  No competing water-stress signal in the house — <span className="font-bold">{limiting.zone.label}</span>
                  &apos;s dominant term is {factorLabel(limiting.factor)}, unrelated to nutrition. Environmental
                  fusion supports this diagnosis rather than contradicting it.
                </p>
              )}
            </Panel>
          )}

          <Button tone="ink" onClick={reset} className="self-start flex items-center gap-2">
            <RotateCcw size={14} /> Scan Another Leaf
          </Button>
        </div>
      )}
    </div>
  );
}
