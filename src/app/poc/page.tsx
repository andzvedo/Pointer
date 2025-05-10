'use client';

import React, { useState } from 'react';
import { DataPreviewStructure } from '@/components/DataPreviewStructure';

export default function POCPage() {
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);

  const handleUrlProcess = (url: string) => {
    console.log('Processing URL:', url);
    setProcessedUrl(url);
  };

  return (
    <div className="h-screen w-full overflow-hidden">
      <div className="fixed top-0 left-0 right-0 z-10 bg-white p-4 shadow-md">
        <h1 className="text-xl font-bold text-center">Pointer.design Sync Plugin - POC</h1>
        
        {processedUrl && (
          <div className="mt-2 bg-gray-50 p-2 rounded-md">
            <h2 className="font-semibold text-sm">URL Processada:</h2>
            <p className="text-xs break-all">{processedUrl}</p>
          </div>
        )}
      </div>
      
      <div className="h-full w-full pt-[80px]">
        <DataPreviewStructure onUrlProcess={handleUrlProcess} />
      </div>
    </div>
  );
}
