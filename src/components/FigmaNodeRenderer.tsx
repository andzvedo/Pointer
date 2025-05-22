import React from 'react';

// Interface for Figma nodes (expanded to support more node types)
export interface FigmaNode {
    id: string;
    name: string;
    type: string; // 'FRAME', 'RECTANGLE', 'TEXT', 'GROUP', 'COMPONENT', etc.
    absoluteBoundingBox?: { x: number; y: number; width: number; height: number };
    fills?: ReadonlyArray<any>;
    strokes?: ReadonlyArray<any>;
    strokeWeight?: number;
    cornerRadius?: number | { topLeft?: number; topRight?: number; bottomRight?: number; bottomLeft?: number };
    characters?: string; // For TEXT nodes
    style?: { // For TEXT nodes
        fontFamily?: string;
        fontWeight?: number;
        fontSize?: number;
        textAlignHorizontal?: string;
        textAlignVertical?: string;
        letterSpacing?: number;
        lineHeightPx?: number;
        lineHeightPercent?: number;
    };
    layoutMode?: string; // For AUTO_LAYOUT
    primaryAxisSizingMode?: string;
    counterAxisSizingMode?: string;
    paddingLeft?: number;
    paddingRight?: number;
    paddingTop?: number;
    paddingBottom?: number;
    itemSpacing?: number; // For AUTO_LAYOUT
    children?: FigmaNode[];
    parent?: FigmaNode; // Referência ao nó pai para cálculo de posição relativa
}

// Helper function to convert Figma color (0-1 range) to CSS rgba string
export function figmaColorToCss(color?: { r: number; g: number; b: number; a: number }): string {
    if (!color) return 'transparent';
    const r = Math.round(color.r * 255);
    const g = Math.round(color.g * 255);
    const b = Math.round(color.b * 255);
    return `rgba(${r}, ${g}, ${b}, ${color.a})`;
}

// Helper function to get background color from fills
export function getBackgroundColor(fills?: ReadonlyArray<any>): string {
    if (!fills || fills.length === 0) return 'transparent';
    const solidFill = fills.find((fill: any) => fill.type === 'SOLID' && fill.color);
    return figmaColorToCss(solidFill?.color);
}

// Helper function to render a node recursively
export function renderNode(node: FigmaNode, scale: number = 0.2): React.ReactNode {
    if (!node) {
        console.log('Attempted to render null node');
        return null;
    }
    
    console.log('Rendering node:', { id: node.id, name: node.name, type: node.type, bbox: node.absoluteBoundingBox });
    
    // Se o nó não tiver absoluteBoundingBox, não podemos renderizá-lo corretamente
    if (!node.absoluteBoundingBox) {
        console.log('Node missing absoluteBoundingBox:', node.id, node.name);
        return null;
    }
    
    // Para nós de primeiro nível (frames), definir posição relativa ao container
    // Para nós filhos, definir posição absoluta em relação ao pai
    const isTopLevelNode = node.type === 'FRAME' || node.type === 'COMPONENT' || node.type === 'INSTANCE';
    
    const style: React.CSSProperties = {
        position: 'absolute',
        left: isTopLevelNode ? '0' : `${(node.absoluteBoundingBox.x - (node.parent?.absoluteBoundingBox?.x || 0)) * scale}px`,
        top: isTopLevelNode ? '0' : `${(node.absoluteBoundingBox.y - (node.parent?.absoluteBoundingBox?.y || 0)) * scale}px`,
        width: `${node.absoluteBoundingBox.width * scale}px`,
        height: `${node.absoluteBoundingBox.height * scale}px`,
        backgroundColor: getBackgroundColor(node.fills),
        borderRadius: typeof node.cornerRadius === 'number' ? `${node.cornerRadius * scale}px` : undefined,
        overflow: 'hidden',
    };
    
    // Add border if there are strokes
    if (node.strokes && node.strokes.length > 0 && node.strokeWeight) {
        const strokeFill = node.strokes.find((stroke: any) => stroke.type === 'SOLID');
        if (strokeFill) {
            style.border = `${node.strokeWeight * scale}px solid ${figmaColorToCss(strokeFill.color)}`;
        }
    }
    
    // Special handling for TEXT nodes
    if (node.type === 'TEXT' && node.characters) {
        const textStyle: React.CSSProperties = {
            fontSize: node.style?.fontSize ? `${node.style.fontSize * scale}px` : undefined,
            fontWeight: node.style?.fontWeight,
            textAlign: node.style?.textAlignHorizontal?.toLowerCase() as any,
            margin: 0,
            padding: 0,
            color: getBackgroundColor(node.fills) !== 'transparent' ? getBackgroundColor(node.fills) : '#000',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
        };

        if (node.style?.lineHeightPx) {
            textStyle.lineHeight = `${node.style.lineHeightPx * scale}px`;
        } else if (node.style?.lineHeightPercent) {
            textStyle.lineHeight = `${node.style.lineHeightPercent / 100}`;
        }

        if (node.style?.letterSpacing) {
            textStyle.letterSpacing = `${node.style.letterSpacing * scale}px`;
        }

        return (
            <div style={style}>
                <p style={textStyle}>
                    {node.characters}
                </p>
            </div>
        );
    }
    
    // Render children recursively for container nodes
    return (
        <div style={style}>
            {node.children?.map((child: FigmaNode) => (
                <React.Fragment key={child.id}>
                    {renderNode(child, scale)}
                </React.Fragment>
            ))}
        </div>
    );
}
