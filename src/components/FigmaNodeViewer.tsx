import React from 'react';

// Define an interface for the expected node data structure (can be expanded later)
// Based on common properties from Figma API Node type
interface FigmaNode {
  id: string;
  name: string;
  type: string;
  absoluteBoundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  fills?: ReadonlyArray<{
    type: string;
    color?: { r: number; g: number; b: number; a: number };
    // Add other fill types if needed (e.g., GRADIENT_LINEAR)
  }>;
  // Add other common properties as needed: strokes, children, etc.
}

interface FigmaNodeViewerProps {
  nodeData: FigmaNode | null;
}

// Helper function to convert Figma color (0-1 range) to CSS rgba string
function figmaColorToCss(color?: { r: number; g: number; b: number; a: number }): string {
    if (!color) return 'transparent';
    const r = Math.round(color.r * 255);
    const g = Math.round(color.g * 255);
    const b = Math.round(color.b * 255);
    return `rgba(${r}, ${g}, ${b}, ${color.a})`;
}


const FigmaNodeViewer: React.FC<FigmaNodeViewerProps> = ({ nodeData }) => {
  if (!nodeData) {
    return <div className="text-center text-gray-500">No node data available.</div>;
  }

  // Extract basic properties
  const { name, type, absoluteBoundingBox: bounds, fills } = nodeData;
  
  // --- Basic Visualization --- 
  // Get the first solid fill color, if any
  const solidFill = fills?.find(fill => fill.type === 'SOLID' && fill.color);
  const backgroundColor = figmaColorToCss(solidFill?.color);
  
  // For simplicity, we'll use the bounds for width/height, scaled down
  // In a real canvas, we'd use these for positioning and actual size
  const displayWidth = bounds ? Math.max(50, bounds.width / 5) : 100; // Example scaling
  const displayHeight = bounds ? Math.max(50, bounds.height / 5) : 100; // Example scaling

  return (
    <div className="border p-4 rounded-lg bg-white shadow">
      <h3 className="text-lg font-semibold mb-2">Node Details:</h3>
      <p><span className="font-medium">Name:</span> {name}</p>
      <p><span className="font-medium">Type:</span> {type}</p>
      {bounds && (
        <p><span className="font-medium">Dimensions:</span> {bounds.width.toFixed(0)} x {bounds.height.toFixed(0)}</p>
      )}
      
      <h4 className="text-md font-semibold mt-4 mb-2">Simplified Preview:</h4>
      <div 
        className="border border-dashed border-gray-400 overflow-hidden flex items-center justify-center" 
        style={{
            width: `${displayWidth}px`,
            height: `${displayHeight}px`,
            backgroundColor: backgroundColor, // Apply the extracted background color
        }}
      >
        {/* Display node name inside the preview box if it's short */} 
        {name.length < 20 && <span className="text-xs text-black mix-blend-difference p-1 break-all">{name}</span>}
      </div>
      
      {/* Raw JSON is still useful for debugging during development */}
      {/* <details className="mt-4">
          <summary className="cursor-pointer text-sm text-gray-600">View Raw JSON Data</summary>
          <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-60">
              {JSON.stringify(nodeData, null, 2)}
          </pre>
      </details> */} 
    </div>
  );
};

export default FigmaNodeViewer; 