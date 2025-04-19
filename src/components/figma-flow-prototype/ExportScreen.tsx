"use client";
import React from "react";

interface ExportScreenProps {
  svg: string;
  onExport: () => void;
  exportStatus: 'idle' | 'loading' | 'success';
}

export const ExportScreen: React.FC<ExportScreenProps> = ({ svg, onExport, exportStatus }) => (
  <div className="flex flex-col items-center justify-center min-h-[400px] bg-[#F2F2F2] p-8 rounded-xl shadow-md">
    <div className="bg-white rounded-lg shadow-lg p-8 w-96 mb-4 flex flex-col items-center">
      <h2 className="font-semibold mb-3 text-lg">SVG Final</h2>
      <div className="w-56 h-56 flex items-center justify-center border border-[#E5E5E5] bg-white mb-4" dangerouslySetInnerHTML={{ __html: svg }} />
      <button
        className={`w-full h-11 rounded-lg font-semibold transition mb-2 ${exportStatus === 'success' ? 'bg-green-600 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
        onClick={onExport}
        disabled={exportStatus === 'loading'}
      >
        {exportStatus === 'loading' ? (
          <span className="flex items-center justify-center"><svg className="animate-spin mr-2" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#fff"><circle cx="12" cy="12" r="10" stroke="#E5E5E5" strokeWidth="4" /><path d="M12 2a10 10 0 0 1 10 10" stroke="#fff" strokeWidth="4" /></svg>Exportando...</span>
        ) : exportStatus === 'success' ? (
          <span>SVG exportado com sucesso!</span>
        ) : (
          <span>Exportar SVG</span>
        )}
      </button>
    </div>
  </div>
);
