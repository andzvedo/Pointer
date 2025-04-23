"use strict";
var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));

// code.ts
async function extractStyles(node) {
  var _a, _b, _c, _d, _e;
  const styles = {};
  if (node.width !== void 0) styles.width = Math.round(node.width);
  if (node.height !== void 0) styles.height = Math.round(node.height);
  if (node.x !== void 0) styles.x = Math.round(node.x);
  if (node.y !== void 0) styles.y = Math.round(node.y);
  if ("fills" in node && node.fills !== figma.mixed && Array.isArray(node.fills) && node.fills.length > 0) {
    const fill = node.fills[0];
    if (fill.type === "SOLID") {
      styles.backgroundColor = {
        r: Math.round(fill.color.r * 255),
        g: Math.round(fill.color.g * 255),
        b: Math.round(fill.color.b * 255),
        a: (_a = fill.opacity) != null ? _a : 1
        // Usar fill.opacity se disponível, senão 1
      };
      const toHex = (n) => {
        const hex = Math.round(n).toString(16);
        return hex.length === 1 ? "0" + hex : hex;
      };
      const r = toHex(styles.backgroundColor.r);
      const g = toHex(styles.backgroundColor.g);
      const b = toHex(styles.backgroundColor.b);
      const a = ((_b = styles.backgroundColor.a) != null ? _b : 1) < 1 ? toHex(Math.round(((_c = styles.backgroundColor.a) != null ? _c : 1) * 255)) : "";
      styles.backgroundColorHex = `#${r}${g}${b}${a}`;
    } else if (fill.type === "GRADIENT_LINEAR" || fill.type === "GRADIENT_RADIAL" || fill.type === "GRADIENT_ANGULAR" || fill.type === "GRADIENT_DIAMOND") {
      styles.backgroundGradient = {
        type: fill.type.replace("GRADIENT_", "").toLowerCase(),
        gradientTransform: fill.gradientTransform,
        stops: fill.gradientStops.map((stop) => {
          var _a2;
          return {
            position: stop.position,
            color: {
              r: Math.round(stop.color.r * 255),
              g: Math.round(stop.color.g * 255),
              b: Math.round(stop.color.b * 255),
              a: (_a2 = stop.color.a) != null ? _a2 : 1
            }
          };
        })
      };
    }
  }
  if ("strokes" in node && Array.isArray(node.strokes) && node.strokes.length > 0) {
    if (node.strokeWeight !== figma.mixed && node.strokeWeight > 0) {
      const strokePaint = node.strokes[0];
      styles.border = {
        width: node.strokeWeight,
        style: node.strokeAlign,
        // strokeAlign existe
        color: strokePaint.color ? {
          r: Math.round(strokePaint.color.r * 255),
          g: Math.round(strokePaint.color.g * 255),
          b: Math.round(strokePaint.color.b * 255),
          a: (_d = strokePaint.opacity) != null ? _d : 1
          // Usar opacidade da paint
        } : void 0
        // Propriedades adicionais úteis da API:
        // cap: node.strokeCap,
        // join: node.strokeJoin,
        // dashes: node.strokeDashes,
      };
    }
  }
  if ("cornerRadius" in node && typeof node.cornerRadius === "number") {
    styles.borderRadius = node.cornerRadius;
  } else if ("topLeftRadius" in node) {
    styles.borderRadius = {
      topLeft: node.topLeftRadius,
      topRight: node.topRightRadius,
      bottomLeft: node.bottomLeftRadius,
      bottomRight: node.bottomRightRadius
    };
  }
  if ("effects" in node && Array.isArray(node.effects) && node.effects.length > 0) {
    styles.effects = node.effects.map((effect) => {
      var _a2;
      if ((effect.type === "DROP_SHADOW" || effect.type === "INNER_SHADOW") && effect.visible !== false) {
        return {
          type: effect.type === "DROP_SHADOW" ? "dropShadow" : "innerShadow",
          color: effect.color ? {
            r: Math.round(effect.color.r * 255),
            g: Math.round(effect.color.g * 255),
            b: Math.round(effect.color.b * 255),
            a: (_a2 = effect.color.a) != null ? _a2 : 1
          } : void 0,
          offset: effect.offset,
          radius: effect.radius,
          spread: effect.spread || 0
        };
      }
      return null;
    }).filter(Boolean);
  }
  if ("opacity" in node && typeof node.opacity === "number") {
    styles.opacity = node.opacity;
  }
  if (node.type === "TEXT") {
    if (typeof node.fontName !== "symbol") {
      await figma.loadFontAsync(node.fontName);
      styles.typography = styles.typography || {};
      styles.typography.fontFamily = node.fontName.family;
    } else {
      if (node.getStyledTextSegments && typeof node.getStyledTextSegments === "function") {
        const segments = node.getStyledTextSegments(["fontName"]);
        for (const segment of segments) {
          if (typeof segment.fontName !== "symbol") {
            await figma.loadFontAsync(segment.fontName);
          }
        }
      }
    }
    styles.typography = styles.typography || {};
    if (typeof node.fontSize === "number") styles.typography.fontSize = node.fontSize;
    if (typeof node.fontWeight === "number") styles.typography.fontWeight = node.fontWeight;
    if (typeof node.lineHeight !== "symbol") styles.typography.lineHeight = node.lineHeight;
    if (typeof node.letterSpacing !== "symbol") styles.typography.letterSpacing = node.letterSpacing;
    if (typeof node.textAlignHorizontal !== "symbol") styles.typography.textAlign = node.textAlignHorizontal;
    if (typeof node.textAlignVertical !== "symbol") styles.typography.verticalAlign = node.textAlignVertical;
    if (typeof node.textCase !== "symbol") styles.typography.textCase = node.textCase;
    if (typeof node.textDecoration !== "symbol") styles.typography.textDecoration = node.textDecoration;
    if ("fills" in node && node.fills !== figma.mixed && Array.isArray(node.fills) && node.fills.length > 0) {
      const textFill = node.fills[0];
      if (textFill.type === "SOLID") {
        styles.typography.color = {
          r: Math.round(textFill.color.r * 255),
          g: Math.round(textFill.color.g * 255),
          b: Math.round(textFill.color.b * 255),
          a: (_e = textFill.opacity) != null ? _e : 1
        };
      }
    }
  }
  if ("layoutMode" in node && node.layoutMode !== "NONE") {
    styles.layout = {
      mode: node.layoutMode,
      // HORIZONTAL | VERTICAL
      primaryAxisAlignItems: node.primaryAxisAlignItems,
      // MIN | MAX | CENTER | SPACE_BETWEEN
      counterAxisAlignItems: node.counterAxisAlignItems,
      // MIN | MAX | CENTER | BASELINE
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
    Object.entries(styles).filter(([_, v]) => v !== void 0 && v !== null)
  );
}
function extractProperties(node) {
  const properties = {};
  if (node.type === "TEXT") {
    properties.text = node.characters;
  }
  if (node.type === "INSTANCE") {
    properties.isInstance = true;
    if (node.mainComponent) {
      properties.componentId = node.mainComponent.id;
      properties.componentName = node.mainComponent.name;
      try {
        properties.componentProperties = node.componentProperties;
      } catch (error) {
        console.warn(`Erro ao acessar componentProperties do nó ${node.id}: ${error.message}`);
        properties.componentPropertiesError = error.message;
      }
    }
  } else if (node.type === "COMPONENT") {
    properties.isComponent = true;
    properties.componentName = node.name;
  } else if (node.type === "COMPONENT_SET") {
    properties.isComponentSet = true;
    properties.componentSetName = node.name;
    properties.variantGroupProperties = node.variantGroupProperties;
  }
  properties.visible = node.visible;
  if ("constraints" in node) {
    properties.constraints = node.constraints;
  }
  properties.suggestedClassName = node.name.replace(/[^a-zA-Z0-9_-]/g, "-").toLowerCase();
  if ("description" in node && node.description) {
    properties.description = node.description;
  }
  properties.locked = node.locked;
  if ("isMask" in node) {
    properties.isMask = node.isMask;
  }
  if ("exportSettings" in node) {
    properties.exportSettings = node.exportSettings;
  }
  return Object.fromEntries(
    Object.entries(properties).filter(([_, v]) => v !== void 0)
  );
}
function extractVectorData(node) {
  if (node.type !== "VECTOR") {
    return null;
  }
  const vectorData = {
    // Armazenar a representação da rede vetorial crua
    // A conversão para SVG path data precisará ser feita posteriormente
    network: node.vectorNetwork || null,
    // Pega a rede vetorial
    vectorPaths: node.vectorPaths || null,
    // Pega paths SVG se existirem (menos comum)
    // Estilos são aplicados ao nó VectorNode diretamente
    fillStyles: [],
    strokeStyles: [],
    strokeProperties: null
  };
  if (node.fills !== figma.mixed && Array.isArray(node.fills) && node.fills.length > 0) {
    vectorData.fillStyles = node.fills.map((fill) => {
      const baseStyle = {
        type: fill.type,
        visible: fill.visible !== false,
        // Default true
        opacity: "opacity" in fill ? fill.opacity : 1
        // Default 1
      };
      if (fill.type === "SOLID") {
        const solidFill = fill;
        return __spreadProps(__spreadValues({}, baseStyle), {
          color: {
            r: Math.round(solidFill.color.r * 255),
            g: Math.round(solidFill.color.g * 255),
            b: Math.round(solidFill.color.b * 255),
            a: baseStyle.opacity
            // Usa a opacidade do paint
          }
        });
      } else if (fill.type.startsWith("GRADIENT")) {
        const gradientFill = fill;
        return __spreadProps(__spreadValues({}, baseStyle), {
          gradientTransform: gradientFill.gradientTransform,
          gradientStops: gradientFill.gradientStops.map((stop) => {
            var _a;
            return {
              // Tipo inferido
              position: stop.position,
              color: {
                r: Math.round(stop.color.r * 255),
                g: Math.round(stop.color.g * 255),
                b: Math.round(stop.color.b * 255),
                a: (_a = stop.color.a) != null ? _a : 1
              }
            };
          })
        });
      }
      return baseStyle;
    });
  }
  if (Array.isArray(node.strokes) && node.strokes.length > 0) {
    vectorData.strokeStyles = node.strokes.map((stroke) => {
      const baseStyle = {
        type: stroke.type,
        visible: stroke.visible !== false,
        opacity: "opacity" in stroke ? stroke.opacity : 1
      };
      if (stroke.type === "SOLID") {
        const solidStroke = stroke;
        return __spreadProps(__spreadValues({}, baseStyle), {
          color: {
            r: Math.round(solidStroke.color.r * 255),
            g: Math.round(solidStroke.color.g * 255),
            b: Math.round(solidStroke.color.b * 255),
            a: baseStyle.opacity
          }
        });
      }
      return baseStyle;
    });
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
  return vectorData.network || vectorData.vectorPaths || vectorData.fillStyles.length > 0 || vectorData.strokeStyles.length > 0 ? vectorData : null;
}
async function convertNodeToAst(node, parentPath = []) {
  const currentPath = [...parentPath, node.name];
  const styles = await extractStyles(node);
  const properties = extractProperties(node);
  const vectorData = extractVectorData(node);
  const astNode = {
    type: node.type.toLowerCase(),
    name: node.name,
    id: node.id,
    properties,
    styles,
    metadata: {
      figmaId: node.id,
      figmaType: node.type,
      figmaPath: currentPath
    }
  };
  if (vectorData) {
    astNode.vector = vectorData;
  }
  if ("children" in node) {
    const childrenPromises = node.children.map(
      (child) => (
        // child é SceneNode aqui
        convertNodeToAst(child, currentPath)
      )
      // Chamada recursiva async
    );
    astNode.children = await Promise.all(childrenPromises);
  }
  return astNode;
}
async function main() {
  figma.showUI(__html__, { width: 340, height: 480 });
  figma.ui.onmessage = async (msg) => {
    if (msg.type === "processSelection") {
      console.log("Plugin: Processando sele\xE7\xE3o...");
      const selection = figma.currentPage.selection;
      if (selection.length === 0) {
        figma.notify("Selecione pelo menos um elemento.", { timeout: 2e3 });
        figma.ui.postMessage({ type: "astGenerated", payload: { status: "Nenhum elemento selecionado." } });
        return;
      }

      console.log("Seleção atual:", selection);

      selection.forEach((node, index) => {
        console.log(`Processando nó [${index}]:`, node);
        // Aqui você pode validar o tipo:
        if (node.type !== 'FRAME') {
          console.warn(`Nó não suportado: ${node.type}`);
        }
      });
      
      try {
        figma.notify(`Processando ${selection.length} elemento(s)...`, { timeout: 1e3 });
        const processedNodes = [];
        
        for (const node of selection) {
          try {
            // lógica de processamento
            const astNode = await convertNodeToAst(node, [figma.currentPage.name]);
            processedNodes.push(astNode);
          } catch (e) {
            console.error("Erro ao processar nó", node.id, e);
            figma.notify("Erro ao processar um item da seleção. Veja o console.");
          }
        }

        const finalAst = {
          version: "1.0",
          source: "figma",
          name: figma.root.name,
          // Nome do arquivo Figma
          // Criar um nó raiz simulado para conter os nós processados
          rootNode: {
            type: "selection-root",
            name: "Processed Selection",
            id: "selection-root-id",
            properties: { nodeCount: processedNodes.length },
            styles: {},
            children: processedNodes,
            metadata: {
              figmaId: "selection",
              figmaType: "SELECTION",
              figmaPath: [figma.root.name, figma.currentPage.name, "Selection"]
            }
          },
          metadata: {
            generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
            figmaFileKey: figma.fileKey,
            // Disponível na API do plugin
            figmaFileName: figma.root.name
          }
        };
        console.log("Plugin: AST final gerada:", finalAst);
        figma.ui.postMessage({ type: "astGenerated", payload: finalAst });
      } catch (error) {
        console.error("Erro geral ao processar sele\xE7\xE3o:", error);
        figma.notify("Erro geral ao processar a sele\xE7\xE3o. Verifique o console.", { error: true });
        figma.ui.postMessage({ type: "astGenerated", payload: { error: "Erro no processamento." } });
      }
    } else if (msg.type === "getInitialData") {
      figma.ui.postMessage({ type: "initialData", payload: { status: "Plugin pronto" } });
    }
  };
  console.log("Plugin Core (code.ts) inicializado e pronto.");
}
main().catch((err) => console.error(err));
