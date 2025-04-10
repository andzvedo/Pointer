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
    const decodedUrl = url.includes('%') ? decodeURIComponent(url) : url;
    
    const parsedUrl = new URL(decodedUrl);
    const pathParts = parsedUrl.pathname.split('/');
    
    // Suporta vários formatos de URL do Figma
    const fileIndex = pathParts.findIndex(part => ['file', 'design', 'proto'].includes(part));
    
    // Extract fileKey
    let fileKey: string | null = null;
    if (fileIndex !== -1 && pathParts.length > fileIndex + 1) {
      fileKey = pathParts[fileIndex + 1];
    }
    
    // Extract nodeId from URL parameters or path
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
  try {
    const searchParams = request.nextUrl.searchParams;
    const figmaUrl = searchParams.get('figmaUrl');

    if (!figmaUrl) {
      return Response.json({ error: 'Missing figmaUrl parameter' }, { status: 400 });
    }

    console.log('Received request for Figma URL:', figmaUrl);

    const { fileKey, nodeId } = extractFigmaParams(figmaUrl);
    console.log('Extracted fileKey:', fileKey, 'nodeId:', nodeId);

    if (!fileKey) {
      return Response.json({ error: 'Could not extract fileKey from the provided Figma URL' }, { status: 400 });
    }

    const accessToken = process.env.FIGMA_ACCESS_TOKEN;
    if (!accessToken) {
      console.error('Figma Access Token not found in environment variables.');
      return Response.json({ error: 'Server configuration error: Missing Figma token' }, { status: 500 });
    }

    // Fazer a requisição para a API do Figma
    const figmaApiUrl = `https://api.figma.com/v1/files/${fileKey}?geometry=paths`;
    console.log('Requesting Figma API:', figmaApiUrl);

    const response = await fetch(figmaApiUrl, {
      headers: {
        'X-Figma-Token': accessToken
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Figma API error:', errorData);
      return Response.json({ 
        error: errorData.err || 'Error fetching data from Figma API',
        details: errorData
      }, { status: response.status });
    }

    const data = await response.json();
    
    // Se um nodeId específico foi fornecido, retornar apenas esse nó
    if (nodeId && data.document) {
      const node = findNodeById(data.document, nodeId);
      if (!node) {
        return Response.json({ error: 'Node not found' }, { status: 404 });
      }
      return Response.json(node);
    }

    // Caso contrário, retornar o documento inteiro
    return Response.json(data.document);
  } catch (error) {
    console.error('Error processing request:', error);
    return Response.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Função auxiliar para encontrar um nó pelo ID
function findNodeById(node: any, nodeId: string): any {
  if (node.id === nodeId) {
    return node;
  }
  
  if (node.children) {
    for (const child of node.children) {
      const found = findNodeById(child, nodeId);
      if (found) return found;
    }
  }
  
  return null;
}