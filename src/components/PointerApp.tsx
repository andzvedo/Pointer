"use client";

import React from 'react';
import { PointerHeader } from './PointerHeader';
import { Sidebar } from './Sidebar';
import { Canvas } from './Canvas';

interface PointerAppProps {
  frameTitle?: string;
  frameUrl?: string;
  blocks?: Array<{
    fileType: string;
    fileSize: string;
  }>;
  children?: React.ReactNode;
}

export function PointerApp({
  frameTitle = 'Frame_name_here_that_is_long_...',
  frameUrl = 'https://www.figma.com/design/ezXGzVgULKqKPpnzPTJYHw/DesignTools-Visual-Editor?node-id=337-6089&t=9BPwE9SUnEOvQT5-11',
  blocks = [
    { fileType: 'SVG', fileSize: '123 kbs' },
    { fileType: 'Design data', fileSize: '123 kbs' },
  ],
  children,
}: PointerAppProps) {
  return (
    <div className="flex min-h-screen w-full flex-col bg-[#F2F2F2] p-2">
      <div className="flex w-full flex-col gap-2 rounded">
        <PointerHeader
          frameTitle={frameTitle}
          frameUrl={frameUrl}
          onRefresh={() => console.log('Refresh clicked')}
          onNew={() => console.log('New clicked')}
        />
        
        <div className="flex gap-2">
          <Sidebar
            blocks={blocks}
            onBlockHeaderClick={(index) => console.log(`Block ${index} clicked`)}
          />
          <Canvas>{children}</Canvas>
        </div>
      </div>
    </div>
  );
} 