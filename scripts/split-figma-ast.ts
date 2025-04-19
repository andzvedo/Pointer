const fs = require('fs');
const path = require('path');

// Caminho para o AST completo exportado do Figma
const AST_PATH = path.resolve(__dirname, '../public/images/design-ast.json');
// Pasta de saída para ASTs divididos
const OUTPUT_DIR = path.resolve(__dirname, '../tools/figma-ast-split');
// Garante que diretórios existam
function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Salva um nó AST em um arquivo, criando subpastas conforme figmaPath
function saveAstNode(node: any, figmaPath: string[]) {
  const dir = path.join(OUTPUT_DIR, ...figmaPath.slice(0, -1));
  ensureDir(dir);
  const fileName = `${figmaPath[figmaPath.length - 1]}.ast.json`;
  const filePath = path.join(dir, fileName);
  fs.writeFileSync(filePath, JSON.stringify(node, null, 2), 'utf-8');
  console.log(`Salvo: ${filePath}`);
}

// Percorre recursivamente a árvore AST e salva subárvores relevantes
function traverse(node: any, pathArr: string[] = []) {
  if (!node) return;

  // Novo critério: salva se for FRAME ou COMPONENT
  if ((node.type === 'COMPONENT' || node.type === 'FRAME') && node.name) {
    const figmaPath = [...pathArr, node.name.replace(/[\\/:"*?<>|]+/g, '_')];
    saveAstNode(node, figmaPath);
  }

  // Recursão para filhos
  if (Array.isArray(node.children)) {
    node.children.forEach((child: any) =>
      traverse(child, [...pathArr, node.name ? node.name.replace(/[\\/:"*?<>|]+/g, '_') : 'unnamed'])
    );
  }
}

// Execução principal
function main() {
  ensureDir(OUTPUT_DIR);
  const ast = JSON.parse(fs.readFileSync(AST_PATH, 'utf-8'));
  traverse(ast, []);
  console.log('Divisão concluída!');
}

main();