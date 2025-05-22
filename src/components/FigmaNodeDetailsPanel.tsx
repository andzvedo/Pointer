import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from '@/components/ui/textarea';
import { Copy, Info } from 'lucide-react';
import { FigmaNode } from './FigmaNodeRenderer'; // Assuming FigmaNode is exported from FigmaNodeRenderer

// Helper function to convert Figma color (0-1 range) to CSS rgba string 
// This is also present in FigmaNodeRenderer.tsx, consider moving to a common utils file later if needed.
function figmaColorToCss(color?: { r: number; g: number; b: number; a: number }): string {
    if (!color) return 'transparent';
    const r = Math.round(color.r * 255);
    const g = Math.round(color.g * 255);
    const b = Math.round(color.b * 255);
    return `rgba(${r}, ${g}, ${b}, ${color.a})`;
}

interface FigmaNodeDetailsPanelProps {
  figmaUrl: string;
  nodes: FigmaNode[];
  onCopyJson: () => void;
}

export function FigmaNodeDetailsPanel({ figmaUrl, nodes, onCopyJson }: FigmaNodeDetailsPanelProps) {
  if (!nodes || nodes.length === 0 || !nodes[0]) {
    return (
      <aside className="w-72 bg-white border-r border-gray-200 p-4 flex flex-col space-y-4 overflow-y-auto">
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
        <div className="flex-grow overflow-y-auto border rounded-md p-3 bg-white space-y-3">
          <p className="text-xs text-gray-500">No node data to display.</p>
        </div>
      </aside>
    );
  }

  const node = nodes[0]; // Assuming we are displaying details for the first node

  return (
    <aside className="w-72 bg-white border-r border-gray-200 p-4 flex flex-col space-y-4 overflow-y-auto">
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

        <div className="flex-grow overflow-y-auto border rounded-md p-3 bg-white space-y-3">
          <div className="flex justify-between items-center border-b pb-2 mb-2">
              <h3 className="text-sm font-semibold truncate" title={node.name}>{node.name}</h3>
              <Button variant="ghost" size="icon" onClick={onCopyJson} title="Copy JSON" className="h-6 w-6">
                  <Copy className="h-4 w-4 text-gray-500" />
              </Button>
          </div>
          <div className="space-y-3">
              <div className="space-y-1">
                  <p className="text-xs font-medium text-gray-500">Properties</p>
                  <div className="bg-gray-50 rounded p-2 space-y-1">
                      <p className="text-xs text-gray-600">Type: <span className="font-medium text-gray-800">{node.type}</span></p>
                      {node.absoluteBoundingBox && (
                        <p className="text-xs text-gray-600">Dimensions: <span className="font-medium text-gray-800">{node.absoluteBoundingBox.width.toFixed(0)} × {node.absoluteBoundingBox.height.toFixed(0)}</span></p>
                      )}
                      {node.characters && (
                        <p className="text-xs text-gray-600">Text: <span className="font-medium text-gray-800">{node.characters.substring(0, 50)}{node.characters.length > 50 ? '...' : ''}</span></p>
                      )}
                      {node.layoutMode && (
                        <p className="text-xs text-gray-600">Layout: <span className="font-medium text-gray-800">{node.layoutMode}</span></p>
                      )}
                      {node.children && (
                        <p className="text-xs text-gray-600">Children: <span className="font-medium text-gray-800">{node.children.length}</span></p>
                      )}
                  </div>
              </div>
              
              {node.fills && node.fills.length > 0 && (
                <div className="space-y-1">
                    <p className="text-xs font-medium text-gray-500">Fill</p>
                    <div className="flex items-center gap-1">
                        {node.fills.map((fill: any, index: number) => {
                            if (fill.type === 'SOLID') {
                                return (
                                    <div key={index} className="w-5 h-5 rounded-full border border-gray-300" 
                                         style={{ backgroundColor: figmaColorToCss(fill.color) }} />
                                );
                            }
                            return null;
                        })}
                    </div>
                </div>
              )}
              
              {node.strokes && node.strokes.length > 0 && (
                <div className="space-y-1">
                    <p className="text-xs font-medium text-gray-500">Stroke</p>
                    <div className="flex items-center gap-1">
                        {node.strokes.map((stroke: any, index: number) => {
                            if (stroke.type === 'SOLID') {
                                return (
                                    <div key={index} className="w-5 h-5 rounded-full border border-gray-300" 
                                         style={{ backgroundColor: figmaColorToCss(stroke.color) }} />
                                );
                            }
                            return null;
                        })}
                    </div>
                </div>
              )}
          </div>
          
          <div className="pt-2">
              <p className="text-xs font-medium text-gray-500 mb-1">JSON Data</p>
              <Textarea
                  readOnly
                  value={JSON.stringify(node, null, 2)}
                  className="w-full h-56 font-mono text-xs resize-none bg-gray-50 border-gray-300 focus-visible:ring-offset-0 focus-visible:ring-0"
              />
          </div>
        </div>
    </aside>
  );
}
