"use client";
import React from "react";

interface EntryPointScreenProps {
  onSubmit: (url: string) => void;
  url: string;
  setUrl: (url: string) => void;
  disabled?: boolean;
}

export const EntryPointScreen: React.FC<EntryPointScreenProps> = ({ url, setUrl, onSubmit, disabled }) => (
  <div className="flex flex-col items-center justify-center min-h-[400px] bg-[#F2F2F2] p-8 rounded-xl shadow-md">
    <input
      className="w-80 h-10 px-4 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-[#222] text-base bg-white mb-4"
      type="text"
      placeholder="Cole a URL do Figma aqui"
      value={url}
      onChange={e => setUrl(e.target.value)}
      disabled={disabled}
      data-testid="figma-url-input"
    />
    <button
      className="w-80 h-10 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center"
      onClick={() => onSubmit(url)}
      disabled={disabled || !url}
      data-testid="submit-btn"
    >
      {/* Ícone de ação pode ser SVG inline */}
      <span className="mr-2">Extrair</span>
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14M12 5l7 7-7 7" /></svg>
    </button>
  </div>
);
