'use client'

import React, { useState, useEffect } from 'react'

interface FigmaUrlInputProps {
  onUrlSubmit: (url: string) => void
  isLoading?: boolean
}

const FigmaUrlInput: React.FC<FigmaUrlInputProps> = ({ onUrlSubmit, isLoading = false }) => {
  const [url, setUrl] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isValid, setIsValid] = useState(false)

  const validateFigmaUrl = (url: string): { isValid: boolean; error: string | null } => {
    if (!url.trim()) {
      return { isValid: false, error: null }
    }

    try {
      const urlObj = new URL(url)

      // Verifica se é uma URL do Figma
      if (!urlObj.hostname.includes('figma.com')) {
        return {
          isValid: false,
          error: 'A URL deve ser do Figma (figma.com)',
        }
      }

      // Verifica se contém /file/ ou /design/
      const hasValidPath = url.includes('/file/') || url.includes('/design/')
      if (!hasValidPath) {
        return {
          isValid: false,
          error: 'A URL deve conter /file/ ou /design/ seguido pelo ID do arquivo',
        }
      }

      // Verifica se tem um ID após /file/ ou /design/
      const match = url.match(/(?:file|design)\/(.*?)(?:\/|$)/)
      if (!match || !match[1]) {
        return {
          isValid: false,
          error: 'Não foi possível encontrar o ID do arquivo na URL',
        }
      }

      // A URL é válida
      return { isValid: true, error: null }
    } catch (err) {
      console.error('Erro ao validar URL:', err)
      return {
        isValid: false,
        error: 'URL inválida. Por favor, insira uma URL completa e válida',
      }
    }
  }

  // Função para preencher uma URL de teste
  const fillTestUrl = () => {
    const testUrl =
      'https://www.figma.com/design/ezXGzVgULKqKPpnzPTJYHw/DesignTools-Visual-Editor?node-id=174-1620&t=IoqVORtCVnmbHc8E-11'
    setUrl(testUrl)
  }

  useEffect(() => {
    const { isValid: valid, error: validationError } = validateFigmaUrl(url)
    setIsValid(valid)
    setError(validationError)
  }, [url])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isValid) {
      onUrlSubmit(url.trim())
    }
  }

  return (
    <div className='bg-white rounded-lg shadow-md p-6 mb-8'>
      <h2 className='text-lg font-bold mb-4'>Conectar com o Design do Figma</h2>
      <form onSubmit={handleSubmit} className='w-full'>
        <div className='flex flex-col gap-4'>
          <div className='flex flex-col md:flex-row gap-2'>
            <div className='flex-1'>
              <input
                type='text'
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder='Ex: https://www.figma.com/file/abc123... ou https://www.figma.com/design/abc123...'
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  error ? 'border-red-500' : 'border-gray-300'
                }`}
              />

              {error && <p className='mt-1 text-sm text-red-600'>{error}</p>}
            </div>
            <div className='flex gap-2'>
              <button
                type='button'
                onClick={fillTestUrl}
                className='px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 whitespace-nowrap'
              >
                URL Teste
              </button>
              <button
                type='submit'
                disabled={isLoading || !isValid}
                className={`px-6 py-3 bg-blue-500 text-white rounded-lg whitespace-nowrap ${
                  isLoading || !isValid ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'
                }`}
              >
                {isLoading ? 'Processando...' : 'Processar Design'}
              </button>
            </div>
          </div>
          <div className='flex items-start gap-3 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0'
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
              <p>
                Cole a URL completa do seu arquivo Figma para iniciar o processo de tradução em AST
                estruturada.
              </p>
              <p className='mt-1'>
                A URL deve conter <code className='bg-gray-200 px-1 rounded'>/file/</code> ou{' '}
                <code className='bg-gray-200 px-1 rounded'>/design/</code> seguido pelo ID do
                arquivo.
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}

export default FigmaUrlInput
