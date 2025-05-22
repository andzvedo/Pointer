'use client'

import React, { useState, useCallback } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, AlertCircle, Copy, Info, ZoomIn, ZoomOut } from 'lucide-react' // Added ZoomIn, ZoomOut
import { Textarea } from '@/components/ui/textarea';
import { FigmaNode, renderNode } from '../components/FigmaNodeRenderer';
import { FigmaNodeDetailsPanel } from '../components/FigmaNodeDetailsPanel';

type FetchStatus = 'idle' | 'loading' | 'success' | 'error';

export default function FigmaExtractorPage() {
  const [figmaUrl, setFigmaUrl] = useState<string>('')
  const [status, setStatus] = useState<FetchStatus>('idle')
  const [nodes, setNodes] = useState<FigmaNode[]>([])
  const [error, setError] = useState<string | null>(null)
  const [previewScale, setPreviewScale] = useState<number>(1.0); // Added previewScale state

  const handleZoomIn = () => {
    setPreviewScale(prevScale => Math.min(prevScale * 1.2, 5.0)); // Zoom in by 20%, max 5x
  };

  const handleZoomOut = () => {
    setPreviewScale(prevScale => Math.max(prevScale / 1.2, 0.1)); // Zoom out by 20%, min 0.1x
  };

  const handleFetchData = async () => {
    if (!figmaUrl) {
      setError('Please enter a valid Figma File URL.');
      setStatus('error');
      return;
    }
    setStatus('loading');
    setError(null);
    setNodes([]);

    try {
      console.log('Fetching data from Figma URL:', figmaUrl);
      const response = await fetch(`/api/figma?figmaUrl=${encodeURIComponent(figmaUrl)}`)
      if (!response.ok) {
        let errorMsg = `Request failed: ${response.status}`;
        try { const data = await response.json(); errorMsg = data.details || data.error || errorMsg; } catch {} 
        throw new Error(errorMsg);
      }
      
      const data = await response.json();
      console.log('Received data from API:', data);
      
      // Verificar se recebemos um único nó (caso de nodeId específico) ou um array de nós
      if (Array.isArray(data)) {
        // Caso 1: Recebemos um array de frames/nós
        console.log(`Processando ${data.length} nós recebidos da API`);
        
        // Verificar se os nós têm as propriedades necessárias para renderização
        const validNodes = data.filter(node => {
          const hasRequiredProps = node && node.id && node.absoluteBoundingBox;
          if (!hasRequiredProps) {
            console.warn('Nó inválido encontrado:', node);
          }
          return hasRequiredProps;
        });
        
        // Processar nós para adicionar referências aos pais
        const processedNodes = processNodesWithParentReferences(validNodes);
        
        console.log(`${processedNodes.length} nós válidos para renderização`);
        setNodes(processedNodes as FigmaNode[]);
      } else if (data && typeof data === 'object') {
        // Caso 2: Recebemos um único nó (provavelmente de uma URL com nodeId específico)
        console.log('Processando nó único recebido da API:', data);
        
        // Verificar se o nó tem as propriedades necessárias para renderização
        if (data.id && data.absoluteBoundingBox) {
          // Processar o nó para adicionar referências aos pais
          const processedNode = processNodeWithParentReferences(data);
          const nodeArray = [processedNode] as FigmaNode[];
          setNodes(nodeArray);
        } else {
          console.error('Nó recebido não tem as propriedades necessárias para renderização:', data);
          throw new Error('Node is missing required properties for rendering');
        }
      } else {
        throw new Error('API returned invalid data format.');
      }
      
      setStatus('success');
    } catch (err: any) {
      console.error("Fetch error:", err);
      setError(err.message || 'An unexpected error occurred.');
      setStatus('error');
    }
  }
  
  // Função para processar nós e adicionar referências aos pais
  const processNodesWithParentReferences = (nodes: any[]): any[] => {
    // Primeiro, criar uma cópia profunda dos nós para não modificar os originais
    const nodesCopy = JSON.parse(JSON.stringify(nodes));
    
    // Função recursiva para processar nós
    const processNode = (node: any, parent: any = null) => {
      // Adicionar referência ao pai
      if (parent) {
        node.parent = { 
          id: parent.id,
          absoluteBoundingBox: parent.absoluteBoundingBox
        };
      }
      
      // Processar filhos recursivamente
      if (node.children && Array.isArray(node.children)) {
        node.children.forEach((child: any) => {
          processNode(child, node);
        });
      }
      
      return node;
    };
    
    // Processar cada nó de primeiro nível
    return nodesCopy.map((node: any) => processNode(node));
  };
  
  // Função para processar um único nó e adicionar referências aos pais
  const processNodeWithParentReferences = (node: any): any => {
    return processNodesWithParentReferences([node])[0];
  };

  const handleCopyJson = useCallback(() => {
      if (nodes.length > 0 && nodes[0]) {
          try {
              const jsonStr = JSON.stringify(nodes[0], null, 2);
              // Usar uma abordagem alternativa que não depende diretamente do clipboard API
              // Criar um elemento temporário para copiar o texto
              const textArea = document.createElement('textarea');
              textArea.value = jsonStr;
              document.body.appendChild(textArea);
              textArea.select();
              
              try {
                  document.execCommand('copy');
                  console.log('JSON copied successfully');
              } catch (err) {
                  console.error('Failed to copy JSON:', err);
              }
              
              document.body.removeChild(textArea);
          } catch (err) {
              console.error('Error preparing JSON for copy:', err);
          }
      }
  }, [nodes]);

  // State 1 & 2: Idle and Loading
  if (status === 'idle' || status === 'loading' ) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <Card className="w-full max-w-md shadow-md">
          <CardHeader>
            <CardTitle>Extract data from Figma</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="relative">
                 <label className="text-sm font-medium text-gray-700 absolute -top-2 left-2 bg-white px-1">Figma URL</label>
                 <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer" title="Paste the full URL of your Figma file.">
                   <Info className="h-4 w-4" />
                 </span>
                 <Input
                    type="url"
                    placeholder="Enter Figma URL here"
                    className="border-gray-300 pt-3"
                    value={figmaUrl}
                    onChange={(e) => setFigmaUrl(e.target.value)}
                    disabled={status === 'loading'}
                  />
              </div>
              
              <Button onClick={handleFetchData} disabled={status === 'loading'} className="w-full bg-gray-800 hover:bg-gray-700 text-white">
                {status === 'loading' ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    <span>Extracting...</span> 
                  </>
                ) : (
                  <span>Extract data</span> 
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // State 3: Error occurred during fetch
  if (status === 'error') {
    return (
       <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <Card className="w-full max-w-md shadow-md">
          <CardHeader>
            <CardTitle>Extract data from Figma</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="relative">
                 <label className="text-sm font-medium text-gray-700 absolute -top-2 left-2 bg-white px-1">Figma URL</label>
                 <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer" title="Paste the full URL of your Figma file.">
                   <Info className="h-4 w-4" />
                 </span>
                 <Input
                    type="url"
                    placeholder="Enter Figma URL here"
                    className="border-gray-300 pt-3" 
                    value={figmaUrl}
                    onChange={(e) => setFigmaUrl(e.target.value)}
                  />
              </div>
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error || 'Could not fetch data.'}</AlertDescription>
              </Alert>
              <Button onClick={() => setStatus('idle')} variant="outline" className="w-full">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // State 4: Success (Data Extracted Layout)
  return (
    <div className="flex h-screen w-screen bg-white overflow-hidden">
      <FigmaNodeDetailsPanel 
        figmaUrl={figmaUrl}
        nodes={nodes}
        onCopyJson={handleCopyJson}
      />

      <main className="flex-1 flex flex-col bg-gray-50 h-full">
          <header className="bg-white border-b border-gray-200 p-3 flex justify-between items-center">
              <h1 className="text-base font-semibold">Preview</h1>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={handleZoomOut} title="Zoom Out" className="h-8 w-8">
                    <ZoomOut className="h-4 w-4" />
                </Button>
                <span className="text-sm text-gray-600 w-12 text-center">{Math.round(previewScale * 100)}%</span>
                <Button variant="outline" size="icon" onClick={handleZoomIn} title="Zoom In" className="h-8 w-8">
                    <ZoomIn className="h-4 w-4" />
                </Button>
                <Button 
                    onClick={() => { setStatus('idle'); setNodes([]); setFigmaUrl(''); setPreviewScale(1.0); }} 
                    className="bg-gray-800 hover:bg-gray-700 text-white h-8 px-3 text-sm ml-4"
                >
                   + New extraction
                </Button>
              </div>
          </header>

          <div className="flex-grow p-6 overflow-auto h-full w-full flex items-center justify-center">
              {nodes.length === 0 && status === 'success' && (
                  <div className="flex items-center justify-center h-full">
                      <div className="text-center p-8 bg-gray-50 rounded-lg border border-gray-200">
                          <p className="text-gray-500 mb-2">Nenhum frame ou componente encontrado para renderizar.</p>
                          <p className="text-sm text-gray-400">Tente outra URL do Figma ou verifique se a URL contém frames visíveis.</p>
                      </div>
                  </div>
              )}
              
              <div className="flex flex-col w-full h-full">
                  {nodes.map((node) => {
                      // Verificar se o nó tem todas as propriedades necessárias
                      if (!node || !node.id || !node.absoluteBoundingBox) {
                          console.log('Skipping invalid node:', node);
                          return null;
                      }
                      
                      // Exibir apenas frames e elementos de nível superior
                      if (node.type !== 'FRAME' && node.type !== 'COMPONENT' && node.type !== 'INSTANCE') {
                          return null;
                      }
                      
                      // Não precisamos mais verificar se o nó está selecionado
                      const width = node.absoluteBoundingBox?.width || 0;
                      const height = node.absoluteBoundingBox?.height || 0;
                      
                      // Pular elementos sem dimensões
                      if (width <= 0 || height <= 0) {
                          console.log('Skipping node with invalid dimensions:', node.id, node.name);
                          return null;
                      }
                      
                      // Calculate scale to fit the node in the preview container
                      // Usar a altura disponível do container para maximizar o tamanho do preview
                      const containerHeight = window.innerHeight - 150; // Altura aproximada descontando header e margens
                      const containerWidth = window.innerWidth - 300; // Largura aproximada descontando a sidebar e margens
                      
                      // Calcular a escala mantendo a proporção original
                      const scaleByHeight = containerHeight / height;
                      const scaleByWidth = containerWidth / width;
                      const initialFitScale = Math.min(scaleByHeight, scaleByWidth, 1); // Limitar a escala a no máximo 1 (tamanho real)
                      
                      const effectiveScale = initialFitScale * previewScale;
                                            
                      console.log('Rendering preview for node:', {
                          id: node.id,
                          name: node.name,
                          type: node.type,
                          dimensions: `${width}x${height}`,
                          initialFitScale,
                          previewScale,
                          effectiveScale,
                          hasChildren: (node.children && node.children.length > 0) || false
                      });
                      
                      return (
                          <div 
                              key={node.id} 
                              className="bg-white rounded-lg overflow-hidden shadow border w-full h-full flex flex-col"
                          >
                              <div className="px-3 py-2 border-b border-gray-200 flex justify-between items-center">
                                  <div className="flex items-center gap-1">
                                      <span className="text-xs font-medium truncate" title={node.name}>{node.name}</span>
                                      <span className="text-xs text-gray-500 bg-gray-100 px-1 rounded">{node.type}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                      <span className="text-xs text-gray-500">{Math.round(width)} × {Math.round(height)}</span>
                                  </div>
                              </div>
                              <div className="relative bg-gray-100 overflow-auto flex-1 flex items-center justify-center" style={{ height: 'calc(100vh - 200px)' }}> {/* Changed overflow-hidden to overflow-auto */}
                                  <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
                                      <div className="relative" style={{ 
                                          width: '100%', 
                                          height: '100%',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          border: '1px dashed #ccc'
                                      }}>
                                          {/* Render the node with all its children */}
                                          <div style={{ 
                                              position: 'relative', 
                                              width: '100%', 
                                              height: '100%',
                                              transform: `scale(${effectiveScale})`, // Use effectiveScale
                                              transformOrigin: 'center center'
                                          }}>
                                              {renderNode(node, effectiveScale)} {/* Pass effectiveScale to renderNode */}
                                          </div>
                                      </div>
                                  </div>
                              </div>
                          </div>
                      );
                  })}
                  {nodes.filter(node => node.type === 'FRAME').length === 0 && (
                      <p className="text-gray-500 col-span-full text-center mt-10">No frames found on the first page of the Figma file.</p>
                  )}
              </div>
          </div>
      </main>
    </div>
  );
}
