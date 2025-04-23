// Utilitário para filtrar nodes do Figma
export const NODE_PROPERTIES: Record<string, string[]> = {
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

export const INTERACTION_PROPERTIES = ['reactions','prototypeStartNodeID','transitionNodeID','actions','events'];

export function isDefaultValue(key: string, value: any): boolean {
  if (key === 'visible' && value === true) return true;
  if (key === 'opacity' && value === 1) return true;
  if (Array.isArray(value) && value.length === 0) return true;
  return false;
}

export function filterNode(node: any): any {
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

  if (filtered.children && Array.isArray(filtered.children)) {
    filtered.children = filtered.children
      .map(filterNode)
      .filter(Boolean);
  }
  if (["FRAME","COMPONENT"].includes(type)) {
    filtered.imageUrl = null;
  }
  return filtered;
}
