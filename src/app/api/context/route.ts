/**
 * API Route para geração de contexto a partir de um link do Figma
 * 
 * Recebe um link do Figma, extrai os dados e gera um bundle de contexto
 * otimizado para LLMs e VLMs.
 */

import { NextRequest } from 'next/server';
import { NextResponse } from 'next/dist/server/web/spec-extension/response';
import { generateContextBundle, bundleToMarkdown } from '@/lib/contextGenerator';
import { hygienizeFigmaData, generateHygieneReport } from '@/lib/figmaHygiene';

// Utilitário para extrair fileKey e nodeId da URL do Figma
function extractFigmaParams(url: string): { fileKey: string | null; nodeId: string | null } {
  try {
    // Garantir que a URL está decodificada corretamente
    const decodedUrl = url.includes('%') ? decodeURIComponent(url) : url;
    
    const parsedUrl = new URL(decodedUrl);
    const pathParts = parsedUrl.pathname.split('/');
    
    // Suporta vários formatos de URL do Figma
    const fileIndex = pathParts.findIndex(part => ['file', 'design', 'proto'].includes(part));
    
    // Extract fileKey
    let fileKey: string | null = null;
    if (fileIndex !== -1 && pathParts.length > fileIndex + 1) {
      fileKey = pathParts[fileIndex + 1];
    }
    
    // Extract nodeId from URL parameters or path
    let nodeId: string | null = null;
    const nodeIdParam = parsedUrl.searchParams.get('node-id');
    
    if (nodeIdParam) {
      nodeId = nodeIdParam;
    } else {
      // Try to find node-id in other formats
      for (const param of ['node', 'nodeId']) {
        const value = parsedUrl.searchParams.get(param);
        if (value) {
          nodeId = value;
          break;
        }
      }
    }
    
    // Normalize nodeId format (replace - with :)
    if (nodeId) {
      nodeId = nodeId.replace(/-/g, ':');
    }
    
    return { fileKey, nodeId };
  } catch (error) {
    console.error('Error extracting Figma params:', error);
    return { fileKey: null, nodeId: null };
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const figmaUrl = searchParams.get('figmaUrl');
  const format = searchParams.get('format') || 'json'; // 'json' ou 'markdown'
  const includeRaw = searchParams.get('includeRaw') === 'true';
  const skipHygiene = searchParams.get('skipHygiene') === 'true'; // Opção para pular a higienização
  
  if (!figmaUrl) {
    return NextResponse.json({ error: 'Missing figmaUrl parameter' }, { status: 400 });
  }
  
  const figmaToken = process.env.FIGMA_TOKEN;
  if (!figmaToken) {
    return NextResponse.json({ error: 'Figma API token not configured' }, { status: 500 });
  }
  
  // Extrair fileKey e nodeId da URL
  const { fileKey, nodeId } = extractFigmaParams(figmaUrl);
  
  if (!fileKey) {
    return NextResponse.json({ error: 'Invalid Figma URL: could not extract fileKey' }, { status: 400 });
  }
  
  if (!nodeId) {
    return NextResponse.json({ error: 'Invalid Figma URL: could not extract nodeId' }, { status: 400 });
  }
  
  try {
    // Buscar dados do Figma
    console.log(`Fetching Figma data for fileKey=${fileKey}, nodeId=${nodeId}`);
    const figmaApiUrl = `https://api.figma.com/v1/files/${fileKey}/nodes?ids=${nodeId}`;
    const figmaResponse = await fetch(figmaApiUrl, {
      headers: {
        'X-Figma-Token': figmaToken
      }
    });
    
    if (!figmaResponse.ok) {
      const errorText = await figmaResponse.text();
      console.error('Figma API error:', errorText);
      return NextResponse.json({ 
        error: 'Failed to fetch data from Figma API',
        details: errorText
      }, { status: figmaResponse.status });
    }
    
    // Buscar imagem do node
    console.log(`Fetching image for fileKey=${fileKey}, nodeId=${nodeId}`);
    const figmaImageUrl = `https://api.figma.com/v1/images/${fileKey}?ids=${nodeId}&format=png&scale=2`;
    const imageResponse = await fetch(figmaImageUrl, {
      headers: {
        'X-Figma-Token': figmaToken
      }
    });
    
    let imageUrl = null;
    if (imageResponse.ok) {
      const imageData = await imageResponse.json();
      if (imageData.images && imageData.images[nodeId]) {
        imageUrl = imageData.images[nodeId];
        console.log(`Successfully fetched image: ${imageUrl}`);
      }
    } else {
      console.error('Failed to fetch Figma image:', await imageResponse.text());
    }
    
    let figmaData = await figmaResponse.json();
    let hygieneReport = null;
    
    // Aplicar higienização aos dados do Figma, se não for pulada
    if (!skipHygiene) {
      console.log(`Applying hygiene to Figma data for nodeId=${nodeId}`);
      const originalData = { ...figmaData };
      figmaData = hygienizeFigmaData(figmaData);
      hygieneReport = generateHygieneReport(originalData, figmaData);
      console.log(`Hygiene complete: ${hygieneReport.nodesRemoved} nodes removed, ${hygieneReport.sizeReductionPercentage} size reduction`);
    }
    
    // Gerar bundle de contexto
    const contextBundle = generateContextBundle(figmaData, figmaUrl, nodeId, {
      includeRawData: includeRaw,
      generateSummary: true,
      inferRoles: true
    });
    
    // Adicionar relatório de higiene ao bundle, se disponível
    if (hygieneReport) {
      contextBundle.metadata.hygieneReport = hygieneReport;
    }
    
    // Adicionar URL da imagem ao bundle, se disponível
    if (imageUrl) {
      contextBundle.visual.imageUrl = imageUrl;
    }
    
    // Retornar no formato solicitado
    if (format === 'markdown') {
      const markdown = bundleToMarkdown(contextBundle);
      return new NextResponse(markdown, {
        headers: {
          'Content-Type': 'text/markdown; charset=utf-8'
        }
      });
    }
    
    // Formato padrão: JSON
    return NextResponse.json(contextBundle);
  } catch (error) {
    console.error('Error generating context:', error);
    return NextResponse.json({ 
      error: 'Failed to generate context',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
