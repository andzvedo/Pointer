"use client";
import React from "react";

interface SuccessScreenProps {
  onNext: () => void;
}

export const SuccessScreen: React.FC<SuccessScreenProps> = ({ onNext }) => (
  <div className="flex flex-col items-center justify-center min-h-[400px] bg-[#F2F2F2] p-8 rounded-xl shadow-md">
    <div className="relative w-80">
      <input
        className="w-full h-10 px-4 border border-[#E5E5E5] rounded-lg bg-white text-[#222] text-base opacity-50 mb-2"
        type="text"
        value="URL válida"
        disabled
      />
      <span className="absolute right-3 top-1/2 -translate-y-1/2">
        <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#07750B"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
      </span>
    </div>
    <span className="text-[#07750B] font-semibold text-sm mb-4">Dados extraídos com sucesso!</span>
    <button
      className="w-80 h-10 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
      onClick={onNext}
      data-testid="next-btn"
    >Próximo</button>
  </div>
);
