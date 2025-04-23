"use client";

import React from 'react';
import { ChevronDown } from 'lucide-react';

interface CodeBlockHeaderProps {
  fileType: string;
  fileSize: string;
  onClick?: () => void;
}

function CodeBlockHeader({ fileType, fileSize, onClick }: CodeBlockHeaderProps) {
  return (
    <div className="flex h-12 w-full items-center justify-between rounded-t-md border border-[#E5E5E5] bg-white pl-4">
      <div className="flex items-center gap-4">
        <span className="text-sm font-semibold text-[#525252] font-['Inter']">
          {fileType}
        </span>
        <span className="text-xs text-[#525252]/50 font-['Inter']">
          Size: {fileSize}
        </span>
      </div>
      <button
        onClick={onClick}
        className="flex h-12 w-12 items-center justify-center"
      >
        <ChevronDown className="h-6 w-6 text-[#555555]/50" />
      </button>
    </div>
  );
}

interface SidebarProps {
  blocks: {
    fileType: string;
    fileSize: string;
  }[];
  onBlockHeaderClick?: (index: number) => void;
}

export function Sidebar({ blocks, onBlockHeaderClick }: SidebarProps) {
  return (
    <aside className="flex h-[740px] w-[320px] flex-col gap-2">
      {blocks.map((block, index) => (
        <div key={index} className="flex flex-col">
          <CodeBlockHeader
            fileType={block.fileType}
            fileSize={block.fileSize}
            onClick={() => onBlockHeaderClick?.(index)}
          />
          {/* Conteúdo do bloco pode ser implementado conforme necessário */}
        </div>
      ))}
    </aside>
  );
} 