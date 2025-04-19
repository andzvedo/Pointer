"use client";
import React from "react";

interface ErrorScreenProps {
  error: string;
  onRetry: () => void;
}

export const ErrorScreen: React.FC<ErrorScreenProps> = ({ error, onRetry }) => (
  <div className="flex flex-col items-center justify-center min-h-[400px] bg-[#F2F2F2] p-8 rounded-xl shadow-md">
    <input
      className="w-80 h-10 px-4 border border-red-500 rounded-lg bg-white text-[#222] text-base mb-2 shadow-sm animate-shake"
      type="text"
      value={error}
      disabled
    />
    <span className="text-red-600 font-semibold mb-4">{error || "URL inválida. Tente novamente."}</span>
    <button
      className="w-80 h-10 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
      onClick={onRetry}
      data-testid="retry-btn"
    >Tentar novamente</button>
  </div>
);
