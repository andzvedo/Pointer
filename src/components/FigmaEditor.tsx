'use client'

import React, { useState, useEffect } from 'react'
import FigmaUrlInput from './FigmaUrlInput'
import CodePreview from './CodePreview'
import ConceptExplanation from './ConceptExplanation'
/* // Removendo importação - lógica movida para o plugin
import {
  convertFigmaToAst,
  formatAstForIntegration,
  generateIntegrationInstructions,
} from '../lib/figmaToAst' 
*/

// Plataformas de integração suportadas
const SUPPORTED_PLATFORMS = ['cursor', 'windsurf', 'generic'] as const
type PlatformType = (typeof SUPPORTED_PLATFORMS)[number]

const FigmaEditor: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [figmaData, setFigmaData] = useState<any>(null)
  const [filteredJson, setFilteredJson] = useState<any>(null)
  const [astBlobUrl, setAstBlobUrl] = useState<string | null>(null)
  const [rawBlobUrl, setRawBlobUrl] = useState<string | null>(null)
  const [filteredBlobUrl, setFilteredBlobUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [designAst, setDesignAst] = useState<any>(null)
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformType>('generic')
  const [integrationCode, setIntegrationCode] = useState<string>('')
  const [integrationInstructions, setIntegrationInstructions] = useState<string>('')

  // Efeito para verificar quando o componente é montado
  useEffect(() => {
    console.log('FigmaEditor montado')
  }, [])

  // Efeito para atualizar o código de integração quando a plataforma muda
  useEffect(() => {
    if (designAst) {
      updateIntegrationCode(selectedPlatform)
    }
  }, [selectedPlatform, designAst])

  const extractFileKeyFromUrl = (url: string) => {
    // Aceita tanto URLs com /file/ quanto /design/
    const match = url.match(/(?:file|design)\/(.*?)(?:\/|$)/)
    if (!match) return null

    // Remove qualquer parâmetro adicional da URL
    const fileKey = match[1].split('?')[0]
    console.log('FileKey extraído:', fileKey)
    return fileKey
  }

  // Função para atualizar o código de integração e instruções
  const updateIntegrationCode = (platform: PlatformType) => {
    if (!designAst) return
    
    console.warn("updateIntegrationCode: Lógica de formatação movida para o plugin ou backend.");
    // A formatação e as instruções virão via WebSocket
    /* // Código antigo removido
    const formattedCode = formatAstForIntegration(designAst, platform)
    const instructions = generateIntegrationInstructions(platform)
    setIntegrationCode(formattedCode)
    setIntegrationInstructions(instructions)
    */
    // Placeholder enquanto não temos WebSocket
    setIntegrationCode(`// Código para ${platform} será recebido via WebSocket`);
    setIntegrationInstructions(`## Instruções para ${platform}\n\nAs instruções formatadas serão recebidas via WebSocket.`);
  }

  const handleUrlSubmit = async (url: string) => {
    // ... (início da função)
    console.log('handleUrlSubmit chamado com URL:', url)
    setIsLoading(true)
    setError(null)
    setDesignAst(null)
    setIntegrationCode('')
    setIntegrationInstructions('')

    // ESTA FUNÇÃO SERÁ REESCRITA/REMOVIDA
    // A busca de dados e geração de AST agora acontece no plugin.
    // A comunicação será via WebSocket.
    // Mantendo a estrutura básica por enquanto, mas comentando a lógica principal.
    
    /* // Lógica antiga de fetch e processamento comentada
    try {
      const fileKey = extractFileKeyFromUrl(url)
      console.log('FileKey extraído no handleUrlSubmit:', fileKey)

      if (!fileKey) {
        throw new Error(
          'URL do Figma inválida. A URL deve conter /file/ ou /design/ seguido pelo ID do arquivo.',
        )
      }
      const encodedUrl = encodeURIComponent(url)
      console.log('Fazendo requisição para:', `/api/figma?figmaUrl=${encodedUrl}`)
      const response = await fetch(`/api/figma?figmaUrl=${encodedUrl}`)
      console.log('Resposta recebida. Status:', response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('Erro da API:', errorData)
        throw new Error(errorData.error || 'Erro ao carregar dados do Figma')
      }
      const data = await response.json()
      console.log('Dados recebidos do Figma:', Object.keys(data))
      setFigmaData(data) 

      // Gerar link para download do RAW JSON
      const rawBlob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      setRawBlobUrl(URL.createObjectURL(rawBlob))

      try {
        let filtered = data
        if (typeof window !== 'undefined' && (window as any).filterNode) {
          filtered = (window as any).filterNode(data)
        }
        setFilteredJson(filtered)
        const filteredBlob = new Blob([JSON.stringify(filtered, null, 2)], { type: 'application/json' })
        setFilteredBlobUrl(URL.createObjectURL(filteredBlob))

        // Converter dados filtrados para AST
        console.log('Convertendo dados filtrados para AST')
        const ast = convertFigmaToAst(filtered, fileKey) // Chamada removida
        setDesignAst(ast)
        const astBlob = new Blob([JSON.stringify(ast, null, 2)], { type: 'application/json' })
        setAstBlobUrl(URL.createObjectURL(astBlob))

        // Gerar código de integração para a plataforma selecionada
        updateIntegrationCode(selectedPlatform) // Chamada removida indiretamente
      } catch (astError) {
        console.error('Erro ao gerar AST:', astError)
        throw new Error('Erro ao processar os dados do Figma para o formato estruturado')
      }
    } catch (err) {
      console.error('Erro no handleUrlSubmit:', err)
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
      console.error('Erro completo:', err)
    } finally {
      console.log('Finalizando processamento, isLoading = false')
      setIsLoading(false)
    }
    */
    
    // Simulação de erro/aviso enquanto a lógica está desativada
    setError("Lógica de busca via API desativada. Use o plugin Figma.");
    setIsLoading(false);
  }

  const handlePlatformChange = (platform: PlatformType) => {
    setSelectedPlatform(platform)
  }

  return (
    <div className='min-h-screen bg-gray-50 py-8'>
      <div className='container mx-auto px-4'>
        <h1 className='text-3xl font-bold text-center mb-8'>Tradutor de Design Figma</h1>
        <p className='text-center text-gray-600 mb-8'>
          Transforme seus designs do Figma em representações estruturadas para integração com
          ferramentas de desenvolvimento
        </p>

        <ConceptExplanation />

        {/* Novo: Upload manual de JSON filtrado */}
        <div className="mb-6 flex flex-col items-center">
          <label className="mb-2 font-medium">Ou carregue um arquivo JSON filtrado do Figma</label>
          <input
            type="file"
            accept="application/json"
            onChange={async (e) => {
              const file = e.target.files?.[0]
              if (!file) return
              setIsLoading(true)
              setError(null)
              setDesignAst(null)
              setIntegrationCode("")
              setIntegrationInstructions("")
              try {
                const text = await file.text()
                const json = JSON.parse(text)
                setFigmaData(json)
                // Converter para AST (REMOVIDO/COMENTADO)
                /*
                const ast = convertFigmaToAst(json)
                setDesignAst(ast)
                updateIntegrationCode(selectedPlatform)
                */
               setError("Processamento de JSON manual desativado temporariamente.");
              } catch (err) {
                 // ... (tratamento de erro)
              } finally {
                setIsLoading(false)
              }
            }}
            className="border px-3 py-2 rounded shadow-sm"
          />
        </div>

        <FigmaUrlInput onUrlSubmit={handleUrlSubmit} isLoading={isLoading} />

        {error && <div className='mt-4 p-4 bg-red-100 text-red-700 rounded-lg'>{error}</div>}

        {/* Botões para download dos arquivos processados */}
        {(rawBlobUrl || filteredBlobUrl || astBlobUrl) && (
          <div className="mt-8 flex flex-col items-center gap-3">
            <h3 className="font-semibold mb-2">Downloads:</h3>
            {rawBlobUrl && (
              <a href={rawBlobUrl} download="raw-figma.json" className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Baixar RAW JSON</a>
            )}
            {filteredBlobUrl && (
              <a href={filteredBlobUrl} download="filtered-figma.json" className="px-4 py-2 bg-blue-100 rounded hover:bg-blue-200">Baixar JSON Filtrado</a>
            )}
            {astBlobUrl && (
              <a href={astBlobUrl} download="design-ast.json" className="px-4 py-2 bg-green-100 rounded hover:bg-green-200">Baixar AST</a>
            )}
          </div>
        )}

        {designAst && (
          <>
            <div className='bg-white rounded-lg shadow-lg overflow-hidden mb-4'>
              <div className='border-b border-gray-200 p-4'>
                <h2 className='text-xl font-bold'>Integração com Plataformas</h2>
                <p className='text-gray-600 mt-1'>
                  Selecione a plataforma para a qual deseja exportar o contexto de design
                </p>
                <div className='flex space-x-2 mt-4'>
                  {SUPPORTED_PLATFORMS.map((platform) => (
                    <button
                      key={platform}
                      onClick={() => handlePlatformChange(platform)}
                      className={`px-4 py-2 rounded-md ${selectedPlatform === platform
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                    >
                      {platform.charAt(0).toUpperCase() + platform.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <CodePreview
              mainCode={integrationCode}
              supplementaryContent={integrationInstructions}
              astData={JSON.stringify(designAst, null, 2)}
              platformType={selectedPlatform}
              rawFigmaData={figmaData}
            />
          </>
        )}
      </div>
    </div>
  )
}

export default FigmaEditor
