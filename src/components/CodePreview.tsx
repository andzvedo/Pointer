'use client'

import React from 'react'

interface CodePreviewProps {
  mainCode: string
  supplementaryContent: string
  astData: string
  platformType: 'cursor' | 'windsurf' | 'generic'
  rawFigmaData?: any
}

const CodePreview: React.FC<CodePreviewProps> = ({
  mainCode,
  supplementaryContent,
  astData,
  platformType,
  rawFigmaData,
}) => {
  // Função para sanitizar o nome do design para uso em nome de arquivo
  const sanitizeFileName = (name: string): string => {
    if (!name) return 'figma-design'
    return name
      .replace(/[/\\?%*:|"<>]/g, '-')
      .replace(/\s+/g, '-')
      .toLowerCase()
      .slice(0, 50)
  }

  // Obtém o nome do design do Figma
  const getDesignName = (): string => {
    if (rawFigmaData && rawFigmaData.name) {
      return sanitizeFileName(rawFigmaData.name)
    }
    return 'figma-design'
  }

  const handleDownload = (content: string, type: string) => {
    const designName = getDesignName()
    let fileName = ''

    switch (type) {
      case 'integration':
        fileName =
          platformType === 'cursor'
            ? `${designName}-context.js`
            : platformType === 'windsurf'
              ? `${designName}-spec.js`
              : `${designName}-ast.json`
        break
      case 'instructions':
        fileName = `${designName}-instructions.md`
        break
      case 'ast':
        fileName = `${designName}-ast.json`
        break
      case 'rawData':
        fileName = `${designName}-raw-data.json`
        break
      default:
        fileName = `${designName}-download.txt`
    }

    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Função para baixar os dados brutos completos do Figma
  const handleDownloadRawData = () => {
    if (!rawFigmaData) return

    try {
      const seen = new WeakSet()
      const jsonContent = JSON.stringify(
        rawFigmaData,
        (key, value) => {
          if (typeof value === 'object' && value !== null) {
            if (seen.has(value)) {
              return '[Referência Circular]'
            }
            seen.add(value)
          }
          return value
        },
        2,
      )

      handleDownload(jsonContent, 'rawData')
    } catch (err) {
      console.error('Erro ao preparar download dos dados completos:', err)
      alert('Ocorreu um erro ao preparar o download. Tente novamente.')
    }
  }

  return (
    <div className='bg-white rounded-lg shadow-lg p-6'>
      <h2 className='text-xl font-bold mb-4'>Downloads Disponíveis</h2>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        {/* Código de Integração */}
        <div className='p-4 bg-blue-50 rounded-lg'>
          <h3 className='font-semibold text-blue-800 mb-2'>Código de Integração</h3>
          <p className='text-sm text-blue-600 mb-3'>
            Código estruturado para integração com{' '}
            {platformType === 'cursor'
              ? 'Cursor'
              : platformType === 'windsurf'
                ? 'Windsurf'
                : 'sua plataforma'}
            .
          </p>
          <button
            onClick={() => handleDownload(mainCode, 'integration')}
            className='w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center justify-center'
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='h-5 w-5 mr-2'
              viewBox='0 0 20 20'
              fill='currentColor'
            >
              <path
                fillRule='evenodd'
                d='M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z'
                clipRule='evenodd'
              />
            </svg>
            Baixar Código de Integração
          </button>
        </div>

        {/* Instruções */}
        <div className='p-4 bg-green-50 rounded-lg'>
          <h3 className='font-semibold text-green-800 mb-2'>Instruções de Uso</h3>
          <p className='text-sm text-green-600 mb-3'>
            Documentação detalhada sobre como utilizar o código gerado.
          </p>
          <button
            onClick={() => handleDownload(supplementaryContent, 'instructions')}
            className='w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 flex items-center justify-center'
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='h-5 w-5 mr-2'
              viewBox='0 0 20 20'
              fill='currentColor'
            >
              <path
                fillRule='evenodd'
                d='M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z'
                clipRule='evenodd'
              />
            </svg>
            Baixar Instruções
          </button>
        </div>

        {/* AST Completa */}
        <div className='p-4 bg-purple-50 rounded-lg'>
          <h3 className='font-semibold text-purple-800 mb-2'>AST Completa</h3>
          <p className='text-sm text-purple-600 mb-3'>
            Representação estruturada completa do design, incluindo dados vetoriais.
          </p>
          <button
            onClick={() => handleDownload(astData, 'ast')}
            className='w-full px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 flex items-center justify-center'
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='h-5 w-5 mr-2'
              viewBox='0 0 20 20'
              fill='currentColor'
            >
              <path
                fillRule='evenodd'
                d='M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z'
                clipRule='evenodd'
              />
            </svg>
            Baixar AST
          </button>
        </div>

        {/* Dados Brutos */}
        {rawFigmaData && (
          <div className='p-4 bg-yellow-50 rounded-lg'>
            <h3 className='font-semibold text-yellow-800 mb-2'>Dados Brutos do Figma</h3>
            <p className='text-sm text-yellow-600 mb-3'>
              Dados completos extraídos diretamente da API do Figma.
            </p>
            <button
              onClick={handleDownloadRawData}
              className='w-full px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 flex items-center justify-center'
            >
              <svg
                xmlns='http://www.w3.org/2000/svg'
                className='h-5 w-5 mr-2'
                viewBox='0 0 20 20'
                fill='currentColor'
              >
                <path
                  fillRule='evenodd'
                  d='M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z'
                  clipRule='evenodd'
                />
              </svg>
              Baixar Dados Brutos
            </button>
          </div>
        )}
      </div>

      <div className='mt-6 p-4 bg-gray-50 rounded-lg'>
        <div className='flex items-start'>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            className='h-6 w-6 text-gray-500 mr-2'
            viewBox='0 0 20 20'
            fill='currentColor'
          >
            <path
              fillRule='evenodd'
              d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z'
              clipRule='evenodd'
            />
          </svg>
          <div>
            <h4 className='font-semibold text-gray-800'>Sobre os Downloads</h4>
            <p className='mt-1 text-sm text-gray-600'>
              Todos os arquivos são gerados localmente no seu navegador. Os dados completos são
              utilizados para a conversão AST, garantindo fidelidade máxima ao design original do
              Figma.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CodePreview
