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
  prototyping?: {
    interactions?: any[];
    reactions?: any[];
    destination?: string;
    preserveScrollPosition?: boolean;
    transitionType?: string;
    transitionDuration?: number;
    transitionEasing?: string;
  };
  variantProperties?: {
    [key: string]: string;
  };
  sharedStyles?: {
    fills?: string;
    strokes?: string; 
    effects?: string;
    grid?: string;
    typography?: string;
  };
  children?: DesignASTNode[];
  metadata?: {
    figmaId: string;
    figmaType: string;
    figmaPath?: string[];
    notes?: string;
    hasIssues?: boolean; // Indica se o nó tem problemas de processamento
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
    problematicNodes?: {id: string, name: string, reason: string}[];
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
 * Função para diagnóstico detalhado de componentes com problemas
 */
function diagnoseComponentIssue(node: SceneNode, reason: string): string {
  let detailedReport = '';

  try {
    // Construir caminho completo até o nó
    let nodePath = '';
    try {
      // Usar uma função recursiva auxiliar para construir o caminho com segurança
      function buildPath(currentNode: BaseNodeMixin): string[] {
        const path: string[] = [];
        if (currentNode && 'name' in currentNode && typeof currentNode.name === 'string') {
          path.push(currentNode.name);
        } else {
          path.push('[Nó sem nome]');
        }
        
        // Acessar pai de forma segura, verificando se existe e tem a propriedade 'parent'
        if (currentNode && 'parent' in currentNode && currentNode.parent) {
          const parent = currentNode.parent;
          // Garantir que o pai seja um BaseNodeMixin (ancestral comum)
          if (parent && 'id' in parent && 'type' in parent) { 
            path.unshift(...buildPath(parent as BaseNodeMixin));
          }
        }
        return path;
      }
      
      // Iniciar a construção do caminho a partir do nó atual
      const pathParts = buildPath(node);
      nodePath = pathParts.join(' → ');
      
    } catch (error) {
      nodePath = `[Erro ao obter caminho: ${error instanceof Error ? error.message : 'desconhecido'}]`;
    }

    // Coletar informações detalhadas sobre o componente
    let componentInfo = '';
    if (node.type === 'INSTANCE') {
      const mainComponent = node.mainComponent;
      if (mainComponent) {
        componentInfo = `
Componente principal: "${mainComponent.name}" (ID: ${mainComponent.id})`;
        
        // Verificar se está em um component set
        if (mainComponent.parent && mainComponent.parent.type === 'COMPONENT_SET') {
          const parentInfo = {
            id: mainComponent.parent.id,
            type: mainComponent.parent.type,
            // Como há problemas de tipagem com 'name', acessamos de forma segura
            name: 'name' in mainComponent.parent ? (mainComponent.parent as any).name || 'Sem nome' : 'Sem nome'
          };
          
          componentInfo += `
Component Set: "${parentInfo.name}" (ID: ${parentInfo.id})`;
          
          // Verificar se o component set tem erros
          if ('hasErrors' in mainComponent.parent && mainComponent.parent.hasErrors === true) {
            componentInfo += `
⚠️ Este Component Set tem erros internos`;
          }
          
          // Tentar listar variantes
          try {
            if ('variantGroupProperties' in mainComponent.parent) {
              const variants = (mainComponent.parent as any).variantGroupProperties;
              if (variants) {
                componentInfo += `
Propriedades do grupo de variantes: ${JSON.stringify(variants)}`;
              }
            }
          } catch (e) {
            componentInfo += `
[Erro ao inspecionar variantes: ${e instanceof Error ? e.message : 'desconhecido'}]`;
          }
        }
      }
    }
    
    // Montar relatório completo
    detailedReport = `
=============================================
DIAGNÓSTICO DETALHADO DE COMPONENTE COM PROBLEMA
=============================================
Nó: "${node.name}" (ID: ${node.id})
Tipo: ${node.type}
Caminho: ${nodePath}
Problema: ${reason}
${componentInfo}
=============================================
`;

    // Exibir notificação específica no Figma
    figma.notify(`⚠️ Problema identificado em "${node.name}". Ver console para detalhes completos.`, {timeout: 8000});
    
    // Destacar o nó na interface (se possível)
    try {
      figma.currentPage.selection = [node];
      figma.viewport.scrollAndZoomIntoView([node]);
    } catch (e) {
      console.warn("Não foi possível selecionar o nó problemático:", e);
    }
    
    return detailedReport;
    
  } catch (error) {
    // Fallback se algo der errado no diagnóstico
    return `Erro ao diagnosticar componente: ${error instanceof Error ? error.message : 'desconhecido'}`;
  }
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
    
    try {
      // Método robusto para evitar erros com componentes com problemas
      // Primeiro, salvamos o ID do componente principal (mais seguro)
      if (node.mainComponent) { 
        properties.componentId = node.mainComponent.id;
        properties.componentName = node.mainComponent.name;
      }
      
      // Vamos extrair qualquer outra informação segura que não dependa de componentProperties
      if ('parent' in node && node.parent) {
        properties.parentNodeId = node.parent.id;
        properties.parentNodeType = node.parent.type;
      }
      
      // Verificação de caminhos alternativos para obter informações de variante
      const componentName = node.mainComponent?.name || '';
      if (componentName.includes('=')) {
        // Extrair variantes do nome usando uma abordagem baseada em string
        try {
          const variantMap: { [key: string]: string } = {};
          const variantParts = componentName.split(', ');
          
          for (const part of variantParts) {
            const [key, value] = part.split('=');
            if (key && value) {
              variantMap[key.trim()] = value.trim();
            }
          }
          
          if (Object.keys(variantMap).length > 0) {
            properties.variantsByName = variantMap;
          }
        } catch (nameError) {
          console.warn(`Aviso: Não foi possível extrair variantes do nome para o nó ${node.id}`, nameError);
        }
      }
      
      // BLOCO CRÍTICO: Acesso a componentProperties - separado em um bloco try/catch isolado
      try {
        // Verificar possíveis sinais de problemas no component set antes de tentar acessar
        let skipComponentProperties = false;
        let skipReason = '';
        
        // Verificar se o mainComponent existe e pode ser acessado
        if (!node.mainComponent) {
          skipComponentProperties = true;
          skipReason = 'main_component_missing';
        } 
        // Verificar parent (component set) com erros
        else if (node.mainComponent.parent && 
            node.mainComponent.parent.type === 'COMPONENT_SET' && 
            'hasErrors' in node.mainComponent.parent && 
            node.mainComponent.parent.hasErrors === true) {
          skipComponentProperties = true;
          skipReason = 'component_set_has_errors';
          
          // DIAGNÓSTICO DETALHADO: Gerar relatório completo do problema
          const detailedReport = diagnoseComponentIssue(node, 'Component set com erros internos');
          console.error(detailedReport);
          
          // Armazenar informações de diagnóstico nas propriedades para referência
          properties.detailedDiagnosis = {
            componentSetId: node.mainComponent.parent.id,
            componentSetName: node.mainComponent.parent.name,
            mainComponentId: node.mainComponent.id,
            mainComponentName: node.mainComponent.name
          };
        }
        // Verificar o próprio componente principal com erros
        else if ('hasErrors' in node.mainComponent && node.mainComponent.hasErrors === true) {
          skipComponentProperties = true;
          skipReason = 'main_component_has_errors';
          
          // DIAGNÓSTICO DETALHADO do componente principal
          const detailedReport = diagnoseComponentIssue(node, 'Componente principal com erros internos');
          console.error(detailedReport);
        }
        
        // Se não detectarmos problemas, tentamos acessar componentProperties com cuidado
        if (!skipComponentProperties) {
          // Verificação adicional com try/catch para pegar qualquer erro não detectado
          try {
            properties.componentProperties = node.componentProperties;
          } catch (propAccessError) {
            console.warn(`Não foi possível acessar componentProperties para ${node.id} (${node.name}):`, propAccessError);
            properties.componentPropertiesError = true;
            properties.errorReason = propAccessError instanceof Error ? propAccessError.message : 'Acesso negado';
            
            // Gerar diagnóstico detalhado também para erros não detectados previamente
            const detailedReport = diagnoseComponentIssue(
              node, 
              `Erro ao acessar componentProperties: ${properties.errorReason}`
            );
            console.error(detailedReport);
          }
        } else {
          // Registramos o motivo de evitar o acesso
          properties.componentPropertiesSkipped = true;
          properties.skipReason = skipReason;
          console.warn(`Acesso a componentProperties evitado para ${node.id} (${node.name}). Motivo: ${skipReason}`);
        }
      } catch (criticalError) {
        // Capturar quaisquer erros não esperados
        console.error(`Erro crítico ao processar componentProperties do nó ${node.id} (${node.name}):`, criticalError);
        properties.criticalError = true;
        properties.errorReason = criticalError instanceof Error ? criticalError.message : 'Erro desconhecido';
      }
      
    } catch (e) {
      // Verificando o tipo do erro antes de acessar a mensagem
      let errorMessage = 'Erro desconhecido ao verificar estado do componente';
      if (e instanceof Error) {
        errorMessage = e.message;
      }
      console.warn(`Aviso: Não foi possível verificar o estado do componente para o nó ${node.id} (${node.name}). Erro: ${errorMessage}`);
      properties.componentPropertiesError = true;
      properties.errorReason = errorMessage; 
    }
  } else if (node.type === 'COMPONENT') {
    properties.isComponent = true;
    properties.componentName = node.name; // Nome do próprio componente
    
    // Verificar se o componente tem erros conhecidos
    if ('hasErrors' in node && node.hasErrors === true) {
      properties.hasErrors = true;
      console.warn(`Aviso: O componente ${node.id} (${node.name}) tem erros conhecidos`);
      
      // Diagnóstico detalhado para o componente com problemas
      const detailedReport = diagnoseComponentIssue(node, 'Componente com erros internos');
      console.error(detailedReport);
    }
  } else if (node.type === 'COMPONENT_SET') {
    properties.isComponentSet = true;
    properties.componentSetName = node.name;
    
    // Verificar se o component set tem erros conhecidos
    if ('hasErrors' in node && node.hasErrors === true) {
      properties.hasErrors = true;
      console.warn(`Aviso: O component set ${node.id} (${node.name}) tem erros conhecidos`);
      
      // Diagnóstico detalhado para o component set
      const detailedReport = diagnoseComponentIssue(node, 'Component set com erros internos');
      console.error(detailedReport);
      
      figma.notify(`⚠️ Component set problemático identificado: "${node.name}". Para corrigir, recrie este component set.`, {timeout: 8000});
    }
    
    try {
      properties.variantGroupProperties = node.variantGroupProperties;
    } catch (e) {
      let errorMessage = 'Erro desconhecido ao acessar variantGroupProperties';
      if (e instanceof Error) {
        errorMessage = e.message;
      }
      console.warn(`Aviso: Não foi possível acessar variantGroupProperties para o component set ${node.id} (${node.name}). Erro: ${errorMessage}`);
      properties.variantGroupPropertiesError = true;
    }
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
 * Extrai informações de prototipagem de um nó Figma
 */
function extractPrototypingData(node: SceneNode): { [key: string]: any } | null {
  // Só extrair se o nó tiver informações de prototipagem
  if (!('reactions' in node) || !node.reactions || node.reactions.length === 0) {
    return null;
  }

  try {
    const prototypingData: any = {
      interactions: []
    };

    // Iterar reações para capturar interações
    if (Array.isArray(node.reactions)) {
      for (const reaction of node.reactions) {
        // Validar a reação antes de processá-la
        if (!reaction.action) continue;
        
        const interaction: any = {
          trigger: reaction.trigger?.type || 'UNKNOWN',
          action: reaction.action.type
        };

        // Extrair informações específicas dependendo do tipo de ação
        if (reaction.action.type === 'NAVIGATE') {
          // Se for navegação para outra tela
          if (reaction.action.destination) {
            const destinationNode = reaction.action.destinationId 
              ? figma.getNodeById(reaction.action.destinationId) 
              : null;
              
            interaction.destination = {
              id: reaction.action.destinationId || 'UNKNOWN',
              name: destinationNode?.name || 'Unknown Destination'
            };
            
            // Extrair configurações de transição
            if (reaction.action.navigation) {
              interaction.transitionType = reaction.action.navigation.navigationType || 'INSTANT';
              interaction.transitionEasing = reaction.action.navigation.easingType || 'EASE_OUT';
              interaction.transitionDuration = reaction.action.navigation.duration || 0;
              interaction.preserveScrollPosition = !!reaction.action.navigation.preserveScrollPosition;
            }
          }
        } else if (reaction.action.type === 'URL') {
          // Se for abrir URL
          interaction.url = reaction.action.url || '';
        } else if (reaction.action.type === 'OPEN_NODE') {
          // Se for abrir componente ou tela
          interaction.nodeID = reaction.action.nodeID || '';
          interaction.nodeType = reaction.action.nodeType || '';
        } else if (reaction.action.type === 'OVERLAY') {
          // Se for overlay
          interaction.overlayNodeId = reaction.action.overlayNodeId || '';
          interaction.overlayRelativePosition = reaction.action.overlayRelativePosition || '';
        }

        prototypingData.interactions.push(interaction);
      }
    }

    // Somente retornar se tiver alguma interação válida
    return prototypingData.interactions.length > 0 ? prototypingData : null;
  } catch (error) {
    console.error(`Erro ao extrair dados de prototipagem do nó ${node.id} (${node.name}):`, error);
    return null;
  }
}

/**
 * Extrai informações de variantes para componentes e instâncias
 */
function extractVariantData(node: SceneNode): { [key: string]: string } | null {
  if (node.type !== 'COMPONENT' && node.type !== 'INSTANCE') {
    return null;
  }

  try {
    // Para componentes, obtemos propriedades de variante diretamente
    if (node.type === 'COMPONENT') {
      const variantProperties = 'componentPropertyDefinitions' in node ? 
          node.componentPropertyDefinitions : null;
      
      if (!variantProperties) {
        // Tentar extrair de outro modo para componentes em component sets
        if ('parent' in node && node.parent?.type === 'COMPONENT_SET') {
          // Verificar se está em um component set e extrair propriedades
          const componentSet = node.parent;
          if ('variantGroupProperties' in componentSet) {
            // Tentativa de recuperar variantes do component set
            const setVariants = componentSet.variantGroupProperties;
            
            // Tentar combinar com o nome do componente para detectar suas variantes
            if (setVariants && node.name.includes('=')) {
              const variantMap: { [key: string]: string } = {};
              const variantParts = node.name.split(', ');
              
              for (const part of variantParts) {
                const [key, value] = part.split('=');
                if (key && value) {
                  variantMap[key.trim()] = value.trim();
                }
              }
              
              if (Object.keys(variantMap).length > 0) {
                return variantMap;
              }
            }
          }
        }
        return null;
      }
      
      // Converter as definições de propriedades para um formato mais simples
      const result: { [key: string]: string } = {};
      for (const [key, def] of Object.entries(variantProperties)) {
        if (def.type === 'VARIANT') {
          result[key] = def.defaultValue as string || '';
        }
      }
      
      return Object.keys(result).length > 0 ? result : null;
    }
    
    // Para instâncias, obtemos os valores atuais de variante
    if (node.type === 'INSTANCE' && 'componentProperties' in node) {
      try {
        const properties = node.componentProperties;
        if (!properties) return null;
        
        const result: { [key: string]: string } = {};
        for (const [key, prop] of Object.entries(properties)) {
          if (prop.type === 'VARIANT') {
            result[key] = prop.value as string || '';
          }
        }
        
        return Object.keys(result).length > 0 ? result : null;
      } catch (error) {
        console.warn(`Não foi possível extrair propriedades de variante da instância ${node.id}:`, error);
        return null;
      }
    }
    
    return null;
  } catch (error) {
    console.error(`Erro ao extrair dados de variante do nó ${node.id} (${node.name}):`, error);
    return null;
  }
}

/**
 * Extrai informações de estilos compartilhados aplicados a um nó
 */
function extractSharedStyles(node: SceneNode): { [key: string]: string } | null {
  const sharedStyles: { [key: string]: string } = {};
  
  try {
    // Estilos de preenchimento
    if ('fillStyleId' in node) {
      // Use uma abordagem mais segura para verificar se é um valor válido
      const styleId = node.fillStyleId;
      if (styleId && typeof styleId === 'string') {
        sharedStyles.fills = styleId;
        
        // Tentar obter informações adicionais do estilo pelo ID
        try {
          const style = figma.getStyleById(styleId);
          if (style) {
            sharedStyles.fillsName = style.name;
          }
        } catch (e) {
          // Silenciar erro se o estilo não puder ser encontrado
        }
      }
    }
    
    // Estilos de contorno
    if ('strokeStyleId' in node) {
      const styleId = node.strokeStyleId;
      if (styleId && typeof styleId === 'string') {
        sharedStyles.strokes = styleId;
        
        try {
          const style = figma.getStyleById(styleId);
          if (style) {
            sharedStyles.strokesName = style.name;
          }
        } catch (e) {
          // Silenciar erro se o estilo não puder ser encontrado
        }
      }
    }
    
    // Estilos de efeito
    if ('effectStyleId' in node) {
      const styleId = node.effectStyleId;
      if (styleId && typeof styleId === 'string') {
        sharedStyles.effects = styleId;
        
        try {
          const style = figma.getStyleById(styleId);
          if (style) {
            sharedStyles.effectsName = style.name;
          }
        } catch (e) {
          // Silenciar erro se o estilo não puder ser encontrado
        }
      }
    }
    
    // Estilos de grid
    if ('gridStyleId' in node) {
      const styleId = node.gridStyleId;
      if (styleId && typeof styleId === 'string') {
        sharedStyles.grid = styleId;
        
        try {
          const style = figma.getStyleById(styleId);
          if (style) {
            sharedStyles.gridName = style.name;
          }
        } catch (e) {
          // Silenciar erro se o estilo não puder ser encontrado
        }
      }
    }
    
    // Estilos de texto
    if (node.type === 'TEXT' && 'textStyleId' in node) {
      const styleId = node.textStyleId;
      if (styleId && typeof styleId === 'string') {
        sharedStyles.typography = styleId;
        
        try {
          const style = figma.getStyleById(styleId);
          if (style) {
            sharedStyles.typographyName = style.name;
          }
        } catch (e) {
          // Silenciar erro se o estilo não puder ser encontrado
        }
      }
    }
    
    return Object.keys(sharedStyles).length > 0 ? sharedStyles : null;
    
  } catch (error) {
    console.error(`Erro ao extrair estilos compartilhados do nó ${node.id} (${node.name}):`, error);
    return null;
  }
}

/**
 * Converte um nó Figma em um nó AST de design (ADAPTADO PARA PLUGIN API)
 */
async function convertNodeToAst(
  node: SceneNode, 
  parentPath: string[] = []
): Promise<DesignASTNode> { 
  
  const currentPath = [...parentPath, node.name];
  
  // Criando uma estrutura básica com informações mínimas
  // para garantir que algo seja retornado mesmo em caso de erro
  const baseNode: DesignASTNode = {
    type: node.type.toLowerCase(), 
    name: node.name,
    id: node.id, 
    properties: {},
    styles: {},
    metadata: {
      figmaId: node.id,
      figmaType: node.type, 
      figmaPath: currentPath,
      notes: '', // Inicializa notes vazio para evitar erros de undefined
      hasIssues: false
    }
  };
  
  try {
    // Assegurando que metadata existe
    if (!baseNode.metadata) {
      baseNode.metadata = {
        figmaId: node.id,
        figmaType: node.type,
        figmaPath: currentPath,
        notes: '',
        hasIssues: false
      };
    }

    // Detectando nós especiais que podem causar problemas
    let hasNodeSpecificIssues = false;
    
    // Verificar nós com problemas conhecidos que precisam de tratamento especial
    if ('hasErrors' in node && node.hasErrors === true) {
      hasNodeSpecificIssues = true;
      if (baseNode.metadata) {
        baseNode.metadata.notes += `⚠️ O nó tem erros conhecidos pela API do Figma. Alguns dados podem estar incompletos.\n`;
        baseNode.metadata.hasIssues = true;
      }
      // Continua processando, mas com um aviso de que podem haver problemas
    }

    // Extraindo informações com tratamento de erro para cada etapa
    let extractedStyles = {};
    try {
      extractedStyles = await extractStyles(node);
    } catch (styleError) {
      const errorMessage = styleError instanceof Error ? styleError.message : 'Erro desconhecido';
      console.error(`Erro ao extrair estilos do nó ${node.id} (${node.name}):`, styleError);
      if (baseNode.metadata) {
        baseNode.metadata.notes += `Erro ao extrair estilos: ${errorMessage}\n`;
        baseNode.metadata.hasIssues = true;
      }
      
      // Notificar usuário sobre erros graves de estilos em nós importantes
      // Limitar notificações para não sobrecarregar a interface
      if (node.type === 'FRAME' || node.type === 'COMPONENT' || node.type === 'COMPONENT_SET') {
        figma.notify(`⚠️ Erro ao extrair estilos de "${node.name}": ${errorMessage.substring(0, 50)}`, {timeout: 3000});
      }
    }
    
    let extractedProperties = {};
    try {
      extractedProperties = extractProperties(node);
    } catch (propError) {
      const errorMessage = propError instanceof Error ? propError.message : 'Erro desconhecido';
      console.error(`Erro ao extrair propriedades do nó ${node.id} (${node.name}):`, propError);
      if (baseNode.metadata) {
        baseNode.metadata.notes += `Erro ao extrair propriedades: ${errorMessage}\n`;
        baseNode.metadata.hasIssues = true;
      }
    }
    
    let extractedVectorData = null;
    try {
      extractedVectorData = extractVectorData(node);
    } catch (vectorError) {
      const errorMessage = vectorError instanceof Error ? vectorError.message : 'Erro desconhecido';
      console.error(`Erro ao extrair dados vetoriais do nó ${node.id} (${node.name}):`, vectorError);
      if (baseNode.metadata) {
        baseNode.metadata.notes += `Erro ao extrair dados vetoriais: ${errorMessage}\n`;
        baseNode.metadata.hasIssues = true;
      }
    }
    
    // NOVO: Extrair dados de prototipagem
    let extractedPrototypingData = null;
    try {
      extractedPrototypingData = extractPrototypingData(node);
    } catch (protoError) {
      const errorMessage = protoError instanceof Error ? protoError.message : 'Erro desconhecido';
      console.error(`Erro ao extrair dados de prototipagem do nó ${node.id} (${node.name}):`, protoError);
      if (baseNode.metadata) {
        baseNode.metadata.notes += `Erro ao extrair dados de prototipagem: ${errorMessage}\n`;
        baseNode.metadata.hasIssues = true;
      }
    }
    
    // NOVO: Extrair dados de variantes
    let extractedVariantData = null;
    try {
      extractedVariantData = extractVariantData(node);
    } catch (variantError) {
      const errorMessage = variantError instanceof Error ? variantError.message : 'Erro desconhecido';
      console.error(`Erro ao extrair dados de variante do nó ${node.id} (${node.name}):`, variantError);
      if (baseNode.metadata) {
        baseNode.metadata.notes += `Erro ao extrair dados de variante: ${errorMessage}\n`;
        baseNode.metadata.hasIssues = true;
      }
    }
    
    // NOVO: Extrair estilos compartilhados
    let extractedSharedStyles = null;
    try {
      extractedSharedStyles = extractSharedStyles(node);
    } catch (styleError) {
      const errorMessage = styleError instanceof Error ? styleError.message : 'Erro desconhecido';
      console.error(`Erro ao extrair estilos compartilhados do nó ${node.id} (${node.name}):`, styleError);
      if (baseNode.metadata) {
        baseNode.metadata.notes += `Erro ao extrair estilos compartilhados: ${errorMessage}\n`;
        baseNode.metadata.hasIssues = true;
      }
    }
    
    // Atualiza o nó base com as informações extraídas
    baseNode.styles = extractedStyles;
    baseNode.properties = extractedProperties;
    if (extractedVectorData) {
      baseNode.vector = extractedVectorData;
    }
    
    // NOVO: Adicionar dados de prototipagem, variantes e estilos compartilhados
    if (extractedPrototypingData) {
      baseNode.prototyping = extractedPrototypingData;
    }
    
    if (extractedVariantData) {
      baseNode.variantProperties = extractedVariantData;
    }
    
    if (extractedSharedStyles) {
      baseNode.sharedStyles = extractedSharedStyles;
    }
    
    // Tratamento especial para carregamento assíncrono de filhos
    // Processar filhos com segurança e maior robustez
    if ('children' in node) {
      try {
        // Array para armazenar promessas dos nós filhos
        const childPromises: Promise<DesignASTNode>[] = [];
        
        // Limite seguro para evitar processamento excessivo
        const MAX_CHILDREN = 100;
        const childCount = node.children.length;
        
        // Aviso sobre número excessivo de filhos
        if (childCount > MAX_CHILDREN) {
          const message = `⚠️ O nó "${node.name}" tem ${childCount} filhos, limitando processamento aos primeiros ${MAX_CHILDREN} para desempenho.`;
          console.warn(message);
          figma.notify(message, {timeout: 3000});
          if (baseNode.metadata) {
            baseNode.metadata.notes += `${message}\n`;
            baseNode.metadata.hasIssues = true;
          }
        }
        
        // Processar filhos com limite
        const childrenToProcess = node.children.slice(0, MAX_CHILDREN);
        
        // Processar cada filho com tratamento de erro individual
        for (const child of childrenToProcess) {
          const childPromise = convertNodeToAst(child, currentPath)
            .catch(err => {
              console.error(`Erro ao processar filho ${child.id} (${child.name}):`, err);
              // Retorna um nó mínimo com informação de erro para não quebrar o fluxo
              return {
                type: child.type.toLowerCase(),
                name: child.name,
                id: child.id,
                properties: {},
                styles: {},
                metadata: {
                  figmaId: child.id,
                  figmaType: child.type,
                  figmaPath: [...currentPath, child.name],
                  notes: `Erro ao processar: ${err instanceof Error ? err.message : 'Erro desconhecido'}`,
                  hasIssues: true
                }
              } as DesignASTNode;
            });
          
          childPromises.push(childPromise);
        }
        
        // Aguardar processamento de todos os filhos
        baseNode.children = await Promise.all(childPromises);
        
        // Se limitamos o número de filhos, adicionar essa informação
        if (childCount > MAX_CHILDREN) {
          baseNode.properties.totalChildrenCount = childCount;
          baseNode.properties.processedChildrenCount = MAX_CHILDREN;
          baseNode.properties.truncatedForPerformance = true;
        }
        
      } catch (childrenError) {
        const errorMessage = childrenError instanceof Error ? childrenError.message : 'Erro desconhecido';
        console.error(`Erro ao processar filhos do nó ${node.id} (${node.name}):`, childrenError);
        if (baseNode.metadata) {
          baseNode.metadata.notes += `Erro ao processar filhos: ${errorMessage}\n`;
          baseNode.metadata.hasIssues = true;
        }
        baseNode.children = []; // Garante que children existe mesmo se vazio
      }
    }
    
    // Verificar se há informações relevantes no metadata.notes para sinalizar problemas
    if (baseNode.metadata?.notes && baseNode.metadata.notes.trim().length > 0) {
      baseNode.metadata.hasIssues = true;
    }
    
    return baseNode;
    
  } catch (generalError) {
    // Se qualquer outro erro ocorrer, log e retorna o nó base
    const errorMessage = generalError instanceof Error ? generalError.message : 'Erro desconhecido';
    console.error(`Erro geral ao processar nó ${node.id} (${node.name}):`, generalError);
    if (!baseNode.metadata) {
      baseNode.metadata = {
        figmaId: node.id,
        figmaType: node.type,
        figmaPath: currentPath,
        notes: '',
        hasIssues: true
      };
    }
    baseNode.metadata.notes = `Erro geral no processamento: ${errorMessage}`;
    baseNode.metadata.hasIssues = true;
    return baseNode;
  }
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
        // Verificar se há muitos elementos selecionados
        const MAX_SELECTION = 50;
        if (selection.length > MAX_SELECTION) {
          const message = `⚠️ Muitos elementos selecionados (${selection.length}). Processando apenas os primeiros ${MAX_SELECTION} para desempenho.`;
          figma.notify(message, { timeout: 3000 });
          console.warn(message);
        }
        
        const selectionToProcess = selection.slice(0, MAX_SELECTION);
        figma.notify(`Processando ${selectionToProcess.length} elemento(s)...`, { timeout: 2000 });

        // Contador para tracking de progresso e problemas detectados
        let processedCount = 0;
        const totalToProcess = selectionToProcess.length;
        const problematicNodes: {id: string, name: string, reason: string}[] = [];
        
        const processedNodes: DesignASTNode[] = [];
        // Usar for...of para chamadas async/await
        for (const node of selectionToProcess) {
            try {
                // Atualizar progresso para seleções grandes
                processedCount++;
                if (totalToProcess > 5 && processedCount % 5 === 0) {
                  figma.notify(`Processando ${processedCount}/${totalToProcess}...`, { timeout: 1000 });
                }
                
                const astNode = await convertNodeToAst(node, [figma.currentPage.name]);
                processedNodes.push(astNode);
                
                // Verificar se o nó processado tem problemas
                if (astNode.metadata?.hasIssues) {
                  console.warn(`⚠️ O nó "${node.name}" foi processado com problemas. Verifique metadata.notes para detalhes.`);
                  // Armazenar nó problemático
                  problematicNodes.push({
                    id: node.id, 
                    name: node.name,
                    reason: astNode.metadata.notes || 'Problema não especificado'
                  });
                }
            } catch (nodeError) {
                const errorMessage = nodeError instanceof Error ? nodeError.message : 'Erro desconhecido';
                console.error(`Erro ao processar nó ${node.id} (${node.name}):`, nodeError);
                figma.notify(`⚠️ Erro ao processar nó: ${node.name}. Ver console.`, { timeout: 3000 });
                
                // Registrar problema detectado
                problematicNodes.push({
                  id: node.id, 
                  name: node.name,
                  reason: errorMessage
                });
                
                // Adicionar um nó de erro para manter a estrutura intacta
                processedNodes.push({
                  type: node.type.toLowerCase(),
                  name: node.name,
                  id: node.id,
                  properties: { processingError: true },
                  styles: {},
                  metadata: {
                    figmaId: node.id,
                    figmaType: node.type,
                    figmaPath: [figma.currentPage.name, node.name],
                    notes: `Erro fatal ao processar: ${errorMessage}`,
                    hasIssues: true
                  }
                });
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
                properties: { 
                  nodeCount: processedNodes.length,
                  totalSelectedNodes: selection.length,
                  truncated: selection.length > MAX_SELECTION
                },
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
                figmaFileName: figma.root.name,
                problematicNodes: problematicNodes.length > 0 ? problematicNodes : undefined
            }
        };
        
        // Contar nós com problemas
        const nodesWithIssues = countNodesWithIssues(finalAst.rootNode);
        if (nodesWithIssues > 0) {
          const message = `⚠️ ${nodesWithIssues} nó(s) processado(s) com avisos ou erros. Verifique o console para detalhes.`;
          console.warn(message);
          figma.notify(message, { timeout: 3000 });
          
          // Enviar lista de nós problemáticos para a UI
          if (problematicNodes.length > 0) {
            figma.ui.postMessage({ 
              type: 'processingIssues', 
              payload: { problematicNodes }
            });
          }
        }
        
        console.log("Plugin: AST final gerada:", finalAst);
        // Enviar a AST final para a UI
        figma.ui.postMessage({ type: 'astGenerated', payload: finalAst });
        figma.notify("Processamento concluído!", { timeout: 2000 });

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
        console.error("Erro geral ao processar seleção:", error);
        figma.notify("❌ Erro geral ao processar a seleção. Verifique o console.", { timeout: 3000 });
        figma.ui.postMessage({ type: 'astGenerated', payload: { error: `Erro no processamento: ${errorMessage}` } });
      }

    } else if (msg.type === 'getInitialData') {
      figma.ui.postMessage({ type: 'initialData', payload: { status: 'Plugin pronto' } });
    } else if (msg.type === 'locateNode') {
      // Nova funcionalidade: localizar nó problemático no Figma
      try {
        const node = figma.getNodeById(msg.nodeId);
        if (node && node.type !== 'DOCUMENT') {
          // Selecionar e focar no nó problemático
          figma.currentPage.selection = [node as SceneNode];
          figma.viewport.scrollAndZoomIntoView([node as SceneNode]);
          figma.notify(`Localizando "${node.name}"...`, { timeout: 2000 });
        } else {
          figma.notify("❌ Não foi possível localizar o nó.", { timeout: 3000 });
        }
      } catch (error) {
        figma.notify("❌ Erro ao tentar localizar o nó. Veja o console.", { timeout: 3000 });
        console.error("Erro ao tentar localizar nó:", error);
      }
    }
  };

  console.log("Plugin Core (code.ts) inicializado e pronto.");
}

/**
 * Função auxiliar para contar nós com problemas na AST
 */
function countNodesWithIssues(node: DesignASTNode): number {
  let count = node.metadata?.hasIssues ? 1 : 0;
  
  if (node.children && node.children.length > 0) {
    for (const child of node.children) {
      count += countNodesWithIssues(child);
    }
  }
  
  return count;
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