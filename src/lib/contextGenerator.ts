/**
 * Context Generator
 * 
 * Transforma dados do Figma em contexto rico e estruturado para LLMs e VLMs.
 * Filtra, sumariza e enriquece os dados para facilitar o entendimento por modelos de IA.
 */

import { extractNodeType, inferNodeRole, getNodeText } from '@/lib/nodeAnalyzer';
import { 
  assignSemanticTag,
  analyzeElementContext,
  analyzeNavigationFlow,
  generateNarration,
  generateSemanticJSON,
  type SemanticTag
} from './semanticAnalyzer';

// Tipos de dados
export interface ContextBundle {
  // Metadados
  metadata: {
    title: string;
    description: string;
    figmaUrl: string;
    nodeId: string;
    timestamp: string;
    version: string;
    hygieneReport?: any; // Relatório de higiene dos dados do Figma
  };
  
  // Sumarização
  summary: {
    type: string;
    role: string;
    description: string;
    childrenCount: number;
    complexity: 'simple' | 'medium' | 'complex';
    narration: string;
  };
  
  // Estrutura
  structure: {
    type: string;
    name: string;
    role?: string;
    children?: any[];
    properties?: Record<string, any>;
  };
  
  // Semântica
  semantic: {
    tag: SemanticTag;
    purpose?: string;
    userAction?: string;
    userFlow?: string;
    expectedUser?: {
      persona?: string;
      funnelStage?: string;
      intent?: string;
    };
    json: any;
  };
  
  // Visual
  visual: {
    dimensions: {
      width: number;
      height: number;
    };
    colors: string[];
    typography?: {
      fonts: string[];
      sizes: number[];
    };
    imageUrl?: string;
  };
  
  // Interações (se disponíveis)
  interactions?: {
    hasPrototyping: boolean;
    actions?: string[];
    transitions?: any[];
    navigationFlows?: string[];
  };
  
  // Dados brutos filtrados (opcional, para referência)
  rawData?: any;
}

/**
 * Gera um bundle de contexto a partir de dados do Figma
 * @param figmaData Dados brutos do Figma (de API ou plugin)
 * @param figmaUrl URL do Figma
 * @param nodeId ID do node
 * @param options Opções de geração
 * @returns Bundle de contexto estruturado
 */
export function generateContextBundle(
  figmaData: any,
  figmaUrl: string,
  nodeId: string,
  options: {
    includeRawData?: boolean;
    generateSummary?: boolean;
    inferRoles?: boolean;
  } = {}
): ContextBundle {
  // Valores padrão
  const opts = {
    includeRawData: false,
    generateSummary: true,
    inferRoles: true,
    ...options
  };
  
  // Encontrar o node específico nos dados
  const node = findNodeById(figmaData, nodeId);
  if (!node) {
    throw new Error(`Node com ID ${nodeId} não encontrado nos dados do Figma`);
  }
  
  // Extrair cores do node e filhos
  const colors = extractColors(node);
  
  // Extrair tipografia
  const typography = extractTypography(node);
  
  // Extrair interações (se houver)
  const interactions = extractInteractions(node);
  
  // Analisar estrutura
  const structure = analyzeStructure(node, opts.inferRoles);
  
  // Gerar sumarização
  const summary = opts.generateSummary 
    ? generateSummary(node, structure, colors, typography, interactions)
    : { 
        type: node.type || 'UNKNOWN',
        role: 'unknown',
        description: node.name || 'Componente sem nome',
        childrenCount: (node.children?.length || 0),
        complexity: determineComplexity(node),
        narration: ''
      };
  
  // Adicionar narração automática se não estiver presente
  if (!summary.narration) {
    summary.narration = generateNarration(node);
  }
  
  // Analisar semântica
  const semanticTag = assignSemanticTag(node);
  const elementContext = analyzeElementContext(node);
  const semanticJSON = generateSemanticJSON(node);
  
  // Analisar fluxos de navegação
  const navigationFlows = analyzeNavigationFlow(node);
  
  // Construir o bundle
  const bundle: ContextBundle = {
    metadata: {
      title: node.name || 'Componente Figma',
      description: `${summary.type} extraído do Figma`,
      figmaUrl,
      nodeId,
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    },
    summary,
    structure,
    semantic: {
      tag: semanticTag,
      purpose: elementContext.purpose,
      userAction: elementContext.userAction,
      userFlow: elementContext.userFlow,
      expectedUser: elementContext.expectedUser,
      json: semanticJSON
    },
    visual: {
      dimensions: {
        width: node.absoluteBoundingBox?.width || 0,
        height: node.absoluteBoundingBox?.height || 0
      },
      colors,
      typography
    }
  };
  
  // Adicionar interações se existirem
  if (interactions?.hasPrototyping) {
    bundle.interactions = interactions;
    
    // Adicionar fluxos de navegação se existirem
    if (navigationFlows.length > 0) {
      bundle.interactions.navigationFlows = navigationFlows;
    }
  }
  
  // Incluir dados brutos filtrados se solicitado
  if (opts.includeRawData) {
    bundle.rawData = filterRawData(node);
  }
  
  return bundle;
}

/**
 * Encontra um node pelo ID na árvore de dados do Figma
 */
function findNodeById(data: any, nodeId: string): any {
  // Se for resposta da API de nodes
  if (data.nodes && data.nodes[nodeId]) {
    return data.nodes[nodeId].document;
  }
  
  // Se for resposta da API de arquivos ou plugin
  if (data.document) {
    return findNodeInTree(data.document, nodeId);
  }
  
  // Se for o node direto
  if (data.id === nodeId) {
    return data;
  }
  
  // Busca recursiva
  return findNodeInTree(data, nodeId);
}

/**
 * Busca recursiva por um node na árvore
 */
function findNodeInTree(node: any, nodeId: string): any {
  if (!node) return null;
  
  if (node.id === nodeId) {
    return node;
  }
  
  if (node.children) {
    for (const child of node.children) {
      const found = findNodeInTree(child, nodeId);
      if (found) return found;
    }
  }
  
  return null;
}

/**
 * Extrai cores do node e seus filhos
 */
function extractColors(node: any): string[] {
  const colors = new Set<string>();
  
  // Adicionar cores do próprio node
  if (node.backgroundColor) {
    const color = rgbaToHex(node.backgroundColor);
    if (color) colors.add(color);
  }
  
  if (node.fills && Array.isArray(node.fills)) {
    node.fills.forEach((fill: any) => {
      if (fill.type === 'SOLID' && fill.color) {
        const color = rgbaToHex(fill.color, fill.opacity);
        if (color) colors.add(color);
      }
    });
  }
  
  // Adicionar cores de texto
  if (node.style?.fills && Array.isArray(node.style.fills)) {
    node.style.fills.forEach((fill: any) => {
      if (fill.type === 'SOLID' && fill.color) {
        const color = rgbaToHex(fill.color, fill.opacity);
        if (color) colors.add(color);
      }
    });
  }
  
  // Recursivamente adicionar cores dos filhos
  if (node.children && Array.isArray(node.children)) {
    node.children.forEach((child: any) => {
      const childColors = extractColors(child);
      childColors.forEach(color => colors.add(color));
    });
  }
  
  return Array.from(colors);
}

/**
 * Converte RGBA para Hex
 */
function rgbaToHex(color: any, opacity?: number): string | null {
  if (!color) return null;
  
  const r = Math.round((color.r || 0) * 255);
  const g = Math.round((color.g || 0) * 255);
  const b = Math.round((color.b || 0) * 255);
  const a = opacity !== undefined ? opacity : (color.a !== undefined ? color.a : 1);
  
  if (a < 1) {
    return `rgba(${r}, ${g}, ${b}, ${a.toFixed(2)})`;
  }
  
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

/**
 * Extrai informações de tipografia
 */
function extractTypography(node: any): { fonts: string[], sizes: number[] } {
  const fonts = new Set<string>();
  const sizes = new Set<number>();
  
  // Extrair do próprio node
  if (node.style) {
    if (node.style.fontFamily) fonts.add(node.style.fontFamily);
    if (node.style.fontSize) sizes.add(node.style.fontSize);
  }
  
  // Recursivamente extrair dos filhos
  if (node.children && Array.isArray(node.children)) {
    node.children.forEach((child: any) => {
      const childTypography = extractTypography(child);
      childTypography.fonts.forEach(font => fonts.add(font));
      childTypography.sizes.forEach(size => sizes.add(size));
    });
  }
  
  return {
    fonts: Array.from(fonts),
    sizes: Array.from(sizes).sort((a, b) => a - b)
  };
}

/**
 * Extrai informações de interações e prototipagem
 */
function extractInteractions(node: any): { hasPrototyping: boolean, actions?: string[], transitions?: any[] } {
  const hasPrototyping = !!(
    node.reactions?.length || 
    node.transitionNodeID || 
    node.prototypingKey
  );
  
  if (!hasPrototyping) {
    return { hasPrototyping: false };
  }
  
  const actions: string[] = [];
  const transitions: any[] = [];
  
  // Extrair ações de prototipagem
  if (node.reactions && Array.isArray(node.reactions)) {
    node.reactions.forEach((reaction: any) => {
      if (reaction.action) {
        actions.push(`${reaction.trigger || 'ON_CLICK'} -> ${reaction.action}`);
      }
      
      if (reaction.destinationId) {
        transitions.push({
          trigger: reaction.trigger || 'ON_CLICK',
          destination: reaction.destinationId,
          navigation: reaction.navigation || 'NAVIGATE'
        });
      }
    });
  }
  
  return {
    hasPrototyping,
    actions: actions.length > 0 ? actions : undefined,
    transitions: transitions.length > 0 ? transitions : undefined
  };
}

/**
 * Analisa a estrutura do node e seus filhos
 */
function analyzeStructure(node: any, inferRoles: boolean = true): any {
  const result: any = {
    type: node.type || 'UNKNOWN',
    name: node.name || 'Unnamed'
  };
  
  // Inferir papel/função do componente
  if (inferRoles) {
    result.role = inferNodeRole(node);
  }
  
  // Adicionar propriedades relevantes
  const properties: Record<string, any> = {};
  
  // Layout
  if (node.layoutMode) {
    properties.layout = {
      mode: node.layoutMode,
      direction: node.layoutMode === 'HORIZONTAL' ? 'row' : 'column',
      spacing: node.itemSpacing,
      padding: {
        top: node.paddingTop,
        right: node.paddingRight,
        bottom: node.paddingBottom,
        left: node.paddingLeft
      }
    };
  }
  
  // Texto
  if (node.type === 'TEXT' && node.characters) {
    properties.text = {
      content: node.characters,
      style: {
        fontFamily: node.style?.fontFamily,
        fontSize: node.style?.fontSize,
        fontWeight: node.style?.fontWeight,
        textAlign: node.style?.textAlignHorizontal
      }
    };
  }
  
  // Adicionar propriedades se não estiverem vazias
  if (Object.keys(properties).length > 0) {
    result.properties = properties;
  }
  
  // Processar filhos recursivamente
  if (node.children && Array.isArray(node.children) && node.children.length > 0) {
    result.children = node.children.map((child: any) => analyzeStructure(child, inferRoles));
  }
  
  return result;
}

/**
 * Gera uma sumarização textual do componente
 */
function generateSummary(
  node: any, 
  structure: any, 
  colors: string[], 
  typography: any, 
  interactions: any
): any {
  const type = extractNodeType(node);
  const role = inferNodeRole(node);
  const childrenCount = node.children?.length || 0;
  const complexity = determineComplexity(node);
  
  // Gerar descrição básica
  let description = `${type} "${node.name}"`;
  
  // Adicionar informações sobre layout
  if (node.layoutMode) {
    description += ` com layout ${node.layoutMode === 'HORIZONTAL' ? 'horizontal' : 'vertical'}`;
  }
  
  // Adicionar informações sobre filhos
  if (childrenCount > 0) {
    description += ` contendo ${childrenCount} elemento${childrenCount > 1 ? 's' : ''}`;
    
    // Categorizar filhos
    const childTypes = categorizeChildren(node.children);
    const childDescriptions = [];
    
    for (const [type, count] of Object.entries(childTypes)) {
      childDescriptions.push(`${count} ${type}${count > 1 ? 's' : ''}`);
    }
    
    if (childDescriptions.length > 0) {
      description += ` (${childDescriptions.join(', ')})`;
    }
  }
  
  // Adicionar informações sobre interações
  if (interactions?.hasPrototyping) {
    description += `. Possui interações de prototipagem`;
    if (interactions.actions?.length) {
      description += ` com ${interactions.actions.length} ação(ões)`;
    }
  }
  
  // Adicionar informações sobre estilo
  if (colors.length > 0) {
    description += `. Utiliza ${colors.length} cor${colors.length > 1 ? 'es' : ''}`;
  }
  
  if (typography.fonts.length > 0) {
    description += `. Fonte${typography.fonts.length > 1 ? 's' : ''}: ${typography.fonts.join(', ')}`;
  }
  
  // Gerar narração automática
  const narration = generateNarration(node);
  
  return {
    type,
    role,
    description,
    childrenCount,
    complexity,
    narration
  };
}

/**
 * Categoriza os filhos de um node por tipo
 */
function categorizeChildren(children: any[]): Record<string, number> {
  if (!children || !Array.isArray(children)) return {};
  
  const categories: Record<string, number> = {};
  
  children.forEach(child => {
    const type = extractNodeType(child);
    categories[type] = (categories[type] || 0) + 1;
  });
  
  return categories;
}

/**
 * Determina a complexidade do componente
 */
function determineComplexity(node: any): 'simple' | 'medium' | 'complex' {
  if (!node) return 'simple';
  
  const childCount = countTotalChildren(node);
  
  if (childCount <= 5) return 'simple';
  if (childCount <= 20) return 'medium';
  return 'complex';
}

/**
 * Conta o número total de filhos (recursivamente)
 */
function countTotalChildren(node: any): number {
  if (!node.children || !Array.isArray(node.children)) return 0;
  
  let count = node.children.length;
  
  for (const child of node.children) {
    count += countTotalChildren(child);
  }
  
  return count;
}

/**
 * Filtra dados brutos para incluir apenas o essencial
 */
function filterRawData(node: any): any {
  if (!node) return null;
  
  // Lista de propriedades a manter
  const keepProps = [
    'id', 'name', 'type', 'visible',
    'absoluteBoundingBox', 'constraints',
    'layoutMode', 'primaryAxisAlignItems', 'counterAxisAlignItems',
    'itemSpacing', 'paddingLeft', 'paddingRight', 'paddingTop', 'paddingBottom',
    'backgroundColor', 'fills', 'strokes', 'strokeWeight', 'cornerRadius', 'effects',
    'characters', 'style', 'reactions'
  ];
  
  const filtered: any = {};
  
  // Copiar apenas propriedades relevantes
  for (const prop of keepProps) {
    if (node[prop] !== undefined) {
      filtered[prop] = node[prop];
    }
  }
  
  // Processar filhos recursivamente
  if (node.children && Array.isArray(node.children)) {
    filtered.children = node.children.map(filterRawData);
  }
  
  return filtered;
}

/**
 * Exporta o bundle de contexto como Markdown
 */
export function bundleToMarkdown(bundle: ContextBundle): string {
  let markdown = `# ${bundle.metadata.title}\n\n`;
  
  // Metadados
  markdown += `## Metadados\n\n`;
  markdown += `- **Tipo:** ${bundle.summary.type}\n`;
  markdown += `- **Função:** ${bundle.summary.role}\n`;
  markdown += `- **Complexidade:** ${bundle.summary.complexity}\n`;
  markdown += `- **Tag Semântica:** ${bundle.semantic.tag}\n`;
  markdown += `- **Link Figma:** [Abrir no Figma](${bundle.metadata.figmaUrl})\n\n`;
  
  // Descrição e Narração
  markdown += `## Descrição\n\n${bundle.summary.description}\n\n`;
  markdown += `## Narração Automática\n\n${bundle.summary.narration}\n\n`;
  
  // Visual
  markdown += `## Aspectos Visuais\n\n`;
  markdown += `- **Dimensões:** ${bundle.visual.dimensions.width}×${bundle.visual.dimensions.height}px\n`;
  
  if (bundle.visual.colors.length > 0) {
    markdown += `- **Cores:** ${bundle.visual.colors.join(', ')}\n`;
  }
  
  if (bundle.visual.typography?.fonts.length) {
    markdown += `- **Fontes:** ${bundle.visual.typography.fonts.join(', ')}\n`;
  }
  
  if (bundle.visual.typography?.sizes.length) {
    markdown += `- **Tamanhos de fonte:** ${bundle.visual.typography.sizes.join(', ')}px\n`;
  }
  
  markdown += `\n`;
  
  // Interações
  if (bundle.interactions?.hasPrototyping) {
    markdown += `## Interações\n\n`;
    
    if (bundle.interactions.actions?.length) {
      markdown += `### Ações\n\n`;
      bundle.interactions.actions.forEach(action => {
        markdown += `- ${action}\n`;
      });
      markdown += `\n`;
    }
    
    if (bundle.interactions.transitions?.length) {
      markdown += `### Transições\n\n`;
      bundle.interactions.transitions.forEach(transition => {
        markdown += `- ${transition.trigger} → ${transition.destination} (${transition.navigation})\n`;
      });
      markdown += `\n`;
    }
    
    if (bundle.interactions.navigationFlows?.length) {
      markdown += `### Fluxos de Navegação\n\n`;
      bundle.interactions.navigationFlows.forEach(flow => {
        markdown += `- ${flow}\n`;
      });
      markdown += `\n`;
    }
  }
  
  // Contexto Semântico
  markdown += `## Contexto Semântico\n\n`;
  
  if (bundle.semantic.purpose) {
    markdown += `- **Propósito:** ${bundle.semantic.purpose}\n`;
  }
  
  if (bundle.semantic.userAction) {
    markdown += `- **Ação Esperada:** ${bundle.semantic.userAction}\n`;
  }
  
  if (bundle.semantic.userFlow) {
    markdown += `- **Fluxo:** ${bundle.semantic.userFlow}\n`;
  }
  
  if (bundle.semantic.expectedUser) {
    markdown += `- **Contexto do Usuário:**\n`;
    if (bundle.semantic.expectedUser.persona) {
      markdown += `  - Persona: ${bundle.semantic.expectedUser.persona}\n`;
    }
    if (bundle.semantic.expectedUser.funnelStage) {
      markdown += `  - Etapa do Funil: ${bundle.semantic.expectedUser.funnelStage}\n`;
    }
    if (bundle.semantic.expectedUser.intent) {
      markdown += `  - Intenção: ${bundle.semantic.expectedUser.intent}\n`;
    }
  }
  
  markdown += `\n### Representação JSON Semântica\n\n`;
  markdown += `\`\`\`json\n${JSON.stringify(bundle.semantic.json, null, 2)}\n\`\`\`\n\n`;
  
  // Estrutura
  markdown += `## Estrutura\n\n`;
  markdown += `\`\`\`json\n${JSON.stringify(bundle.structure, null, 2)}\n\`\`\`\n\n`;
  
  return markdown;
}
