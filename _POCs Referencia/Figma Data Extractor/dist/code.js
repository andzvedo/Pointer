"use strict";
/// <reference types="@figma/plugin-typings" />
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
console.log("PLUGIN SCRIPT STARTING...");
// Show UI with a specific size
figma.showUI(__html__, {
    width: 600,
    height: 700
});
// Helper function to safely extract node properties with children
function getNodeProperties(node) {
    const properties = {
        id: node.id,
        name: node.name,
        type: node.type,
    };
    // Add common properties if they exist
    if ('visible' in node)
        properties.visible = node.visible;
    if ('opacity' in node)
        properties.opacity = isNotMixed(node.opacity) ? node.opacity : undefined;
    if ('blendMode' in node)
        properties.blendMode = isNotMixed(node.blendMode) ? node.blendMode : undefined;
    if ('effects' in node)
        properties.effects = isNotMixed(node.effects) ? [...node.effects] : undefined;
    if ('effectStyleId' in node)
        properties.effectStyleId = isNotMixed(node.effectStyleId) ? String(node.effectStyleId) : undefined;
    // Add position and size if available
    if ('x' in node)
        properties.x = node.x;
    if ('y' in node)
        properties.y = node.y;
    if ('width' in node)
        properties.width = node.width;
    if ('height' in node)
        properties.height = node.height;
    if ('rotation' in node)
        properties.rotation = isNotMixed(node.rotation) ? node.rotation : undefined;
    // Add fills and strokes if available
    if ('fills' in node)
        properties.fills = isNotMixed(node.fills) ? [...node.fills] : undefined;
    if ('fillStyleId' in node)
        properties.fillStyleId = isNotMixed(node.fillStyleId) ? String(node.fillStyleId) : undefined;
    if ('strokes' in node)
        properties.strokes = isNotMixed(node.strokes) ? [...node.strokes] : undefined;
    if ('strokeStyleId' in node)
        properties.strokeStyleId = isNotMixed(node.strokeStyleId) ? String(node.strokeStyleId) : undefined;
    if ('strokeWeight' in node)
        properties.strokeWeight = isNotMixed(node.strokeWeight) ? node.strokeWeight : undefined;
    if ('strokeAlign' in node)
        properties.strokeAlign = isNotMixed(node.strokeAlign) ? node.strokeAlign : undefined;
    if ('strokeCap' in node)
        properties.strokeCap = isNotMixed(node.strokeCap) ? node.strokeCap : undefined;
    if ('strokeJoin' in node)
        properties.strokeJoin = isNotMixed(node.strokeJoin) ? node.strokeJoin : undefined;
    if ('strokeMiterLimit' in node)
        properties.strokeMiterLimit = isNotMixed(node.strokeMiterLimit) ? node.strokeMiterLimit : undefined;
    if ('dashPattern' in node)
        properties.dashPattern = isNotMixed(node.dashPattern) ? [...node.dashPattern] : undefined;
    // Add corner properties if available
    if ('cornerRadius' in node)
        properties.cornerRadius = isNotMixed(node.cornerRadius) ? node.cornerRadius : undefined;
    if ('cornerSmoothing' in node)
        properties.cornerSmoothing = isNotMixed(node.cornerSmoothing) ? node.cornerSmoothing : undefined;
    // Add text properties if it's a text node
    if (node.type === 'TEXT') {
        if ('characters' in node)
            properties.characters = node.characters;
        if ('fontSize' in node)
            properties.fontSize = isNotMixed(node.fontSize) ? node.fontSize : undefined;
        if ('fontName' in node)
            properties.fontName = isNotMixed(node.fontName) ? node.fontName : undefined;
        if ('textAlignHorizontal' in node)
            properties.textAlignHorizontal = isNotMixed(node.textAlignHorizontal) ? node.textAlignHorizontal : undefined;
        if ('textAlignVertical' in node)
            properties.textAlignVertical = isNotMixed(node.textAlignVertical) ? node.textAlignVertical : undefined;
        if ('textAutoResize' in node)
            properties.textAutoResize = isNotMixed(node.textAutoResize) ? node.textAutoResize : undefined;
        if ('textCase' in node)
            properties.textCase = isNotMixed(node.textCase) ? node.textCase : undefined;
        if ('textDecoration' in node)
            properties.textDecoration = isNotMixed(node.textDecoration) ? node.textDecoration : undefined;
        if ('letterSpacing' in node)
            properties.letterSpacing = isNotMixed(node.letterSpacing) ? node.letterSpacing : undefined;
        if ('lineHeight' in node)
            properties.lineHeight = isNotMixed(node.lineHeight) ? node.lineHeight : undefined;
        if ('paragraphIndent' in node)
            properties.paragraphIndent = isNotMixed(node.paragraphIndent) ? node.paragraphIndent : undefined;
        if ('paragraphSpacing' in node)
            properties.paragraphSpacing = isNotMixed(node.paragraphSpacing) ? node.paragraphSpacing : undefined;
    }
    // Add children if available
    if (hasChildren(node)) {
        const nodeWithChildren = node;
        properties.children = nodeWithChildren.children.map(child => getNodeProperties(child));
    }
    // Add prototype interactions
    properties.interactions = extractPrototypeInteractions(node);
    return properties;
}
// Helper function to check if a value is not figma.mixed
function isNotMixed(value) {
    return value !== figma.mixed;
}
// Helper function to check if a paint is a solid paint
function isSolidPaint(paint) {
    return paint && paint.type === 'SOLID' && 'color' in paint;
}
// Helper function to check if a node has children
function hasChildren(node) {
    return 'children' in node && Array.isArray(node.children);
}
// Helper function to check if a node has a fontName property
function hasFontName(node) {
    return 'fontName' in node &&
        node.fontName !== undefined &&
        node.fontName !== figma.mixed &&
        typeof node.fontName === 'object' &&
        'family' in node.fontName &&
        'style' in node.fontName;
}
// Helper function to check if a node has a letterSpacing property
function hasLetterSpacing(node) {
    return 'letterSpacing' in node &&
        node.letterSpacing !== undefined &&
        node.letterSpacing !== figma.mixed;
}
// Helper function to check if a node has a valid corner radius
function hasValidCornerRadius(node) {
    return 'cornerRadius' in node &&
        node.cornerRadius !== undefined &&
        node.cornerRadius !== figma.mixed;
}
// Helper function to safely check if a node has valid fills
function hasValidFills(node) {
    return 'fills' in node &&
        node.fills !== undefined &&
        isNotMixed(node.fills) &&
        Array.isArray(node.fills) &&
        node.fills.length > 0;
}
// Helper function to safely check if a node has valid strokes
function hasValidStrokes(node) {
    return 'strokes' in node &&
        node.strokes !== undefined &&
        isNotMixed(node.strokes) &&
        Array.isArray(node.strokes) &&
        node.strokes.length > 0 &&
        'strokeWeight' in node &&
        node.strokeWeight !== undefined &&
        isNotMixed(node.strokeWeight);
}
// Helper function to safely check if a node has valid effects
function hasValidEffects(node) {
    return 'effects' in node &&
        node.effects !== undefined &&
        isNotMixed(node.effects) &&
        Array.isArray(node.effects) &&
        node.effects.length > 0;
}
// Helper function to convert color to CSS format
function colorToCSS(color) {
    const r = Math.round(color.r * 255);
    const g = Math.round(color.g * 255);
    const b = Math.round(color.b * 255);
    return `rgba(${r}, ${g}, ${b}, 1)`;
}
// Helper function to safely convert a value to a number
function safeNumber(value) {
    return isNotMixed(value) ? value : 0;
}
// Function to generate CSS code for a node
function generateCSS(node, className = '', includeChildren = false, prefix = '') {
    // Create a CSS class name if not provided
    if (!className) {
        className = node.name.replace(/\s+/g, '-').toLowerCase();
    }
    let css = `${prefix}.${className} {\n`;
    // Add position and size
    if ('x' in node)
        css += `${prefix}  left: ${node.x}px;\n`;
    if ('y' in node)
        css += `${prefix}  top: ${node.y}px;\n`;
    if ('width' in node)
        css += `${prefix}  width: ${node.width}px;\n`;
    if ('height' in node)
        css += `${prefix}  height: ${node.height}px;\n`;
    // Add position
    css += `${prefix}  position: absolute;\n`;
    // Add opacity
    if ('opacity' in node && isNotMixed(node.opacity) && node.opacity < 1) {
        css += `${prefix}  opacity: ${node.opacity};\n`;
    }
    // Border radius
    if (hasValidCornerRadius(node) && node.cornerRadius > 0) {
        css += `${prefix}  border-radius: ${node.cornerRadius}px;\n`;
    }
    // Background color
    if (hasValidFills(node)) {
        const solidFill = node.fills.find(fill => fill.type === 'SOLID');
        if (solidFill && 'color' in solidFill) {
            css += `${prefix}  background-color: ${colorToCSS(solidFill.color)};\n`;
            if (solidFill.opacity !== undefined && solidFill.opacity < 1) {
                css += `${prefix}  opacity: ${solidFill.opacity};\n`;
            }
        }
    }
    // Border
    if (hasValidStrokes(node)) {
        const stroke = node.strokes[0];
        if (isSolidPaint(stroke) && 'color' in stroke) {
            css += `${prefix}  border: ${node.strokeWeight}px solid ${colorToCSS(stroke.color)};\n`;
        }
    }
    // Add text properties if it's a text node
    if (node.type === 'TEXT') {
        if ('fontSize' in node && isNotMixed(node.fontSize)) {
            css += `${prefix}  font-size: ${String(node.fontSize)}px;\n`;
        }
        if (hasFontName(node)) {
            css += `${prefix}  font-family: ${String(node.fontName.family)};\n`;
            css += `${prefix}  font-weight: ${node.fontName.style.includes('Bold') ? 'bold' : 'normal'};\n`;
            css += `${prefix}  font-style: ${node.fontName.style.includes('Italic') ? 'italic' : 'normal'};\n`;
        }
        // Text align
        if ('textAlignHorizontal' in node && isNotMixed(node.textAlignHorizontal)) {
            css += `${prefix}  text-align: ${String(node.textAlignHorizontal).toLowerCase()};\n`;
        }
        if ('lineHeight' in node && isNotMixed(node.lineHeight)) {
            let lineHeight = '';
            if (typeof node.lineHeight === 'object' && 'value' in node.lineHeight) {
                lineHeight = node.lineHeight.value;
                if (node.lineHeight.unit === 'PERCENT') {
                    lineHeight = `${lineHeight}%`;
                }
                else {
                    lineHeight = `${lineHeight}px`;
                }
            }
            else if (typeof node.lineHeight === 'number') {
                lineHeight = `${node.lineHeight}px`;
            }
            if (lineHeight) {
                css += `${prefix}  line-height: ${lineHeight};\n`;
            }
        }
    }
    // Add effects (shadows)
    if (hasValidEffects(node)) {
        const dropShadows = node.effects.filter((effect) => effect.type === 'DROP_SHADOW');
        if (dropShadows.length > 0) {
            const shadowStrings = dropShadows.map((shadow) => {
                if ('offset' in shadow && 'color' in shadow) {
                    return `${shadow.offset.x}px ${shadow.offset.y}px ${shadow.radius}px ${colorToCSS(shadow.color)}`;
                }
                return '';
            }).filter((s) => s.length > 0).join(', ');
            if (shadowStrings) {
                css += `${prefix}  box-shadow: ${shadowStrings};\n`;
            }
        }
    }
    css += `${prefix}}\n\n`;
    // Add CSS for children
    if (includeChildren && hasChildren(node)) {
        const nodeWithChildren = node;
        nodeWithChildren.children.forEach((child) => {
            css += generateCSS(child, child.name, includeChildren, prefix + '  ');
        });
    }
    return css;
}
// Function to generate JavaScript code for a node
function generateJavaScript(node, className, includeChildren = false) {
    let js = '';
    // Create element
    js += `function create${className}() {\n`;
    js += `  const element = document.createElement('div');\n`;
    js += `  element.className = '${className}';\n\n`;
    // Apply styles
    js += `  // Apply styles\n`;
    js += `  const styles = {\n`;
    js += `    position: 'absolute',\n`;
    // Position and size
    if ('x' in node)
        js += `    left: '${node.x}px',\n`;
    if ('y' in node)
        js += `    top: '${node.y}px',\n`;
    if ('width' in node)
        js += `    width: '${node.width}px',\n`;
    if ('height' in node)
        js += `    height: '${node.height}px',\n`;
    // Background color
    if (hasValidFills(node)) {
        const solidFill = node.fills.find(fill => fill.type === 'SOLID');
        if (solidFill && 'color' in solidFill) {
            js += `    backgroundColor: '${colorToCSS(solidFill.color)}',\n`;
            if (solidFill.opacity !== undefined && solidFill.opacity < 1) {
                js += `    opacity: ${solidFill.opacity},\n`;
            }
        }
    }
    // Border
    if (hasValidStrokes(node)) {
        const stroke = node.strokes[0];
        if (isSolidPaint(stroke) && 'color' in stroke) {
            js += `    border: '${node.strokeWeight}px solid ${colorToCSS(stroke.color)}',\n`;
        }
    }
    // Border radius
    if (hasValidCornerRadius(node) && node.cornerRadius > 0) {
        js += `    borderRadius: '${String(node.cornerRadius)}px',\n`;
    }
    // Text properties
    if (node.type === 'TEXT') {
        if ('fontSize' in node && isNotMixed(node.fontSize)) {
            js += `    fontSize: '${String(node.fontSize)}px',\n`;
        }
        if (hasFontName(node)) {
            js += `    fontFamily: '${String(node.fontName.family)}',\n`;
            js += `    fontWeight: '${node.fontName.style.includes('Bold') ? 'bold' : 'normal'}',\n`;
            js += `    fontStyle: '${node.fontName.style.includes('Italic') ? 'italic' : 'normal'}',\n`;
        }
        // Text align
        if ('textAlignHorizontal' in node && isNotMixed(node.textAlignHorizontal)) {
            js += `    textAlign: '${String(node.textAlignHorizontal).toLowerCase()}',\n`;
        }
    }
    // Add effects (shadows)
    if (hasValidEffects(node)) {
        const dropShadows = node.effects.filter((effect) => effect.type === 'DROP_SHADOW');
        if (dropShadows.length > 0) {
            const shadowStrings = dropShadows.map((shadow) => {
                if ('offset' in shadow && 'color' in shadow) {
                    return `${shadow.offset.x}px ${shadow.offset.y}px ${shadow.radius}px ${colorToCSS(shadow.color)}`;
                }
                return '';
            }).filter((s) => s.length > 0).join(', ');
            if (shadowStrings) {
                js += `    boxShadow: '${shadowStrings}',\n`;
            }
        }
    }
    js += `  };\n\n`;
    // Apply styles to element
    js += `  Object.assign(element.style, styles);\n\n`;
    // Add text content if it's a text node
    if (node.type === 'TEXT' && 'characters' in node) {
        js += `  element.textContent = "${String(node.characters).replace(/"/g, '\\"')}";\n`;
    }
    // Add children if available and requested
    if (includeChildren && hasChildren(node)) {
        const nodeWithChildren = node;
        nodeWithChildren.children.forEach((child) => {
            const childVarName = `child${child.id}`;
            const childFuncName = `create${child.name}`;
            js += `  const ${childVarName} = ${childFuncName}();\n`;
            js += `  element.appendChild(${childVarName});\n`;
        });
    }
    js += `  return element;\n`;
    js += `}\n\n`;
    // Add child function definitions
    if (includeChildren && hasChildren(node)) {
        const nodeWithChildren = node;
        nodeWithChildren.children.forEach(child => {
            js += generateJavaScript(child, child.name, includeChildren);
        });
    }
    return js;
}
// Generate HTML from node
function generateHTML(node, includeChildren = false, indentLevel = 0) {
    const indent = '  '.repeat(indentLevel);
    let html = '';
    // Create element based on node type
    let tagName = 'div';
    let content = '';
    if (node.type === 'TEXT' && 'characters' in node) {
        content = node.characters;
        // If it's a short text, use span instead of div
        if (content.length < 100) {
            tagName = 'span';
        }
    }
    // Generate a class name based on node name
    const className = node.name.replace(/\s+/g, '-').toLowerCase();
    // Start building the HTML element
    html += `${indent}<${tagName} class="${String(className)}"`;
    // Add inline style
    let style = '';
    // Position and size
    if ('x' in node)
        style += `left: ${Math.round(safeNumber(node.x))}px; `;
    if ('y' in node)
        style += `top: ${Math.round(safeNumber(node.y))}px; `;
    if ('width' in node)
        style += `width: ${Math.round(safeNumber(node.width))}px; `;
    if ('height' in node)
        style += `height: ${Math.round(safeNumber(node.height))}px; `;
    // Position
    style += `position: absolute; `;
    // Opacity
    if ('opacity' in node && isNotMixed(node.opacity) && node.opacity !== 1) {
        style += `opacity: ${node.opacity}; `;
    }
    // Border radius
    if (hasValidCornerRadius(node) && node.cornerRadius > 0) {
        style += `border-radius: ${node.cornerRadius}px; `;
    }
    // Background color (from fills)
    if ('fills' in node && isNotMixed(node.fills) && node.fills.length > 0) {
        const solidFill = node.fills.find((fill) => fill.type === 'SOLID');
        if (solidFill && 'color' in solidFill) {
            style += `background-color: ${colorToCSS(solidFill.color)}; `;
        }
    }
    // Border (from strokes)
    if ('strokes' in node && isNotMixed(node.strokes) && node.strokes.length > 0 && 'strokeWeight' in node && isNotMixed(node.strokeWeight)) {
        const solidStroke = node.strokes.find((fill) => fill.type === 'SOLID');
        if (solidStroke && 'color' in solidStroke) {
            style += `border: ${node.strokeWeight}px solid ${colorToCSS(solidStroke.color)}; `;
        }
    }
    // Text properties
    if (node.type === 'TEXT') {
        if ('fontSize' in node && isNotMixed(node.fontSize)) {
            style += `font-size: ${String(node.fontSize)}px; `;
        }
        if (hasFontName(node)) {
            style += `font-family: ${String(node.fontName.family)}; `;
            style += `font-weight: ${node.fontName.style.includes('Bold') ? 'bold' : 'normal'}; `;
            style += `font-style: ${node.fontName.style.includes('Italic') ? 'italic' : 'normal'}; `;
        }
        if (hasLetterSpacing(node)) {
            const spacing = typeof node.letterSpacing === 'number'
                ? node.letterSpacing
                : node.letterSpacing.value;
            style += `letter-spacing: ${spacing}px; `;
        }
    }
    // Effects (shadows)
    if ('effects' in node && node.effects) {
        const dropShadows = node.effects.filter((effect) => effect.type === 'DROP_SHADOW');
        if (dropShadows.length > 0) {
            const shadowStrings = dropShadows.map((shadow) => {
                return `${shadow.offset.x}px ${shadow.offset.y}px ${shadow.radius}px ${colorToCSS(shadow.color)}`;
            });
            style += `box-shadow: ${shadowStrings.join(', ')}; `;
        }
    }
    // Create HTML element based on node type
    if (node.type === 'TEXT' && 'characters' in node) {
        html += ` style="${style}">\n`;
        html += `${indent}  ${String(node.characters)}\n`;
        html += `${indent}</${tagName}>`;
    }
    else if (includeChildren && hasChildren(node)) {
        html += ` style="${style}">\n`;
        // Add children
        node.children.forEach(child => {
            html += generateHTML(child, includeChildren, indentLevel + 1);
        });
        html += `${indent}</${tagName}>`;
    }
    else {
        html += ` style="${style}"></${tagName}>`;
    }
    return html;
}
// Extract prototype interactions
function extractPrototypeInteractions(node) {
    const interactions = [];
    if ('reactions' in node && node.reactions) {
        node.reactions.forEach(reaction => {
            var _a;
            if (reaction.action && reaction.action.type === 'NODE') {
                interactions.push({
                    sourceNodeId: node.id,
                    sourceNodeName: node.name,
                    targetNodeId: reaction.action.destinationId || '',
                    targetNodeName: '', // Will be populated later
                    trigger: ((_a = reaction.trigger) === null || _a === void 0 ? void 0 : _a.type) || 'UNKNOWN',
                    action: 'NAVIGATE'
                });
            }
        });
    }
    // Recursively extract interactions from children
    if (hasChildren(node)) {
        const nodeWithChildren = node;
        nodeWithChildren.children.forEach(child => {
            const childInteractions = extractPrototypeInteractions(child);
            interactions.push(...childInteractions);
        });
    }
    return interactions;
}
// Register Codegen handlers if available
if ('codegen' in figma) {
    // Use type assertion to avoid TypeScript errors
    const codegen = figma.codegen;
    codegen.on('generate', (event) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const suggestions = getCodeSuggestions(event.node);
            const suggestion = suggestions.find((s) => s.language === event.language);
            if (suggestion) {
                return suggestion.code;
            }
            else {
                // Fall back to custom generator
                return generateCustomCode(event.node, event.language);
            }
        }
        catch (error) {
            console.error('Codegen error:', error instanceof Error ? error.message : String(error));
            return generateCustomCode(event.node, event.language);
        }
    }));
}
// Custom code generator for fallback
function generateCustomCode(node, language) {
    switch (language) {
        case 'css':
            return generateCSS(node, node.name);
        case 'html':
            return generateHTML(node);
        case 'javascript':
            return generateJavaScript(node, node.name);
        default:
            return `// Unsupported language: ${language}`;
    }
}
// Function to get code suggestions for a node
function getCodeSuggestions(node) {
    try {
        // Using a more general approach since getSuggestions might not be available
        if ('codegen' in figma && typeof figma.codegen === 'object' && figma.codegen !== null) {
            const codegen = figma.codegen;
            if (typeof codegen.getSuggestions === 'function') {
                return codegen.getSuggestions([node]);
            }
        }
        return [];
    }
    catch (error) {
        console.error('Error getting code suggestions:', error instanceof Error ? error.message : String(error));
        return [];
    }
}
// Helper function to filter out empty strings
function filterEmptyStrings(items) {
    return items.filter((s) => s.length > 0);
}
// Handle messages from the UI
figma.ui.onmessage = (msg) => {
    console.log("Message received from UI:", msg);
    if (msg.type === 'extract-data') {
        const nodes = figma.currentPage.selection;
        if (nodes.length === 0) {
            figma.ui.postMessage({
                type: 'error',
                message: 'No nodes selected. Please select at least one node.'
            });
            return;
        }
        try {
            // Extract all properties from each node, including children
            const data = nodes.map(node => getNodeProperties(node));
            // Send data back to UI
            figma.ui.postMessage({
                type: 'extracted-data',
                data: data
            });
        }
        catch (error) {
            console.error('Error extracting data:', error instanceof Error ? error.message : String(error));
            figma.ui.postMessage({
                type: 'error',
                message: error instanceof Error ? error.message : String(error)
            });
        }
    }
    else if (msg.type === 'generate-code') {
        const nodes = figma.currentPage.selection;
        if (nodes.length === 0) {
            figma.ui.postMessage({
                type: 'error',
                message: 'No nodes selected. Please select at least one node.'
            });
            return;
        }
        try {
            // Generate code for each node
            const cssCode = nodes.map(node => generateCSS(node, node.name.replace(/\s+/g, '-').toLowerCase())).join('\n');
            const jsCode = nodes.map(node => generateJavaScript(node, node.name.replace(/\s+/g, '-').toLowerCase())).join('\n');
            const htmlCode = nodes.map(node => generateHTML(node)).join('\n');
            // Send generated code back to UI
            figma.ui.postMessage({
                type: 'generated-code',
                css: cssCode,
                js: jsCode,
                html: htmlCode
            });
        }
        catch (error) {
            console.error('Error generating code:', error instanceof Error ? error.message : String(error));
            figma.ui.postMessage({
                type: 'error',
                message: 'Error generating code: ' + (error instanceof Error ? error.message : String(error))
            });
        }
    }
    else if (msg.type === 'generate-custom-code') {
        try {
            const nodes = figma.currentPage.selection;
            const generatedCode = nodes.map(node => generateCustomCode(node, msg.language)).join('\n\n');
            // Send generated code back to UI
            figma.ui.postMessage({
                type: 'code-generated',
                code: generatedCode,
                language: msg.language
            });
        }
        catch (error) {
            console.error("Error generating code:", error instanceof Error ? error.message : String(error));
            figma.ui.postMessage({
                type: 'error',
                message: "Error generating code: " + (error instanceof Error ? error.message : String(error))
            });
        }
    }
};
