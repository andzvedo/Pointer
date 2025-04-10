'use client';

import React, { useState, useEffect } from 'react';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import javascript from 'react-syntax-highlighter/dist/esm/languages/hljs/javascript';
import json from 'react-syntax-highlighter/dist/esm/languages/hljs/json';
import markdown from 'react-syntax-highlighter/dist/esm/languages/hljs/markdown';

SyntaxHighlighter.registerLanguage('javascript', javascript);
SyntaxHighlighter.registerLanguage('json', json);
SyntaxHighlighter.registerLanguage('markdown', markdown);

interface CodePreviewProps {
  mainCode: string;
  supplementaryContent: string;
  astData: string;
  platformType: 'cursor' | 'windsurf' | 'generic';
  rawFigmaData?: any;
}

const CodePreview: React.FC<CodePreviewProps> = ({ 
  mainCode, 
  supplementaryContent, 
  astData, 
  platformType,
  rawFigmaData
}) => {
  type TabType = 'integration' | 'instructions' | 'ast' | 'rawData';
  const [activeTab, setActiveTab] = useState<TabType>('integration');
  const [copied, setCopied] = useState<boolean>(false);

  // Reset o estado de cópia quando o código muda
  useEffect(() => {
    setCopied(false);
  }, [mainCode, astData, platformType, rawFigmaData]);

  const getLanguage = (tab: TabType, platform: string): string => {
    switch (tab) {
      case 'integration':
        return platform === 'generic' ? 'json' : 'javascript';
      case 'instructions':
        return 'markdown';
      case 'ast':
      case 'rawData':
        return 'json';
      default:
        return 'json';
    }
  };

  const getCurrentContent = (tab: TabType): string => {
    switch (tab) {
      case 'integration':
        return mainCode;
      case 'instructions':
        return supplementaryContent;
      case 'ast':
        return astData;
      case 'rawData':
        if (!rawFigmaData) return '// Dados não disponíveis';
        
        try {
          // Para a visualização na interface, mostraremos apenas um preview simplificado
          // sem truncar ou modificar os dados originais
          const previewData = {
            __previewNote: "Este é apenas um preview dos dados. Os dados completos são usados para conversão e estão disponíveis via download.",
            document: rawFigmaData.document ? {
              id: rawFigmaData.document.id,
              name: rawFigmaData.document.name,
              type: rawFigmaData.document.type,
              children: '[Array com elementos. Faça download para ver os dados completos]'
            } : '[Documento não disponível]',
            schemaVersion: rawFigmaData.schemaVersion,
            styles: rawFigmaData.styles ? 'Objeto com estilos disponível no download' : null,
            name: rawFigmaData.name,
            lastModified: rawFigmaData.lastModified,
            thumbnailUrl: rawFigmaData.thumbnailUrl,
            version: rawFigmaData.version,
            components: rawFigmaData.components ? `Objeto com ${Object.keys(rawFigmaData.components).length} componentes` : null,
            // Adicione outros campos de alto nível que sejam relevantes para o preview
          };
          
          return JSON.stringify(previewData, null, 2);
        } catch (err: any) {
          console.error('Erro ao processar dados brutos para preview:', err);
          return `// Erro ao processar dados para preview: ${err.message}\n// Utilize o botão "Baixar JSON Completo" para acessar os dados na íntegra.`;
        }
      default:
        return '';
    }
  };

  // Função para sanitizar o nome do design para uso em nome de arquivo
  const sanitizeFileName = (name: string): string => {
    if (!name) return 'figma-design';
    // Remove caracteres que não são seguros para nomes de arquivos
    return name
      .replace(/[/\\?%*:|"<>]/g, '-')
      .replace(/\s+/g, '-')
      .toLowerCase()
      .slice(0, 50); // Limita o tamanho do nome
  };

  // Obtém o nome do design do Figma
  const getDesignName = (): string => {
    if (rawFigmaData && rawFigmaData.name) {
      return sanitizeFileName(rawFigmaData.name);
    }
    return 'figma-design';
  };

  const getFileName = (tab: TabType, platform: string): string => {
    const designName = getDesignName();
    
    switch (tab) {
      case 'integration':
        switch (platform) {
          case 'cursor':
            return `${designName}-context.js`;
          case 'windsurf':
            return `${designName}-spec.js`;
          default:
            return `${designName}-ast.json`;
        }
      case 'instructions':
        return `${designName}-instructions.md`;
      case 'ast':
        return `${designName}-ast.json`;
      case 'rawData':
        return `${designName}-raw-data.json`;
      default:
        return `${designName}-download.txt`;
    }
  };

  const handleCopyClick = async () => {
    try {
      await navigator.clipboard.writeText(getCurrentContent(activeTab));
      setCopied(true);
      
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      console.error('Erro ao copiar para clipboard:', err);
    }
  };

  const handleDownloadClick = () => {
    const content = getCurrentContent(activeTab);
    const fileName = getFileName(activeTab, platformType);
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Função para baixar os dados brutos completos do Figma (sem truncagem)
  const handleDownloadRawData = () => {
    if (!rawFigmaData) return;
    
    try {
      // Criamos uma função que trata referências circulares, mas não trunca os dados
      const prepareJsonForDownload = (data: any) => {
        const seen = new WeakSet();
        return JSON.stringify(data, (key, value) => {
          if (typeof value === 'object' && value !== null) {
            if (seen.has(value)) {
              return "[Referência Circular]";
            }
            seen.add(value);
          }
          return value;
        }, 2);
      };
      
      const jsonContent = prepareJsonForDownload(rawFigmaData);
      const blob = new Blob([jsonContent], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${getDesignName()}-raw-data-complete.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Erro ao preparar download dos dados completos:', err);
      alert('Ocorreu um erro ao preparar o download. Tente novamente.');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="border-b border-gray-200">
        <nav className="flex flex-wrap space-x-2 p-4">
          <button
            onClick={() => setActiveTab('integration')}
            className={`px-4 py-2 rounded-md mb-2 ${
              activeTab === 'integration'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Código de Integração
          </button>
          <button
            onClick={() => setActiveTab('instructions')}
            className={`px-4 py-2 rounded-md mb-2 ${
              activeTab === 'instructions'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Instruções
          </button>
          <button
            onClick={() => setActiveTab('ast')}
            className={`px-4 py-2 rounded-md mb-2 ${
              activeTab === 'ast'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            AST Completa
          </button>
          {rawFigmaData && (
            <button
              onClick={() => setActiveTab('rawData')}
              className={`px-4 py-2 rounded-md mb-2 ${
                activeTab === 'rawData'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Dados Extraídos
            </button>
          )}
          
          <div className="flex-grow"></div>
          
          <button
            onClick={handleCopyClick}
            className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-md flex items-center mb-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path d="M8 2a1 1 0 000 2h2a1 1 0 100-2H8z" />
              <path d="M3 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v6h-4.586l1.293-1.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L10.414 13H15v3a2 2 0 01-2 2H5a2 2 0 01-2-2V5zM15 11h2a1 1 0 110 2h-2v-2z" />
            </svg>
            {copied ? 'Copiado!' : 'Copiar'}
          </button>
          
          <button
            onClick={handleDownloadClick}
            className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-md flex items-center mb-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            Download
          </button>
        </nav>
      </div>

      <div className="p-4 relative">
        <div className="rounded-md overflow-hidden">
          {activeTab === 'rawData' ? (
            <>
              <div className="px-4 py-3 bg-amber-100 text-amber-800 rounded-t-md">
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <p>
                    <strong>Informação:</strong> Por razões de desempenho, estamos exibindo apenas um preview simplificado dos dados. Os dados completos são usados para a conversão AST e podem ser baixados pelo botão abaixo.
                  </p>
                </div>
          </div>
              <SyntaxHighlighter
                language="json"
                style={docco}
                customStyle={{
                  margin: 0,
                  padding: '1rem',
                  borderRadius: '0 0 0.5rem 0.5rem',
                  backgroundColor: '#f8f9fa',
                  minHeight: '600px',
                  maxHeight: '600px',
                  overflowY: 'auto',
                  fontSize: '0.875rem',
                  lineHeight: '1.5',
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace'
                }}
              >
                {getCurrentContent(activeTab) || '// Nenhum conteúdo disponível'}
              </SyntaxHighlighter>
            </>
          ) : (
            <SyntaxHighlighter
              language={getLanguage(activeTab, platformType)}
              style={docco}
              customStyle={{
                margin: 0,
                padding: '1rem',
                borderRadius: '0.5rem',
                backgroundColor: '#f8f9fa',
                minHeight: '600px',
                maxHeight: '600px',
                overflowY: 'auto',
                fontSize: '0.875rem',
                lineHeight: '1.5',
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace'
              }}
            >
              {getCurrentContent(activeTab) || '// Nenhum conteúdo disponível'}
            </SyntaxHighlighter>
          )}
        </div>
        
        {activeTab === 'integration' && (
          <div className="mt-4 p-4 bg-blue-50 text-blue-800 rounded-lg">
            <h3 className="font-bold">Uso do Código de Integração</h3>
            <p className="mt-2">
              Este código serve como uma representação estruturada <strong>completa</strong> do seu design do Figma, incluindo todos os frames, componentes e elementos.
              {platformType === 'cursor' && ' Crie um arquivo no Cursor e cole este código para usar como referência ao implementar componentes.'}
              {platformType === 'windsurf' && ' Importe este arquivo no Windsurf para usar seus recursos de geração de código baseado em design.'}
            </p>
            <div className="mt-3 p-3 bg-white rounded border border-blue-200">
              <div className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="text-sm">
                    <strong>Diferencial:</strong> Enquanto muitas ferramentas extraem apenas componentes isolados, nossa representação AST preserva a estrutura 
                    hierárquica completa do seu design. Todos os frames, componentes e elementos estão organizados de forma similar 
                    à estrutura original no Figma.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'ast' && (
          <div className="mt-4 p-4 bg-purple-50 text-purple-800 rounded-lg">
            <h3 className="font-bold">Abstract Syntax Tree (AST) Completa</h3>
            <p className="mt-2">
              Esta representação estruturada do design inclui todos os elementos do documento Figma. 
              Com o parâmetro <code className="bg-purple-100 px-1 rounded">geometry=paths</code>, nossa AST contém 
              dados vetoriais completos, permitindo recriação fiel de qualquer elemento.
            </p>
            <div className="mt-3 flex flex-col sm:flex-row gap-3">
              <div className="flex-1 p-3 bg-white rounded border border-purple-200">
                <h4 className="font-medium text-purple-800">Dados Vetoriais</h4>
                <p className="mt-1 text-sm">
                  Os elementos <code className="bg-purple-100 px-1 rounded">vector</code> contêm caminhos, 
                  preenchimentos e contornos completos que podem ser convertidos em SVG, Canvas ou qualquer formato vetorial.
                </p>
              </div>
              <div className="flex-1 p-3 bg-white rounded border border-purple-200">
                <h4 className="font-medium text-purple-800">Representação SVG</h4>
                <p className="mt-1 text-sm">
                  Nossa AST também inclui representação SVG pré-gerada para cada vetor, disponível através do campo 
                  <code className="bg-purple-100 px-1 rounded">svgRepresentation</code>.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'rawData' && (
          <div className="mt-4 p-4 bg-yellow-50 text-yellow-800 rounded-lg">
            <h3 className="font-bold">Dados Brutos do Figma</h3>
            <p className="mt-2">
              Acima está um <strong>preview simplificado</strong> dos dados extraídos diretamente da API do Figma.
              <strong> A conversão para AST sempre utiliza os dados completos e integrais</strong>, não esta versão simplificada.
            </p>
            <div className="mt-3 p-3 bg-white rounded border border-yellow-200">
              <div className="flex flex-col md:flex-row md:items-center justify-between">
                <div>
                  <h4 className="font-medium text-yellow-800">Dados Completos do Figma</h4>
                  <p className="mt-1 text-sm">
                    Para análise detalhada ou desenvolvimento personalizado, baixe o arquivo JSON completo com toda a estrutura original do design.
                  </p>
                  <div className="mt-2 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-xs text-green-700">Os dados completos são utilizados para a conversão AST</span>
                  </div>
                </div>
                <button
                  onClick={handleDownloadRawData}
                  className="mt-3 md:mt-0 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-md flex items-center justify-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  Baixar JSON Completo
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CodePreview; 
