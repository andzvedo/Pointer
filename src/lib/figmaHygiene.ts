/**
 * Figma Hygiene
 * 
 * Módulo para limpeza e normalização de dados do Figma antes da extração de contexto.
 * Garante que os dados estejam em um formato consistente e otimizado para análise.
 */

/**
 * Interface para opções de higienização
 */
export interface HygieneOptions {
  // Remove nós ocultos (visible: false)
  removeHiddenNodes?: boolean;
  
  // Remove nós com nomes começando com underscore (_) ou ponto (.)
  removePrivateNodes?: boolean;
  
  // Remove nós vazios (sem filhos e sem conteúdo visual)
  removeEmptyNodes?: boolean;
  
  // Normaliza nomes de nós (remove caracteres especiais, espaços extras)
  normalizeNodeNames?: boolean;
  
  // Simplifica a árvore removendo grupos desnecessários
  simplifyTree?: boolean;
  
  // Remove propriedades desnecessárias para reduzir o tamanho dos dados
  removeUnnecessaryProps?: boolean;
  
  // Corrige problemas comuns de estrutura
  fixStructuralIssues?: boolean;
  
  // Infere propriedades ausentes com base em heurísticas
  inferMissingProps?: boolean;
}

/**
 * Valores padrão para opções de higienização
 */
const DEFAULT_OPTIONS: HygieneOptions = {
  removeHiddenNodes: true,
  removePrivateNodes: true,
  removeEmptyNodes: true,
  normalizeNodeNames: true,
  simplifyTree: true,
  removeUnnecessaryProps: true,
  fixStructuralIssues: true,
  inferMissingProps: true
};

/**
 * Limpa e normaliza dados do Figma para melhorar a extração de contexto
 * @param figmaData Dados brutos do Figma
 * @param options Opções de higienização
 * @returns Dados limpos e normalizados
 */
export function hygienizeFigmaData(figmaData: any, options: HygieneOptions = {}): any {
  // Mesclar opções com padrões
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  // Se for resposta da API de nodes
  if (figmaData.nodes) {
    const result = { ...figmaData };
    
    // Processar cada node
    Object.keys(result.nodes).forEach(nodeId => {
      if (result.nodes[nodeId].document) {
        result.nodes[nodeId].document = processNode(result.nodes[nodeId].document, opts);
      }
    });
    
    return result;
  }
  
  // Se for resposta da API de arquivos ou plugin
  if (figmaData.document) {
    return {
      ...figmaData,
      document: processNode(figmaData.document, opts)
    };
  }
  
  // Se for um node direto
  return processNode(figmaData, opts);
}

/**
 * Processa um node do Figma aplicando regras de higienização
 */
function processNode(node: any, options: HygieneOptions): any {
  if (!node) return null;
  
  // Clone o node para não modificar o original
  const result = { ...node };
  
  // 1. Remover nós ocultos
  if (options.removeHiddenNodes && result.visible === false) {
    return null;
  }
  
  // 2. Remover nós privados (começando com _ ou .)
  if (options.removePrivateNodes && 
      result.name && 
      (result.name.startsWith('_') || result.name.startsWith('.'))) {
    return null;
  }
  
  // 3. Normalizar nomes de nós
  if (options.normalizeNodeNames && result.name) {
    result.name = normalizeNodeName(result.name);
  }
  
  // Processar filhos recursivamente
  if (result.children && Array.isArray(result.children)) {
    // Processar cada filho
    const processedChildren = result.children
      .map((child: any) => processNode(child, options))
      .filter(Boolean); // Remover nulos (nós filtrados)
    
    result.children = processedChildren;
    
    // Remover nós vazios
    if (options.removeEmptyNodes && 
        processedChildren.length === 0 && 
        isEmptyVisualNode(result)) {
      return null;
    }
  }
  
  // 5. Simplificar árvore
  if (options.simplifyTree && 
      canFlattenGroup(result) && 
      result.children && 
      result.children.length === 1) {
    // Mesclar grupo com filho único
    const child = result.children[0];
    child.name = `${result.name}/${child.name}`;
    return processNode(child, options);
  }
  
  // 6. Remover propriedades desnecessárias
  if (options.removeUnnecessaryProps) {
    const cleanedProps = removeUnnecessaryProperties(result);
    Object.assign(result, cleanedProps);
  }
  
  // 7. Corrigir problemas estruturais
  if (options.fixStructuralIssues) {
    const fixedNode = fixStructuralIssues(result);
    Object.assign(result, fixedNode);
  }
  
  // 8. Inferir propriedades ausentes
  if (options.inferMissingProps) {
    const inferredNode = inferMissingProperties(result);
    Object.assign(result, inferredNode);
  }
  
  return result;
}

/**
 * Normaliza o nome de um nó removendo caracteres especiais e espaços extras
 */
function normalizeNodeName(name: string): string {
  // Remover caracteres especiais não úteis
  let normalized = name.replace(/[^\w\s\-\/]/g, '');
  
  // Remover espaços extras
  normalized = normalized.replace(/\s+/g, ' ').trim();
  
  // Remover sufixos numéricos automáticos do Figma (ex: "Button 1")
  normalized = normalized.replace(/\s+\d+$/, '');
  
  return normalized || 'Unnamed';
}

/**
 * Verifica se um nó não tem conteúdo visual relevante
 */
function isEmptyVisualNode(node: any): boolean {
  // Nós de texto vazios
  if (node.type === 'TEXT' && (!node.characters || node.characters.trim() === '')) {
    return true;
  }
  
  // Retângulos/formas sem preenchimento ou borda
  if (['RECTANGLE', 'ELLIPSE', 'POLYGON', 'STAR', 'LINE'].includes(node.type)) {
    const hasNoFill = !node.fills || 
                      node.fills.length === 0 || 
                      node.fills.every((fill: any) => fill.visible === false);
    
    const hasNoStroke = !node.strokes || 
                        node.strokes.length === 0 || 
                        node.strokes.every((stroke: any) => stroke.visible === false);
    
    return hasNoFill && hasNoStroke;
  }
  
  // Frames/grupos sem filhos
  if (['FRAME', 'GROUP', 'COMPONENT', 'INSTANCE'].includes(node.type)) {
    return !node.children || node.children.length === 0;
  }
  
  return false;
}

/**
 * Verifica se um grupo pode ser achatado (não tem propriedades especiais)
 */
function canFlattenGroup(node: any): boolean {
  // Não achatar componentes, instâncias ou frames com layout
  if (node.type === 'COMPONENT' || 
      node.type === 'COMPONENT_SET' || 
      node.type === 'INSTANCE' || 
      node.layoutMode) {
    return false;
  }
  
  // Não achatar grupos com efeitos, máscaras ou outras propriedades especiais
  if (node.effects && node.effects.length > 0) return false;
  if (node.isMask) return false;
  if (node.constraints && (node.constraints.horizontal !== 'SCALE' || node.constraints.vertical !== 'SCALE')) return false;
  
  return node.type === 'GROUP' || node.type === 'FRAME';
}

/**
 * Remove propriedades desnecessárias para reduzir o tamanho dos dados
 */
function removeUnnecessaryProperties(node: any): any {
  const result = { ...node };
  
  // Lista de propriedades a remover
  const propsToRemove = [
    'exportSettings',      // Configurações de exportação
    'preserveRatio',       // Preservar proporção
    'locked',              // Nó bloqueado
    'guides',              // Guias
    'componentPropertyReferences', // Referências de propriedades
    'overrides',           // Substituições
    'componentProperties', // Propriedades de componentes
    'flowStartingPoints',  // Pontos de início de fluxo
    'styleOverrideTable',  // Tabela de substituição de estilo
    'componentPropertyDefinitions', // Definições de propriedades
    'documentationLinks',  // Links de documentação
    'authorVisible',       // Autor visível
    'authorName',          // Nome do autor
    'lineTypes',           // Tipos de linha
    'lineIndentations',    // Indentações de linha
    'layoutGrids',         // Grades de layout
    'individualStrokeWeights', // Pesos de traço individuais
    'booleanOperation'     // Operação booleana
  ];
  
  // Remover propriedades desnecessárias
  propsToRemove.forEach(prop => {
    delete result[prop];
  });
  
  return result;
}

/**
 * Corrige problemas estruturais comuns em arquivos do Figma
 */
function fixStructuralIssues(node: any): any {
  const result = { ...node };
  
  // Garantir que absoluteBoundingBox exista
  if (!result.absoluteBoundingBox && result.type !== 'DOCUMENT' && result.type !== 'CANVAS') {
    // Tentar inferir de filhos
    if (result.children && result.children.length > 0) {
      const childrenWithBounds = result.children.filter((c: any) => c.absoluteBoundingBox);
      
      if (childrenWithBounds.length > 0) {
        // Calcular limites com base nos filhos
        const left = Math.min(...childrenWithBounds.map((c: any) => c.absoluteBoundingBox.x));
        const top = Math.min(...childrenWithBounds.map((c: any) => c.absoluteBoundingBox.y));
        const right = Math.max(...childrenWithBounds.map((c: any) => c.absoluteBoundingBox.x + c.absoluteBoundingBox.width));
        const bottom = Math.max(...childrenWithBounds.map((c: any) => c.absoluteBoundingBox.y + c.absoluteBoundingBox.height));
        
        result.absoluteBoundingBox = {
          x: left,
          y: top,
          width: right - left,
          height: bottom - top
        };
      }
    }
  }
  
  // Garantir que fills seja um array
  if (result.fills && !Array.isArray(result.fills)) {
    result.fills = [result.fills];
  }
  
  // Garantir que strokes seja um array
  if (result.strokes && !Array.isArray(result.strokes)) {
    result.strokes = [result.strokes];
  }
  
  return result;
}

/**
 * Infere propriedades ausentes com base em heurísticas
 */
function inferMissingProperties(node: any): any {
  const result = { ...node };
  
  // Inferir tipo de componente baseado no nome
  if (!result.componentType) {
    const name = (result.name || '').toLowerCase();
    
    if (name.includes('button') || name.includes('btn')) {
      result.componentType = 'BUTTON';
    } else if (name.includes('input') || name.includes('field') || name.includes('text field')) {
      result.componentType = 'INPUT';
    } else if (name.includes('card')) {
      result.componentType = 'CARD';
    } else if (name.includes('icon')) {
      result.componentType = 'ICON';
    } else if (name.includes('avatar')) {
      result.componentType = 'AVATAR';
    }
  }
  
  // Inferir estado para componentes interativos
  if (!result.state && result.componentType) {
    const name = (result.name || '').toLowerCase();
    
    if (name.includes('hover') || name.includes('mouseover')) {
      result.state = 'HOVER';
    } else if (name.includes('press') || name.includes('active')) {
      result.state = 'PRESSED';
    } else if (name.includes('focus')) {
      result.state = 'FOCUSED';
    } else if (name.includes('disabled')) {
      result.state = 'DISABLED';
    } else {
      result.state = 'DEFAULT';
    }
  }
  
  return result;
}

/**
 * Gera um relatório de higienização para mostrar as alterações feitas
 */
export function generateHygieneReport(originalData: any, cleanedData: any): any {
  // Contar nós antes e depois
  const originalNodeCount = countNodes(originalData);
  const cleanedNodeCount = countNodes(cleanedData);
  
  // Calcular tamanho antes e depois
  const originalSize = JSON.stringify(originalData).length;
  const cleanedSize = JSON.stringify(cleanedData).length;
  
  // Calcular nós removidos por tipo
  const removedNodes = calculateRemovedNodes(originalData, cleanedData);
  
  return {
    originalNodeCount,
    cleanedNodeCount,
    nodesRemoved: originalNodeCount - cleanedNodeCount,
    originalSize,
    cleanedSize,
    sizeReduction: originalSize - cleanedSize,
    sizeReductionPercentage: ((originalSize - cleanedSize) / originalSize * 100).toFixed(2) + '%',
    removedNodes
  };
}

/**
 * Conta o número total de nós em uma árvore
 */
function countNodes(data: any): number {
  if (!data) return 0;
  
  // Se for resposta da API de nodes
  if (data.nodes) {
    return Object.values(data.nodes).reduce((count: number, node: any) => {
      return count + (node.document ? countNodesInTree(node.document) : 0);
    }, 0);
  }
  
  // Se for resposta da API de arquivos ou plugin
  if (data.document) {
    return countNodesInTree(data.document);
  }
  
  // Se for um node direto
  return countNodesInTree(data);
}

/**
 * Conta nós recursivamente em uma árvore
 */
function countNodesInTree(node: any): number {
  if (!node) return 0;
  
  let count = 1; // Contar o próprio nó
  
  // Contar filhos recursivamente
  if (node.children && Array.isArray(node.children)) {
    count += node.children.reduce((sum: number, child: any) => {
      return sum + countNodesInTree(child);
    }, 0);
  }
  
  return count;
}

/**
 * Calcula estatísticas sobre nós removidos
 */
function calculateRemovedNodes(originalData: any, cleanedData: any): any {
  // Implementação simplificada - em um caso real, seria necessário
  // rastrear cada nó removido por tipo
  return {
    hidden: 0,
    private: 0,
    empty: 0,
    flattened: 0
  };
}
