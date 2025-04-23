"use client";

import React from 'react';

interface CanvasProps {
  children?: React.ReactNode;
}

export function Canvas({ children }: CanvasProps) {
  return (
    <main className="flex h-[740px] w-[1096px] items-center justify-center rounded border border-[#E5E5E5] bg-white p-[1px]">
      {children || (
        <div className="text-sm text-[#525252]/50 font-['Inter']">
          Área destinada ao conteúdo do editor/preview
        </div>
      )}
    </main>
  );
} 