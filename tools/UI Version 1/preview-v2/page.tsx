'use client';

import React, { useState } from 'react';
import { EntryPointScreen } from '../../../tools/UI Version 1/Code Gen/v2/components/EntryPointScreen';
import { LoadingScreen } from '../../../tools/UI Version 1/Code Gen/v2/components/LoadingScreen';
import { DataExtractedScreen } from '../../../tools/UI Version 1/Code Gen/v2/components/DataExtractedScreen';
import { ExportScreen } from '../../../tools/UI Version 1/Code Gen/v2/components/ExportScreen';

type Screen = 'entry' | 'loading' | 'data-extracted' | 'export';

export default function PreviewV2() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('entry');
  const [figmaUrl, setFigmaUrl] = useState('');

  const handleUrlSubmit = (url: string) => {
    setFigmaUrl(url);
    setCurrentScreen('loading');
    
    // Simular processamento
    setTimeout(() => {
      setCurrentScreen('data-extracted');
    }, 2000);
  };

  const handleBack = () => {
    // Voltar para a tela anterior dependendo da tela atual
    if (currentScreen === 'data-extracted') {
    setCurrentScreen('entry');
  };

  return (
    <>
      {currentScreen === 'entry' && (
        <EntryPointScreen onSubmit={handleUrlSubmit} />
      )}
      {currentScreen === 'loading' && (
        <LoadingScreen />
      )}
      {currentScreen === 'data-extracted' && (
        <DataExtractedScreen onBack={handleBack} />
      )}
    </>
  );
}
