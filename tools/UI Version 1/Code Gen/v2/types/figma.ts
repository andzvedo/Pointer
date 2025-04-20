// Tipos para representar a estrutura de dados do Figma
export interface FigmaNode {
  type: string;
  name: string;
  id: string;
  properties?: {
    isInstance?: boolean;
    componentId?: string;
    constraints?: {
      vertical: string;
      horizontal: string;
    };
    [key: string]: any;
  };
  styles?: {
    width?: number;
    height?: number;
    backgroundColor?: {
      r: number;
      g: number;
      b: number;
      a: number;
    };
    backgroundColorHex?: string;
    border?: {
      width: number;
      style: string;
      color: {
        r: number;
        g: number;
        b: number;
        a: number;
      };
    };
    borderRadius?: number;
    layout?: {
      mode?: string;
      itemSpacing?: number;
      padding?: {
        top?: number;
        right?: number;
        bottom?: number;
        left?: number;
      };
    };
    typography?: {
      fontFamily: string;
      fontSize: number;
      fontWeight: number;
      lineHeight: number;
      letterSpacing?: number;
      textAlign?: string;
      color?: {
        r: number;
        g: number;
        b: number;
        a: number;
      };
    };
    [key: string]: any;
  };
  metadata?: {
    figmaId: string;
    figmaType: string;
    figmaPath: string[];
  };
  children?: FigmaNode[];
}

// Dados extraídos do Figma
export interface ExtractedDesignData {
  nodes: FigmaNode[];
  components: Record<string, string>;
  styles: Record<string, any>;
  tokens: {
    colors: Record<string, string>;
    typography: Record<string, any>;
    spacing: Record<string, number>;
    borderRadius: Record<string, number>;
  };
}
