'use client';

import React, { useState } from 'react';
import { FigmaUrlSimpleInput } from './FigmaUrlSimpleInput';

interface DataPreviewStructureProps {
  onUrlProcess?: (url: string) => void;
}

export function DataPreviewStructure({ onUrlProcess }: DataPreviewStructureProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [processedData, setProcessedData] = useState<any>(null);
  const [showResult, setShowResult] = useState(false);

  const handleProcess = async (url: string) => {
    if (!onUrlProcess) return;
    
    setIsLoading(true);
    setShowResult(false);
    try {
      // Simulando um processamento
      await new Promise(resolve => setTimeout(resolve, 1000));
      onUrlProcess(url);
      
      // Simular dados processados
      const mockData = {
        url,
        timestamp: new Date().toISOString(),
        elements: [
          { type: 'frame', name: 'Header', id: 'frame-001' },
          { type: 'text', name: 'Title', id: 'text-001' },
          { type: 'button', name: 'CTA Button', id: 'button-001' }
        ]
      };
      
      setProcessedData(mockData);
      setShowResult(true);
    } catch (error) {
      console.error('Error processing URL:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-screen bg-[#f7f7f7] border border-black/10 relative overflow-hidden flex flex-col items-center">
      {/* Ícone Pointer no topo */}
      <div className="absolute top-20 left-1/2 transform -translate-x-1/2">
        <div className="h-10 w-[76px] bg-white border border-[#e5e5e5] rounded flex items-center justify-center space-x-2 px-2">
          <div className="w-6 h-6 relative">
            {/* Ícone Pointer (simplificado) */}
            <svg 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              className="absolute inset-0"
            >
              <path 
                d="M3.9 13.56C3.96 13.8 4.08 14.02 4.26 14.18C4.44 14.35 4.67 14.46 4.91 14.49C5.15 14.52 5.4 14.48 5.62 14.37C5.84 14.26 6.02 14.09 6.13 13.87L8.22 10.78L13.13 15.68C13.23 15.78 13.35 15.86 13.48 15.92C13.6 15.97 13.74 16 13.88 16C14.02 16 14.16 15.97 14.29 15.92C14.42 15.86 14.54 15.78 14.64 15.68L15.68 14.64C15.78 14.54 15.86 14.42 15.92 14.29C15.97 14.16 16 14.02 16 13.88C16 13.74 15.97 13.6 15.92 13.48C15.86 13.35 15.78 13.23 15.68 13.13L10.78 8.22L13.89 6.13C14.11 6.02 14.28 5.84 14.39 5.62C14.5 5.4 14.54 5.15 14.51 4.91C14.48 4.67 14.37 4.44 14.2 4.26C14.04 4.08 13.82 3.96 13.58 3.9L0 0L3.9 13.56Z" 
                fill="white" 
                stroke="black" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
            {/* Sombra do ícone */}
            <div className="absolute inset-0 shadow-md"></div>
          </div>
          <svg 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className="opacity-50"
          >
            <path d="M7 10L12 15L17 10" stroke="#555555" strokeWidth="1.5" fill="#555555" />
          </svg>
        </div>
      </div>
      
      {/* Input de URL e botão Process */}
      <div className="absolute top-[235px] w-[658px] z-10">
        <FigmaUrlSimpleInput onProcess={handleProcess} isLoading={isLoading} />
      </div>
      
      {/* Resultado do processamento */}
      {showResult && processedData && (
        <div className="absolute top-[320px] w-[658px] bg-white border border-gray-200 rounded-lg shadow-lg p-6 z-20">
          <h2 className="text-lg font-semibold mb-4">AST Gerada:</h2>
          <div className="bg-gray-50 p-4 rounded-md overflow-auto max-h-[400px]">
            <pre className="text-xs text-gray-800">
              {JSON.stringify(processedData, null, 2)}
            </pre>
          </div>
          <div className="mt-4 flex justify-end">
            <button 
              onClick={() => setShowResult(false)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
      
      {/* Efeito de sombra na parte inferior */}
      <div 
        className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-[1474px] h-[958px] opacity-70"
        style={{
          background: 'linear-gradient(to bottom, transparent 70%, rgba(106, 0, 255, 0.05))',
          boxShadow: '0 -100px 200px 0 rgba(106, 0, 255, 0.05)'
        }}
      />
    </div>
  );
}
