/**
 * Script para dividir o AST do Figma em arquivos menores
 * Este script pega o AST completo exportado pelo fetch-figma-ast.ts
 * e o divide em arquivos menores para cada COMPONENT e FRAME
 */

const fs = require('fs');
const path = require('path');

// Interfaces para tipagem do AST do Figma
interface FigmaNode {
  id: string;
  name: string;
  type: string;
  children?: FigmaNode[];
  [key: string]: any; // Para outras propriedades que podem existir
}

// Configurações
const AST_PATH = path.resolve(__dirname, '../public/images/design-ast.json');
const OUTPUT_DIR = path.resolve(__dirname, '../tools/figma-ast-split');
const INDEX_FILE = path.resolve(OUTPUT_DIR, 'index.json');

// Tipos de nós que serão salvos como arquivos separados
const SAVE_NODE_TYPES = ['COMPONENT', 'FRAME', 'COMPONENT_SET', 'INSTANCE'];

// Estatísticas para o relatório final
const stats = {
  totalNodes: 0,
  savedNodes: 0,
  errors: 0
};

/**
 * Garante que um diretório exista, criando-o se necessário
 */
function ensureDir(dir: string): void {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/**
 * Sanitiza um nome para uso em caminhos de arquivo
 */
function sanitizeName(name: string): string {
  return name.replace(/[\\/:\"*?<>|]+/g, '_').trim();
}

/**
 * Salva um nó AST em um arquivo, criando subpastas conforme figmaPath
 */
function saveAstNode(node: FigmaNode, figmaPath: string[]): void {
  try {
    // Cria o diretório se não existir
    const dir = path.join(OUTPUT_DIR, ...figmaPath.slice(0, -1));
    ensureDir(dir);
    
    // Define o nome do arquivo
    const fileName = `${figmaPath[figmaPath.length - 1]}.ast.json`;
    const filePath = path.join(dir, fileName);
    
    // Salva o arquivo
    fs.writeFileSync(filePath, JSON.stringify(node, null, 2), 'utf-8');
    
    // Atualiza estatísticas
    stats.savedNodes++;
    
    // Log
    console.log(`✅ Salvo: ${filePath}`);
  } catch (error) {
    console.error(`❌ Erro ao salvar ${figmaPath.join('/')}: ${error}`);
    stats.errors++;
  }
}

/**
 * Cria um índice de todos os nós salvos
 */
function createNodeIndex(nodeMap: Map<string, string>): void {
  try {
    const index = {
      total: nodeMap.size,
      nodes: Object.fromEntries(nodeMap)
    };
    
    fs.writeFileSync(INDEX_FILE, JSON.stringify(index, null, 2), 'utf-8');
    console.log(`✅ Índice criado com ${nodeMap.size} nós em: ${INDEX_FILE}`);
  } catch (error) {
    console.error(`❌ Erro ao criar índice: ${error}`);
    stats.errors++;
  }
}

/**
 * Percorre recursivamente a árvore AST e salva subárvores relevantes
 */
function traverse(
  node: FigmaNode, 
  pathArr: string[] = [], 
  nodeMap: Map<string, string> = new Map()
): void {
  if (!node) return;
  
  stats.totalNodes++;
  
  // Sanitiza o nome do nó para uso em caminhos
  const nodeName = node.name ? sanitizeName(node.name) : 'unnamed';
  
  // Determina o caminho para este nó
  const currentPath = [...pathArr];
  if (node.name) {
    currentPath.push(nodeName);
  }
  
  // Salva o nó se for de um tipo relevante
  if (SAVE_NODE_TYPES.includes(node.type) && node.name) {
    const figmaPath = currentPath;
    saveAstNode(node, figmaPath);
    
    // Adiciona ao mapa de nós para o índice
    const relativePath = figmaPath.join('/') + '.ast.json';
    nodeMap.set(node.id, relativePath);
  }
  
  // Recursão para filhos
  if (Array.isArray(node.children)) {
    node.children.forEach((child: FigmaNode) => {
      traverse(child, currentPath, nodeMap);
    });
  }
}

/**
 * Função principal
 */
function main(): void {
  console.log('🔍 Iniciando divisão do AST do Figma...');
  console.log(`📂 Lendo AST de: ${AST_PATH}`);
  
  try {
    // Limpa e cria o diretório de saída
    if (fs.existsSync(OUTPUT_DIR)) {
      console.log(`🗑️  Limpando diretório de saída: ${OUTPUT_DIR}`);
      fs.rmSync(OUTPUT_DIR, { recursive: true, force: true });
    }
    ensureDir(OUTPUT_DIR);
    
    // Lê o AST
    const ast: FigmaNode = JSON.parse(fs.readFileSync(AST_PATH, 'utf-8'));
    
    // Mapa para armazenar os IDs dos nós e seus caminhos relativos
    const nodeMap = new Map<string, string>();
    
    // Processa o AST
    traverse(ast, [], nodeMap);
    
    // Cria um índice de todos os nós
    createNodeIndex(nodeMap);
    
    // Relatório final
    console.log('\n📊 Relatório:');
    console.log(`Total de nós processados: ${stats.totalNodes}`);
    console.log(`Nós salvos: ${stats.savedNodes}`);
    console.log(`Erros: ${stats.errors}`);
    console.log('\n✨ Divisão concluída!');
  } catch (error) {
    console.error(`❌ Erro: ${error}`);
  }
}

// Executa o script
main();