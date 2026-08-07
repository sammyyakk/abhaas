"use client";

import { useCallback, useRef, useState } from "react";
import Webcam from "react-webcam";
import { Bug, Camera, Upload, ScanSearch, RotateCcw, Zap } from "lucide-react";
import { useSimulation } from "@/lib/SimulationContext";
import { classifyLeaf, type ClassificationResult } from "@/lib/pestClassifier";
import { Panel } from "@/components/ui/Panel";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

type Stage = "idle" | "preview" | "scanning" | "result";

function CornerBrackets() {
  const corner = "absolute w-8 h-8 border-purple-1";
  return (
    <>
      <span className={`${corner} top-2 left-2 border-t-4 border-l-4`} />
      <span className={`${corner} top-2 right-2 border-t-4 border-r-4`} />
      <span className={`${corner} bottom-2 left-2 border-b-4 border-l-4`} />
      <span className={`${corner} bottom-2 right-2 border-b-4 border-r-4`} />
    </>
  );
}

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

      {stage === "idle" && (
        <Panel className="p-5">
          <div className="relative border-[3px] border-ink bg-ink aspect-video max-w-xl mx-auto overflow-hidden">
            {!webcamError ? (
              <Webcam
                ref={webcamRef}
                audio={false}
                screenshotFormat="image/jpeg"
                videoConstraints={{ facingMode: "environment" }}
                onUserMediaError={() => setWebcamError(true)}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-paper/50 font-mono text-sm text-center px-4">
                Camera unavailable — use &quot;upload a photo&quot; below instead.
              </div>
            )}
            <CornerBrackets />
          </div>
          <div className="flex flex-col items-center gap-3 mt-5">
            <Button
              tone="purple"
              className="text-base px-8 py-4 flex items-center gap-2"
              onClick={capture}
              disabled={webcamError}
            >
              <Camera size={18} /> Scan Leaf
            </Button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-xs font-mono uppercase tracking-wider text-ink/50 hover:text-ink underline flex items-center gap-1.5"
            >
              <Upload size={12} /> or upload a photo instead
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleFile}
            />
          </div>
        </Panel>
      )}

      {(stage === "preview" || stage === "scanning") && image && (
        <Panel className="p-5">
          <div className="relative border-[3px] border-ink bg-ink aspect-video max-w-xl mx-auto overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={image} alt="Captured leaf" className="w-full h-full object-cover" />
            <CornerBrackets />
            {stage === "scanning" && (
              <div className="absolute inset-x-0 bottom-0 bg-ink/80 p-3">
                <p className="text-[10px] font-mono uppercase tracking-widest text-purple-2 mb-1.5">
                  Analysing...
                </p>
                <div className="h-3 border-2 border-purple-1 bg-ink overflow-hidden">
                  <div className="h-full bg-purple-1 animate-scanfill" />
                </div>
              </div>
            )}
          </div>
          {stage === "preview" && (
            <div className="flex items-center justify-center gap-3 mt-5">
              <Button tone="purple" className="text-base px-8 py-4 flex items-center gap-2" onClick={runScan}>
                <ScanSearch size={18} /> Analyze
              </Button>
              <Button tone="paper" onClick={reset} className="flex items-center gap-2">
                <RotateCcw size={14} /> Retake
              </Button>
            </div>
          )}
        </Panel>
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
