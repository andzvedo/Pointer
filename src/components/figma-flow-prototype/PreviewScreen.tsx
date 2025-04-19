"use client";
import React from "react";

interface PreviewScreenProps {
  svg: string;
  onCopy: () => void;
  onDownload: () => void;
  onNext: () => void;
}

export const PreviewScreen: React.FC<PreviewScreenProps> = ({ svg, onCopy, onDownload, onNext }) => (
  <div className="flex flex-col items-center justify-center min-h-[400px] bg-[#F2F2F2] p-8 rounded-xl shadow-md">
    <div className="bg-white rounded-lg shadow p-6 w-96 mb-4 flex flex-col items-center">
      <h2 className="font-semibold mb-3 text-lg">Pré-visualização do SVG</h2>
      <div className="w-48 h-48 flex items-center justify-center border border-[#E5E5E5] bg-white mb-4" dangerouslySetInnerHTML={{ __html: svg }} />
      <div className="flex gap-2 w-full">
        <button
          className="flex-1 h-10 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
          onClick={onCopy}
        >
          <span className="mr-2">Copiar SVG</span>
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><rect x="9" y="9" width="13" height="13" rx="2" strokeWidth="2"/><rect x="3" y="3" width="13" height="13" rx="2" strokeWidth="2"/></svg>
        </button>
        <button
          className="flex-1 h-10 bg-gray-100 text-blue-600 rounded-lg font-semibold hover:bg-gray-200 transition"
          onClick={onDownload}
        >
          <span className="mr-2">Baixar</span>
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 4v12m0 0l-4-4m4 4l4-4" strokeWidth="2"/><rect x="4" y="18" width="16" height="2" rx="1" strokeWidth="2"/></svg>
        </button>
      </div>
      <button
        className="w-full h-10 bg-gray-100 text-blue-600 rounded-lg font-semibold hover:bg-gray-200 transition mt-2"
        onClick={onNext}
      >Próximo</button>
    </div>
  </div>
);
