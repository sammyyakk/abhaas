"use client";

import { useCallback, useRef, useState } from "react";
import Webcam from "react-webcam";
import { Bug, RotateCcw, Zap } from "lucide-react";
import { useSimulation } from "@/lib/SimulationContext";
import { classifyLeaf, type ClassificationResult } from "@/lib/pestClassifier";
import { LeafCaptureStage, type CaptureStage } from "@/components/scan/LeafCapture";
import { Panel } from "@/components/ui/Panel";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

type Stage = CaptureStage | "result";

export function PestScanner() {
  const { state } = useSimulation();
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
          <Bug size={22} /> Pest ID
        </h2>
        <p className="text-sm text-shell-invert/60 font-mono mt-1">
          Scan a leaf. A lightweight on-device model flags the pest — swappable for a real ONNX/TF.js
          model later. Fused with the live environmental state for extra confidence.
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
          scanningLabel="Analysing..."
        />
      )}

      {stage === "result" && result && (
        <div className="flex flex-col gap-4">
          <Panel accent="purple" className="p-6">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <Badge tone="danger">Pest Detected</Badge>
                <p className="text-2xl md:text-3xl font-bold mt-2 uppercase">{result.pest.name}</p>
                <p className="text-xs font-mono text-ink/60 mt-1">Confidence {result.confidence}%</p>
              </div>
              <div className="border-[3px] border-ink bg-paper-dim px-4 py-3 text-center">
                <p className="text-[10px] font-bold uppercase tracking-widest text-ink/60">Confidence</p>
                <p className="font-mono text-3xl font-bold">{result.confidence}%</p>
              </div>
            </div>
            <p className="text-sm text-ink/70 mt-4 leading-relaxed">{result.pest.treatment}</p>
          </Panel>

          {result.pest.highVpd && hottestZone && (
            <Panel accent="danger" className="p-5">
              <p className="text-xs font-bold uppercase tracking-widest text-danger mb-2 flex items-center gap-2">
                <Zap size={14} /> Environmental cross-reference
              </p>
              <p className="text-sm text-ink/80 leading-relaxed">
                <span className="font-bold">{hottestZone.label}</span> is currently at{" "}
                <span className="font-mono font-bold">{hottestZone.vpdLeaf.toFixed(2)} kPa</span> leaf VPD —
                the highest in the house, and exactly the high-VPD, low-humidity condition {result.pest.name.toLowerCase()}{" "}
                favour. The controller is already managing this zone for plant stress; the same number is
                now also a pest-risk signal.
              </p>
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
