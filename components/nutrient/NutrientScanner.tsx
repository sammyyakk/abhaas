"use client";

import { useCallback, useRef, useState } from "react";
import Webcam from "react-webcam";
import { Leaf, RotateCcw, Sparkles, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useSimulation } from "@/lib/SimulationContext";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { classifyNutrient, dominantLimitingFactor, type NutrientResult } from "@/lib/nutrientClassifier";
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
  const { t } = useLanguage();
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
          <Leaf size={22} /> {t("nutrient.title")}
        </h2>
        <p className="text-sm text-shell-invert/60 font-mono mt-1">{t("nutrient.subtitle")}</p>
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
          captureLabel={t("common.scanLeaf")}
          scanningLabel={t("common.analysingMorphology")}
        />
      )}

      {stage === "result" && result && (
        <div className="flex flex-col gap-4">
          <Panel accent="purple" className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <PredictiveContext zone={limiting ? limiting.zone : state.zones[0]} />
              <div className="md:border-l-[3px] md:border-ink md:pl-6 flex flex-col gap-1">
                <p className="text-xs font-bold uppercase tracking-widest text-ink/60 flex items-center gap-2">
                  <Leaf size={14} /> {t("nutrient.cvInference")}
                </p>
                <div className="flex items-start justify-between gap-4 flex-wrap mt-1">
                  <div>
                    <Badge tone="danger">{t("nutrient.deficiencyDetected")}</Badge>
                    <p className="text-2xl md:text-3xl font-bold mt-2">{t(`nutrientList.${result.deficiency.id}.name`)}</p>
                    <p className="text-xs font-mono text-ink/60 mt-1">
                      {t("nutrient.symptomLabel")}: {t(`nutrientList.${result.deficiency.id}.symptom`)} · {t("common.confidence")} {result.confidence}%
                    </p>
                  </div>
                  <div className="border-[3px] border-ink bg-paper-dim px-4 py-3 text-center">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-ink/60">{t("common.confidence")}</p>
                    <p className="font-mono text-3xl font-bold">{result.confidence}%</p>
                  </div>
                </div>
                <p className="text-sm text-ink/70 mt-4 leading-relaxed">
                  <span className="font-bold">{t("common.recommended")}:</span> {t(`nutrientList.${result.deficiency.id}.action`)}
                </p>
                <p className="text-sm text-ink/70 mt-1 leading-relaxed">
                  <span className="font-bold">{t("common.expectedImpact")}:</span> {t(`nutrientList.${result.deficiency.id}.impact`)}
                </p>
              </div>
            </div>
          </Panel>

          <Panel className="p-5">
            <h3 className="text-sm font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
              <Sparkles size={16} /> {t("nutrient.outcomeForecasting")}
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <StatTile label={t("nutrient.estYieldRecovery")} value={`+${result.yieldRecoveryPct}`} unit="%" color="#59931c" />
              <StatTile
                label={t("nutrient.estResourceSavings")}
                value={result.waterSavingsPct > 0 ? `+${result.waterSavingsPct}` : "0"}
                unit="%"
                color="#7d559c"
              />
            </div>
            <p className="text-[11px] font-mono text-ink/50 mt-3">{t("nutrient.modelledEstimateCaption")}</p>
          </Panel>

          {limiting && (
            <Panel accent={waterConfusable ? "danger" : "green"} className="p-5">
              <p
                className={`text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-2 ${
                  waterConfusable ? "text-danger" : "text-green-3"
                }`}
              >
                {waterConfusable ? <AlertTriangle size={14} /> : <CheckCircle2 size={14} />} {t("nutrient.environmentalFusion")}
              </p>
              <p className="text-sm text-ink/80 leading-relaxed">
                {waterConfusable
                  ? t("nutrient.fusionConfusable", {
                      zone: t(`zone.${limiting.zone.id}.label`),
                      factor: t(`factor.${limiting.factor}`),
                      deficiency: t(`nutrientList.${result.deficiency.id}.name`).toLowerCase(),
                    })
                  : t("nutrient.fusionClear", {
                      zone: t(`zone.${limiting.zone.id}.label`),
                      factor: t(`factor.${limiting.factor}`),
                    })}
              </p>
            </Panel>
          )}

          <Button tone="ink" onClick={reset} className="self-start flex items-center gap-2">
            <RotateCcw size={14} /> {t("common.scanAnotherLeaf")}
          </Button>
        </div>
      )}
    </div>
  );
}
