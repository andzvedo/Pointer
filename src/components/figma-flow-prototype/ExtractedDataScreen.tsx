"use client";
import React from "react";

interface ExtractedDataScreenProps {
  components: { name: string; type: string; }[];
  onCopyAll: () => void;
  onNext: () => void;
}

export const ExtractedDataScreen: React.FC<ExtractedDataScreenProps> = ({ components, onCopyAll, onNext }) => (
  <div className="flex flex-col items-center justify-center min-h-[400px] bg-[#F2F2F2] p-8 rounded-xl shadow-md">
    <div className="bg-white rounded-lg shadow p-6 w-96 mb-4">
      <h2 className="font-semibold mb-3 text-lg">Componentes extraídos</h2>
      <ul className="mb-4">
        {components.map((comp, idx) => (
          <li key={idx} className="flex items-center justify-between py-2 px-2 hover:bg-[#F2F2F2] rounded">
            <span className="flex items-center">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#222"><circle cx="12" cy="12" r="9" strokeWidth="2" /></svg>
              <span className="ml-2 text-[#222] text-base">{comp.name}</span>
            </span>
            <span className="text-xs text-[#555]">{comp.type}</span>
          </li>
        ))}
      </ul>
      <button
        className="w-full h-10 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition mb-2"
        onClick={onCopyAll}
      >
        <span className="mr-2">Copiar tudo</span>
        <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><rect x="9" y="9" width="13" height="13" rx="2" strokeWidth="2"/><rect x="3" y="3" width="13" height="13" rx="2" strokeWidth="2"/></svg>
      </button>
      <button
        className="w-full h-10 bg-gray-100 text-blue-600 rounded-lg font-semibold hover:bg-gray-200 transition"
        onClick={onNext}
      >Próximo</button>
    </div>
  </div>
);
