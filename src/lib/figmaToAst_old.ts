/**
 * figmaToAst.ts
 * 
 * Este módulo transforma dados JSON do Figma em uma representação estruturada (AST)
 * que pode ser usada por ferramentas como Cursor e Windsurf para gerar código
 * com melhor contexto de design.
 */

interface FigmaNode {
  id: string;
  name: string;
  type: string;
  [key: string]: any;
}

interface DesignASTNode {
  type: string;
  name: string;
  id: string;
  properties: {
    [key: string]: any;
  };
  styles: {
    [key: string]: any;
  };
  vector?: {
    fillPaths?: any[];
    strokePaths?: any[];
    fillStyles?: any[];
    strokeStyles?: any[];
    strokeProperties?: any;
    paintStyles?: any[];
    windingRules?: string[];
    svgRepresentation?: string;
  };
  children?: DesignASTNode[];
  metadata?: {
    figmaId: string;
    figmaType: string;
    figmaPath?: string[];
    notes?: string;
  };
}

interface DesignAST {
  version: string;
  source: 'figma';
  name: string;
  rootNode: DesignASTNode;
  assets?: {
    images?: { [key: string]: string };
    colors?: { [key: string]: string };
    typography?: { [key: string]: any };
  };
  metadata: {
    generatedAt: string;
    figmaFileKey?: string;
    figmaFileName?: string;
  };
}

/**
 * Extrai informações de estilo de um nó Figma
 */
function extractStyles(node: FigmaNode): { [key: string]: any } {
  const styles: { [key: string]: any } = {};

  // Dimensões
  if (node.absoluteBoundingBox) {
    styles.width = Math.round(node.absoluteBoundingBox.width);
    styles.height = Math.round(node.absoluteBoundingBox.height);
  }

  // Posição
  if (node.absoluteBoundingBox) {
    styles.x = Math.round(node.absoluteBoundingBox.x);
    styles.y = Math.round(node.absoluteBoundingBox.y);
  }

  // Preenchimento (Background)
  if (node.fills && node.fills.length > 0) {
    const fill = node.fills[0];
    if (fill.type === 'SOLID' && fill.color) {
      styles.backgroundColor = {
        r: Math.round(fill.color.r * 255),
        g: Math.round(fill.color.g * 255),
        b: Math.round(fill.color.b * 255),
        a: fill.color.a || 1
      };
      
      // Formato hexadecimal para fácil referência
      const toHex = (n: number) => {
        const hex = Math.round(n).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
      };
      
      const r = toHex(styles.backgroundColor.r);
      const g = toHex(styles.backgroundColor.g);
      const b = toHex(styles.backgroundColor.b);
      const a = fill.color.a < 1 ? 
        toHex(Math.round(fill.color.a * 255)) : '';
      
      styles.backgroundColorHex = `#${r}${g}${b}${a}`;
    } else if (fill.type === 'GRADIENT_LINEAR' || fill.type === 'GRADIENT_RADIAL') {
      styles.backgroundGradient = {
        type: fill.type === 'GRADIENT_LINEAR' ? 'linear' : 'radial',
        stops: fill.gradientStops?.map((stop: any) => ({
          position: stop.position,
          color: {
            r: Math.round(stop.color.r * 255),
            g: Math.round(stop.color.g * 255),
            b: Math.round(stop.color.b * 255),
            a: stop.color.a || 1
          }
        }))
      };
    }
  }

  // Borda
  if (node.strokes && node.strokes.length > 0) {
    const stroke = node.strokes[0];
    styles.border = {
      width: node.strokeWeight || 1,
      style: node.strokeAlign || 'CENTER',
      color: stroke.color ? {
        r: Math.round(stroke.color.r * 255),
        g: Math.round(stroke.color.g * 255),
        b: Math.round(stroke.color.b * 255),
        a: stroke.color.a || 1
      } : undefined
    };
  }

  // Arredondamento de bordas
  if (node.cornerRadius) {
    styles.borderRadius = node.cornerRadius;
  }

  // Sombras
  if (node.effects && node.effects.length > 0) {
    styles.effects = node.effects.map((effect: any) => {
      if (effect.type === 'DROP_SHADOW' || effect.type === 'INNER_SHADOW') {
        return {
          type: effect.type === 'DROP_SHADOW' ? 'dropShadow' : 'innerShadow',
          color: effect.color ? {
            r: Math.round(effect.color.r * 255),
            g: Math.round(effect.color.g * 255),
            b: Math.round(effect.color.b * 255),
            a: effect.color.a || 1
          } : undefined,
          offset: effect.offset,
          radius: effect.radius,
          spread: effect.spread || 0
        };
      }
      return null;
    }).filter(Boolean);
  }

  // Opacidade
  if (node.opacity !== undefined) {
    styles.opacity = node.opacity;
  }

  // Texto (estilos específicos para nós de texto)
  if (node.type === 'TEXT' && node.style) {
    styles.typography = {
      fontFamily: node.style.fontFamily,
      fontSize: node.style.fontSize,
      fontWeight: node.style.fontWeight,
      lineHeight: node.style.lineHeightPx,
      letterSpacing: node.style.letterSpacing,
      textAlign: node.style.textAlignHorizontal,
      verticalAlign: node.style.textAlignVertical
    };
    
    if (node.fills && node.fills.length > 0 && node.fills[0].color) {
      styles.typography.color = {
        r: Math.round(node.fills[0].color.r * 255),
        g: Math.round(node.fills[0].color.g * 255),
        b: Math.round(node.fills[0].color.b * 255),
        a: node.fills[0].color.a || 1
      };
    }
  }

  // Layout
  if (node.layoutMode) {
    styles.layout = {
      mode: node.layoutMode, // 'HORIZONTAL' ou 'VERTICAL'
      primaryAxisAlignment: node.primaryAxisAlignItems,
      counterAxisAlignment: node.counterAxisAlignItems,
      padding: {
        top: node.paddingTop,
        right: node.paddingRight,
        bottom: node.paddingBottom,
        left: node.paddingLeft
      },
      itemSpacing: node.itemSpacing
    };
  }

  // Retorna apenas propriedades não vazias
  return Object.fromEntries(
    Object.entries(styles).filter(([_, v]) => v !== undefined)
  );
}

/**
 * Extrai propriedades de um nó Figma
 */
function extractProperties(node: FigmaNode): { [key: string]: any } {
  const properties: { [key: string]: any } = {};

  // Propriedades de texto
  if (node.type === 'TEXT') {
    properties.text = node.characters || '';
  }

  // Propriedades de componente
  if (node.componentId) {
    properties.isInstance = true;
    properties.componentId = node.componentId;
  }

  // Visibilidade
  if (node.visible !== undefined) {
    properties.visible = node.visible;
  }

  // Constraints (restrições de layout)
  if (node.constraints) {
    properties.constraints = node.constraints;
  }

  // Nome da camada como uma classe/id potencial
  const cleanName = node.name.replace(/[^a-zA-Z0-9_-]/g, '-').toLowerCase();
  if (cleanName !== node.name.toLowerCase()) {
    properties.suggestedClassName = cleanName;
  }

  // Atributos de acessibilidade
  if (node.accessible) {
    properties.accessibility = {
      role: node.accessibleRole,
      label: node.accessibleLabel,
      description: node.accessibleDescription
    };
  }

  return Object.fromEntries(
    Object.entries(properties).filter(([_, v]) => v !== undefined)
  );
}

/**
 * Extrai dados de geometria vetorial de um nó Figma
 */
function extractVectorData(node: FigmaNode): any {
  // Retorna null se o nó não tem dados de geometria ou não é um tipo relevante
  if (!node.fillGeometryPath && !node.strokeGeometryPath) {
    return null;
  }
  
  const vectorData: any = {};
  
  // Extrai caminhos de preenchimento
  if (node.fillGeometryPath && node.fillGeometryPath.length > 0) {
    vectorData.fillPaths = node.fillGeometryPath.map((path: { path: string; windingRule?: string }) => ({
      pathData: path.path,
      windingRule: path.windingRule || 'EVENODD'
    }));
  }
  
  // Extrai caminhos de contorno
  if (node.strokeGeometryPath && node.strokeGeometryPath.length > 0) {
    vectorData.strokePaths = node.strokeGeometryPath.map((path: { path: string; windingRule?: string }) => ({
      pathData: path.path,
      windingRule: path.windingRule || 'EVENODD'
    }));
  }
  
  // Extrai estilos de pintura relevantes
  if (node.fills && node.fills.length > 0) {
    vectorData.fillStyles = node.fills.map((fill: any) => {
      const baseStyle = {
        type: fill.type,
        visible: fill.visible !== false,
        opacity: fill.opacity !== undefined ? fill.opacity : 1
      };
      
      // Adiciona propriedades específicas para cada tipo de preenchimento
      if (fill.type === 'SOLID') {
        return {
          ...baseStyle,
          color: fill.color ? {
            r: Math.round(fill.color.r * 255),
            g: Math.round(fill.color.g * 255),
            b: Math.round(fill.color.b * 255),
            a: fill.color.a || 1
          } : undefined
        };
      } else if (fill.type === 'GRADIENT_LINEAR' || fill.type === 'GRADIENT_RADIAL' || fill.type === 'GRADIENT_ANGULAR') {
        return {
          ...baseStyle,
          gradientHandlePositions: fill.gradientHandlePositions,
          gradientStops: fill.gradientStops
        };
      } else {
        return baseStyle;
      }
    });
  }
  
  // Adiciona informações de stroke (contorno)
  if (node.strokes && node.strokes.length > 0) {
    vectorData.strokeStyles = node.strokes.map((stroke: any) => ({
      type: stroke.type,
      color: stroke.color ? {
        r: Math.round(stroke.color.r * 255),
        g: Math.round(stroke.color.g * 255),
        b: Math.round(stroke.color.b * 255),
        a: stroke.color.a || 1
      } : undefined,
      visible: stroke.visible !== false,
      opacity: stroke.opacity !== undefined ? stroke.opacity : 1
    }));
    
    vectorData.strokeProperties = {
      weight: node.strokeWeight,
      cap: node.strokeCap,
      join: node.strokeJoin,
      miterLimit: node.strokeMiterAngle,
      dashes: node.strokeDashes,
      strokeAlign: node.strokeAlign
    };
  }
  
  return Object.keys(vectorData).length > 0 ? vectorData : null;
}

/**
 * Converte um nó Figma em um nó AST de design
 */
function convertNodeToAst(
  node: FigmaNode, 
  parentPath: string[] = []
): DesignASTNode {
  // Gera um ID único para o nó AST
  const astId = `ast-${node.id.replace(':', '-')}`;
  
  // Caminho completo até o nó atual
  const currentPath = [...parentPath, node.name];
  
  // Extrai estilos e propriedades
  const styles = extractStyles(node);
  const properties = extractProperties(node);
  
  // Extrai dados de vetor, se disponíveis
  const vectorData = extractVectorData(node);
  
  // Constrói o nó AST
  const astNode: DesignASTNode = {
    type: node.type.toLowerCase(),
    name: node.name,
    id: astId,
    properties: properties,
    styles: styles,
    metadata: {
      figmaId: node.id,
      figmaType: node.type,
      figmaPath: currentPath
    }
  };
  
  // Adiciona dados vetoriais, se disponíveis
  if (vectorData) {
    astNode.vector = vectorData;
  }
  
  // Processar nós filhos, se existirem
  if (node.children && node.children.length > 0) {
    astNode.children = node.children.map((child: FigmaNode) => 
      convertNodeToAst(child, currentPath)
    );
  }

  return astNode;
}

/**
 * Gera uma representação AST completa a partir de um documento Figma
 */
export function convertFigmaToAst(figmaData: any, figmaFileKey?: string): DesignAST {
  // Identifica o nó raiz (geralmente document)
  const rootNode = figmaData.document || figmaData;
  
  // Criamos um nó AST raiz que representa o documento inteiro
  const documentAst: DesignASTNode = {
    type: 'document',
    name: figmaData.name || 'Figma Document',
    id: `ast-document-root`,
    properties: {
      schemaVersion: figmaData.schemaVersion,
      version: figmaData.version,
      lastModified: figmaData.lastModified
    },
    styles: {},
    metadata: {
      figmaId: rootNode.id || 'document-root',
      figmaType: 'DOCUMENT',
      figmaPath: [figmaData.name || 'Figma Document'],
    },
    // Convertemos todos os frames/artboards do documento, não apenas o primeiro
    children: rootNode.children ? 
      rootNode.children.map((child: FigmaNode) => convertNodeToAst(child, [figmaData.name || 'Figma Document'])) 
      : []
  };

  // Converte para o formato AST
  const designAst: DesignAST = {
    version: '1.0',
    source: 'figma',
    name: figmaData.name || 'Figma Design',
    rootNode: documentAst, // Usamos o nó raiz que representa o documento completo
    metadata: {
      generatedAt: new Date().toISOString(),
      figmaFileKey: figmaFileKey,
      figmaFileName: figmaData.name
    }
  };

  return designAst;
}

/**
 * Formata a AST para integração com ferramentas de desenvolvimento
 */
export function formatAstForIntegration(ast: DesignAST, target: 'cursor' | 'windsurf' | 'generic' = 'generic'): string {
  // Função auxiliar para converter dados vetoriais em SVG, se aplicável
  const enhanceAstWithSvgExports = (ast: DesignAST): DesignAST => {
    // Clone a AST para não modificar o original
    const enhancedAst = JSON.parse(JSON.stringify(ast));
    
    // Função recursiva para processar cada nó
    const processNode = (node: DesignASTNode): void => {
      // Se o nó tiver dados vetoriais, adiciona representação SVG
      if (node.vector && (node.vector.fillPaths || node.vector.strokePaths)) {
        try {
          // Exemplo simples de geração de SVG a partir dos dados do caminho
          // Em produção, seria necessário uma implementação mais robusta
          
          // Obtém dimensões para o viewBox
          const width = node.styles.width || 100;
          const height = node.styles.height || 100;
          
          let pathElements = '';
          
          // Adiciona caminhos de preenchimento
          if (node.vector.fillPaths) {
            node.vector.fillPaths.forEach((path, index) => {
              let fill = 'none';
              
              // Tenta obter o estilo de preenchimento, se disponível
              if (node.vector?.fillStyles && node.vector.fillStyles[index]) {
                fill = extractColorFromStyle(node.vector.fillStyles[index]);
              }
              
              pathElements += `<path d="${path.pathData}" fill="${fill}" fill-rule="${path.windingRule === 'EVENODD' ? 'evenodd' : 'nonzero'}" />`;
            });
          }
          
          // Adiciona caminhos de contorno
          if (node.vector.strokePaths) {
            node.vector.strokePaths.forEach((path, index) => {
              let stroke = 'black';
              let strokeWidth = 1;
              
              // Tenta obter o estilo de contorno, se disponível
              if (node.vector?.strokeStyles && node.vector.strokeStyles[index]) {
                stroke = extractColorFromStyle(node.vector.strokeStyles[index]);
              }
              
              if (node.vector?.strokeProperties?.weight) {
                strokeWidth = node.vector.strokeProperties.weight;
              }
              
              pathElements += `<path d="${path.pathData}" fill="none" stroke="${stroke}" stroke-width="${strokeWidth}" />`;
            });
          }
          
          // Cria o elemento SVG
          const svgContent = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
            ${pathElements}
          </svg>`;
          
          // Adiciona o SVG ao nó
          node.vector.svgRepresentation = svgContent;
        } catch (err) {
          console.error('Erro ao gerar SVG para nó:', node.id, err);
        }
      }
      
      // Processa recursivamente os filhos
      if (node.children) {
        node.children.forEach(processNode);
      }
    };
    
    // Função auxiliar para extrair cor como string para SVG
    const extractColorFromStyle = (style: any): string => {
      if (style && style.type === 'SOLID' && style.color) {
        const { r, g, b, a } = style.color;
        if (a < 1) {
          return `rgba(${r}, ${g}, ${b}, ${a})`;
        }
        return `rgb(${r}, ${g}, ${b})`;
      }
      return 'none';
    };
    
    // Processa a árvore começando pelo nó raiz
    processNode(enhancedAst.rootNode);
    
    return enhancedAst;
  };
  
  // Enriquece a AST com representações SVG para vetores, se aplicável
  const enhancedAst = enhanceAstWithSvgExports(ast);
  
  // Stringify da AST com formatação
  const baseOutput = JSON.stringify(enhancedAst, null, 2);
  
  // Personalizações específicas de formato para diferentes plataformas
  switch (target) {
    case 'cursor':
      // Adiciona metadados específicos para o Cursor
      return `// Cursor Design Context - Gerado pelo Pointer.design
/* 
 * Representação estruturada do design do Figma
 * Use esta estrutura para gerar código com contexto visual
 */
const designContext = ${baseOutput};
`;
    
    case 'windsurf':
      // Formato específico para o Windsurf (se necessário)
      return `// Windsurf Design Import - Gerado pelo Pointer.design
export const designSpec = ${baseOutput};
`;
      
    default:
      // Formato genérico
      return baseOutput;
  }
}

/**
 * Gera instruções para uso da AST em diferentes plataformas
 */
export function generateIntegrationInstructions(platform: string): string {
  switch (platform.toLowerCase()) {
    case 'cursor':
      return `
# Integração com Cursor

1. Copie o código AST gerado
2. No Cursor, crie um novo arquivo chamado 'design-context.js'
3. Cole o código AST

Este arquivo contém uma representação estruturada **completa** do seu design do Figma. Diferentemente de ferramentas que extraem apenas um componente específico, nossa AST preserva a hierarquia completa do documento, incluindo todos os frames, componentes e elementos.

## Como usar no desenvolvimento:

\`\`\`javascript
// Exemplo de uso ao implementar componentes:
// Referência ao design context para acessar qualquer parte do design
const header = designContext.rootNode.children.find(node => node.name === "Header");
const content = designContext.rootNode.children.find(node => node.name === "Content");
const footer = designContext.rootNode.children.find(node => node.name === "Footer");

// Acesse propriedades específicas e estilos
const headerHeight = header.styles.height;
const contentPadding = content.styles.layout?.padding;
\`\`\`

A estrutura acima fornece acesso a todos os elementos do design, não apenas a um componente isolado.
`;

    case 'windsurf':
      return `
# Integração com Windsurf

1. Exporte a AST no formato Windsurf
2. Importe o arquivo no seu projeto Windsurf:
   \`\`\`
   import { designSpec } from './design-spec.js';
   \`\`\`

O arquivo exportado contém uma representação **completa e estruturada** do seu design, preservando toda a hierarquia de elementos do Figma. Esta AST inclui todos os frames, componentes e elementos do documento original.

## Como acessar componentes específicos:

\`\`\`javascript
// Exemplos de acesso a componentes específicos:
const allFrames = designSpec.rootNode.children;
const header = allFrames.find(frame => frame.name === "Header");
const mainContent = allFrames.find(frame => frame.name === "Content");

// Gerar componentes a partir dos dados do design
windsurf.generateFromDesign(designSpec);
// Ou gerar um componente específico
windsurf.generateComponentFromNode(header);
\`\`\`
`;

    default:
      return `
# Representação Estruturada Completa do Design

Esta AST contém a representação completa e estruturada do seu design do Figma. 
Diferentemente de outras abordagens que extraem apenas componentes isolados, nossa representação preserva:

- A hierarquia completa do documento
- Todos os frames e artboards
- Todos os componentes e instâncias
- Elementos aninhados em qualquer nível de profundidade
- Propriedades e estilos de cada elemento

## Estrutura da AST:

\`\`\`
designAST
  ├── metadata - informações sobre o documento
  └── rootNode - o documento raiz
       ├── children[0] - primeiro frame/artboard (ex: "Header")
       ├── children[1] - segundo frame/artboard (ex: "Content") 
       └── children[n] - frames/artboards adicionais
\`\`\`

Cada nó contém propriedades (text, isInstance, etc.), estilos (width, height, colors, etc.) e informações de metadados que permitem mapear de volta para o Figma.
`;
  }
} 