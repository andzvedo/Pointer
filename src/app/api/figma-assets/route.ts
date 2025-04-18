import { NextRequest } from 'next/server'
import JSZip from 'jszip'

// Função utilitária para extrair fileKey da URL do Figma
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

// Função recursiva para encontrar todos os nodes de asset
function findAssetNodes(node: any, assets: {vectors: any[]; images: any[]}) {
  if (!node) return
  if (node.type === 'VECTOR' || node.type === 'vector' || node.type === 'ICON') {
    assets.vectors.push({id: node.id, name: node.name || node.id})
  }
  if (node.type === 'IMAGE' || node.type === 'image') {
    assets.images.push({id: node.id, name: node.name || node.id})
  }
  if (node.children && Array.isArray(node.children)) {
    node.children.forEach((child: any) => findAssetNodes(child, assets))
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const figmaUrl = searchParams.get('figmaUrl')
  const figmaToken = process.env.FIGMA_TOKEN
  console.log('[API/figma-assets] Requisição recebida. figmaUrl:', figmaUrl)
  if (!figmaUrl || !figmaToken) {
    console.error('[API/figma-assets] Faltando figmaUrl ou FIGMA_TOKEN.')
    return new Response(JSON.stringify({ error: 'Missing figmaUrl or Figma API token' }), { status: 400 })
  }
  const headers = { 'X-Figma-Token': figmaToken } as Record<string, string>;

  const fileKey = extractFileKey(figmaUrl)
  console.log('[API/figma-assets] fileKey extraído:', fileKey)
  if (!fileKey) {
    console.error('[API/figma-assets] Figma URL inválida.')
    return new Response(JSON.stringify({ error: 'Invalid Figma URL' }), { status: 400 })
  }

  // 1. Buscar JSON bruto do Figma
  const fileRes = await fetch(`https://api.figma.com/v1/files/${fileKey}`, {
    headers
  })
  console.log('[API/figma-assets] Status da busca do arquivo:', fileRes.status)
  if (!fileRes.ok) {
    const msg = await fileRes.text()
    console.error('[API/figma-assets] Erro ao buscar arquivo do Figma:', msg)
    return new Response(JSON.stringify({ error: 'Could not fetch Figma file', details: msg }), { status: 500 })
  }
  const fileJson = (await fileRes.json()) as any

  // 2. Encontrar todos os assets
  const assets = { vectors: [], images: [] } as { vectors: any[]; images: any[] }
  findAssetNodes((fileJson as any).document, assets)
  console.log(`[API/figma-assets] Assets encontrados: SVGs=${assets.vectors.length} | Imagens=${assets.images.length}`)

  // 3. Buscar URLs dos assets via API do Figma
  async function getAssetUrls(type: 'svg' | 'png', nodes: any[]) {
    if (nodes.length === 0) return {}
    const ids = nodes.map(n => n.id).join(',')
    if (!ids) return {}
    const url = `https://api.figma.com/v1/images/${fileKey}?ids=${ids}&format=${type}`
    const res = await fetch(url, { headers })
    if (!res.ok) return {}
    const data = (await res.json()) as any
    return data.images || {}
  }
  const vectorUrls = await getAssetUrls('svg', assets.vectors)
  const imageUrls = await getAssetUrls('png', assets.images)

  // 4. Baixar assets
  const zip = new JSZip()
  const assetMap: Record<string, string> = {} // nodeId -> asset path
  // SVGs
  await Promise.all(
    assets.vectors.map(async (node) => {
      const assetUrl = vectorUrls[node.id]
      if (assetUrl) {
        const resp = await fetch(assetUrl)
        const svg = await resp.text()
        const filename = `assets/${node.name || node.id}.svg`
        zip.file(filename, svg)
        assetMap[node.id] = filename
      }
    })
  )
  // PNGs
  await Promise.all(
    assets.images.map(async (node) => {
      const assetUrl = imageUrls[node.id]
      if (assetUrl) {
        const resp = await fetch(assetUrl)
        const buffer = await resp.arrayBuffer()
        const filename = `assets/${node.name || node.id}.png`
        zip.file(filename, Buffer.from(buffer))
        assetMap[node.id] = filename
      }
    })
  )

  // 5. Atualizar AST para referenciar os assets
  function patchAstWithAssets(node: any) {
    if (!node) return
    if (assetMap[node.id]) {
      node.asset = assetMap[node.id]
    }
    if (node.children && Array.isArray(node.children)) {
      node.children.forEach(patchAstWithAssets)
    }
  }
  patchAstWithAssets((fileJson as any).document)

  // 6. Adicionar AST ao ZIP
  zip.file('design-ast.json', JSON.stringify((fileJson as any).document, null, 2))

  // 7. Gerar ZIP e retornar
  const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' })
  return new Response(zipBuffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': 'attachment; filename="design-assets.zip"'
    }
  })
}
