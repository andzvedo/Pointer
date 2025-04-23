'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { ArrowLeft, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import DynamicFigmaCanvasEditor from '@/components/DynamicFigmaCanvasEditor'
import ElementPropertiesPanel from '@/components/ElementPropertiesPanel'

// Interface para elementos do Figma que serão editados
interface FigmaElement {
  id: string
  type: string
  x: number
  y: number
  width: number
  height: number
  name: string
  fill?: string
  opacity?: number
  children?: FigmaElement[]
}

export default function EditorPage() {
  const [figmaUrl, setFigmaUrl] = useState<string>('')
  const [figmaData, setFigmaData] = useState<any>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedElement, setSelectedElement] = useState<FigmaElement | null>(null)

  // Carregar dados salvos no localStorage, se existirem
  useEffect(() => {
    const savedFigmaUrl = localStorage.getItem('figmaUrl')
    const savedFigmaData = localStorage.getItem('figmaData')

    if (savedFigmaUrl) {
      setFigmaUrl(savedFigmaUrl)
    }

    if (savedFigmaData) {
      try {
        setFigmaData(JSON.parse(savedFigmaData))
      } catch (err) {
        console.error('Erro ao carregar dados salvos:', err)
      }
    }
  }, [])

  const fetchFigmaData = async () => {
    if (!figmaUrl.trim()) {
      setError('Por favor, insira uma URL do Figma válida')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        figmaUrl: figmaUrl,
        includeStyles: 'true',
        includeComponents: 'true',
        depth: '10', // Profundidade maior para capturar toda a hierarquia
      })

      const response = await fetch(`/api/figma?${params.toString()}`)

      if (!response.ok) {
        throw new Error(`Erro ao buscar dados: ${response.status}`)
      }

      const data = await response.json()
      console.log('Dados recebidos da API:', data)

      setFigmaData(data)

      // Salvar no localStorage para uso futuro
      localStorage.setItem('figmaUrl', figmaUrl)
      localStorage.setItem('figmaData', JSON.stringify(data))
    } catch (err: any) {
      console.error('Erro ao buscar dados do Figma:', err)
      setError(err.message || 'Ocorreu um erro ao buscar os dados do Figma')
    } finally {
      setLoading(false)
    }
  }

  const handleElementSelect = (element: FigmaElement) => {
    console.log('Elemento selecionado:', element)
    setSelectedElement(element)
  }

  const handlePropertyChange = (property: string, value: any) => {
    if (!selectedElement) return

    // Atualizar o elemento selecionado com a nova propriedade
    const updatedElement = { ...selectedElement, [property]: value }
    setSelectedElement(updatedElement)

    // Aqui você também poderia atualizar o estado global do canvas
    // ou disparar alguma ação para atualizar os elementos no canvas
    console.log(`Propriedade ${property} alterada para:`, value)
  }

  return (
    <div className='container mx-auto py-6'>
      <div className='mb-6'>
        <Link href='/' className='flex items-center text-sm text-gray-600 hover:text-gray-900'>
          <ArrowLeft className='w-4 h-4 mr-1' />
          Voltar para a página inicial
        </Link>
      </div>

      <div className='grid grid-cols-1 gap-6 mb-6'>
        <Card>
          <CardHeader>
            <CardTitle>Editor Visual do Figma</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='flex space-x-2 mb-4'>
              <Input
                placeholder='Cole a URL do seu arquivo Figma aqui'
                value={figmaUrl}
                onChange={(e) => setFigmaUrl(e.target.value)}
                className='flex-1'
              />

              <Button onClick={fetchFigmaData} disabled={loading}>
                {loading ? 'Carregando...' : 'Carregar Design'}
              </Button>
            </div>

            {error && (
              <Alert variant='destructive' className='mb-4'>
                <AlertCircle className='h-4 w-4' />
                <AlertTitle>Erro</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>

      <div className='grid grid-cols-3 gap-6'>
        <div className='col-span-2'>
          <DynamicFigmaCanvasEditor figmaNode={figmaData} onElementSelect={handleElementSelect} />
        </div>

        <div className='col-span-1'>
          <ElementPropertiesPanel
            selectedElement={selectedElement}
            onPropertyChange={handlePropertyChange}
          />
        </div>
      </div>
    </div>
  )
}
