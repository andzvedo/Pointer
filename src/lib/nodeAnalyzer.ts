/**
 * Node Analyzer
 * 
 * Funções auxiliares para analisar e extrair informações semânticas de nodes do Figma.
 * Usado pelo Context Generator para enriquecer o contexto com informações de alto nível.
 */

/**
 * Extrai o tipo de um node do Figma de forma mais amigável
 */
export function extractNodeType(node: any): string {
  if (!node || !node.type) return 'Desconhecido';
  
  // Mapeamento de tipos do Figma para nomes mais amigáveis
  const typeMap: Record<string, string> = {
    'FRAME': 'Frame',
    'GROUP': 'Grupo',
    'COMPONENT': 'Componente',
    'COMPONENT_SET': 'Conjunto de Componentes',
    'INSTANCE': 'Instância',
    'RECTANGLE': 'Retângulo',
    'ELLIPSE': 'Elipse',
    'TEXT': 'Texto',
    'VECTOR': 'Vetor',
    'LINE': 'Linha',
    'POLYGON': 'Polígono',
    'STAR': 'Estrela',
    'BOOLEAN_OPERATION': 'Operação Booleana',
    'SLICE': 'Slice',
    'SECTION': 'Seção'
  };
  
  return typeMap[node.type] || node.type;
}

/**
 * Extrai o texto de um node (se for TEXT)
 */
export function getNodeText(node: any): string | null {
  if (!node) return null;
  
  if (node.type === 'TEXT' && node.characters) {
    return node.characters;
  }
  
  return null;
}

/**
 * Infere o papel/função de um node com base em suas características
 */
export function inferNodeRole(node: any): string {
  if (!node) return 'unknown';
  
  // Verificar nome do node
  const name = (node.name || '').toLowerCase();
  const text = getNodeText(node)?.toLowerCase() || '';
  
  // Verificar se é um componente de UI comum
  
  // Botões
  if (
    name.includes('button') || 
    name.includes('btn') || 
    text.match(/^(ok|cancel|submit|send|save|delete|edit|add|remove|close|open|buy|sell|login|logout|sign in|sign up)$/i)
  ) {
    return 'button';
  }
  
  // Inputs
  if (
    name.includes('input') || 
    name.includes('field') || 
    name.includes('textfield') ||
    name.includes('text-field') ||
    name.includes('form field')
  ) {
    return 'input';
  }
  
  // Checkboxes
  if (
    name.includes('checkbox') || 
    name.includes('check')
  ) {
    return 'checkbox';
  }
  
  // Radio buttons
  if (
    name.includes('radio') || 
    name.includes('option')
  ) {
    return 'radio';
  }
  
  // Dropdowns/Selects
  if (
    name.includes('dropdown') || 
    name.includes('select') || 
    name.includes('menu')
  ) {
    return 'select';
  }
  
  // Cards
  if (
    name.includes('card') || 
    name.includes('tile')
  ) {
    return 'card';
  }
  
  // Headers
  if (
    name.includes('header') || 
    name.includes('navbar') || 
    name.includes('nav') ||
    name.includes('topbar')
  ) {
    return 'header';
  }
  
  // Footers
  if (
    name.includes('footer')
  ) {
    return 'footer';
  }
  
  // Sidebar
  if (
    name.includes('sidebar') || 
    name.includes('side bar') || 
    name.includes('sidenav')
  ) {
    return 'sidebar';
  }
  
  // Tabs
  if (
    name.includes('tab') || 
    name.includes('tabs')
  ) {
    return 'tabs';
  }
  
  // Modal/Dialog
  if (
    name.includes('modal') || 
    name.includes('dialog') || 
    name.includes('popup')
  ) {
    return 'modal';
  }
  
  // Carousel/Slider
  if (
    name.includes('carousel') || 
    name.includes('slider') || 
    name.includes('gallery')
  ) {
    return 'carousel';
  }
  
  // Accordion
  if (
    name.includes('accordion') || 
    name.includes('collapse') || 
    name.includes('expandable')
  ) {
    return 'accordion';
  }
  
  // Toggle/Switch
  if (
    name.includes('toggle') || 
    name.includes('switch')
  ) {
    return 'toggle';
  }
  
  // Avatar
  if (
    name.includes('avatar') || 
    name.includes('profile pic') || 
    name.includes('user pic')
  ) {
    return 'avatar';
  }
  
  // Badge
  if (
    name.includes('badge') || 
    name.includes('tag') || 
    name.includes('chip') || 
    name.includes('pill')
  ) {
    return 'badge';
  }
  
  // Tooltip
  if (
    name.includes('tooltip') || 
    name.includes('hint')
  ) {
    return 'tooltip';
  }
  
  // Progress
  if (
    name.includes('progress') || 
    name.includes('loader') || 
    name.includes('loading') || 
    name.includes('spinner')
  ) {
    return 'progress';
  }
  
  // Alert/Notification
  if (
    name.includes('alert') || 
    name.includes('notification') || 
    name.includes('toast') || 
    name.includes('message') ||
    name.includes('banner')
  ) {
    return 'alert';
  }
  
  // Table
  if (
    name.includes('table') || 
    name.includes('grid') || 
    name.includes('data table')
  ) {
    return 'table';
  }
  
  // List
  if (
    name.includes('list') || 
    name.includes('items')
  ) {
    return 'list';
  }
  
  // Divider
  if (
    name.includes('divider') || 
    name.includes('separator') || 
    name.includes('hr')
  ) {
    return 'divider';
  }
  
  // Icon
  if (
    name.includes('icon') || 
    node.type === 'VECTOR' || 
    node.type === 'BOOLEAN_OPERATION'
  ) {
    return 'icon';
  }
  
  // Headings
  if (
    name.includes('heading') || 
    name.includes('title') || 
    name.includes('h1') || 
    name.includes('h2') || 
    name.includes('h3') || 
    name.includes('h4') || 
    name.includes('h5') || 
    name.includes('h6')
  ) {
    return 'heading';
  }
  
  // Paragraph
  if (
    name.includes('paragraph') || 
    name.includes('text') || 
    name.includes('description') || 
    name.includes('body')
  ) {
    return 'paragraph';
  }
  
  // Form
  if (
    name.includes('form') || 
    name.includes('login form') || 
    name.includes('signup form') || 
    name.includes('register form')
  ) {
    return 'form';
  }
  
  // Container/Section
  if (
    name.includes('container') || 
    name.includes('section') || 
    name.includes('wrapper') || 
    name.includes('content')
  ) {
    return 'container';
  }
  
  // Tentar inferir pelo tipo de node e estrutura
  if (node.type === 'TEXT') {
    // Verificar se parece um heading pelo tamanho da fonte
    if (node.style?.fontSize && node.style.fontSize >= 18) {
      return 'heading';
    }
    return 'text';
  }
  
  if (node.type === 'FRAME' || node.type === 'GROUP') {
    // Verificar se tem layout auto
    if (node.layoutMode) {
      return 'container';
    }
    
    // Verificar se tem muitos filhos
    if (node.children && node.children.length > 5) {
      return 'section';
    }
  }
  
  // Fallback para tipo genérico
  if (node.type === 'FRAME') return 'frame';
  if (node.type === 'GROUP') return 'group';
  if (node.type === 'COMPONENT') return 'component';
  if (node.type === 'INSTANCE') return 'instance';
  if (node.type === 'RECTANGLE') return 'rectangle';
  
  return 'unknown';
}

/**
 * Analisa a acessibilidade de um node
 */
export function analyzeAccessibility(node: any): { issues: string[], suggestions: string[] } {
  const issues: string[] = [];
  const suggestions: string[] = [];
  
  // Verificar contraste de texto (simplificado)
  if (node.type === 'TEXT' && node.style?.fills && node.style.fills.length > 0) {
    const textColor = node.style.fills[0].color;
    const backgroundColor = findBackgroundColor(node);
    
    if (textColor && backgroundColor) {
      const contrast = calculateContrast(textColor, backgroundColor);
      
      if (contrast < 4.5) {
        issues.push(`Contraste de texto insuficiente (${contrast.toFixed(2)}:1)`);
        suggestions.push('Aumentar o contraste entre texto e fundo para pelo menos 4.5:1');
      }
    }
  }
  
  // Verificar tamanho de toque para elementos interativos
  if (inferNodeRole(node) === 'button' || node.name?.toLowerCase().includes('button')) {
    const width = node.absoluteBoundingBox?.width || 0;
    const height = node.absoluteBoundingBox?.height || 0;
    
    if (width < 44 || height < 44) {
      issues.push(`Área de toque muito pequena (${width}×${height}px)`);
      suggestions.push('Aumentar a área de toque para pelo menos 44×44px');
    }
  }
  
  // Verificar texto alternativo para imagens
  if (node.type === 'RECTANGLE' && node.fills && node.fills.some((fill: any) => fill.type === 'IMAGE')) {
    if (!node.name || node.name === 'Rectangle' || node.name.match(/^image\s*\d*$/i)) {
      issues.push('Imagem sem descrição alternativa');
      suggestions.push('Adicionar um nome descritivo à imagem para acessibilidade');
    }
  }
  
  return { issues, suggestions };
}

/**
 * Encontra a cor de fundo de um node
 */
function findBackgroundColor(node: any): any {
  // Verificar se o próprio node tem cor de fundo
  if (node.backgroundColor) {
    return node.backgroundColor;
  }
  
  // Verificar se tem fills de cor sólida
  if (node.fills && Array.isArray(node.fills)) {
    const solidFill = node.fills.find((fill: any) => fill.type === 'SOLID');
    if (solidFill && solidFill.color) {
      return solidFill.color;
    }
  }
  
  // Verificar no parent, se existir
  if (node.parent) {
    return findBackgroundColor(node.parent);
  }
  
  // Fallback para branco
  return { r: 1, g: 1, b: 1 };
}

/**
 * Calcula o contraste entre duas cores (simplificado)
 */
function calculateContrast(foreground: any, background: any): number {
  // Converter para luminância relativa
  const luminance1 = calculateRelativeLuminance(foreground);
  const luminance2 = calculateRelativeLuminance(background);
  
  // Calcular contraste
  const lighter = Math.max(luminance1, luminance2);
  const darker = Math.min(luminance1, luminance2);
  
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Calcula a luminância relativa de uma cor
 */
function calculateRelativeLuminance(color: any): number {
  const r = color.r || 0;
  const g = color.g || 0;
  const b = color.b || 0;
  
  const R = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
  const G = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
  const B = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);
  
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}
