import { type NextRequest } from 'next/server'

// Helper function to extract fileKey from Figma URL (nodeId is no longer needed here)
function extractFigmaFileKey(url: string): string | null {
  try {
    const parsedUrl = new URL(url)
    const pathParts = parsedUrl.pathname.split('/')
    const fileIndex = pathParts.findIndex(part => part === 'file' || part === 'design')
    if (fileIndex !== -1 && pathParts.length > fileIndex + 1) {
      return pathParts[fileIndex + 1]
    }
    return null
  } catch (error) {
    console.error('Error parsing Figma URL:', error)
    return null
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const figmaUrl = searchParams.get('figmaUrl')

  if (!figmaUrl) {
    return Response.json({ error: 'Missing figmaUrl parameter' }, { status: 400 })
  }

  console.log('Received request for Figma URL:', figmaUrl)

  const fileKey = extractFigmaFileKey(figmaUrl)

  console.log('Extracted fileKey:', fileKey)

  const personalAccessToken = process.env.FIGMA_PERSONAL_ACCESS_TOKEN
  console.log('Attempting to use Figma Token from env:', personalAccessToken ? `Token found (Length: ${personalAccessToken.length})` : 'Token NOT FOUND in env!');

  if (!personalAccessToken) {
    console.error('Figma Personal Access Token not found in environment variables.')
    return Response.json({ error: 'Server configuration error: Missing Figma token' }, { status: 500 })
  }

  if (!fileKey) {
    return Response.json({ error: 'Could not extract fileKey from the provided Figma URL' }, { status: 400 })
  }

  // --- Fetch the entire file structure --- 
  const figmaApiFileUrl = `https://api.figma.com/v1/files/${fileKey}`
  // We can add ?depth=1 later if we only want top-level children
  console.log(`Calling Figma API via fetch for file: ${figmaApiFileUrl}`)

  try {
    const response = await fetch(figmaApiFileUrl, {
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

    const fileData = await response.json();

    // --- Extract top-level frames from the first page (canvas) --- 
    // The structure is typically fileData.document.children[pageIndex].children
    const firstPage = fileData?.document?.children?.[0];
    if (!firstPage || firstPage.type !== 'CANVAS') {
        console.error('Could not find the first page (Canvas) in the document structure:', fileData?.document);
        return Response.json({ error: 'Invalid Figma file structure: Canvas not found.' }, { status: 500 });
    }

    // --- DEBUG LOG: Log the structure of the first page --- 
    console.log('First page structure (type, children count):', { type: firstPage.type, childrenCount: firstPage.children?.length });
    // --- END DEBUG LOG ---

    const topLevelFrames = firstPage.children?.filter((node: any) => node.type === 'FRAME') || [];
    console.log(`Found ${topLevelFrames.length} top-level frames on the first page.`);

    // Return the array of top-level frame nodes
    return Response.json(topLevelFrames);

  } catch (error: any) {
    console.error('Error during fetch call to Figma API:', error);
    return Response.json({ error: 'Failed to fetch Figma file data via fetch', details: error?.message }, { status: 500 })
  }
} 