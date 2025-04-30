import { NextRequest } from 'next/server'

// Utilitário para extrair fileKey da URL do Figma
function extractFileKey(url: string): string | null {
  try {
    const decodedUrl = url.includes('%') ? decodeURIComponent(url) : url
    const parsedUrl = new URL(decodedUrl)
    const pathParts = parsedUrl.pathname.split('/')
    const fileIndex = pathParts.findIndex(part => ['file', 'design', 'proto'].includes(part))
    if (fileIndex !== -1 && pathParts.length > fileIndex + 1) {
      return pathParts[fileIndex + 1]
    }
    return null
  } catch {
    return null
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const figmaUrl = searchParams.get('figmaUrl')
  let nodeId = searchParams.get('nodeId')
  // Permitir nodeId com '-' ou ':'
  if (nodeId) {
    nodeId = nodeId.replace(/-/g, ':')
  }
  const figmaToken = process.env.FIGMA_TOKEN

  if (!figmaUrl || !nodeId || !figmaToken) {
    return new Response('Missing figmaUrl, nodeId or Figma API token', { status: 400 })
  }

  const fileKey = extractFileKey(figmaUrl)
  if (!fileKey) {
    return new Response('Invalid Figma URL', { status: 400 })
  }

  // Buscar SVG do node específico
  const url = `https://api.figma.com/v1/images/${fileKey}?ids=${nodeId}&format=svg`
  const headers = { 'X-Figma-Token': figmaToken } as Record<string, string>
  const res = await fetch(url, { headers })
  if (!res.ok) {
    return new Response('Could not fetch SVG from Figma', { status: 500 })
  }
  const data = await res.json()
  const svgUrl = data.images?.[nodeId]
  if (!svgUrl) {
    return new Response('SVG URL not found for node', { status: 404 })
  }
  // Buscar SVG real do asset
  const svgRes = await fetch(svgUrl)
  if (!svgRes.ok) {
    return new Response('Could not fetch SVG file', { status: 500 })
  }
  const svg = await svgRes.text()
  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=31536000',
    },
  })

}
