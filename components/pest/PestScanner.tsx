"use client";

import { useCallback, useRef, useState } from "react";
import Webcam from "react-webcam";
import { Bug, RotateCcw, Zap } from "lucide-react";
import { useSimulation } from "@/lib/SimulationContext";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { classifyLeaf, type ClassificationResult } from "@/lib/pestClassifier";
import { LeafCaptureStage, type CaptureStage } from "@/components/scan/LeafCapture";
import { PredictiveContext } from "@/components/scan/PredictiveContext";
import { Panel } from "@/components/ui/Panel";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

type Stage = CaptureStage | "result";

export function PestScanner() {
  const { state } = useSimulation();
  const { t } = useLanguage();
  const webcamRef = useRef<Webcam>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [stage, setStage] = useState<Stage>("idle");
  const [image, setImage] = useState<string | null>(null);
  const [webcamError, setWebcamError] = useState(false);
  const [result, setResult] = useState<ClassificationResult | null>(null);

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
    const r = await classifyLeaf(image);
    setResult(r);
    setStage("result");
  }

  function reset() {
    setStage("idle");
    setImage(null);
    setResult(null);
  }

  const hottestZone = [...state.zones].sort((a, b) => b.vpdLeaf - a.vpdLeaf)[0];

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Bug size={22} /> {t("pest.title")}
        </h2>
        <p className="text-sm text-shell-invert/60 font-mono mt-1">{t("pest.subtitle")}</p>
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
          scanningLabel={t("common.analysing")}
        />
      )}

      {stage === "result" && result && (
        <div className="flex flex-col gap-4">
          <Panel accent="purple" className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <PredictiveContext zone={hottestZone} />
              <div className="md:border-l-[3px] md:border-ink md:pl-6 flex flex-col gap-1">
                <p className="text-xs font-bold uppercase tracking-widest text-ink/60 flex items-center gap-2">
                  <Bug size={14} /> {t("pest.cvInference")}
                </p>
                <div className="flex items-start justify-between gap-4 flex-wrap mt-1">
                  <div>
                    <Badge tone="danger">{t("pest.pestDetected")}</Badge>
                    <p className="text-2xl md:text-3xl font-bold mt-2 uppercase">{t(`pestList.${result.pest.id}.name`)}</p>
                    <p className="text-xs font-mono text-ink/60 mt-1">{t("common.confidence")} {result.confidence}%</p>
                  </div>
                  <div className="border-[3px] border-ink bg-paper-dim px-4 py-3 text-center">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-ink/60">{t("common.confidence")}</p>
                    <p className="font-mono text-3xl font-bold">{result.confidence}%</p>
                  </div>
                </div>
                <p className="text-sm text-ink/70 mt-4 leading-relaxed">{t(`pestList.${result.pest.id}.treatment`)}</p>
              </div>
            </div>
          </Panel>

          {result.pest.highVpd && hottestZone && (
            <Panel accent="danger" className="p-5">
              <p className="text-xs font-bold uppercase tracking-widest text-danger mb-2 flex items-center gap-2">
                <Zap size={14} /> {t("pest.environmentalCrossReference")}
              </p>
              <p className="text-sm text-ink/80 leading-relaxed">
                {t("pest.envCrossRefBody", {
                  zone: t(`zone.${hottestZone.id}.label`),
                  vpd: hottestZone.vpdLeaf.toFixed(2),
                  pest: t(`pestList.${result.pest.id}.name`).toLowerCase(),
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
