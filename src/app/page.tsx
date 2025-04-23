import { PointerApp } from '@/components/PointerApp';

export const metadata = {
  title: 'Figma Design Translator - Extração de Contexto para Ferramentas de IA',
  description:
    'Transforme seus designs do Figma em representações estruturadas (AST) que podem ser usadas por ferramentas como Cursor e Windsurf para implementação de código com IA',
}

export default function Home() {
  return (
    <PointerApp />
  );
}
