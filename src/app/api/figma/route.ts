// Definindo tipos para substituir a importação de next/server
interface NextRequest extends Request {
  nextUrl: {
    searchParams: URLSearchParams;
  };
}

// Definindo interfaces para a API do Figma com base na documentação oficial
interface FigmaApiNodeResponse {
  nodes: {
    [key: string]: {
      document: any;
      components?: any;
      schemaVersion?: number;
      styles?: any;
    };
  };
  name: string;
  lastModified: string;
  thumbnailUrl: string;
  version: string;
  role?: string;
  editorType?: string;
  linkAccess?: string;
}

interface FigmaApiFileResponse {
  document: any;
  components: any;
  schemaVersion: number;
  styles: any;
  name: string;
  lastModified: string;
  thumbnailUrl: string;
  version: string;
  role?: string;
  editorType?: string;
  linkAccess?: string;
}

// Helper function to extract fileKey and nodeId from Figma URL
function extractFigmaParams(url: string): { fileKey: string | null; nodeId: string | null } {
  try {
    // Garantir que a URL está decodificada corretamente
    // Isso permite que a função funcione tanto com URLs normais quanto com URLs codificadas
    const decodedUrl = url.includes('%') ? decodeURIComponent(url) : url;
    
    const parsedUrl = new URL(decodedUrl)
    const pathParts = parsedUrl.pathname.split('/')
    
    // Suporta vários formatos de URL do Figma
    // 1. https://www.figma.com/file/{fileKey}/{title}
    // 2. https://www.figma.com/design/{fileKey}/{title}
    // 3. https://www.figma.com/proto/{fileKey}/{title}
    const fileIndex = pathParts.findIndex(part => ['file', 'design', 'proto'].includes(part))
    
    // Extract fileKey
    let fileKey: string | null = null
    if (fileIndex !== -1 && pathParts.length > fileIndex + 1) {
      fileKey = pathParts[fileIndex + 1]
    }
    
    // Extract nodeId from URL parameters or path
    let nodeId: string | null = null
    
    // Primeiro tenta o formato mais comum: ?node-id=X:Y
    const nodeIdParam = parsedUrl.searchParams.get('node-id')
    
    if (nodeIdParam) {
      // Formato esperado: 148-302 ou 148:302
      // Garantir que estamos usando o formato correto (com ':' em vez de '-')
      nodeId = nodeIdParam.includes(':') ? nodeIdParam : nodeIdParam.replace('-', ':')
    } else {
      // Tenta outros formatos de URL
      // 1. /node/{nodeId} (formato antigo)
      const nodeIndex = pathParts.findIndex(part => part === 'node')
      if (nodeIndex !== -1 && pathParts.length > nodeIndex + 1) {
        nodeId = pathParts[nodeIndex + 1].includes(':') ? 
                pathParts[nodeIndex + 1] : 
                pathParts[nodeIndex + 1].replace('-', ':')
      }
      
      // 2. ?page-id={nodeId} (para páginas específicas)
      if (!nodeId) {
        const pageIdParam = parsedUrl.searchParams.get('page-id')
        if (pageIdParam) {
          nodeId = pageIdParam.includes(':') ? pageIdParam : pageIdParam.replace('-', ':')
        }
      }
    }
    
    console.log('Extracted fileKey:', fileKey, 'nodeId:', nodeId)
    return { fileKey, nodeId }
  } catch (error) {
    console.error('Error parsing Figma URL:', error)
    return { fileKey: null, nodeId: null }
  }
}

// Função para processar um nó e garantir que ele tenha todas as propriedades necessárias para renderização
function processNodeForRendering(node: any, parentRef: any = null): any {
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
  
  // Adicionar referência ao nó pai, mas apenas com as propriedades mínimas necessárias
  // para evitar circularidade
  if (parentRef) {
    processedNode.parent = {
      id: parentRef.id,
      absoluteBoundingBox: parentRef.absoluteBoundingBox
      // Não incluir 'children' aqui para evitar circularidade
    };
  }
  
  // Processar propriedades específicas por tipo de nó
  switch (processedNode.type) {
    case 'TEXT':
      // Garantir que nós de texto tenham as propriedades de estilo necessárias
      if (!processedNode.style) {
        processedNode.style = {};
      }
      // Valores padrão para propriedades de texto
      processedNode.style.fontFamily = processedNode.style.fontFamily || 'Inter';
      processedNode.style.fontSize = processedNode.style.fontSize || 14;
      processedNode.style.fontWeight = processedNode.style.fontWeight || 400;
      processedNode.style.textAlignHorizontal = processedNode.style.textAlignHorizontal || 'LEFT';
      processedNode.style.textAlignVertical = processedNode.style.textAlignVertical || 'TOP';
      break;
      
    case 'FRAME':
    case 'GROUP':
    case 'COMPONENT':
    case 'INSTANCE':
      // Garantir que nós de container tenham as propriedades de layout necessárias
      if (processedNode.layoutMode) {
        // Para nós com Auto Layout, garantir que tenham as propriedades necessárias
        processedNode.primaryAxisAlignItems = processedNode.primaryAxisAlignItems || 'MIN';
        processedNode.counterAxisAlignItems = processedNode.counterAxisAlignItems || 'MIN';
        processedNode.primaryAxisSizingMode = processedNode.primaryAxisSizingMode || 'AUTO';
        processedNode.counterAxisSizingMode = processedNode.counterAxisSizingMode || 'AUTO';
        processedNode.itemSpacing = processedNode.itemSpacing || 0;
        processedNode.paddingLeft = processedNode.paddingLeft || 0;
        processedNode.paddingRight = processedNode.paddingRight || 0;
        processedNode.paddingTop = processedNode.paddingTop || 0;
        processedNode.paddingBottom = processedNode.paddingBottom || 0;
      }
      break;
  }
  
  // Garantir que fills, strokes e effects sejam arrays
  processedNode.fills = Array.isArray(processedNode.fills) ? processedNode.fills : [];
  processedNode.strokes = Array.isArray(processedNode.strokes) ? processedNode.strokes : [];
  processedNode.effects = Array.isArray(processedNode.effects) ? processedNode.effects : [];
  
  // Processar recursivamente os filhos, se existirem
  if (processedNode.children && Array.isArray(processedNode.children)) {
    // Processar cada filho recursivamente passando o nó atual como o pai
    processedNode.children = processedNode.children
      .map((child: any) => processNodeForRendering(child, processedNode))
      .filter(Boolean); // Remover filhos nulos
  }
  
  return processedNode;
}

// Função auxiliar para serializar objetos que podem conter referências circulares
function serializeWithoutCircular(obj: any) {
  // Conjunto para acompanhar objetos já visitados
  const seenObjects = new WeakSet();
  
  // Função de substituição para o JSON.stringify
  const replacer = (key: string, value: any) => {
    // Se for um valor primitivo ou null, retornar diretamente
    if (value === null || typeof value !== 'object') {
      return value;
    }
    
    // Se já vimos este objeto antes, substituir por uma referência
    if (seenObjects.has(value)) {
      // Apenas retornar uma referência ao objeto pai (id) se for uma propriedade parent
      if (key === 'parent' && value.id) {
        return { id: value.id, absoluteBoundingBox: value.absoluteBoundingBox };
      }
      return '[Circular Reference]';
    }
    
    // Marcar como visitado e continuar a serialização
    seenObjects.add(value);
    return value;
  };
  
  return JSON.stringify(obj, replacer);
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const figmaUrl = searchParams.get('figmaUrl')
  const includeStyles = searchParams.get('includeStyles') === 'true'
  const includeComponents = searchParams.get('includeComponents') === 'true'
  const depth = searchParams.get('depth') || '2' // Profundidade padrão para buscar nós

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

  // Construir parâmetros de consulta para a API do Figma
  const queryParams = new URLSearchParams();
  
  // Adicionar parâmetros opcionais conforme a documentação da API
  if (includeStyles) queryParams.append('include_styles', 'true');
  if (includeComponents) queryParams.append('include_components', 'true');
  
  // Determine which API endpoint to use based on whether we have a nodeId
  let figmaApiUrl: string
  let isNodeSpecific = false
  
  if (nodeId) {
    // If we have a specific nodeId, use the nodes endpoint
    // Importante: a API do Figma espera que os IDs estejam no formato correto (com ':' em vez de '-')
    queryParams.append('ids', nodeId);
    queryParams.append('depth', depth);
    figmaApiUrl = `https://api.figma.com/v1/files/${fileKey}/nodes?${queryParams.toString()}`
    isNodeSpecific = true
    console.log(`Calling Figma API for specific node: ${figmaApiUrl}`)
  } else {
    // Otherwise fetch the entire file structure
    figmaApiUrl = `https://api.figma.com/v1/files/${fileKey}?${queryParams.toString()}`
    console.log(`Calling Figma API for entire file: ${figmaApiUrl}`)
  }

  try {
    const response = await fetch(figmaApiUrl, {
      method: 'GET',
      headers: {
        'X-Figma-Token': personalAccessToken,
      }
    });

    console.log(`Figma API response status: ${response.status}`)

    if (!response.ok) {
      let errorBody = 'Could not read error body';
      try { errorBody = await response.json(); } catch { errorBody = await response.text(); }
      console.error('Figma API Error:', { status: response.status, statusText: response.statusText, body: errorBody });
      
      // Retornar mensagens de erro específicas com base no código de status
      if (response.status === 404) {
        return Response.json({ error: 'Figma file or node not found' }, { status: 404 });
      } else if (response.status === 403) {
        return Response.json({ error: 'Access denied. Check your Figma token permissions' }, { status: 403 });
      } else if (response.status === 429) {
        return Response.json({ error: 'Rate limit exceeded for Figma API' }, { status: 429 });
      }
      
      throw new Error(`Figma API request failed with status ${response.status}`);
    }

    const responseData = await response.json() as FigmaApiNodeResponse | FigmaApiFileResponse;
    
    // Process the response based on whether we requested a specific node or the entire file
    if (isNodeSpecific) {
      // For node-specific requests, the structure is different
      // The response has a 'nodes' object with nodeId as keys
      const nodeResponse = responseData as FigmaApiNodeResponse;
      
      if (!nodeResponse.nodes || Object.keys(nodeResponse.nodes).length === 0) {
        console.error('No nodes found in the response:', nodeResponse);
        return Response.json({ error: 'No nodes found with the specified ID' }, { status: 404 });
      }
      
      // Get the requested node data
      // Garantir que nodeId não é null antes de usar como índice
      if (!nodeId) {
        console.error('NodeId is null but isNodeSpecific is true');
        return Response.json({ error: 'Invalid node ID' }, { status: 400 });
      }
      
      // Imprimir as chaves disponíveis para debug
      console.log('Available node keys in response:', Object.keys(nodeResponse.nodes));
      
      // Tentar encontrar o nó usando o nodeId exato ou tentando formatos alternativos
      let nodeData = nodeResponse.nodes[nodeId];
      
      // Se não encontrou, tente outras variações do formato
      if (!nodeData) {
        // Tentar com hífen se tiver dois pontos
        const altNodeId = nodeId.includes(':') ? nodeId.replace(':', '-') : nodeId.replace('-', ':');
        console.log('Trying alternative node ID format:', altNodeId);
        nodeData = nodeResponse.nodes[altNodeId];
      }
      
      if (!nodeData || !nodeData.document) {
        console.error('Node data not found for any ID format. Available nodes:', Object.keys(nodeResponse.nodes));
        return Response.json({ error: 'Node data not found' }, { status: 404 });
      }
      
      console.log(`Found node with ID ${nodeId} of type ${nodeData.document.type}`);
      
      // Processar o documento do nó para garantir que ele tenha todas as propriedades necessárias
      const processedNode = processNodeForRendering(nodeData.document);
      
      // Adicionar metadados do arquivo ao resultado
      const result = {
        node: processedNode,
        metadata: {
          name: nodeResponse.name,
          lastModified: nodeResponse.lastModified,
          version: nodeResponse.version,
          thumbnailUrl: nodeResponse.thumbnailUrl,
          nodeId: nodeId
        }
      };
      
      console.log('Processed node for rendering:', {
        id: processedNode.id,
        name: processedNode.name,
        type: processedNode.type,
        hasBoundingBox: !!processedNode.absoluteBoundingBox,
        childrenCount: processedNode.children?.length || 0
      });
      
      // Serializar manualmente para evitar problemas com referências circulares
      const serialized = serializeWithoutCircular(result);
      
      // Return the processed node document with metadata
      return new Response(serialized, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
    } else {
      // For full file requests, process the document structure
      const fileResponse = responseData as FigmaApiFileResponse;
      
      if (!fileResponse.document) {
        console.error('Document data not found in response:', fileResponse);
        return Response.json({ error: 'Invalid Figma file structure' }, { status: 500 });
      }
      
      // Find the first page (canvas)
      const pages = fileResponse.document.children?.filter((child: any) => child.type === 'CANVAS') || [];
      
      if (pages.length === 0) {
        console.error('No canvas pages found in the document:', fileResponse.document);
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
      
      // Process the first page to ensure it has all necessary properties for rendering
      const processedPage = processNodeForRendering(firstPage);
      
      // Adicionar metadados do arquivo ao resultado
      const result = {
        node: processedPage,
        metadata: {
          name: fileResponse.name,
          lastModified: fileResponse.lastModified,
          version: fileResponse.version,
          thumbnailUrl: fileResponse.thumbnailUrl,
          pageId: processedPage.id,
          pageName: processedPage.name
        },
        pages: pages.map((page: { id: any; name: any; children: string | any[]; }) => ({
          id: page.id,
          name: page.name,
          childrenCount: page.children?.length || 0
        }))
      };
      
      // Serializar manualmente para evitar problemas com referências circulares
      const serialized = serializeWithoutCircular(result);
      
      // Return the processed page with metadata
      return new Response(serialized, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

  } catch (error) {
    console.error('Error fetching Figma data:', error);
    return Response.json({ error: 'Failed to fetch Figma data: ' + (error instanceof Error ? error.message : String(error)) }, { status: 500 });
  }
}