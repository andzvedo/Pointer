/// <reference types="@figma/plugin-typings" />

/**
 * figmaToAst.ts - LOGIC MOVED HERE
 * 
 * Este módulo transforma dados JSON do Figma em uma representação estruturada (AST)
 * que pode ser usada por ferramentas como Cursor e Windsurf para gerar código
 * com melhor contexto de design.
 * 
 * NOTE: This code needs adaptation for the Figma Plugin API.
 */

// import { SceneNode, SolidPaint, GradientPaint, FontName } from '@figma/plugin-typings'; // REMOVENDO imports

// Interface para representar o NÓ que vem da API REST (precisará adaptar/substituir)
/*
interface FigmaNode {
  id: string;
  name: string;
  type: string;
  [key: string]: any; 
}
*/

// -------------- BEGIN MOVED CODE FROM figmaToAst.ts --------------

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
 * Extrai informações de estilo de um nó Figma (ADAPTADO PARA PLUGIN API)
 */
async function extractStyles(node: SceneNode): Promise<{ [key: string]: any }> { // Tipo SceneNode deve ser global
  const styles: { [key: string]: any } = {};

  // Dimensões (Plugin API)
  if (node.width !== undefined) styles.width = Math.round(node.width);
  if (node.height !== undefined) styles.height = Math.round(node.height);

  // Posição Relativa (Plugin API)
  if (node.x !== undefined) styles.x = Math.round(node.x);
  if (node.y !== undefined) styles.y = Math.round(node.y);
  // TODO: Considerar node.absoluteTransform para posição absoluta se necessário

  // Preenchimento (Background) (Adaptado para Plugin API)
  if ('fills' in node && node.fills !== figma.mixed && Array.isArray(node.fills) && node.fills.length > 0) {
    const fill = node.fills[0] as SolidPaint | GradientPaint; // Tipagem mais específica

    if (fill.type === 'SOLID') {
      styles.backgroundColor = {
        r: Math.round(fill.color.r * 255),
        g: Math.round(fill.color.g * 255),
        b: Math.round(fill.color.b * 255),
        a: fill.opacity ?? 1, // Usar fill.opacity se disponível, senão 1
      };

      const toHex = (n: number) => {
        const hex = Math.round(n).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
      };
      const r = toHex(styles.backgroundColor.r);
      const g = toHex(styles.backgroundColor.g);
      const b = toHex(styles.backgroundColor.b);
      const a = (styles.backgroundColor.a ?? 1) < 1 ? 
        toHex(Math.round((styles.backgroundColor.a ?? 1) * 255)) : '';
      styles.backgroundColorHex = `#${r}${g}${b}${a}`;

    } else if (fill.type === 'GRADIENT_LINEAR' || fill.type === 'GRADIENT_RADIAL' || fill.type === 'GRADIENT_ANGULAR' || fill.type === 'GRADIENT_DIAMOND') {
       // A estrutura de gradientStops é a mesma
       styles.backgroundGradient = {
        type: fill.type.replace('GRADIENT_', '').toLowerCase(),
        gradientTransform: fill.gradientTransform, 
        stops: fill.gradientStops.map((stop) => ({
          position: stop.position,
          color: {
            r: Math.round(stop.color.r * 255),
            g: Math.round(stop.color.g * 255),
            b: Math.round(stop.color.b * 255),
            a: stop.color.a ?? 1
          }
        }))
      };
    } // TODO: Handle IMAGE fills
  }

  // Borda (Adaptado para Plugin API)
  if ('strokes' in node && Array.isArray(node.strokes) && node.strokes.length > 0) { 
    if (node.strokeWeight !== figma.mixed && node.strokeWeight > 0) {
       const strokePaint = node.strokes[0] as SolidPaint; 
       styles.border = {
         width: node.strokeWeight,
         style: node.strokeAlign, // strokeAlign existe
         color: strokePaint.color ? {
           r: Math.round(strokePaint.color.r * 255),
           g: Math.round(strokePaint.color.g * 255),
           b: Math.round(strokePaint.color.b * 255),
           a: strokePaint.opacity ?? 1 // Usar opacidade da paint
         } : undefined,
         // Propriedades adicionais úteis da API:
         // cap: node.strokeCap,
         // join: node.strokeJoin,
         // dashes: node.strokeDashes,
       };
    }
  }

  // Arredondamento de bordas (Adaptado para Plugin API)
  if ('cornerRadius' in node && typeof node.cornerRadius === 'number') { 
    styles.borderRadius = node.cornerRadius;
  } else if ('topLeftRadius' in node) { // Se tem raios individuais
     styles.borderRadius = {
       topLeft: node.topLeftRadius,
       topRight: node.topRightRadius,
       bottomLeft: node.bottomLeftRadius,
       bottomRight: node.bottomRightRadius,
     }
  }

  // Sombras (Adaptado para Plugin API)
  if ('effects' in node && Array.isArray(node.effects) && node.effects.length > 0) { 
    styles.effects = node.effects.map((effect) => { // Removido tipo explícito Effect
      if ((effect.type === 'DROP_SHADOW' || effect.type === 'INNER_SHADOW') && effect.visible !== false) {
        return {
          type: effect.type === 'DROP_SHADOW' ? 'dropShadow' : 'innerShadow',
          color: effect.color ? {
            r: Math.round(effect.color.r * 255),
            g: Math.round(effect.color.g * 255),
            b: Math.round(effect.color.b * 255),
            a: effect.color.a ?? 1
          } : undefined,
          offset: effect.offset,
          radius: effect.radius,
          spread: effect.spread || 0
        };
      } // TODO: Handle LAYER_BLUR, BACKGROUND_BLUR
      return null;
    }).filter(Boolean);
  }

  // Opacidade (Adaptado para Plugin API)
  if ('opacity' in node && typeof node.opacity === 'number') { 
    styles.opacity = node.opacity;
  }

  // Texto (Adaptado para Plugin API)
  if (node.type === 'TEXT') {
    // Corrigindo verificações de figma.mixed para tipos específicos
    if (typeof node.fontName !== 'symbol') { 
       await figma.loadFontAsync(node.fontName as FontName);
       styles.typography = styles.typography || {};
       styles.typography.fontFamily = node.fontName.family;
    } else {
       // Se fontName for mixed, carregar fontes dos segmentos
       if (node.getStyledTextSegments && typeof node.getStyledTextSegments === 'function') {
          const segments = node.getStyledTextSegments(['fontName']);
          for (const segment of segments) {
              if (typeof segment.fontName !== 'symbol') { 
                 await figma.loadFontAsync(segment.fontName);
              }
          }
       }
    }
    
    styles.typography = styles.typography || {};
    if (typeof node.fontSize === 'number') styles.typography.fontSize = node.fontSize;
    if (typeof node.fontWeight === 'number') styles.typography.fontWeight = node.fontWeight; // fontWeight é number
    if (typeof node.lineHeight !== 'symbol') styles.typography.lineHeight = node.lineHeight;
    if (typeof node.letterSpacing !== 'symbol') styles.typography.letterSpacing = node.letterSpacing;
    if (typeof node.textAlignHorizontal !== 'symbol') styles.typography.textAlign = node.textAlignHorizontal;
    if (typeof node.textAlignVertical !== 'symbol') styles.typography.verticalAlign = node.textAlignVertical;
    if (typeof node.textCase !== 'symbol') styles.typography.textCase = node.textCase;
    if (typeof node.textDecoration !== 'symbol') styles.typography.textDecoration = node.textDecoration;
    
    // Cor do texto vem do fill
    if ('fills' in node && node.fills !== figma.mixed && Array.isArray(node.fills) && node.fills.length > 0) {
        const textFill = node.fills[0] as SolidPaint; // Assumindo Solid
         if (textFill.type === 'SOLID') {
            styles.typography.color = {
                r: Math.round(textFill.color.r * 255),
                g: Math.round(textFill.color.g * 255),
                b: Math.round(textFill.color.b * 255),
                a: textFill.opacity ?? 1
            };
         }
    }
  }

  // Layout (Auto Layout - Adaptado para Plugin API)
  if ('layoutMode' in node && node.layoutMode !== 'NONE') {
    styles.layout = {
      mode: node.layoutMode, // HORIZONTAL | VERTICAL
      primaryAxisAlignItems: node.primaryAxisAlignItems, // MIN | MAX | CENTER | SPACE_BETWEEN
      counterAxisAlignItems: node.counterAxisAlignItems, // MIN | MAX | CENTER | BASELINE
      padding: {
        top: node.paddingTop,
        right: node.paddingRight,
        bottom: node.paddingBottom,
        left: node.paddingLeft
      },
      itemSpacing: node.itemSpacing
      // Propriedades adicionais úteis:
      // primaryAxisSizingMode: node.primaryAxisSizingMode // FIXED | AUTO
      // counterAxisSizingMode: node.counterAxisSizingMode // FIXED | AUTO
    };
  }

  return Object.fromEntries(
    Object.entries(styles).filter(([_, v]) => v !== undefined && v !== null)
  );
}

/**
 * Extrai propriedades de um nó Figma (ADAPTADO PARA PLUGIN API)
 */
function extractProperties(node: SceneNode): { [key: string]: any } {
  const properties: { [key: string]: any } = {};

  // Propriedades de texto
  if (node.type === 'TEXT') {
    properties.text = node.characters;
  }

  // Propriedades de componente/instância
  if (node.type === 'INSTANCE') {
    properties.isInstance = true;
    if (node.mainComponent) { // Checagem extra de segurança
       properties.componentId = node.mainComponent.id;
       properties.componentName = node.mainComponent.name;
       // Adiciona propriedades do componente (variantes, etc.)
       properties.componentProperties = node.componentProperties;
    }
  } else if (node.type === 'COMPONENT') {
     properties.isComponent = true;
     properties.componentName = node.name; // Nome do próprio componente
     // Para ComponentSet, usar node.variantGroupProperties?
  } else if (node.type === 'COMPONENT_SET') {
     properties.isComponentSet = true;
     properties.componentSetName = node.name;
     properties.variantGroupProperties = node.variantGroupProperties;
  }

  // Visibilidade
  properties.visible = node.visible;

  // Constraints
  if ('constraints' in node) {
    properties.constraints = node.constraints;
  }

  // Nome da camada
  properties.suggestedClassName = node.name.replace(/[^a-zA-Z0-9_-]/g, '-').toLowerCase();

  // Descrição (Corrigindo verificação)
  if ('description' in node && node.description) { 
    properties.description = node.description;
  }

  // Outras propriedades comuns
  properties.locked = node.locked;
  if ('isMask' in node) {
      properties.isMask = node.isMask;
  }
  if ('exportSettings' in node) {
      properties.exportSettings = node.exportSettings;
  }

  return Object.fromEntries(
    Object.entries(properties).filter(([_, v]) => v !== undefined)
  );
}

/**
 * Extrai dados de geometria vetorial de um nó Figma (ADAPTADO PARA PLUGIN API)
 */
// Removendo lógica obsoleta e focando em vectorNetwork
function extractVectorData(node: SceneNode): any {
  // Somente processa nós vetoriais
  if (node.type !== 'VECTOR') {
    return null;
  }

  const vectorData: any = {
     // Armazenar a representação da rede vetorial crua
     // A conversão para SVG path data precisará ser feita posteriormente
     network: node.vectorNetwork || null, // Pega a rede vetorial
     vectorPaths: node.vectorPaths || null, // Pega paths SVG se existirem (menos comum)
     // Estilos são aplicados ao nó VectorNode diretamente
     fillStyles: [],
     strokeStyles: [],
     strokeProperties: null
  };

  // Reutilizar lógica de extração de estilos de preenchimento (adaptada de extractStyles)
  if (node.fills !== figma.mixed && Array.isArray(node.fills) && node.fills.length > 0) {
    vectorData.fillStyles = node.fills.map((fill: Paint) => {
      const baseStyle = {
        type: fill.type,
        visible: fill.visible !== false, // Default true
        opacity: ('opacity' in fill) ? fill.opacity : 1 // Default 1
      };
      if (fill.type === 'SOLID') {
        const solidFill = fill as SolidPaint;
        return {
          ...baseStyle,
          color: { 
             r: Math.round(solidFill.color.r * 255),
             g: Math.round(solidFill.color.g * 255),
             b: Math.round(solidFill.color.b * 255),
             a: baseStyle.opacity // Usa a opacidade do paint
          }
        };
      } else if (fill.type.startsWith('GRADIENT')) {
        const gradientFill = fill as GradientPaint;
        return {
          ...baseStyle,
          gradientTransform: gradientFill.gradientTransform,
          gradientStops: gradientFill.gradientStops.map(stop => ({ // Tipo inferido
            position: stop.position,
            color: { 
                r: Math.round(stop.color.r * 255),
                g: Math.round(stop.color.g * 255),
                b: Math.round(stop.color.b * 255),
                a: stop.color.a ?? 1 
            }
          }))
        };
      } // TODO: Handle IMAGE fills
      return baseStyle;
    });
  }

  // Reutilizar lógica de extração de estilos de contorno (adaptada de extractStyles)
  if (Array.isArray(node.strokes) && node.strokes.length > 0) {
     vectorData.strokeStyles = node.strokes.map((stroke: Paint) => {
        const baseStyle = {
          type: stroke.type,
          visible: stroke.visible !== false, 
          opacity: ('opacity' in stroke) ? stroke.opacity : 1
        };
         if (stroke.type === 'SOLID') {
           const solidStroke = stroke as SolidPaint;
            return {
                ...baseStyle,
                color: { 
                    r: Math.round(solidStroke.color.r * 255),
                    g: Math.round(solidStroke.color.g * 255),
                    b: Math.round(solidStroke.color.b * 255),
                    a: baseStyle.opacity 
                }
            };
         } // TODO: Handle GRADIENT/IMAGE strokes
         return baseStyle;
     });

     // Extrair propriedades do contorno
     if (node.strokeWeight !== figma.mixed) {
         vectorData.strokeProperties = {
             weight: node.strokeWeight,
             cap: node.strokeCap,
             join: node.strokeJoin,
             miterLimit: node.strokeMiterLimit,
             strokeAlign: node.strokeAlign
         };
     }
  }

  // Retorna dados se algo foi extraído (rede, paths ou estilos)
  return (vectorData.network || vectorData.vectorPaths || vectorData.fillStyles.length > 0 || vectorData.strokeStyles.length > 0) 
          ? vectorData 
          : null;
}

/**
 * Converte um nó Figma em um nó AST de design (ADAPTADO PARA PLUGIN API)
 */
async function convertNodeToAst(
  node: SceneNode, 
  parentPath: string[] = []
): Promise<DesignASTNode> { 
  
  const currentPath = [...parentPath, node.name];
  
  const styles = await extractStyles(node); 
  const properties = extractProperties(node); 
  const vectorData = extractVectorData(node); // Chamando a função adaptada (não é async)
  
  const astNode: DesignASTNode = {
    type: node.type.toLowerCase(), 
    name: node.name,
    id: node.id, 
    properties: properties,
    styles: styles,
    metadata: {
      figmaId: node.id,
      figmaType: node.type, 
      figmaPath: currentPath
    }
  };
  
  if (vectorData) {
    astNode.vector = vectorData; // Adiciona os dados vetoriais extraídos
  }
  
  // Adaptando processamento de filhos
  if ('children' in node) {
    const childrenPromises = node.children.map((child) => // child é SceneNode aqui
      convertNodeToAst(child, currentPath) // Chamada recursiva async
    );
    astNode.children = await Promise.all(childrenPromises);
  }

  return astNode;
}

// ----- LÓGICA PRINCIPAL DO PLUGIN -----

async function main() {
  figma.showUI(__html__, { width: 340, height: 480 }); 

  figma.ui.onmessage = async (msg) => {
    if (msg.type === 'processSelection') {
      console.log("Plugin: Processando seleção...");
      const selection = figma.currentPage.selection;

      if (selection.length === 0) {
        figma.notify("Selecione pelo menos um elemento.", { timeout: 2000 });
        // Envia uma mensagem de volta para limpar o status 'Processando...'
        figma.ui.postMessage({ type: 'astGenerated', payload: { status: 'Nenhum elemento selecionado.' } });
        return;
      }
      
      try {
        figma.notify(`Processando ${selection.length} elemento(s)...`, { timeout: 1000 });

        const processedNodes: DesignASTNode[] = [];
        // Usar for...of para chamadas async/await
        for (const node of selection) {
            try {
                const astNode = await convertNodeToAst(node, [figma.currentPage.name]); // Passa o nome da página como path inicial
                processedNodes.push(astNode);
            } catch (nodeError) {
                console.error(`Erro ao processar nó ${node.id} (${node.name}):`, nodeError);
                figma.notify(`Erro ao processar nó: ${node.name}. Ver console.`, { error: true });
                // Pode optar por pular nós com erro ou parar tudo
            }
        }

        // Criar a estrutura final da AST
        const finalAst: DesignAST = {
            version: '1.0',
            source: 'figma',
            name: figma.root.name, // Nome do arquivo Figma
            // Criar um nó raiz simulado para conter os nós processados
            rootNode: {
                type: 'selection-root',
                name: 'Processed Selection',
                id: 'selection-root-id',
                properties: { nodeCount: processedNodes.length },
                styles: {},
                children: processedNodes,
                metadata: {
                   figmaId: 'selection',
                   figmaType: 'SELECTION',
                   figmaPath: [figma.root.name, figma.currentPage.name, 'Selection']
                }
            },
            metadata: {
                generatedAt: new Date().toISOString(),
                figmaFileKey: figma.fileKey, // Disponível na API do plugin
                figmaFileName: figma.root.name
            }
        };
        
        console.log("Plugin: AST final gerada:", finalAst);
        // Enviar a AST final para a UI
        figma.ui.postMessage({ type: 'astGenerated', payload: finalAst });

      } catch (error) {
        console.error("Erro geral ao processar seleção:", error);
        figma.notify("Erro geral ao processar a seleção. Verifique o console.", { error: true });
        figma.ui.postMessage({ type: 'astGenerated', payload: { error: 'Erro no processamento.' } });
      }

    } else if (msg.type === 'getInitialData') {
      figma.ui.postMessage({ type: 'initialData', payload: { status: 'Plugin pronto' } });
    }
  };

  console.log("Plugin Core (code.ts) inicializado e pronto.");
}

main().catch(err => console.error(err));


// --- Funções de formatação (Manter? Mover para UI/Backend?) ---
// A geração de SVG, por exemplo, pode ser pesada para o core do plugin.
// Considerar fazer isso na UI ou no backend que recebe a AST.

/**
 * Formata a AST para integração com ferramentas de desenvolvimento
 */
function formatAstForIntegration(ast: DesignAST, target: 'cursor' | 'windsurf' | 'generic' = 'generic'): string { 
  // ... (código mantido por enquanto)
  const enhanceAstWithSvgExports = (ast: DesignAST): DesignAST => {
    const enhancedAst = JSON.parse(JSON.stringify(ast));
    const processNode = (node: DesignASTNode): void => {
      if (node.vector && (node.vector.fillPaths || node.vector.strokePaths)) {
        try {
          const width = node.styles.width || 100;
          const height = node.styles.height || 100;
          let pathElements = '';
          if (node.vector.fillPaths) {
            node.vector.fillPaths.forEach((path, index) => {
              let fill = 'none';
              if (node.vector?.fillStyles && node.vector.fillStyles[index]) {
                fill = extractColorFromStyle(node.vector.fillStyles[index]);
              }
              pathElements += `<path d="${path.pathData}" fill="${fill}" fill-rule="${path.windingRule === 'EVENODD' ? 'evenodd' : 'nonzero'}" />`;
            });
          }
          if (node.vector.strokePaths) {
            node.vector.strokePaths.forEach((path, index) => {
              let stroke = 'black';
              let strokeWidth = 1;
              if (node.vector?.strokeStyles && node.vector.strokeStyles[index]) {
                stroke = extractColorFromStyle(node.vector.strokeStyles[index]);
              }
              if (node.vector?.strokeProperties?.weight) {
                strokeWidth = node.vector.strokeProperties.weight;
              }
              pathElements += `<path d="${path.pathData}" fill="none" stroke="${stroke}" stroke-width="${strokeWidth}" />`;
            });
          }
          const svgContent = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">${pathElements}</svg>`;
          node.vector.svgRepresentation = svgContent;
        } catch (err) {
          console.error('Erro ao gerar SVG para nó:', node.id, err);
        }
      }
      if (node.children) {
        node.children.forEach(processNode);
      }
    };
    const extractColorFromStyle = (style: any): string => {
      if (style && style.type === 'SOLID' && style.color) {
        const { r, g, b, a } = style.color;
        const r255 = Math.round(r * 255);
        const g255 = Math.round(g * 255);
        const b255 = Math.round(b * 255);
        if ((a ?? 1) < 1) {
          return `rgba(${r255}, ${g255}, ${b255}, ${a ?? 1})`;
        }
        return `rgb(${r255}, ${g255}, ${b255})`;
      }
      return 'none';
    };
    processNode(enhancedAst.rootNode);
    return enhancedAst;
  };
  const enhancedAst = enhanceAstWithSvgExports(ast);
  const baseOutput = JSON.stringify(enhancedAst, null, 2);
  switch (target) {
    case 'cursor': return `// Cursor Design Context...
const designContext = ${baseOutput};
`;
    case 'windsurf': return `// Windsurf Design Import...
export const designSpec = ${baseOutput};
`;
    default: return baseOutput;
  }
}

/**
 * Gera instruções para uso da AST
 */
function generateIntegrationInstructions(platform: string): string {
  switch (platform.toLowerCase()) {
    case 'cursor': return `
# Integração com Cursor...`;
    case 'windsurf': return `
# Integração com Windsurf...`;
    default: return `
# Representação Estruturada...`;
  }
}

// -------------- END MOVED CODE --------------