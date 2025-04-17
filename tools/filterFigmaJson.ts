import fs from 'fs';
import path from 'path';

/**
 * Filtro de propriedades relevantes de nodes Figma para exportação enxuta.
 * Checklist de propriedades em: context/figma-node-properties-checklist.md
 */

// Propriedades por tipo de node
const NODE_PROPERTIES: Record<string, string[]> = {
  FRAME: [
    'id','name','type','visible','absoluteBoundingBox','constraints','layoutMode','primaryAxisAlignItems','counterAxisAlignItems','primaryAxisSizingMode','counterAxisSizingMode','itemSpacing','paddingLeft','paddingRight','paddingTop','paddingBottom','backgroundColor','fills','strokes','strokeWeight','cornerRadius','effects','blendMode','opacity','children','clipsContent','componentId','componentPropertyReferences','overrides'
  ],
  COMPONENT: [
    'id','name','type','visible','absoluteBoundingBox','constraints','layoutMode','primaryAxisAlignItems','counterAxisAlignItems','primaryAxisSizingMode','counterAxisSizingMode','itemSpacing','paddingLeft','paddingRight','paddingTop','paddingBottom','backgroundColor','fills','strokes','strokeWeight','cornerRadius','effects','blendMode','opacity','children','clipsContent','componentId','componentPropertyReferences','overrides'
  ],
  INSTANCE: [
    'id','name','type','visible','absoluteBoundingBox','constraints','layoutMode','primaryAxisAlignItems','counterAxisAlignItems','primaryAxisSizingMode','counterAxisSizingMode','itemSpacing','paddingLeft','paddingRight','paddingTop','paddingBottom','backgroundColor','fills','strokes','strokeWeight','cornerRadius','effects','blendMode','opacity','children','clipsContent','componentId','componentPropertyReferences','overrides'
  ],
  RECTANGLE: [
    'id','name','type','visible','absoluteBoundingBox','constraints','fills','strokes','strokeWeight','cornerRadius','effects','blendMode','opacity','vectorPaths','rotation'
  ],
  VECTOR: [
    'id','name','type','visible','absoluteBoundingBox','constraints','fills','strokes','strokeWeight','cornerRadius','effects','blendMode','opacity','vectorPaths','rotation'
  ],
  ELLIPSE: [
    'id','name','type','visible','absoluteBoundingBox','constraints','fills','strokes','strokeWeight','cornerRadius','effects','blendMode','opacity','vectorPaths','rotation'
  ],
  POLYGON: [
    'id','name','type','visible','absoluteBoundingBox','constraints','fills','strokes','strokeWeight','cornerRadius','effects','blendMode','opacity','vectorPaths','rotation'
  ],
  STAR: [
    'id','name','type','visible','absoluteBoundingBox','constraints','fills','strokes','strokeWeight','cornerRadius','effects','blendMode','opacity','vectorPaths','rotation'
  ],
  LINE: [
    'id','name','type','visible','absoluteBoundingBox','constraints','fills','strokes','strokeWeight','cornerRadius','effects','blendMode','opacity','vectorPaths','rotation'
  ],
  TEXT: [
    'id','name','type','visible','absoluteBoundingBox','constraints','characters','style','fills','strokes','strokeWeight','effects','blendMode','opacity','rotation'
  ],
  GROUP: [
    'id','name','type','visible','absoluteBoundingBox','children'
  ],
  SECTION: [
    'id','name','type','visible','absoluteBoundingBox','children'
  ],
};

const INTERACTION_PROPERTIES = ['reactions','prototypeStartNodeID','transitionNodeID','actions','events'];

function isDefaultValue(key: string, value: any): boolean {
  // Customize this with more defaults as needed
  if (key === 'visible' && value === true) return true;
  if (key === 'opacity' && value === 1) return true;
  if (Array.isArray(value) && value.length === 0) return true;
  return false;
}

function filterNode(node: any): any {
  if (!node || typeof node !== 'object') return node;
  if (node.visible === false) return undefined;
  const type = node.type?.toUpperCase();
  const allowed = NODE_PROPERTIES[type] || [];
  const filtered: Record<string, any> = {};

  for (const key of Object.keys(node)) {
    if (allowed.includes(key) || INTERACTION_PROPERTIES.includes(key)) {
      if (!isDefaultValue(key, node[key])) {
        filtered[key] = node[key];
      }
    }
  }

  // Recursivo para filhos
  if (filtered.children && Array.isArray(filtered.children)) {
    filtered.children = filtered.children
      .map(filterNode)
      .filter(Boolean);
  }

  // Campo customizado para imagem (preencher depois)
  if (['FRAME','COMPONENT'].includes(type)) {
    filtered.imageUrl = null;
  }

  return filtered;
}

// CLI
if (require.main === module) {
  const [,, inputPath, outputPath] = process.argv;
  if (!inputPath || !outputPath) {
    console.error('Uso: ts-node filterFigmaJson.ts <input.json> <output.json>');
    process.exit(1);
  }
  const input = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
  const filtered = filterNode(input);
  fs.writeFileSync(outputPath, JSON.stringify(filtered, null, 2), 'utf8');
  console.log(`Exportação enxuta salva em: ${outputPath}`);
}
