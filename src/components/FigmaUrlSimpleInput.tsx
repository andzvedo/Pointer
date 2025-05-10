'use client';

import React, { useState } from 'react';

interface FigmaUrlSimpleInputProps {
  onProcess: (url: string) => void;
  isLoading?: boolean;
}

export function FigmaUrlSimpleInput({ onProcess, isLoading = false }: FigmaUrlSimpleInputProps) {
  const [url, setUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onProcess(url.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center space-x-4 w-full max-w-2xl mx-auto">
      <div className="flex-1">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Paste the Figma URL here..."
          className="w-full h-10 px-3 bg-[#f2f2f3] border border-[#d7d7d7] rounded text-sm text-[#525252] outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      <button
        type="submit"
        disabled={isLoading}
        className={`h-10 px-4 bg-[#ebebec] border border-[#555555]/50 rounded text-sm font-semibold text-[#4f4f4f] flex items-center justify-center hover:bg-[#e5e5e5] ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        {isLoading ? 'Processing...' : 'Process'}
      </button>
    </form>
  );
}
