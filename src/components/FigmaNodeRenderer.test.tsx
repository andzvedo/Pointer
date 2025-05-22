import { figmaColorToCss, getBackgroundColor } from './FigmaNodeRenderer';

describe('FigmaNodeRenderer Utilities', () => {
  describe('figmaColorToCss', () => {
    it('should convert a valid Figma color object to rgba string', () => {
      expect(figmaColorToCss({ r: 0.2, g: 0.4, b: 0.6, a: 0.8 })).toBe('rgba(51, 102, 153, 0.8)');
    });

    it('should convert a Figma color with RGB values as 0', () => {
      expect(figmaColorToCss({ r: 0, g: 0, b: 0, a: 1 })).toBe('rgba(0, 0, 0, 1)');
    });

    it('should convert a Figma color with RGB values as 1', () => {
      expect(figmaColorToCss({ r: 1, g: 1, b: 1, a: 0.5 })).toBe('rgba(255, 255, 255, 0.5)');
    });

    it('should return "transparent" for undefined input', () => {
      expect(figmaColorToCss(undefined)).toBe('transparent');
    });

    it('should handle alpha value of 0', () => {
      expect(figmaColorToCss({ r: 0.5, g: 0.5, b: 0.5, a: 0 })).toBe('rgba(128, 128, 128, 0)');
    });
    
    it('should correctly round color values', () => {
      // g: 0.54321 * 255 = 138.51855, which rounds to 139.
      expect(figmaColorToCss({ r: 0.12345, g: 0.54321, b: 0.98765, a: 1 })).toBe('rgba(31, 139, 252, 1)');
    });
  });

  describe('getBackgroundColor', () => {
    const redColor = { r: 1, g: 0, b: 0, a: 1 };
    const blueColor = { r: 0, g: 0, b: 1, a: 1 };

    it('should return the color of a valid SOLID fill', () => {
      const fills = [{ type: 'SOLID', color: redColor }];
      expect(getBackgroundColor(fills)).toBe('rgba(255, 0, 0, 1)');
    });

    it('should return "transparent" for an empty fills array', () => {
      expect(getBackgroundColor([])).toBe('transparent');
    });

    it('should return "transparent" for undefined fills input', () => {
      expect(getBackgroundColor(undefined)).toBe('transparent');
    });

    it('should return "transparent" if no SOLID fill is present', () => {
      const fills = [{ type: 'GRADIENT_LINEAR', gradientStops: [] }];
      expect(getBackgroundColor(fills)).toBe('transparent');
    });

    it('should return "transparent" if SOLID fill has no color property', () => {
      const fills = [{ type: 'SOLID' }];
      // Type assertion to bypass strict type checking for test case
      expect(getBackgroundColor(fills as any)).toBe('transparent');
    });
    
    it('should return "transparent" if SOLID fill has undefined color property', () => {
      const fills = [{ type: 'SOLID', color: undefined }];
      // Type assertion to bypass strict type checking for test case
      expect(getBackgroundColor(fills as any)).toBe('transparent');
    });

    it('should use the first SOLID fill if multiple fills are present', () => {
      const fills = [
        { type: 'GRADIENT_LINEAR', gradientStops: [] },
        { type: 'SOLID', color: redColor },
        { type: 'SOLID', color: blueColor },
      ];
      expect(getBackgroundColor(fills)).toBe('rgba(255, 0, 0, 1)');
    });

    it('should use the first SOLID fill even if it is not the first in the array', () => {
        const fills = [
            { type: 'GRADIENT_LINEAR', gradientStops: [] },
            { type: 'SOLID', color: redColor },
            { type: 'IMAGE', src: 'image.png'}
        ];
        expect(getBackgroundColor(fills)).toBe('rgba(255, 0, 0, 1)');
    });
  });
});
