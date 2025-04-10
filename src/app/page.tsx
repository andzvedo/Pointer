import FigmaEditor from '../components/FigmaEditor';

export const metadata = {
  title: 'Figma Design Translator - Extração de Contexto para Ferramentas de IA',
  description: 'Transforme seus designs do Figma em representações estruturadas (AST) que podem ser usadas por ferramentas como Cursor e Windsurf para implementação de código com IA',
};

export default function Home() {
  return (
    <>
      <FigmaEditor />
      <footer className="py-6 text-center text-sm text-gray-500">
        <p>© 2024 Pointer.design - Tradutor de Design Figma para Integração com Ferramentas de IA</p>
      </footer>
    </>
  );
}
