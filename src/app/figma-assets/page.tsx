"use client"
import React, { useState } from "react"

export default function FigmaAssetsPage() {
  const [figmaUrl, setFigmaUrl] = useState("")
  const [svgContent, setSvgContent] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  function extractNodeId(url: string): string | null {
    const match = url.match(/[?&]node-id=([^&#]+)/)
    if (match && match[1]) {
      return match[1].replace(/-/g, ':')
    }
    return null
  }

  async function handleFetchSvg(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSvgContent(null)
    setLoading(true)
    try {
      const nodeId = extractNodeId(figmaUrl)
      if (!nodeId) {
        setError("Node ID não encontrado na URL do Figma.")
        setLoading(false)
        return
      }
      const url = `/api/figma-asset?figmaUrl=${encodeURIComponent(figmaUrl)}&nodeId=${encodeURIComponent(nodeId)}`
      const res = await fetch(url)
      if (!res.ok) {
        setError(await res.text())
        setLoading(false)
        return
      }
      const svg = await res.text()
      setSvgContent(svg)
    } catch (err: any) {
      setError(err.message || "Erro desconhecido")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-4">Buscar SVG de Node Figma</h1>
      <form className="space-y-4" onSubmit={handleFetchSvg}>
        <div>
          <label className="block font-medium">URL do Figma:</label>
          <input
            type="text"
            className="w-full border rounded px-2 py-1"
            value={figmaUrl}
            onChange={e => setFigmaUrl(e.target.value)}
            placeholder="Cole aqui a URL do arquivo Figma"
            required
          />
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-60"
          disabled={loading}
        >{loading ? "Buscando..." : "Buscar SVG"}</button>
      </form>
      {error && <div className="text-red-600 mt-4">{error}</div>}
      {svgContent && (
        <div className="mt-6">
          <div className="font-mono text-xs mb-2">Prévia do SVG:</div>
          <div
            className="border rounded bg-white flex items-center"
            style={{ maxHeight: '400px', overflow: 'auto' }}
            dangerouslySetInnerHTML={{ __html: svgContent }}
          />
          <div className="mt-0">
            <button
              className="underline text-blue-700"
              onClick={() => {
                // Extrai o nodeId novamente da URL do Figma
                const match = figmaUrl.match(/[?&]node-id=([^&#]+)/)
                const nodeId = match && match[1] ? match[1].replace(/-/g, ':') : 'figma-node'
                const blob = new Blob([svgContent!], { type: 'image/svg+xml' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `${nodeId}.svg`
                document.body.appendChild(a)
                a.click()
                a.remove()
                URL.revokeObjectURL(url)
              }}
            >Baixar SVG</button>
          </div>
        </div>
      )}
    </div>
  )
}
