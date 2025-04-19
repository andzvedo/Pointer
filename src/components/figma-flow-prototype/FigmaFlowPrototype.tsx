"use client";
import React, { useState } from "react";
import { EntryPointScreen } from "./EntryPointScreen";
import { ProcessingScreen } from "./ProcessingScreen";
import { ErrorScreen } from "./ErrorScreen";
import { SuccessScreen } from "./SuccessScreen";
import { ExtractedDataScreen } from "./ExtractedDataScreen";
import { PreviewScreen } from "./PreviewScreen";
import { ExportScreen } from "./ExportScreen";

// Dummy data for extracted components and SVG
const dummyComponents = [
  { name: "ButtonPrimary", type: "Button" },
  { name: "InputField", type: "Input" },
  { name: "CardContainer", type: "Card" },
];
const dummySVG = `<svg width='64' height='64'><rect width='64' height='64' rx='8' fill='#E5E5E5'/><circle cx='32' cy='32' r='20' fill='#2563eb'/></svg>`;

// Possible states
const states = [
  "entry",
  "processing",
  "error",
  "success",
  "extracted",
  "preview",
  "export"
] as const;
type FlowState = typeof states[number];

export const FigmaFlowPrototype: React.FC = () => {
  const [state, setState] = useState<FlowState>("entry");
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [exportStatus, setExportStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  // Simulate transitions with dummy logic
  const handleSubmit = (url: string) => {
    setState("processing");
    setTimeout(() => {
      if (url.startsWith("https://figma.com/")) {
        setState("success");
      } else {
        setError("URL inválida. Tente novamente.");
        setState("error");
      }
    }, 1200);
  };
  const handleRetry = () => {
    setUrl("");
    setError("");
    setState("entry");
  };
  const handleSuccessNext = () => setState("extracted");
  const handleCopyAll = () => alert("Componentes copiados!");
  const handleExtractedNext = () => setState("preview");
  const handleCopySVG = () => alert("SVG copiado!");
  const handleDownloadSVG = () => alert("Download iniciado!");
  const handlePreviewNext = () => setState("export");
  const handleExport = () => {
    setExportStatus('loading');
    setTimeout(() => setExportStatus('success'), 1200);
  };

  switch (state) {
    case "entry":
      return <EntryPointScreen url={url} setUrl={setUrl} onSubmit={handleSubmit} />;
    case "processing":
      return <ProcessingScreen message="Validando URL..." />;
    case "error":
      return <ErrorScreen error={error} onRetry={handleRetry} />;
    case "success":
      return <SuccessScreen onNext={handleSuccessNext} />;
    case "extracted":
      return <ExtractedDataScreen components={dummyComponents} onCopyAll={handleCopyAll} onNext={handleExtractedNext} />;
    case "preview":
      return <PreviewScreen svg={dummySVG} onCopy={handleCopySVG} onDownload={handleDownloadSVG} onNext={handlePreviewNext} />;
    case "export":
      return <ExportScreen svg={dummySVG} onExport={handleExport} exportStatus={exportStatus} />;
    default:
      return null;
  }
};
