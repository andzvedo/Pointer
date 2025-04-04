// Show UI
figma.showUI(__html__, { width: 600, height: 700 });

// Helper function to safely extract node properties with children
function getNodeProperties(node, includeChildren = true, depth = 0, maxDepth = 10) {
  // Prevent infinite recursion
  if (depth > maxDepth) {
    return { 
      id: node.id, 
      name: node.name, 
      type: node.type,
      maxDepthReached: true
    };
  }
  
  // Start with basic properties every node has
  const properties = {
    id: node.id,
    name: node.name,
    type: node.type,
    visible: node.visible,
    locked: node.locked
  };
  
  // Add bounding box if available
  if (node.absoluteBoundingBox) {
    properties.absoluteBoundingBox = node.absoluteBoundingBox;
  }
  
  // Add size properties if available
  if ('width' in node) properties.width = node.width;
  if ('height' in node) properties.height = node.height;
  if ('x' in node) properties.x = node.x;
  if ('y' in node) properties.y = node.y;
  if ('rotation' in node) properties.rotation = node.rotation;
  
  // Add parent info if available
  if (node.parent) {
    properties.parent = {
      id: node.parent.id,
      type: node.parent.type,
      name: node.parent.name
    };
  }
  
  // Add style properties
  if ('fills' in node) properties.fills = node.fills;
  if ('strokes' in node) properties.strokes = node.strokes;
  if ('strokeWeight' in node) properties.strokeWeight = node.strokeWeight;
  if ('strokeAlign' in node) properties.strokeAlign = node.strokeAlign;
  if ('strokeCap' in node) properties.strokeCap = node.strokeCap;
  if ('strokeJoin' in node) properties.strokeJoin = node.strokeJoin;
  if ('strokeMiterLimit' in node) properties.strokeMiterLimit = node.strokeMiterLimit;
  if ('strokeDashes' in node) properties.strokeDashes = node.strokeDashes;
  if ('cornerRadius' in node) properties.cornerRadius = node.cornerRadius;
  if ('cornerSmoothing' in node) properties.cornerSmoothing = node.cornerSmoothing;
  
  // Add effects
  if ('effects' in node) properties.effects = node.effects;
  
  // Add blend mode
  if ('blendMode' in node) properties.blendMode = node.blendMode;
  if ('opacity' in node) properties.opacity = node.opacity;
  
  // Add layout properties
  if ('layoutMode' in node) properties.layoutMode = node.layoutMode;
  if ('layoutAlign' in node) properties.layoutAlign = node.layoutAlign;
  if ('layoutGrow' in node) properties.layoutGrow = node.layoutGrow;
  if ('primaryAxisSizingMode' in node) properties.primaryAxisSizingMode = node.primaryAxisSizingMode;
  if ('counterAxisSizingMode' in node) properties.counterAxisSizingMode = node.counterAxisSizingMode;
  if ('primaryAxisAlignItems' in node) properties.primaryAxisAlignItems = node.primaryAxisAlignItems;
  if ('counterAxisAlignItems' in node) properties.counterAxisAlignItems = node.counterAxisAlignItems;
  if ('paddingLeft' in node) properties.paddingLeft = node.paddingLeft;
  if ('paddingRight' in node) properties.paddingRight = node.paddingRight;
  if ('paddingTop' in node) properties.paddingTop = node.paddingTop;
  if ('paddingBottom' in node) properties.paddingBottom = node.paddingBottom;
  if ('itemSpacing' in node) properties.itemSpacing = node.itemSpacing;
  
  // Add text-specific properties
  if ('characters' in node) properties.characters = node.characters;
  if ('fontSize' in node) properties.fontSize = node.fontSize;
  if ('fontName' in node) properties.fontName = node.fontName;
  if ('textAlignHorizontal' in node) properties.textAlignHorizontal = node.textAlignHorizontal;
  if ('textAlignVertical' in node) properties.textAlignVertical = node.textAlignVertical;
  if ('textAutoResize' in node) properties.textAutoResize = node.textAutoResize;
  if ('paragraphIndent' in node) properties.paragraphIndent = node.paragraphIndent;
  if ('paragraphSpacing' in node) properties.paragraphSpacing = node.paragraphSpacing;
  if ('letterSpacing' in node) properties.letterSpacing = node.letterSpacing;
  if ('lineHeight' in node) properties.lineHeight = node.lineHeight;
  if ('textCase' in node) properties.textCase = node.textCase;
  if ('textDecoration' in node) properties.textDecoration = node.textDecoration;
  
  // Add component properties
  if ('componentId' in node) properties.componentId = node.componentId;
  if ('componentProperties' in node) properties.componentProperties = node.componentProperties;
  if ('componentPropertyReferences' in node) properties.componentPropertyReferences = node.componentPropertyReferences;
  if ('variantProperties' in node) properties.variantProperties = node.variantProperties;
  
  // Add instance properties
  if ('mainComponent' in node && node.mainComponent) {
    properties.mainComponent = {
      id: node.mainComponent.id,
      name: node.mainComponent.name
    };
  }
  
  // Add constraints
  if ('constraints' in node) properties.constraints = node.constraints;
  
  // Add export settings
  if ('exportSettings' in node) properties.exportSettings = node.exportSettings;
  
  // Add reactions if available
  if ('reactions' in node) properties.reactions = node.reactions;
  
  // Add shared properties
  if ('sharedPluginData' in node) {
    try {
      properties.sharedPluginData = node.sharedPluginData;
    } catch (e) {
      properties.sharedPluginDataError = e.message;
    }
  }
  
  // Add plugin data
  if ('getPluginData' in node) {
    try {
      properties.pluginData = {
        keys: node.getPluginDataKeys()
      };
    } catch (e) {
      properties.pluginDataError = e.message;
    }
  }
  
  // Add children recursively if available and requested
  if (includeChildren && 'children' in node && node.children) {
    properties.children = node.children.map(child => 
      getNodeProperties(child, includeChildren, depth + 1, maxDepth)
    );
  } else if ('children' in node && node.children) {
    // Just add children count if not including full children data
    properties.childrenCount = node.children.length;
    properties.childrenTypes = node.children.map(child => child.type);
  }
  
  return properties;
}

// Generate CSS from node properties
function generateCSS(node, includeChildren = true, prefix = '') {
  if (!node) return '';
  
  let css = `${prefix}/* CSS for ${node.name} (${node.type}) */\n`;
  const className = node.name.replace(/\s+/g, '-').toLowerCase();
  css += `${prefix}.${className} {\n`;
  
  // Width and height
  if ('width' in node) css += `${prefix}  width: ${Math.round(node.width)}px;\n`;
  if ('height' in node) css += `${prefix}  height: ${Math.round(node.height)}px;\n`;
  
  // Position
  if ('x' in node) css += `${prefix}  left: ${Math.round(node.x)}px;\n`;
  if ('y' in node) css += `${prefix}  top: ${Math.round(node.y)}px;\n`;
  
  // Opacity
  if ('opacity' in node && node.opacity !== 1) {
    css += `${prefix}  opacity: ${node.opacity};\n`;
  }
  
  // Rotation
  if ('rotation' in node && node.rotation !== 0) {
    css += `${prefix}  transform: rotate(${node.rotation}deg);\n`;
  }
  
  // Border radius
  if ('cornerRadius' in node && node.cornerRadius > 0) {
    css += `${prefix}  border-radius: ${node.cornerRadius}px;\n`;
  }
  
  // Background color (from fills)
  if ('fills' in node && node.fills && node.fills.length > 0) {
    const solidFill = node.fills.find(fill => fill.type === 'SOLID' && fill.visible !== false);
    if (solidFill) {
      const { r, g, b, a } = solidFill.color;
      const rgba = `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${a})`;
      css += `${prefix}  background-color: ${rgba};\n`;
    }
  }
  
  // Border (from strokes)
  if ('strokes' in node && node.strokes && node.strokes.length > 0 && 'strokeWeight' in node) {
    const solidStroke = node.strokes.find(stroke => stroke.type === 'SOLID' && stroke.visible !== false);
    if (solidStroke) {
      const { r, g, b, a } = solidStroke.color;
      const rgba = `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${a})`;
      css += `${prefix}  border: ${node.strokeWeight}px solid ${rgba};\n`;
    }
  }
  
  // Text properties
  if (node.type === 'TEXT') {
    if ('fontSize' in node) css += `${prefix}  font-size: ${node.fontSize}px;\n`;
    if ('fontName' in node) css += `${prefix}  font-family: ${node.fontName.family}, sans-serif;\n`;
    if ('fontName' in node && node.fontName.style) {
      const style = node.fontName.style.toLowerCase();
      if (style.includes('bold')) {
        css += `${prefix}  font-weight: bold;\n`;
      }
      if (style.includes('italic')) {
        css += `${prefix}  font-style: italic;\n`;
      }
    }
    if ('textAlignHorizontal' in node) {
      const alignment = node.textAlignHorizontal.toLowerCase();
      css += `${prefix}  text-align: ${alignment};\n`;
    }
    if ('letterSpacing' in node && node.letterSpacing !== 0) {
      css += `${prefix}  letter-spacing: ${node.letterSpacing}px;\n`;
    }
    if ('lineHeight' in node && typeof node.lineHeight === 'object' && 'value' in node.lineHeight) {
      css += `${prefix}  line-height: ${node.lineHeight.value}${node.lineHeight.unit.toLowerCase()};\n`;
    }
  }
  
  // Effects (shadows)
  if ('effects' in node && node.effects) {
    const dropShadows = node.effects.filter(effect => effect.type === 'DROP_SHADOW' && effect.visible !== false);
    if (dropShadows.length > 0) {
      const shadowStrings = dropShadows.map(shadow => {
        const { r, g, b, a } = shadow.color;
        const rgba = `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${a})`;
        return `${shadow.offset.x}px ${shadow.offset.y}px ${shadow.radius}px ${rgba}`;
      });
      css += `${prefix}  box-shadow: ${shadowStrings.join(', ')};\n`;
    }
  }
  
  css += `${prefix}}\n`;
  
  // Process children if available and requested
  if (includeChildren && node.children && node.children.length > 0) {
    node.children.forEach(child => {
      css += '\n' + generateCSS(child, includeChildren, prefix);
    });
  }
  
  return css;
}

// Generate React component from node
function generateReactComponent(node, includeChildren = true, isChild = false) {
  if (!node) return '';
  
  const componentName = node.name
    .split(/\s+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
  
  let component = '';
  
  if (!isChild) {
    component += `// React component for ${node.name} (${node.type})\n`;
    component += `import React from 'react';\n\n`;
    component += `const ${componentName} = () => {\n`;
  }
  
  const styleName = isChild ? `${componentName.charAt(0).toLowerCase() + componentName.slice(1)}Style` : 'styles';
  
  component += `  const ${styleName} = {\n`;
  
  // Width and height
  if ('width' in node) component += `    width: ${Math.round(node.width)},\n`;
  if ('height' in node) component += `    height: ${Math.round(node.height)},\n`;
  
  // Position
  if ('x' in node || 'y' in node) component += `    position: 'absolute',\n`;
  if ('x' in node) component += `    left: ${Math.round(node.x)},\n`;
  if ('y' in node) component += `    top: ${Math.round(node.y)},\n`;
  
  // Opacity
  if ('opacity' in node && node.opacity !== 1) {
    component += `    opacity: ${node.opacity},\n`;
  }
  
  // Border radius
  if ('cornerRadius' in node && node.cornerRadius > 0) {
    component += `    borderRadius: ${node.cornerRadius},\n`;
  }
  
  // Background color (from fills)
  if ('fills' in node && node.fills && node.fills.length > 0) {
    const solidFill = node.fills.find(fill => fill.type === 'SOLID' && fill.visible !== false);
    if (solidFill) {
      const { r, g, b, a } = solidFill.color;
      const rgba = `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${a})`;
      component += `    backgroundColor: '${rgba}',\n`;
    }
  }
  
  // Border (from strokes)
  if ('strokes' in node && node.strokes && node.strokes.length > 0 && 'strokeWeight' in node) {
    const solidStroke = node.strokes.find(stroke => stroke.type === 'SOLID' && stroke.visible !== false);
    if (solidStroke) {
      const { r, g, b, a } = solidStroke.color;
      const rgba = `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${a})`;
      component += `    border: '${node.strokeWeight}px solid ${rgba}',\n`;
    }
  }
  
  // Text properties
  if (node.type === 'TEXT') {
    if ('fontSize' in node) component += `    fontSize: ${node.fontSize},\n`;
    if ('fontName' in node) component += `    fontFamily: '${node.fontName.family}, sans-serif',\n`;
    if ('fontName' in node && node.fontName.style) {
      const style = node.fontName.style.toLowerCase();
      if (style.includes('bold')) {
        component += `    fontWeight: 'bold',\n`;
      }
      if (style.includes('italic')) {
        component += `    fontStyle: 'italic',\n`;
      }
    }
    if ('textAlignHorizontal' in node) {
      const alignment = node.textAlignHorizontal.toLowerCase();
      component += `    textAlign: '${alignment}',\n`;
    }
    if ('letterSpacing' in node && node.letterSpacing !== 0) {
      component += `    letterSpacing: ${node.letterSpacing},\n`;
    }
  }
  
  // Effects (shadows)
  if ('effects' in node && node.effects) {
    const dropShadows = node.effects.filter(effect => effect.type === 'DROP_SHADOW' && effect.visible !== false);
    if (dropShadows.length > 0) {
      const shadowStrings = dropShadows.map(shadow => {
        const { r, g, b, a } = shadow.color;
        const rgba = `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${a})`;
        return `${shadow.offset.x}px ${shadow.offset.y}px ${shadow.radius}px ${rgba}`;
      });
      component += `    boxShadow: '${shadowStrings.join(', ')}',\n`;
    }
  }
  
  component += `  };\n\n`;
  
  // Process children if available and requested
  let childComponents = '';
  let childJSX = '';
  
  if (includeChildren && node.children && node.children.length > 0) {
    node.children.forEach(child => {
      const childComponent = generateReactComponent(child, includeChildren, true);
      childComponents += childComponent.component;
      childJSX += `      ${childComponent.jsx}\n`;
    });
  }
  
  component += childComponents;
  
  // Return statement based on node type
  let jsx = '';
  if (node.type === 'TEXT' && 'characters' in node) {
    jsx = `<div style={${styleName}}>\n      ${node.characters}\n    </div>`;
  } else if (includeChildren && node.children && node.children.length > 0) {
    jsx = `<div style={${styleName}}>\n${childJSX}    </div>`;
  } else {
    jsx = `<div style={${styleName}}></div>`;
  }
  
  if (isChild) {
    return {
      component: component,
      jsx: jsx
    };
  } else {
    component += `  return (\n    ${jsx}\n  );\n`;
    component += `};\n\n`;
    component += `export default ${componentName};\n`;
    return component;
  }
}

// Generate HTML from node
function generateHTML(node, includeChildren = true, indentLevel = 0) {
  if (!node) return '';
  
  const indent = '  '.repeat(indentLevel);
  let html = `${indent}<!-- HTML for ${node.name} (${node.type}) -->\n`;
  
  const className = node.name.replace(/\s+/g, '-').toLowerCase();
  let style = '';
  
  // Width and height
  if ('width' in node) style += `width: ${Math.round(node.width)}px; `;
  if ('height' in node) style += `height: ${Math.round(node.height)}px; `;
  
  // Position
  if ('x' in node || 'y' in node) style += `position: absolute; `;
  if ('x' in node) style += `left: ${Math.round(node.x)}px; `;
  if ('y' in node) style += `top: ${Math.round(node.y)}px; `;
  
  // Opacity
  if ('opacity' in node && node.opacity !== 1) {
    style += `opacity: ${node.opacity}; `;
  }
  
  // Border radius
  if ('cornerRadius' in node && node.cornerRadius > 0) {
    style += `border-radius: ${node.cornerRadius}px; `;
  }
  
  // Background color (from fills)
  if ('fills' in node && node.fills && node.fills.length > 0) {
    const solidFill = node.fills.find(fill => fill.type === 'SOLID' && fill.visible !== false);
    if (solidFill) {
      const { r, g, b, a } = solidFill.color;
      const rgba = `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${a})`;
      style += `background-color: ${rgba}; `;
    }
  }
  
  // Border (from strokes)
  if ('strokes' in node && node.strokes && node.strokes.length > 0 && 'strokeWeight' in node) {
    const solidStroke = node.strokes.find(stroke => stroke.type === 'SOLID' && stroke.visible !== false);
    if (solidStroke) {
      const { r, g, b, a } = solidStroke.color;
      const rgba = `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${a})`;
      style += `border: ${node.strokeWeight}px solid ${rgba}; `;
    }
  }
  
  // Text properties
  if (node.type === 'TEXT') {
    if ('fontSize' in node) style += `font-size: ${node.fontSize}px; `;
    if ('fontName' in node) style += `font-family: ${node.fontName.family}, sans-serif; `;
    if ('fontName' in node && node.fontName.style) {
      const fontStyle = node.fontName.style.toLowerCase();
      if (fontStyle.includes('bold')) {
        style += `font-weight: bold; `;
      }
      if (fontStyle.includes('italic')) {
        style += `font-style: italic; `;
      }
    }
    if ('textAlignHorizontal' in node) {
      const alignment = node.textAlignHorizontal.toLowerCase();
      style += `text-align: ${alignment}; `;
    }
    if ('letterSpacing' in node && node.letterSpacing !== 0) {
      style += `letter-spacing: ${node.letterSpacing}px; `;
    }
  }
  
  // Effects (shadows)
  if ('effects' in node && node.effects) {
    const dropShadows = node.effects.filter(effect => effect.type === 'DROP_SHADOW' && effect.visible !== false);
    if (dropShadows.length > 0) {
      const shadowStrings = dropShadows.map(shadow => {
        const { r, g, b, a } = shadow.color;
        const rgba = `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${a})`;
        return `${shadow.offset.x}px ${shadow.offset.y}px ${shadow.radius}px ${rgba}`;
      });
      style += `box-shadow: ${shadowStrings.join(', ')}; `;
    }
  }
  
  // Create HTML element based on node type
  if (node.type === 'TEXT' && 'characters' in node) {
    html += `${indent}<div class="${className}" style="${style}">\n`;
    html += `${indent}  ${node.characters}\n`;
    html += `${indent}</div>`;
  } else if (includeChildren && node.children && node.children.length > 0) {
    html += `${indent}<div class="${className}" style="${style}">\n`;
    
    // Add children
    node.children.forEach(child => {
      html += generateHTML(child, includeChildren, indentLevel + 1) + '\n';
    });
    
    html += `${indent}</div>`;
  } else {
    html += `${indent}<div class="${className}" style="${style}"></div>`;
  }
  
  return html;
}

// Handle messages from the UI
figma.ui.onmessage = (msg) => {
  console.log("Message received from UI:", msg);
  
  if (msg.type === 'extract-data') {
    // Get selected nodes
    const nodes = figma.currentPage.selection;
    
    if (nodes.length === 0) {
      figma.ui.postMessage({
        type: 'figma-data',
        data: [],
        message: "No nodes selected. Please select at least one node in Figma."
      });
      return;
    }
    
    try {
      // Extract all properties from each node, including children
      const data = nodes.map(node => getNodeProperties(node, true));
      
      // Send data back to UI
      figma.ui.postMessage({
        type: 'figma-data',
        data: data
      });
    } catch (error) {
      console.error("Error extracting data:", error);
      figma.ui.postMessage({
        type: 'error',
        message: "Error extracting data: " + error.message
      });
    }
  } else if (msg.type === 'generate-code') {
    // Get selected nodes
    const nodes = figma.currentPage.selection;
    
    if (nodes.length === 0) {
      figma.ui.postMessage({
        type: 'code-generated',
        code: '',
        message: "No nodes selected. Please select at least one node in Figma."
      });
      return;
    }
    
    try {
      let generatedCode = '';
      
      // Generate code based on the requested language/framework
      switch (msg.language) {
        case 'css':
          generatedCode = nodes.map(node => generateCSS(node, true)).join('\n\n');
          break;
        case 'react':
          generatedCode = nodes.map(node => generateReactComponent(node, true)).join('\n\n');
          break;
        case 'html':
          generatedCode = nodes.map(node => generateHTML(node, true)).join('\n\n');
          break;
        default:
          throw new Error(`Unsupported language: ${msg.language}`);
      }
      
      // Send generated code back to UI
      figma.ui.postMessage({
        type: 'code-generated',
        code: generatedCode,
        language: msg.language
      });
    } catch (error) {
      console.error("Error generating code:", error);
      figma.ui.postMessage({
        type: 'error',
        message: "Error generating code: " + error.message
      });
    }
  }
};
