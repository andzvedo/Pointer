// Função auxiliar para converter cor RGB do Figma
const rgbToHex = (r: number, g: number, b: number, a: number = 1) => {
  if (a < 1) {
    return `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${a})`;
  }
  const toHex = (n: number) => {
    const hex = Math.round(n * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

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
  fills?: Array<{
    type: string;
    color?: {
      r: number;
      g: number;
      b: number;
      a: number;
    };
    gradientStops?: Array<{
      position: number;
      color: {
        r: number;
        g: number;
        b: number;
        a: number;
      };
    }>;
  }>;
  strokes?: Array<any>;
  strokeWeight?: number;
  cornerRadius?: number;
  characters?: string;
  style?: {
    fontFamily?: string;
    fontWeight?: number;
    fontSize?: number;
    lineHeightPx?: number;
    letterSpacing?: number;
    textAlignHorizontal?: string;
    textAlignVertical?: string;
  };
  effects?: Array<{
    type: string;
    color?: {
      r: number;
      g: number;
      b: number;
      a: number;
    };
    offset?: { x: number; y: number };
    radius?: number;
    spread?: number;
  }>;
  layoutMode?: 'HORIZONTAL' | 'VERTICAL';
  primaryAxisAlignItems?: string;
  counterAxisAlignItems?: string;
  paddingLeft?: number;
  paddingRight?: number;
  paddingTop?: number;
  paddingBottom?: number;
  itemSpacing?: number;
  opacity?: number;
  children?: FigmaNode[];
}

interface GeneratedCode {
  html: string;
  css: string;
  tailwind?: string;
}

// Função para gerar classes Tailwind
function generateTailwindClasses(node: FigmaNode): string {
  const classes: string[] = [];

  // Dimensões
  if (node.absoluteBoundingBox) {
    classes.push(`w-[${Math.round(node.absoluteBoundingBox.width)}px]`);
    classes.push(`h-[${Math.round(node.absoluteBoundingBox.height)}px]`);
  }

  // Preenchimento
  if (node.fills && node.fills.length > 0) {
    const fill = node.fills[0];
    if (fill.color) {
      classes.push(`bg-[${rgbToHex(fill.color.r, fill.color.g, fill.color.b, fill.color.a)}]`);
    }
  }

  // Borda
  if (node.strokeWeight) {
    classes.push(`border-[${node.strokeWeight}px]`);
    if (node.strokes && node.strokes[0]?.color) {
      const strokeColor = node.strokes[0].color;
      classes.push(`border-[${rgbToHex(strokeColor.r, strokeColor.g, strokeColor.b, strokeColor.a)}]`);
    }
  }

  // Arredondamento
  if (node.cornerRadius) {
    classes.push(`rounded-[${node.cornerRadius}px]`);
  }

  // Layout
  if (node.layoutMode === 'HORIZONTAL') {
    classes.push('flex flex-row');
  } else if (node.layoutMode === 'VERTICAL') {
    classes.push('flex flex-col');
  }

  // Espaçamento
  if (node.itemSpacing) {
    classes.push(`gap-[${node.itemSpacing}px]`);
  }

  // Padding
  if (node.paddingTop || node.paddingRight || node.paddingBottom || node.paddingLeft) {
    const pt = node.paddingTop ? `pt-[${node.paddingTop}px]` : '';
    const pr = node.paddingRight ? `pr-[${node.paddingRight}px]` : '';
    const pb = node.paddingBottom ? `pb-[${node.paddingBottom}px]` : '';
    const pl = node.paddingLeft ? `pl-[${node.paddingLeft}px]` : '';
    classes.push(pt, pr, pb, pl);
  }

  // Opacidade
  if (node.opacity !== undefined && node.opacity !== 1) {
    classes.push(`opacity-[${Math.round(node.opacity * 100)}]`);
  }

  return classes.filter(Boolean).join(' ');
}

// Função para gerar HTML
function generateHTML(node: FigmaNode): string {
  let html = '';
  
  if (node.type === 'TEXT') {
    const style = node.style || {};
    const textStyles = [];
    
    if (style.fontSize) textStyles.push(`font-size: ${style.fontSize}px`);
    if (style.fontFamily) textStyles.push(`font-family: ${style.fontFamily}`);
    if (style.fontWeight) textStyles.push(`font-weight: ${style.fontWeight}`);
    if (style.letterSpacing) textStyles.push(`letter-spacing: ${style.letterSpacing}px`);
    
    html = `<p style="${textStyles.join('; ')}">${node.characters || ''}</p>`;
  } else {
    const tag = node.type === 'FRAME' || node.type === 'GROUP' ? 'div' : 'div';
    html = `<${tag}>${node.children?.map(child => generateHTML(child)).join('') || ''}</${tag}>`;
  }

  return html;
}

// Função para gerar CSS
function generateCSS(node: FigmaNode, className: string = ''): string {
  const styles: string[] = [];
  
  if (node.absoluteBoundingBox) {
    styles.push(`width: ${node.absoluteBoundingBox.width}px;`);
    styles.push(`height: ${node.absoluteBoundingBox.height}px;`);
  }

  if (node.fills && node.fills.length > 0) {
    const fill = node.fills[0];
    if (fill.color) {
      styles.push(`background-color: ${rgbToHex(fill.color.r, fill.color.g, fill.color.b, fill.color.a)};`);
    }
  }

  if (node.strokeWeight) {
    styles.push(`border-width: ${node.strokeWeight}px;`);
    if (node.strokes && node.strokes[0]?.color) {
      const strokeColor = node.strokes[0].color;
      styles.push(`border-color: ${rgbToHex(strokeColor.r, strokeColor.g, strokeColor.b, strokeColor.a)};`);
    }
  }

  if (node.cornerRadius) {
    styles.push(`border-radius: ${node.cornerRadius}px;`);
  }

  let css = '';
  if (styles.length > 0) {
    css = `.${className} {\n  ${styles.join('\n  ')}\n}\n`;
  }

  if (node.children) {
    css += node.children.map((child, index) => generateCSS(child, `${className}-child-${index}`)).join('\n');
  }

  return css;
}

function generateReactComponent(node: FigmaNode): string {
  const classes = generateTailwindClasses(node);
  
  if (node.type === 'TEXT') {
    return `<p className="${classes}">${node.characters || ''}</p>`;
  }
  
  const children = node.children
    ? node.children.map(child => generateReactComponent(child)).join('\n')
    : '';
  
  return `<div className="${classes}">${children}</div>`;
}

// Função principal para converter Figma para código
export async function convertFigmaToCode(node: FigmaNode): Promise<GeneratedCode> {
  try {
    const html = generateHTML(node);
    const css = generateCSS(node, 'figma-root');
    
    return {
      html,
      css
    };
  } catch (error) {
    console.error('Erro ao converter Figma para HTML/CSS:', error);
    return {
      html: '',
      css: ''
    };
  }
}

// Função para gerar código React com Tailwind
export async function convertFigmaToReactTailwind(node: FigmaNode): Promise<string> {
  try {
    const componentCode = generateReactComponent(node);
    return `export default function FigmaComponent() {
  return (
    ${componentCode}
  );
}`;
  } catch (error) {
    console.error('Erro ao converter Figma para React:', error);
    return '';
  }
} 