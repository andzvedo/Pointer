import { type NextRequest } from 'next/server'

// Helper function to extract fileKey and nodeId from Figma URL
function extractFigmaDetails(url: string): { fileKey: string | null; nodeId: string | null } {
  try {
    const parsedUrl = new URL(url)
    const pathParts = parsedUrl.pathname.split('/')
    
    let fileKey: string | null = null
    let nodeId: string | null = null

    // Find fileKey (usually after /file/ or /design/)
    const fileIndex = pathParts.findIndex(part => part === 'file' || part === 'design')
    if (fileIndex !== -1 && pathParts.length > fileIndex + 1) {
      fileKey = pathParts[fileIndex + 1]
    }

    // Find nodeId from search parameters
    nodeId = parsedUrl.searchParams.get('node-id')

    // Handle URLs with node-id in the path (less common, but possible)
    if (!nodeId) {
        const nodeIndex = pathParts.findIndex(part => part.includes(':')) // Figma uses node IDs like 123:456
        if (nodeIndex !== -1) {
            // Basic check if it looks like a Figma Node ID (contains :)            
            if (pathParts[nodeIndex].includes(':')) {
                 nodeId = decodeURIComponent(pathParts[nodeIndex])
            }
        }
    }

    // Figma API needs node IDs URL-encoded sometimes (e.g., 1:2 becomes 1%3A2)
    // but the figma-api library likely handles this. Let's keep it decoded for now.
    // if (nodeId) {
    //   nodeId = decodeURIComponent(nodeId)
    // }

    return { fileKey, nodeId }
  } catch (error) {
    console.error('Error parsing Figma URL:', error)
    return { fileKey: null, nodeId: null }
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const figmaUrl = searchParams.get('figmaUrl')

  if (!figmaUrl) {
    return Response.json({ error: 'Missing figmaUrl parameter' }, { status: 400 })
  }

  console.log('Received request for Figma URL:', figmaUrl)

  const { fileKey, nodeId } = extractFigmaDetails(figmaUrl)

  console.log('Extracted details:', { fileKey, nodeId })

  const personalAccessToken = process.env.FIGMA_PERSONAL_ACCESS_TOKEN
  console.log('Attempting to use Figma Token from env:', personalAccessToken ? `Token found (Length: ${personalAccessToken.length})` : 'Token NOT FOUND in env!');

  if (!personalAccessToken) {
    console.error('Figma Personal Access Token not found in environment variables.')
    return Response.json({ error: 'Server configuration error: Missing Figma token' }, { status: 500 })
  }

  if (!fileKey) {
    return Response.json({ error: 'Could not extract fileKey from the provided Figma URL' }, { status: 400 })
  }
  if (!nodeId) {
      return Response.json({ error: 'Could not extract nodeId from the provided Figma URL. Please link directly to a node/layer.' }, { status: 400 })
  }

  // --- Using fetch API directly --- 
  const encodedNodeId = encodeURIComponent(nodeId) // Ensure Node ID is URL encoded (e.g., 1:2 -> 1%3A2)
  const figmaApiUrl = `https://api.figma.com/v1/files/${fileKey}/nodes?ids=${encodedNodeId}`

  console.log(`Calling Figma API via fetch: ${figmaApiUrl}`)

  try {
    const response = await fetch(figmaApiUrl, {
      method: 'GET',
      headers: {
        'X-Figma-Token': personalAccessToken,
      },
    });

    console.log(`Figma API response status: ${response.status}`) 

    if (!response.ok) {
      // Attempt to read the error body from Figma
      let errorBody = 'Could not read error body';
      try {
        errorBody = await response.json(); // Figma usually returns JSON errors
      } catch (parseError) {
        console.error('Failed to parse error response body as JSON:', parseError);
        errorBody = await response.text(); // Fallback to text
      }
      console.error('Figma API Error:', { status: response.status, statusText: response.statusText, body: errorBody });
      // Throw an error to be caught by the outer catch block
      throw new Error(`Figma API request failed with status ${response.status}`);
    }

    // Parse the successful JSON response
    const data = await response.json();

    // --- FIX: Convert nodeId from URL format (e.g., 83-7503) to Figma API key format (e.g., 83:7503) ---
    const figmaNodeIdKey = nodeId.replace('-', ':');
    console.log(`Using key '${figmaNodeIdKey}' to access nodes object.`);
    // --------------------------------------------------------------------------------------------------

    // Extract the specific node document - structure is { nodes: { [nodeIdKey]: { document: ... } } }
    const nodeDocument = data?.nodes?.[figmaNodeIdKey]?.document; 

    if (!nodeDocument) {
        console.error(`Node document for key '${figmaNodeIdKey}' is missing in the Figma API response (fetch):`, data);
        return Response.json({ error: 'Node document not found in Figma response' }, { status: 404 });
    }

    console.log('Successfully fetched Figma node data via fetch.');
    return Response.json(nodeDocument);

  } catch (error: any) {
    console.error('Error during fetch call to Figma API:', error);
    return Response.json({ error: 'Failed to fetch Figma data via fetch', details: error?.message }, { status: 500 })
  }
} 