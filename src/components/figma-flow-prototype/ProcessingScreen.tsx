"use client";
import React from "react";

interface ProcessingScreenProps {
  message?: string;
}

export const ProcessingScreen: React.FC<ProcessingScreenProps> = ({ message }) => (
  <div className="flex flex-col items-center justify-center min-h-[400px] bg-[#F2F2F2] p-8 rounded-xl shadow-md">
    <input
      className="w-80 h-10 px-4 border border-[#E5E5E5] rounded-lg bg-white text-[#222] text-base opacity-50 mb-4"
      type="text"
      value=""
      disabled
      placeholder="Cole a URL do Figma aqui"
    />
    <button
      className="w-80 h-10 bg-blue-600 text-white rounded-lg font-semibold flex items-center justify-center opacity-50 cursor-not-allowed mb-4"
      disabled
    >
      <svg className="animate-spin mr-2" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="10" stroke="#E5E5E5" strokeWidth="4" /><path d="M12 2a10 10 0 0 1 10 10" stroke="#2563eb" strokeWidth="4" /></svg>
      Processando...
    </button>
    {message && <span className="text-sm text-[#555] mt-2">{message}</span>}
  </div>
);
