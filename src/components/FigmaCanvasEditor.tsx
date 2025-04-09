'use client'

import React, { useRef, useState, useEffect } from 'react'
import { Stage, Layer, Rect, Text, Transformer, Group } from 'react-konva'
import { KonvaEventObject } from 'konva/lib/Node'

// Interface para elementos do Figma que serão renderizados no canvas
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

interface FigmaCanvasEditorProps {
  figmaNode: any // Substituir por uma interface mais específica quando necessário
  onElementSelect?: (element: FigmaElement) => void
}

const FigmaCanvasEditor: React.FC<FigmaCanvasEditorProps> = ({ figmaNode, onElementSelect }) => {
  const [elements, setElements] = useState<FigmaElement[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const stageRef = useRef<any>(null)
  const transformerRef = useRef<any>(null)
  
  // Converter o nó do Figma para elementos do canvas
  useEffect(() => {
    if (!figmaNode) return
    
    // Função para converter nós do Figma em elementos do canvas
    const convertFigmaNodeToElements = (node: any, parentX = 0, parentY = 0): FigmaElement[] => {
      if (!node) return []
      
      // Se for um único nó
      if (!Array.isArray(node)) {
        // Ignorar nós invisíveis
        if (node.visible === false) {
          console.log(`Canvas: Ignorando elemento oculto ${node.name || 'sem nome'} (ID: ${node.id || 'sem ID'})`)
          return []
        }
        
        const boundingBox = node.absoluteBoundingBox || { x: 0, y: 0, width: 100, height: 100 }
        
        const element: FigmaElement = {
          id: node.id || Math.random().toString(36).substr(2, 9),
          type: node.type || 'RECTANGLE',
          x: (boundingBox.x || 0) + parentX,
          y: (boundingBox.y || 0) + parentY,
          width: boundingBox.width || 100,
          height: boundingBox.height || 100,
          name: node.name || 'Unnamed Element',
          fill: node.fills && node.fills.length > 0 ? 
            `rgba(${node.fills[0].color?.r * 255 || 200}, ${node.fills[0].color?.g * 255 || 200}, ${node.fills[0].color?.b * 255 || 200}, ${node.fills[0].color?.a || 1})` : 
            '#e0e0e0',
          opacity: node.opacity !== undefined ? node.opacity : 1
        }
        
        // Processar filhos recursivamente
        const childElements: FigmaElement[] = []
        if (node.children && Array.isArray(node.children) && node.children.length > 0) {
          // Contar elementos ocultos para log
          const hiddenChildren = node.children.filter((child: any) => child.visible === false)
          if (hiddenChildren.length > 0) {
            console.log(`Canvas: Ignorando ${hiddenChildren.length} elementos ocultos dentro de ${node.name || 'elemento sem nome'}`)
          }
          
          node.children.forEach((child: any) => {
            // Ignorar filhos invisíveis
            if (child.visible !== false) {
              const childElems = convertFigmaNodeToElements(child, element.x, element.y)
              childElements.push(...childElems)
            }
          })
        }
        
        // Adicionar filhos ao elemento
        if (childElements.length > 0) {
          element.children = childElements
        }
        
        return [element]
      }
      
      // Se for um array de nós
      const elements: FigmaElement[] = []
      // Contar elementos ocultos para log
      if (Array.isArray(node)) {
        const hiddenItems = node.filter((item: any) => item.visible === false)
        if (hiddenItems.length > 0) {
          console.log(`Canvas: Ignorando ${hiddenItems.length} elementos ocultos no nível superior`)
        }
      }
      
      node.forEach((item: any) => {
        // Ignorar itens invisíveis
        if (item.visible !== false) {
          const convertedElements = convertFigmaNodeToElements(item, parentX, parentY)
          elements.push(...convertedElements)
        }
      })
      
      return elements
    }
    
    // Converter e configurar elementos
    try {
      // Tentar diferentes propriedades para encontrar os dados do nó
      let nodeData = figmaNode
      if (figmaNode.node) {
        nodeData = figmaNode.node
      } else if (figmaNode.document) {
        nodeData = figmaNode.document
      }
      
      const convertedElements = convertFigmaNodeToElements(nodeData)
      setElements(convertedElements)
      console.log('Converted elements:', convertedElements)
    } catch (error) {
      console.error('Error converting Figma node to canvas elements:', error)
    }
  }, [figmaNode])
  
  // Atualizar o transformador quando um elemento é selecionado
  useEffect(() => {
    if (selectedId && transformerRef.current) {
      // Encontrar o nó selecionado pelo ID
      const node = stageRef.current?.findOne('#' + selectedId)
      if (node) {
        // Anexar ao transformador
        transformerRef.current.nodes([node])
        transformerRef.current.getLayer().batchDraw()
      }
    } else if (transformerRef.current) {
      // Limpar nós do transformador
      transformerRef.current.nodes([])
      transformerRef.current.getLayer().batchDraw()
    }
  }, [selectedId])
  
  const handleStageClick = (e: KonvaEventObject<MouseEvent>) => {
    // Verificar se o clique foi no próprio stage e não em um elemento
    const clickedOnEmpty = e.target === e.currentTarget
    
    if (clickedOnEmpty) {
      setSelectedId(null)
      return
    }
  }
  
  const handleElementSelect = (id: string, element: FigmaElement) => {
    setSelectedId(id)
    if (onElementSelect) {
      onElementSelect(element)
    }
  }
  
  // Renderizar elementos recursivamente
  const renderElements = (elements: FigmaElement[]) => {
    return elements.map((element) => (
      <Group key={element.id}>
        <Rect
          id={element.id}
          x={element.x}
          y={element.y}
          width={element.width}
          height={element.height}
          fill={element.fill || '#e0e0e0'}
          opacity={element.opacity || 1}
          stroke={selectedId === element.id ? '#3498db' : 'transparent'}
          strokeWidth={1}
          draggable
          onClick={() => handleElementSelect(element.id, element)}
          onTap={() => handleElementSelect(element.id, element)}
        />
        {element.type === 'TEXT' && (
          <Text
            x={element.x + 5}
            y={element.y + element.height / 2 - 8}
            text={element.name}
            fontSize={16}
            fill="#333"
          />
        )}
        {element.children && renderElements(element.children)}
      </Group>
    ))
  }
  
  return (
    <div className="canvas-editor-container relative border border-gray-300 rounded-md overflow-hidden">
      <Stage
        width={800}
        height={600}
        ref={stageRef}
        onClick={handleStageClick}
        onTap={handleStageClick}
        className="bg-gray-50"
      >
        <Layer>
          {elements.length > 0 ? (
            renderElements(elements)
          ) : (
            <Text 
              text="Nenhum elemento para exibir. Faça upload de um design do Figma."
              x={250}
              y={280}
              fontSize={16}
              fill="#999"
            />
          )}
          <Transformer
            ref={transformerRef}
            boundBoxFunc={(oldBox, newBox) => {
              // Limitar o tamanho mínimo
              if (newBox.width < 5 || newBox.height < 5) {
                return oldBox
              }
              return newBox
            }}
          />
        </Layer>
      </Stage>
    </div>
  )
}

export default FigmaCanvasEditor 