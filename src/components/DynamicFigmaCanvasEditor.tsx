import dynamic from 'next/dynamic'

// Importar o FigmaCanvasEditor dinamicamente com SSR desativado
const DynamicFigmaCanvasEditor = dynamic(
  () => import('./FigmaCanvasEditor'),
  { ssr: false }, // Desativa a renderização no lado do servidor
)

export default DynamicFigmaCanvasEditor
