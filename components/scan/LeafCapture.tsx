"use client";

import { RefObject } from "react";
import Webcam from "react-webcam";
import { Camera, Upload, ScanSearch, RotateCcw } from "lucide-react";
import { Panel } from "@/components/ui/Panel";
import { Button } from "@/components/ui/Button";

export type CaptureStage = "idle" | "preview" | "scanning";

export function CornerBrackets() {
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

export function LeafCaptureStage({
  stage,
  image,
  webcamRef,
  fileInputRef,
  webcamError,
  onWebcamError,
  onCapture,
  onFile,
  onAnalyze,
  onRetake,
  captureLabel = "Scan Leaf",
  scanningLabel = "Analysing...",
}: {
  stage: CaptureStage;
  image: string | null;
  webcamRef: RefObject<Webcam | null>;
  fileInputRef: RefObject<HTMLInputElement | null>;
  webcamError: boolean;
  onWebcamError: () => void;
  onCapture: () => void;
  onFile: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAnalyze: () => void;
  onRetake: () => void;
  captureLabel?: string;
  scanningLabel?: string;
}) {
  if (stage === "idle") {
    return (
      <Panel className="p-5">
        <div className="relative border-[3px] border-ink bg-ink aspect-video max-w-xl mx-auto overflow-hidden">
          {!webcamError ? (
            <Webcam
              ref={webcamRef}
              audio={false}
              screenshotFormat="image/jpeg"
              videoConstraints={{ facingMode: "environment" }}
              onUserMediaError={onWebcamError}
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
            onClick={onCapture}
            disabled={webcamError}
          >
            <Camera size={18} /> {captureLabel}
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
            onChange={onFile}
          />
        </div>
      </Panel>
    );
  }

  if ((stage === "preview" || stage === "scanning") && image) {
    return (
      <Panel className="p-5">
        <div className="relative border-[3px] border-ink bg-ink aspect-video max-w-xl mx-auto overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image} alt="Captured leaf" className="w-full h-full object-cover" />
          <CornerBrackets />
          {stage === "scanning" && (
            <div className="absolute inset-x-0 bottom-0 bg-ink/80 p-3">
              <p className="text-[10px] font-mono uppercase tracking-widest text-purple-2 mb-1.5">
                {scanningLabel}
              </p>
              <div className="h-3 border-2 border-purple-1 bg-ink overflow-hidden">
                <div className="h-full bg-purple-1 animate-scanfill" />
              </div>
            </div>
          )}
        </div>
        {stage === "preview" && (
          <div className="flex items-center justify-center gap-3 mt-5">
            <Button tone="purple" className="text-base px-8 py-4 flex items-center gap-2" onClick={onAnalyze}>
              <ScanSearch size={18} /> Analyze
            </Button>
            <Button tone="paper" onClick={onRetake} className="flex items-center gap-2">
              <RotateCcw size={14} /> Retake
            </Button>
          </div>
        )}
      </Panel>
    );
  }

  return null;
}
