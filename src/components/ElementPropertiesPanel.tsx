import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Input } from './ui/input'
import { Label } from './ui/label'

// Interface para elemento do Figma
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

interface ElementPropertiesPanelProps {
  selectedElement: FigmaElement | null
  onPropertyChange: (property: string, value: any) => void
}

const ElementPropertiesPanel: React.FC<ElementPropertiesPanelProps> = ({
  selectedElement,
  onPropertyChange,
}) => {
  if (!selectedElement) {
    return (
      <Card className='w-full'>
        <CardHeader>
          <CardTitle>Propriedades</CardTitle>
        </CardHeader>
        <CardContent>
          <p className='text-gray-500 text-sm'>
            Selecione um elemento para editar suas propriedades
          </p>
        </CardContent>
      </Card>
    )
  }

  const handleInputChange = (property: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    // Converte o valor para número se for necessário
    const value = ['x', 'y', 'width', 'height', 'opacity'].includes(property)
      ? parseFloat(e.target.value)
      : e.target.value

    onPropertyChange(property, value)
  }

  return (
    <Card className='w-full'>
      <CardHeader>
        <CardTitle>Propriedades: {selectedElement.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='space-y-4'>
          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='element-name'>Nome</Label>
              <Input
                id='element-name'
                value={selectedElement.name}
                onChange={handleInputChange('name')}
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='element-type'>Tipo</Label>
              <Input id='element-type' value={selectedElement.type} disabled />
            </div>
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='element-x'>X</Label>
              <Input
                id='element-x'
                type='number'
                value={selectedElement.x}
                onChange={handleInputChange('x')}
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='element-y'>Y</Label>
              <Input
                id='element-y'
                type='number'
                value={selectedElement.y}
                onChange={handleInputChange('y')}
              />
            </div>
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='element-width'>Largura</Label>
              <Input
                id='element-width'
                type='number'
                value={selectedElement.width}
                onChange={handleInputChange('width')}
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='element-height'>Altura</Label>
              <Input
                id='element-height'
                type='number'
                value={selectedElement.height}
                onChange={handleInputChange('height')}
              />
            </div>
          </div>

          {selectedElement.fill && (
            <div className='space-y-2'>
              <Label htmlFor='element-fill'>Cor de Fundo</Label>
              <div className='flex space-x-2'>
                <Input
                  id='element-fill'
                  value={selectedElement.fill}
                  onChange={handleInputChange('fill')}
                />

                <div
                  className='w-10 h-10 rounded border border-gray-300'
                  style={{ backgroundColor: selectedElement.fill }}
                />
              </div>
            </div>
          )}

          {selectedElement.opacity !== undefined && (
            <div className='space-y-2'>
              <Label htmlFor='element-opacity'>Opacidade</Label>
              <div className='flex items-center space-x-2'>
                <Input
                  id='element-opacity'
                  type='range'
                  min='0'
                  max='1'
                  step='0.01'
                  value={selectedElement.opacity}
                  onChange={handleInputChange('opacity')}
                  className='flex-1'
                />

                <span className='text-sm text-gray-500'>
                  {Math.round(selectedElement.opacity * 100)}%
                </span>
              </div>
            </div>
          )}

          {selectedElement.children && (
            <div className='space-y-2'>
              <Label>Elementos Filhos</Label>
              <div className='text-sm text-gray-500'>
                {selectedElement.children.length} elemento(s)
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default ElementPropertiesPanel
