// Use a module wrapper to prevent function name conflicts
(function() {
const fs = require('fs');
const path = require('path');
const https = require('https');

// Figma URL to process
const FIGMA_URL = 'https://www.figma.com/design/EJBx9C4X4el4OWMorPbj3j/Blackbird-Platform?node-id=6847-190964&t=1PGLYcECSmqVT0yp-4';

// Extract fileKey and nodeId from the Figma URL
function extractFigmaParams(url: string): { fileKey: string | null; nodeId: string | null } {
  try {
    const decodedUrl = url.includes('%') ? decodeURIComponent(url) : url;
    const parsedUrl = new URL(decodedUrl);
    const pathParts = parsedUrl.pathname.split('/');
    
    // Support various Figma URL formats
    const fileIndex = pathParts.findIndex(part => ['file', 'design', 'proto'].includes(part));
    
    // Extract fileKey
    let fileKey: string | null = null;
    if (fileIndex !== -1 && pathParts.length > fileIndex + 1) {
      fileKey = pathParts[fileIndex + 1];
    }
    
    // Extract nodeId from URL parameters
    let nodeId: string | null = null;
    const nodeIdParam = parsedUrl.searchParams.get('node-id');
    
    if (nodeIdParam) {
      nodeId = nodeIdParam.includes(':') ? nodeIdParam : nodeIdParam.replace('-', ':');
    }
    
    console.log('Extracted fileKey:', fileKey, 'nodeId:', nodeId);
    return { fileKey, nodeId };
  } catch (error) {
    console.error('Error parsing Figma URL:', error);
    return { fileKey: null, nodeId: null };
  }
}

// Fetch data from Figma API
function fetchFigmaData(fileKey: string, nodeId: string | null): Promise<any> {
  return new Promise((resolve, reject) => {
    // Get the access token from .env.local
    const accessToken = process.env.FIGMA_ACCESS_TOKEN || 'figd_8Zogi1LEpHqlunb79JB1pzn-HU-EV-xAErBV5p4y';
    
    if (!accessToken) {
      reject(new Error('Figma access token not found'));
      return;
    }

    // If we have a nodeId, use the nodes endpoint to fetch just that node
    const path = nodeId 
      ? `/v1/files/${fileKey}/nodes?ids=${nodeId}&geometry=paths` 
      : `/v1/files/${fileKey}?geometry=paths`;

    const options = {
      hostname: 'api.figma.com',
      path: path,
      method: 'GET',
      headers: {
        'X-Figma-Token': accessToken
      }
    };

    console.log(`Requesting: https://api.figma.com${path}`);

    const req = https.request(options, (res: any) => {
      let data = '';

      res.on('data', (chunk: any) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode !== 200) {
          reject(new Error(`API request failed with status code ${res.statusCode}: ${data}`));
          return;
        }

        try {
          const parsedData = JSON.parse(data);
          resolve(parsedData);
        } catch (error) {
          reject(new Error('Failed to parse API response'));
        }
      });
    });

    req.on('error', (error: any) => {
      reject(error);
    });

    req.end();
  });
}

// Main function
async function main() {
  try {
    const { fileKey, nodeId } = extractFigmaParams(FIGMA_URL);
    
    if (!fileKey) {
      throw new Error('Could not extract fileKey from the provided Figma URL');
    }

    console.log('Fetching Figma data for fileKey:', fileKey, 'nodeId:', nodeId);
    const figmaData = await fetchFigmaData(fileKey, nodeId);
    
    // Save the complete AST to the expected location
    const outputDir = path.resolve(__dirname, '../public/images');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const outputPath = path.join(outputDir, 'design-ast.json');
    
    // Handle different response formats based on whether we used the nodes endpoint
    let documentData;
    if (nodeId && figmaData.nodes) {
      // For nodes endpoint, extract the document from the first node
      const nodeKey = Object.keys(figmaData.nodes)[0];
      documentData = figmaData.nodes[nodeKey].document;
      console.log(`Extracted node data for ${nodeKey}`);
    } else {
      // For file endpoint, use the document property
      documentData = figmaData.document;
    }
    
    fs.writeFileSync(outputPath, JSON.stringify(documentData, null, 2), 'utf-8');
    
    console.log(`Figma AST saved to ${outputPath}`);
    console.log('Now you can run the split-figma-ast.ts script to process this data');
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
})();
