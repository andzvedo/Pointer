import { FigmaNode, ExtractedDesignData } from '../types/figma';

// Simulação de dados do AST do Figma
const mockAstData = {
  // Dados simplificados baseados no design-ast.json
  type: "frame",
  name: "Version 1",
  id: "ast-root",
  children: [
    {
      type: "frame",
      name: "1",
      id: "ast-360-10360",
      properties: {
        constraints: {
          vertical: "TOP",
          horizontal: "LEFT"
        }
      },
      styles: {
        width: 1440,
        height: 812,
        backgroundColor: {
          r: 242,
          g: 242,
          b: 242,
          a: 1
        },
        backgroundColorHex: "#f2f2f2"
      },
      metadata: {
        figmaId: "360:10360",
        figmaType: "FRAME",
        figmaPath: ["Version 1", "1"]
      },
      children: [
        {
          type: "instance",
          name: "Figma URL Input",
          id: "ast-360-10361",
          properties: {
            isInstance: true,
            componentId: "360:10361",
            constraints: {
              vertical: "TOP",
              horizontal: "LEFT"
            }
          },
          styles: {
            width: 600,
            height: 48,
            backgroundColor: {
              r: 255,
              g: 255,
              b: 255,
              a: 1
            },
            backgroundColorHex: "#ffffff",
            border: {
              width: 1,
              style: "INSIDE",
              color: {
                r: 229,
                g: 229,
                b: 229,
                a: 1
              }
            },
            borderRadius: 8
          },
          metadata: {
            figmaId: "360:10361",
            figmaType: "INSTANCE",
            figmaPath: ["Version 1", "1", "Figma URL Input"]
          }
        }
      ]
    },
    // Outros frames (2, 3, 4, 5, 6) seriam incluídos aqui...
  ]
};

// Extrai tokens de design do AST
function extractDesignTokens(ast: any): ExtractedDesignData['tokens'] {
  const colors: Record<string, string> = {};
  const typography: Record<string, any> = {};
  const spacing: Record<string, number> = {};
  const borderRadius: Record<string, number> = {};

  // Função recursiva para percorrer a árvore AST
  function traverse(node: any) {
    // Extrair cores
    if (node.styles?.backgroundColorHex && !colors[node.styles.backgroundColorHex]) {
      colors[node.styles.backgroundColorHex] = node.styles.backgroundColorHex;
    }

    // Extrair tipografia
    if (node.styles?.typography) {
      const { fontFamily, fontSize, fontWeight, lineHeight } = node.styles.typography;
      const typographyKey = `${fontFamily}-${fontSize}-${fontWeight}`;
      
      if (!typography[typographyKey]) {
        typography[typographyKey] = {
          fontFamily,
          fontSize,
          fontWeight,
          lineHeight
        };
      }
    }

    // Extrair border radius
    if (node.styles?.borderRadius) {
      const radius = node.styles.borderRadius;
      borderRadius[`radius-${radius}`] = radius;
    }

    // Extrair espaçamentos de layout
    if (node.styles?.layout?.itemSpacing) {
      const itemSpacing = node.styles.layout.itemSpacing;
      spacing[`spacing-${itemSpacing}`] = itemSpacing;
    }

    if (node.styles?.layout?.padding) {
      const padding = node.styles.layout.padding;
      Object.entries(padding).forEach(([key, value]) => {
        if (value) {
          spacing[`padding-${key}-${value}`] = value as number;
        }
      });
    }

    // Percorrer filhos
    if (node.children && Array.isArray(node.children)) {
      node.children.forEach(traverse);
    }
  }

  traverse(ast);

  return {
    colors,
    typography,
    spacing,
    borderRadius
  };
}

// Extrai componentes do AST
function extractComponents(ast: any): Record<string, string> {
  const components: Record<string, string> = {};

  function traverse(node: any) {
    if (node.properties?.isInstance && node.properties?.componentId) {
      components[node.properties.componentId] = node.name;
    }

    if (node.children && Array.isArray(node.children)) {
      node.children.forEach(traverse);
    }
  }

  traverse(ast);

  return components;
}

// Processa a URL do Figma e retorna dados extraídos
export async function processFigmaUrl(url: string): Promise<ExtractedDesignData> {
  // Em um cenário real, você faria uma chamada à API do Figma aqui
  // usando o token de acesso e o ID do arquivo extraído da URL
  
  // Simulando um atraso de rede
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Extrair dados do AST mockado
  const tokens = extractDesignTokens(mockAstData);
  const components = extractComponents(mockAstData);
  
  return {
    nodes: [mockAstData as FigmaNode],
    components,
    styles: {}, // Em um cenário real, extrairíamos estilos da API do Figma
    tokens
  };
}

// Função para extrair o ID do arquivo e o ID do nó de uma URL do Figma
export function extractFigmaIds(url: string): { fileId: string; nodeId?: string } {
  // Exemplo de URL: https://www.figma.com/file/abcdef123456/FileName?node-id=123%3A456
  const fileIdMatch = url.match(/figma\.com\/(file|design)\/([a-zA-Z0-9]+)/);
  const nodeIdMatch = url.match(/node-id=([^&]+)/);
  
  return {
    fileId: fileIdMatch ? fileIdMatch[2] : '',
    nodeId: nodeIdMatch ? nodeIdMatch[1] : undefined
  };
}
