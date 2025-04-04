import { type NextRequest } from 'next/server'

// Helper function to extract fileKey and nodeId from Figma URL
function extractFigmaParams(url: string): { fileKey: string | null; nodeId: string | null } {
  try {
    const parsedUrl = new URL(url)
    const pathParts = parsedUrl.pathname.split('/')
    const fileIndex = pathParts.findIndex(part => part === 'file' || part === 'design')
    
    // Extract fileKey
    let fileKey = null
    if (fileIndex !== -1 && pathParts.length > fileIndex + 1) {
      fileKey = pathParts[fileIndex + 1]
    }
    
    // Extract nodeId from URL parameters or path
    let nodeId = null
    const nodeIdParam = parsedUrl.searchParams.get('node-id')
    
    if (nodeIdParam) {
      // Formato esperado: 148-302 ou 148:302
      // Garantir que estamos usando o formato correto (com ':' em vez de '-')
      nodeId = nodeIdParam.replace('-', ':')
    } else {
      // Try to find node-id in the path (older Figma URLs format)
      const nodeIndex = pathParts.findIndex(part => part === 'node')
      if (nodeIndex !== -1 && pathParts.length > nodeIndex + 1) {
        nodeId = pathParts[nodeIndex + 1].replace('-', ':')
      }
    }
    
    console.log('Extracted nodeId (formatted):', nodeId)
    return { fileKey, nodeId }
  } catch (error) {
    console.error('Error parsing Figma URL:', error)
    return { fileKey: null, nodeId: null }
  }
}

// Função para processar um nó e garantir que ele tenha todas as propriedades necessárias para renderização
function processNodeForRendering(node: any): any {
  if (!node) return null;
  
  // Criar uma cópia do nó para não modificar o original
  const processedNode = { ...node };
  
  // Garantir que o nó tenha um absoluteBoundingBox
  if (!processedNode.absoluteBoundingBox) {
    // Se o nó tiver x, y, width e height diretamente, criar um absoluteBoundingBox
    if (typeof processedNode.x === 'number' && 
        typeof processedNode.y === 'number' && 
        typeof processedNode.width === 'number' && 
        typeof processedNode.height === 'number') {
      processedNode.absoluteBoundingBox = {
        x: processedNode.x,
        y: processedNode.y,
        width: processedNode.width,
        height: processedNode.height
      };
    }
  }
  
  // Processar recursivamente os filhos, se existirem
  if (processedNode.children && Array.isArray(processedNode.children)) {
    processedNode.children = processedNode.children
      .map((child: any) => processNodeForRendering(child))
      .filter(Boolean); // Remover filhos nulos
  }
  
  return processedNode;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const figmaUrl = searchParams.get('figmaUrl')

  if (!figmaUrl) {
    return Response.json({ error: 'Missing figmaUrl parameter' }, { status: 400 })
  }

  console.log('Received request for Figma URL:', figmaUrl)

  const { fileKey, nodeId } = extractFigmaParams(figmaUrl)

  console.log('Extracted fileKey:', fileKey, 'nodeId:', nodeId)

  const personalAccessToken = process.env.FIGMA_PERSONAL_ACCESS_TOKEN
  console.log('Attempting to use Figma Token from env:', personalAccessToken ? `Token found (Length: ${personalAccessToken.length})` : 'Token NOT FOUND in env!');

  if (!personalAccessToken) {
    console.error('Figma Personal Access Token not found in environment variables.')
    return Response.json({ error: 'Server configuration error: Missing Figma token' }, { status: 500 })
  }

  if (!fileKey) {
    return Response.json({ error: 'Could not extract fileKey from the provided Figma URL' }, { status: 400 })
  }

  // Determine which API endpoint to use based on whether we have a nodeId
  let figmaApiUrl: string
  let isNodeSpecific = false
  
  if (nodeId) {
    // If we have a specific nodeId, use the nodes endpoint
    // Importante: a API do Figma espera que os IDs estejam no formato correto (com ':' em vez de '-')
    figmaApiUrl = `https://api.figma.com/v1/files/${fileKey}/nodes?ids=${nodeId}`
    isNodeSpecific = true
    console.log(`Calling Figma API for specific node: ${figmaApiUrl}`)
  } else {
    // Otherwise fetch the entire file structure
    figmaApiUrl = `https://api.figma.com/v1/files/${fileKey}`
    console.log(`Calling Figma API for entire file: ${figmaApiUrl}`)
  }

  try {
    const response = await fetch(figmaApiUrl, {
      method: 'GET',
      headers: {
        'X-Figma-Token': personalAccessToken,
      },
    });

    console.log(`Figma API response status: ${response.status}`) 

    if (!response.ok) {
      let errorBody = 'Could not read error body';
      try { errorBody = await response.json(); } catch { errorBody = await response.text(); }
      console.error('Figma API Error:', { status: response.status, statusText: response.statusText, body: errorBody });
      throw new Error(`Figma API request failed with status ${response.status}`);
    }

    const responseData = await response.json();
    
    // Process the response based on whether we requested a specific node or the entire file
    if (isNodeSpecific) {
      // For node-specific requests, the structure is different
      // The response has a 'nodes' object with nodeId as keys
      if (!responseData.nodes || Object.keys(responseData.nodes).length === 0) {
        console.error('No nodes found in the response:', responseData);
        return Response.json({ error: 'No nodes found with the specified ID' }, { status: 404 });
      }
      
      // Get the requested node data
      // Garantir que nodeId não é null antes de usar como índice
      if (!nodeId) {
        console.error('NodeId is null but isNodeSpecific is true');
        return Response.json({ error: 'Invalid node ID' }, { status: 400 });
      }
      
      // Imprimir as chaves disponíveis para debug
      console.log('Available node keys in response:', Object.keys(responseData.nodes));
      
      // Tentar encontrar o nó usando o nodeId exato ou tentando formatos alternativos
      let nodeData = responseData.nodes[nodeId];
      
      // Se não encontrou, tente outras variações do formato
      if (!nodeData) {
        // Tentar com hífen se tiver dois pontos
        const altNodeId = nodeId.includes(':') ? nodeId.replace(':', '-') : nodeId.replace('-', ':');
        console.log('Trying alternative node ID format:', altNodeId);
        nodeData = responseData.nodes[altNodeId];
      }
      
      if (!nodeData || !nodeData.document) {
        console.error('Node data not found for any ID format. Available nodes:', Object.keys(responseData.nodes));
        return Response.json({ error: 'Node data not found' }, { status: 404 });
      }
      
      console.log(`Found node with ID ${nodeId} of type ${nodeData.document.type}`);
      
      // Processar o documento do nó para garantir que ele tenha todas as propriedades necessárias
      const processedNode = processNodeForRendering(nodeData.document);
      console.log('Processed node for rendering:', {
        id: processedNode.id,
        name: processedNode.name,
        type: processedNode.type,
        hasBoundingBox: !!processedNode.absoluteBoundingBox,
        childrenCount: processedNode.children?.length || 0
      });
      
      // Return the processed node document
      return Response.json(processedNode);
    } else {
      // For full file requests, process the document structure
      if (!responseData.document) {
        console.error('Document data not found in response:', responseData);
        return Response.json({ error: 'Invalid Figma file structure' }, { status: 500 });
      }
      
      // Find the first page (canvas)
      const pages = responseData.document.children?.filter((child: any) => child.type === 'CANVAS') || [];
      
      if (pages.length === 0) {
        console.error('No canvas pages found in the document:', responseData.document);
        return Response.json({ error: 'No canvas pages found in the document' }, { status: 404 });
      }
      
      const firstPage = pages[0];
      console.log(`Found first page "${firstPage.name}" with ${firstPage.children?.length || 0} children`);
      
      // Extract frames (top-level nodes) from the first page
      const frames = firstPage.children?.filter((node: any) => 
        node.type === 'FRAME' && node.visible !== false
      ) || [];
      
      console.log(`Found ${frames.length} frames on the first page.`);
      
      // Processar os frames para garantir que tenham todas as propriedades necessárias para renderização
      const processedFrames = frames.map((frame: any) => processNodeForRendering(frame));
      
      console.log(`Processed ${processedFrames.length} frames for rendering`);
      processedFrames.forEach((frame: any) => {
        console.log('Frame:', {
          id: frame.id,
          name: frame.name,
          type: frame.type,
          hasBoundingBox: !!frame.absoluteBoundingBox,
          childrenCount: frame.children?.length || 0
        });
      });
      
      // Return the array of processed frames with their complete hierarchy intact
      return Response.json(processedFrames);
    }

  } catch (error: any) {
    console.error('Error during fetch call to Figma API:', error);
    return Response.json({ error: 'Failed to fetch Figma file data via fetch', details: error?.message }, { status: 500 })
  }
} 