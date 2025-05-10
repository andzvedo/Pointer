'use client';

import { DataPreviewStructure } from '@/components/DataPreviewStructure';

export default function FigmaSyncPage() {
  const handleUrlProcess = (url: string) => {
    console.log('URL processada:', url);
    // Aqui você pode adicionar a lógica para processar a URL do Figma
  };

  return (
    <div className="h-screen w-full">
      <DataPreviewStructure onUrlProcess={handleUrlProcess} />
    </div>
  );
}
