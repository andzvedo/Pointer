"use client";

import React from 'react';
import { ArrowDown, RefreshCw } from 'lucide-react';

interface PointerHeaderProps {
  frameTitle: string;
  frameUrl: string;
  onRefresh?: () => void;
  onNew?: () => void;
}

export function PointerHeader({ 
  frameTitle, 
  frameUrl, 
  onRefresh, 
  onNew 
}: PointerHeaderProps) {
  return (
    <header className="flex h-12 w-full gap-2 p-0">
      {/* Botão Pointer */}
      <button className="flex h-12 w-[66px] items-center justify-center rounded border border-[#E5E5E5] bg-white">
        <div className="flex items-center">
          {/* Ícone Pointer */}
          <div className="relative h-6 w-6">
            <svg 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.25)]"
            >
              <path 
                d="M4 4L12 12M12 12L20 4M12 12V20" 
                stroke="black" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
              />
            </svg>
          </div>
          
          {/* Ícone Arrow-drop-down */}
          <div className="h-6 w-6 opacity-50 flex items-center justify-center">
            <ArrowDown size={10} className="text-[#555555]" />
          </div>
        </div>
      </button>

      {/* Campo URL */}
      <div className="flex h-12 flex-1 items-center rounded border border-[#E5E5E5] bg-white pl-3 pr-2">
        {/* Texto do título do frame */}
        <span className="mr-2 text-sm text-[#525252] font-['Inter']">
          {frameTitle}
        </span>

        {/* Input URL */}
        <div className="flex h-8 flex-1 items-center rounded bg-[#F0F0F0]/60 px-2">
          {/* Botão Refresh */}
          <button 
            onClick={onRefresh} 
            className="mr-2 flex h-5 w-5 items-center justify-center"
          >
            <RefreshCw size={12} className="text-[#555555] opacity-50" />
          </button>

          {/* Texto URL */}
          <span className="flex-1 truncate text-sm text-[#525252] opacity-50 font-['Inter']">
            {frameUrl}
          </span>
        </div>
      </div>

      {/* Botão "New" */}
      <button 
        onClick={onNew}
        className="flex h-12 w-[116px] items-center justify-center rounded-lg border border-[#555555]/50 bg-[#555555]/30 px-4"
      >
        <span className="text-base font-bold text-[#4F4F4F] font-['Inter']">New</span>
      </button>
    </header>
  );
} 