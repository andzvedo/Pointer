'use client';

import React from 'react';

// Importando componentes UI
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

// Importando componentes principais
import { Canvas } from '@/components/Canvas';
import CodePreview from '@/components/CodePreview';
import ConceptExplanation from '@/components/ConceptExplanation';
import { DataPreviewStructure } from '@/components/DataPreviewStructure';
// Componentes complexos comentados para evitar erros
// import DynamicFigmaCanvasEditor from '@/components/DynamicFigmaCanvasEditor';
// import ElementPropertiesPanel from '@/components/ElementPropertiesPanel';
// import FigmaCanvasEditor from '@/components/FigmaCanvasEditor';
// import FigmaEditor from '@/components/FigmaEditor';
import FigmaUrlInput from '@/components/FigmaUrlInput';
import { FigmaUrlSimpleInput } from '@/components/FigmaUrlSimpleInput';
import JsonViewer from '@/components/JsonViewer'; 
import { PointerApp } from '@/components/PointerApp';
import { PointerHeader } from '@/components/PointerHeader';
import { Sidebar } from '@/components/Sidebar';

export default function ComponentsShowcase() {
  // Dados de exemplo para componentes que precisam de props
  const mockBlocks = [
    { fileType: 'SVG', fileSize: '123 kbs' },
    { fileType: 'Design data', fileSize: '123 kbs' },
  ];

  const mockJsonData = {
    id: '123:456',
    name: 'Main Frame',
    type: 'FRAME',
    children: [
      {
        id: '123:457',
        name: 'Button',
        type: 'COMPONENT',
        properties: { text: 'Click Me', variant: 'primary' },
      },
    ],
  };

  const mockCode = `import React from 'react';

const Example = () => {
  return <div>Hello World</div>;
};

export default Example;`;

  const mockSupplementaryContent = "// Informações adicionais sobre o código...";
  const mockAstData = JSON.stringify({ type: 'root', children: [] }, null, 2);

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-center">Pointer.design Components Showcase</h1>
      
      <div className="mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <p className="text-gray-600">Demonstração dos componentes disponíveis no projeto Pointer.design. Esta página segue o design minimalista e limpo definido para o projeto.</p>
      </div>
      
      {/* Componentes UI */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold mb-6 border-b pb-2">Componentes UI</h2>
        
        <div className="space-y-12">
          <div>
            <h1 className="text-xl font-semibold mb-4">alert.tsx</h1>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <Alert>Este é um alerta de exemplo</Alert>
            </div>
          </div>
          
          <div>
            <h1 className="text-xl font-semibold mb-4">button.tsx</h1>
            <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
              <div className="flex flex-wrap gap-4">
                <Button>Botão Padrão</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="link">Link</Button>
              </div>
              <div className="flex flex-wrap gap-4">
                <Button size="sm">Small</Button>
                <Button>Default</Button>
                <Button size="lg">Large</Button>
                <Button size="icon"><span className="text-lg">+</span></Button>
              </div>
              <div className="flex flex-wrap gap-4">
                <Button disabled>Desabilitado</Button>
                <Button className="bg-blue-600 hover:bg-blue-700">Personalizado</Button>
              </div>
            </div>
          </div>
          
          <div>
            <h1 className="text-xl font-semibold mb-4">card.tsx</h1>
            <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
              <Card className="p-4">
                <p>Card simples</p>
              </Card>
              
              <Card className="p-0 overflow-hidden">
                <div className="p-4 bg-gray-50 border-b">
                  <h3 className="font-medium">Card com cabeçalho</h3>
                </div>
                <div className="p-4">
                  <p>Conteúdo do card com seções</p>
                </div>
                <div className="p-4 bg-gray-50 border-t flex justify-end">
                  <Button size="sm" variant="outline">Ação</Button>
                </div>
              </Card>
            </div>
          </div>
          
          <div>
            <h1 className="text-xl font-semibold mb-4">input.tsx</h1>
            <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
              <div>
                <Input placeholder="Input padrão" className="w-full max-w-md" />
              </div>
              <div>
                <Label htmlFor="with-label" className="block mb-2">Input com Label</Label>
                <Input id="with-label" placeholder="Digite algo..." className="w-full max-w-md" />
              </div>
              <div>
                <Input disabled placeholder="Input desabilitado" className="w-full max-w-md" />
              </div>
              <div className="flex items-center space-x-2 max-w-md">
                <Input placeholder="Com botão" />
                <Button>Enviar</Button>
              </div>
            </div>
          </div>
          
          <div>
            <h1 className="text-xl font-semibold mb-4">label.tsx</h1>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <Label>Label de exemplo</Label>
            </div>
          </div>
          
          <div>
            <h1 className="text-xl font-semibold mb-4">textarea.tsx</h1>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <Textarea placeholder="Textarea de exemplo" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Componentes principais */}
      <div>
        <h2 className="text-2xl font-bold mb-6 border-b pb-2">Componentes Principais</h2>
        
        <div className="space-y-16">
          <div>
            <h1 className="text-xl font-semibold mb-4">Canvas.tsx</h1>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <Canvas>Conteúdo do Canvas</Canvas>
            </div>
          </div>
          
          {/* Componentes complexos foram removidos */}
          
          <div>
            <h1 className="text-xl font-semibold mb-4">DataPreviewStructure.tsx</h1>
            <div className="bg-white rounded-lg shadow-md">
              <div className="h-[400px] overflow-hidden">
                <DataPreviewStructure onUrlProcess={(url: string) => console.log(url)} />
              </div>
            </div>
          </div>
          
          <div>
            <h1 className="text-xl font-semibold mb-4">FigmaUrlSimpleInput.tsx</h1>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <FigmaUrlSimpleInput onProcess={(url) => console.log(url)} />
            </div>
          </div>
          
          <div>
            <h1 className="text-xl font-semibold mb-4">CodePreview.tsx</h1>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <CodePreview
                mainCode={mockCode}
                supplementaryContent={mockSupplementaryContent}
                astData={mockAstData}
                platformType='generic' // ou 'cursor', 'windsurf'
              />
            </div>
          </div>

          <div>
            <h1 className="text-xl font-semibold mb-4">ConceptExplanation.tsx</h1>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <ConceptExplanation />
            </div>
          </div>

          <div>
            <h1 className="text-xl font-semibold mb-4">JsonViewer.tsx</h1>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <JsonViewer data={mockJsonData} />
            </div>
          </div>
          
          <div>
            <h1 className="text-xl font-semibold mb-4">PointerApp.tsx</h1>
            <div className="bg-white rounded-lg shadow-md">
              <div className="h-[500px] overflow-hidden">
                <PointerApp
                  frameTitle="Design de Exemplo"
                  frameUrl="https://www.figma.com/design/example-id/Pointer-Design"
                  blocks={[
                    { fileType: 'SVG', fileSize: '123 kbs' },
                    { fileType: 'Design data', fileSize: '456 kbs' },
                    { fileType: 'Context', fileSize: '789 kbs' },
                  ]}
                >
                  <div className="p-4 h-full flex items-center justify-center bg-gray-50">
                    <div className="text-center">
                      <h3 className="text-lg font-medium mb-2">Conteúdo Principal</h3>
                      <p className="text-gray-500">Esta área exibe o conteúdo principal do aplicativo</p>
                    </div>
                  </div>
                </PointerApp>
              </div>
            </div>
          </div>
          
          <div>
            <h1 className="text-xl font-semibold mb-4">PointerHeader.tsx</h1>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <PointerHeader 
                frameTitle="Exemplo de Frame"
                frameUrl="https://example.com/figma"
                onRefresh={() => console.log('Refresh')}
                onNew={() => console.log('New')}
              />
            </div>
          </div>
          
          <div>
            <h1 className="text-xl font-semibold mb-4">Sidebar.tsx</h1>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <Sidebar 
                blocks={mockBlocks}
                onBlockHeaderClick={(index) => console.log(`Block ${index} clicked`)}
              />
            </div>
          </div>
          
          <div>
            <h1 className="text-xl font-semibold mb-4">FigmaUrlInput.tsx</h1>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <FigmaUrlInput onUrlSubmit={(url) => console.log(url)} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
