'use client'
import React, { useState } from 'react'
import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert"
import { Loader2, AlertCircle, Copy, Info, ArrowLeft, Download, Pencil } from 'lucide-react'
import { Textarea } from '../components/ui/textarea'
import Link from 'next/link'

// NOTA: A funcionalidade de renderização visual do Figma foi temporariamente desativada.
// Todo o código relacionado à renderização foi preservado e pode ser encontrado nos
// arquivos de backup em src/lib/figma-renderer/
// Apenas a extração de dados JSON foi mantida nesta versão simplificada.

// Interface simplificada para os nós do Figma (apenas para visualização JSON)
interface FigmaNode {
    id: string;
    name: string;
  type: string;
    absoluteBoundingBox?: { x: number; y: number; width: number; height: number };
    children?: FigmaNode[];
  [key: string]: any; // Para outras propriedades
}

type FetchStatus = 'idle' | 'loading' | 'success' | 'error'

export default function FigmaExtractorPage() {
  const [figmaUrl, setFigmaUrl] = useState<string>('')
  const [status, setStatus] = useState<FetchStatus>('idle')
  const [nodes, setNodes] = useState<FigmaNode[]>([])
  const [error, setError] = useState<string | null>(null)
  const [jsonData, setJsonData] = useState<string>('')

  const handleFetchData = async () => {
    if (!figmaUrl) {
      setError('Please enter a valid Figma File URL.');
      setStatus('error');
      return;
    }
    
    setStatus('loading');
    setError(null);
    setNodes([]);
    setJsonData('');

    try {
      console.log('Fetching data from Figma URL:', figmaUrl);
      
      // Adicionar parâmetros opcionais para a API
      const params = new URLSearchParams({
        figmaUrl: figmaUrl,
        includeStyles: 'true',
        includeComponents: 'true',
        depth: '3' // Profundidade para capturar detalhes
      });
      
      const response = await fetch(`/api/figma?${params.toString()}`)
      if (!response.ok) {
        let errorMsg = `Request failed: ${response.status}`;
        try { const data = await response.json(); errorMsg = data.details || data.error || errorMsg; } catch {} 
        throw new Error(errorMsg);
      }
      
      const data = await response.json();
      console.log('Received data from API:', data);
      
      // Processar dados recebidos
      if (data.node) {
        // Nova estrutura com metadados
        console.log('Processando nó com nova estrutura de API:', data.node);
        setNodes([data.node]);
        setJsonData(JSON.stringify(data, null, 2));
      } else if (Array.isArray(data)) {
          console.log(`Processando ${data.length} nós recebidos da API`);
        setNodes(data);
        setJsonData(JSON.stringify(data, null, 2));
        } else if (data && typeof data === 'object') {
        console.log('Processando único nó recebido da API');
        setNodes([data]);
        setJsonData(JSON.stringify(data, null, 2));
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
  
  const handleCopyJson = () => {
    if (!jsonData) return;
    
    navigator.clipboard.writeText(jsonData)
      .then(() => alert('JSON data copied to clipboard'))
      .catch(err => console.error('Failed to copy JSON data:', err));
  }

  const handleDownloadJson = () => {
    if (!jsonData) return;
    
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'figma-data.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // State 1: Initial form state
  if (status === 'idle') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <Card className="w-full max-w-md shadow-md">
          <CardHeader>
            <CardTitle>Extract Figma Data</CardTitle>
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
              <div className="text-xs text-gray-500 -mt-2">
                Example: https://www.figma.com/file/abcdef123456/My-Design
              </div>
              <Button onClick={handleFetchData} className="w-full">
                <Info className="h-4 w-4 mr-2" /> 
                Extract Figma Data
              </Button>
              
              <div className="border-t border-gray-200 pt-4 mt-4">
                <Link href="/editor">
                  <Button variant="outline" className="w-full">
                    <Pencil className="h-4 w-4 mr-2" />
                    Abrir Editor Visual
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // State 2: Loading state
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <Card className="w-full max-w-md shadow-md">
          <CardHeader>
            <CardTitle>Extract data from Figma</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center py-6">
              <Loader2 className="h-8 w-8 text-blue-500 animate-spin mb-4" />
              <p className="text-gray-600">Fetching data from Figma API...</p>
              <p className="text-xs text-gray-400 mt-2">{figmaUrl}</p>
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

  // State 4: Success (Data Extracted)
  return (
    <div className="flex flex-col h-screen w-screen bg-white overflow-hidden">
      <header className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
        <h1 className="text-lg font-semibold">Figma Data Extractor</h1>
        <Button onClick={() => setStatus('idle')} variant="outline" size="sm">
          <ArrowLeft className="h-4 w-4 mr-2"/>
          Back
        </Button>
      </header>
      
      <div className="flex flex-col sm:flex-row flex-grow overflow-hidden">
        {/* Informações do nó */}
        <aside className="w-full sm:w-72 bg-white border-r border-gray-200 p-4 flex flex-col space-y-4 overflow-y-auto">
          <div>
              <label htmlFor="figmaUrlDisplay" className="text-xs font-medium text-gray-500 flex items-center justify-between mb-1">
                  <span>Figma URL</span>
                  <span className="cursor-pointer" title="The URL of the Figma file being displayed.">
                    <Info className="h-3 w-3 text-gray-400" />
                  </span>
              </label>
              <Input 
                  id="figmaUrlDisplay"
                  type="text" 
                  value={figmaUrl} 
                  readOnly 
                  className="w-full border-gray-300 bg-gray-50 text-xs h-8 focus-visible:ring-offset-0 focus-visible:ring-0"
              />
          </div>

          {nodes.length > 0 && nodes[0] && (
            <div className="flex-grow overflow-y-auto border rounded-md p-3 bg-white space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">{nodes[0].name}</h3>
                <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600">{nodes[0].type}</span>
              </div>
              
              {/* Dimensões do nó */}
              {nodes[0].absoluteBoundingBox && (
                <div className="text-xs text-gray-600 border-t border-gray-100 pt-2 mt-1">
                  <div className="grid grid-cols-2 gap-1">
                    <div>Largura: {nodes[0].absoluteBoundingBox.width}px</div>
                    <div>Altura: {nodes[0].absoluteBoundingBox.height}px</div>
                  </div>
                </div>
              )}
              
              {/* Título para filhos */}
              <div className="text-xs font-medium text-gray-700 mt-3 pt-2 border-t border-gray-100">
                Elementos ({nodes[0].children?.length || 0})
              </div>
              
              {/* Lista de filhos */}
              <div className="max-h-[300px] overflow-y-auto">
                {nodes[0].children?.slice(0, 20).map(child => (
                  <div key={child.id} className="text-xs flex items-center py-1 pl-2 border-l-2 border-gray-200 hover:bg-gray-50 my-1 group">
                    <div className="flex-1 truncate">
                      {child.name || "Sem nome"}
                    </div>
                    <div className="text-gray-400 text-[10px] opacity-0 group-hover:opacity-100">
                      {child.type}
                    </div>
                    </div>
                ))}
                {nodes[0].children && nodes[0].children.length > 20 && (
                  <div className="text-xs text-gray-400 pl-2 mt-1 italic">
                    ...e mais {nodes[0].children.length - 20} elementos
                  </div>
                )}
                 {nodes[0].children?.length === 0 && (
                  <div className="text-xs text-gray-400 pl-2 italic">
                    Nenhum elemento filho encontrado.
                  </div>
                )}
              </div>
              
              {/* Botões para copiar/baixar JSON */}
              <div className="pt-2 mt-2 border-t border-gray-100 space-y-2">
                <Button 
                  onClick={handleCopyJson} 
                  variant="outline" 
                  size="sm" 
                  className="w-full text-xs h-7"
                >
                  <Copy className="h-3 w-3 mr-1" />
                  Copiar Dados JSON
                </Button>
                <Button 
                  onClick={handleDownloadJson} 
                  variant="outline" 
                  size="sm" 
                  className="w-full text-xs h-7"
                >
                  <Download className="h-3 w-3 mr-1" />
                  Baixar Arquivo JSON
                </Button>
              </div>
            </div>
          )}
      </aside>

        {/* Área de JSON */}
        <main className="flex-grow p-4 bg-gray-50 overflow-hidden flex flex-col">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-sm font-medium text-gray-700">Dados JSON do Figma</h2>
            <div className="text-xs text-gray-500">
              Visualização simplificada - renderização desativada
            </div>
          </div>
          <div className="flex-grow overflow-hidden relative border border-gray-200 rounded-md">
            <Textarea
              value={jsonData}
              readOnly
              className="absolute inset-0 font-mono text-xs p-4 resize-none h-full bg-white"
            />
          </div>
        </main>
          </div>
    </div>
  );
}
