'use client';

import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';

interface ContextBundle {
  metadata: {
    title: string;
    description: string;
    figmaUrl: string;
    nodeId: string;
    timestamp?: string;
    version?: string;
    hygieneReport?: {
      originalNodeCount: number;
      cleanedNodeCount: number;
      nodesRemoved: number;
      sizeReductionPercentage: string;
      [key: string]: any;
    };
  };
  summary: {
    type: string;
    role: string;
    description: string;
    childrenCount: number;
    complexity: 'simple' | 'medium' | 'complex';
    narration?: string;
  };
  visual: {
    dimensions: {
      width: number;
      height: number;
    };
    colors: string[];
    typography?: {
      fonts: string[];
      sizes: number[];
    };
    imageUrl?: string;
  };
  [key: string]: any;
}

export default function ContextPOCPage() {
  const [figmaUrl, setFigmaUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [contextBundle, setContextBundle] = useState<ContextBundle | null>(null);
  const [format, setFormat] = useState<'json' | 'markdown'>('json');
  const [includeRaw, setIncludeRaw] = useState(false);
  const [skipHygiene, setSkipHygiene] = useState(false);
  const [markdownContent, setMarkdownContent] = useState<string | null>(null);
  
  const handleExtractContext = async () => {
    if (!figmaUrl) return;
    
    setLoading(true);
    setError(null);
    setContextBundle(null);
    setMarkdownContent(null);
    
    try {
      const apiUrl = `/api/context?figmaUrl=${encodeURIComponent(figmaUrl)}&format=${format}&includeRaw=${includeRaw}&skipHygiene=${skipHygiene}`;
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to extract context');
      }
      
      if (format === 'markdown') {
        const markdown = await response.text();
        setMarkdownContent(markdown);
      } else {
        const data = await response.json();
        setContextBundle(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Pointer.design - Context POC</h1>
        
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold mb-4">Extrair Contexto do Figma</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Link do Figma (com node-id)
            </label>
            <input
              type="text"
              value={figmaUrl}
              onChange={(e) => setFigmaUrl(e.target.value)}
              placeholder="https://www.figma.com/file/..."
              className="w-full p-2 border rounded-md"
            />
          </div>
          
          <div className="flex flex-wrap items-center mb-4 gap-4">
            <div className="flex items-center">
              <input
                type="radio"
                id="format-json"
                checked={format === 'json'}
                onChange={() => setFormat('json')}
                className="mr-2"
              />
              <label htmlFor="format-json">JSON</label>
            </div>
            
            <div className="flex items-center">
              <input
                type="radio"
                id="format-markdown"
                checked={format === 'markdown'}
                onChange={() => setFormat('markdown')}
                className="mr-2"
              />
              <label htmlFor="format-markdown">Markdown</label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="include-raw"
                checked={includeRaw}
                onChange={(e) => setIncludeRaw(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="include-raw">Incluir dados brutos</label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="skip-hygiene"
                checked={skipHygiene}
                onChange={(e) => setSkipHygiene(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="skip-hygiene" title="Pular a limpeza e normalização dos dados do Figma">
                Pular higienização
              </label>
            </div>
          </div>
          
          <button
            onClick={handleExtractContext}
            disabled={loading || !figmaUrl}
            className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center">
                <Loader2 className="animate-spin mr-2 h-4 w-4" />
                Extraindo...
              </span>
            ) : (
              'Extrair Contexto'
            )}
          </button>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md mb-8">
            <h3 className="font-semibold">Erro</h3>
            <p>{error}</p>
          </div>
        )}
        
        {contextBundle && format === 'json' && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Context Bundle</h2>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(contextBundle, null, 2));
                  alert('Context Bundle copiado para a área de transferência!');
                }}
                className="bg-blue-600 text-white py-1 px-3 rounded text-sm hover:bg-blue-700"
              >
                Copiar Contexto
              </button>
            </div>
            
            <div className="mb-6">
              <h3 className="font-semibold text-lg mb-2">Metadados</h3>
              <p><strong>Título:</strong> {contextBundle.metadata.title}</p>
              <p><strong>Descrição:</strong> {contextBundle.metadata.description}</p>
              <p>
                <strong>Link Figma:</strong>{' '}
                <a 
                  href={contextBundle.metadata.figmaUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Abrir no Figma
                </a>
              </p>
              
              {contextBundle.metadata.hygieneReport && (
                <div className="mt-3 p-3 bg-gray-50 rounded border border-gray-200">
                  <h4 className="font-medium mb-2">Relatório de Higienização</h4>
                  <ul className="text-sm">
                    <li><strong>Nós removidos:</strong> {contextBundle.metadata.hygieneReport.nodesRemoved}</li>
                    <li><strong>Redução de tamanho:</strong> {contextBundle.metadata.hygieneReport.sizeReductionPercentage}</li>
                    <li><strong>Nós originais:</strong> {contextBundle.metadata.hygieneReport.originalNodeCount}</li>
                    <li><strong>Nós após limpeza:</strong> {contextBundle.metadata.hygieneReport.cleanedNodeCount}</li>
                  </ul>
                </div>
              )}
            </div>
            
            <div className="mb-6">
              <h3 className="font-semibold text-lg mb-2">Sumarização</h3>
              <p><strong>Tipo:</strong> {contextBundle.summary.type}</p>
              <p><strong>Função:</strong> {contextBundle.summary.role}</p>
              <p><strong>Complexidade:</strong> {contextBundle.summary.complexity}</p>
              <p><strong>Descrição:</strong> {contextBundle.summary.description}</p>
            </div>
            
            <div className="mb-6">
              <h3 className="font-semibold text-lg mb-2">Visual</h3>
              
              {/* Imagem do Design */}
              {contextBundle.visual.imageUrl && (
                <div className="mb-4">
                  <p className="font-medium mb-2">Imagem do Design:</p>
                  <div className="border border-gray-200 rounded-md p-2 bg-white">
                    <img 
                      src={contextBundle.visual.imageUrl} 
                      alt="Design do Figma" 
                      className="max-w-full h-auto rounded shadow-sm"
                      style={{ maxHeight: '400px' }}
                    />
                  </div>
                </div>
              )}
              
              <p><strong>Dimensões:</strong> {contextBundle.visual.dimensions.width}×{contextBundle.visual.dimensions.height}px</p>
              
              {contextBundle.visual.colors.length > 0 && (
                <div className="mb-2">
                  <p className="font-medium">Cores:</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {contextBundle.visual.colors.map((color, index) => (
                      <div key={index} className="flex items-center">
                        <div 
                          className="w-6 h-6 rounded border border-gray-300 mr-1" 
                          style={{ backgroundColor: color }}
                        />
                        <span className="text-sm">{color}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {contextBundle.visual.typography?.fonts.length && (
                <p>
                  <strong>Fontes:</strong> {contextBundle.visual.typography.fonts.join(', ')}
                </p>
              )}
              
              {contextBundle.visual.typography?.sizes.length && (
                <p>
                  <strong>Tamanhos de fonte:</strong> {contextBundle.visual.typography.sizes.join(', ')}px
                </p>
              )}
            </div>
            
            {contextBundle.interactions?.hasPrototyping && (
              <div className="mb-6">
                <h3 className="font-semibold text-lg mb-2">Interações</h3>
                
                {contextBundle.interactions.actions?.length > 0 && (
                  <div className="mb-2">
                    <p className="font-medium">Ações:</p>
                    <ul className="list-disc pl-5">
                      {contextBundle.interactions.actions.map((action: string, index: number) => (
                        <li key={index}>{action}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {contextBundle.interactions.transitions?.length > 0 && (
                  <div>
                    <p className="font-medium">Transições:</p>
                    <ul className="list-disc pl-5">
                      {contextBundle.interactions.transitions.map((transition: any, index: number) => (
                        <li key={index}>
                          {transition.trigger} → {transition.destination} ({transition.navigation})
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
            
            <div>
              <h3 className="font-semibold text-lg mb-2">Estrutura</h3>
              <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-xs">
                {JSON.stringify(contextBundle.structure, null, 2)}
              </pre>
            </div>
            
            {contextBundle.rawData && (
              <div className="mt-6">
                <h3 className="font-semibold text-lg mb-2">Dados Brutos</h3>
                <details>
                  <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                    Mostrar dados brutos
                  </summary>
                  <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-xs mt-2">
                    {JSON.stringify(contextBundle.rawData, null, 2)}
                  </pre>
                </details>
              </div>
            )}
            
            <div className="mt-8">
              <h3 className="font-semibold text-lg mb-2">Bundle Completo (para LLMs)</h3>
              <div className="flex gap-2 mb-2">
                <details>
                  <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                    Mostrar bundle completo
                  </summary>
                  <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-xs mt-2">
                    {JSON.stringify(contextBundle, null, 2)}
                  </pre>
                </details>
                <button
                  onClick={() => {
                    // Criar um objeto que inclui tanto o JSON quanto a URL da imagem
                    const bundleWithImageReference = {
                      ...contextBundle,
                      visual: {
                        ...contextBundle.visual,
                        imageReference: contextBundle.visual.imageUrl ? 
                          `Design image: ${contextBundle.visual.imageUrl}` : 
                          'No image available'
                      }
                    };
                    navigator.clipboard.writeText(JSON.stringify(bundleWithImageReference, null, 2));
                    alert('Bundle completo copiado para a área de transferência!');
                  }}
                  className="bg-blue-600 text-white py-1 px-3 rounded text-sm hover:bg-blue-700 h-fit"
                >
                  Copiar Bundle
                </button>
              </div>
            </div>
          </div>
        )}
        
        {markdownContent && format === 'markdown' && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h2 className="text-xl font-semibold mb-4">Context Bundle (Markdown)</h2>
            
            <div className="bg-gray-100 p-4 rounded overflow-x-auto">
              <pre className="whitespace-pre-wrap">{markdownContent}</pre>
            </div>
            
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(markdownContent);
                  alert('Markdown copiado para a área de transferência!');
                }}
                className="bg-gray-200 text-gray-800 py-1 px-3 rounded hover:bg-gray-300"
              >
                Copiar Markdown
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
