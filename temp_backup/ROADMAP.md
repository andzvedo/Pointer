# Roadmap: Pointer.design - Figma Visual Editor

## Objetivo Principal

Criar uma ferramenta web que permita a designers manipular visualmente designs existentes do Figma (componentes, layouts) e gerar código frontend (React/Tailwind CSS) limpo e production-ready, conectando diretamente o fluxo de design ao desenvolvimento.

## Arquitetura Geral

*   **Frontend:** Next.js (React, TypeScript), Tailwind CSS, Shadcn/UI
*   **Backend:** Next.js API Routes (Node.js)
*   **Integração Figma:** API REST do Figma via `fetch`
*   **Canvas de Edição:** HTML/CSS/SVG manipulados via React
*   **Renderização Figma:** Suporte para gradientes, efeitos visuais e Auto Layout

## Fases de Implementação

### Fase 1: Fundação e Conexão API

*   [x] Estruturar projeto base para novos módulos.
*   [x] Criar API Route (`/api/figma`) para receber URL do Figma.
*   [x] Implementar extração de `fileKey` e `nodeId` da URL na API Route.
*   [x] Configurar uso de Personal Access Token via variáveis de ambiente (`.env.local`).
*   [x] Implementar chamada à API REST do Figma usando `fetch` para buscar dados do nó (`/v1/files/:file_key/nodes`).
*   [x] Resolver problemas de autenticação e acesso aos dados (Erro 404 -> 200 OK).
*   [x] Criar interface frontend básica (Input de URL, Botão, Exibição de Status/Erro/JSON) em `src/app/page.tsx`.
*   [ ] Refinar tratamento de erros na API Route e no Frontend.
*   [ ] Adicionar validação mais robusta da URL do Figma no frontend e backend.
    
🎨 Design files: 
    https://www.figma.com/design/ezXGzVgULKqKPpnzPTJYHw/DesignTools-Visual-Editor?node-id=148-936&t=yJROdgmvRFLQBCMp-11

### Fase 2: Visualização Básica do Nó Figma

*   [x] Analisar a estrutura de dados JSON retornada pela API Figma para um nó.
*   [x] Criar componentes React no frontend para renderizar uma representação visual *simplificada* do nó buscado (ex: exibir nome, tipo, dimensões, cores de fundo/texto básicas).
*   [x] Exibir esta visualização simplificada na área de resultados da página, em vez do JSON bruto.
*   [ ] Lidar com diferentes tipos de nós básicos (FRAME, RECTANGLE, TEXT).

🎨 Design files:
    https://www.figma.com/design/ezXGzVgULKqKPpnzPTJYHw/DesignTools-Visual-Editor?node-id=154-412&t=gUvViNHI1oDte9vO-11

### Fase 3: Canvas de Edição Interativo

*   [ ] Projetar a arquitetura do canvas de edição (escolher abordagem: manipulação direta do DOM/SVG, biblioteca como Konva, etc.).
*   [ ] Renderizar o nó Figma buscado de forma mais fiel dentro do canvas.
*   [ ] Implementar seleção de elementos dentro do nó renderizado no canvas.
*   [ ] Implementar manipulação visual básica (mover, redimensionar) para elementos selecionados.
*   [ ] Criar um painel de propriedades (sidebar) para exibir as propriedades do elemento selecionado (ex: dimensões, cores, texto).
*   [ ] Implementar edição de propriedades básicas no painel lateral (ex: alterar cor de fundo, conteúdo de texto).
*   [ ] Refletir as mudanças do painel de propriedades na visualização do canvas em tempo real.

### Fase 4: Geração de Código (Visual -> Código)

*   [ ] Definir mapeamentos: Nó Figma + Propriedades -> Componente React + Classes Tailwind.
    *   Ex: Frame com Auto Layout Vertical -> `<div className="flex flex-col ...">`
    *   Ex: Nó de Texto com estilos -> `<p className="text-lg text-blue-500 ...">`
    *   Ex: Retângulo com fill -> `<div className="bg-red-500 ...">`
*   [ ] Implementar a lógica de tradução que recebe a estrutura de dados do nó (modificada ou não pelas edições visuais) e gera o código JSX/Tailwind correspondente.
*   [ ] Exibir o código gerado em tempo real em uma área dedicada na interface (ex: usando `Textarea` ou um editor de código leve).
*   [ ] Garantir que as edições visuais no canvas atualizem o código gerado.

### Fase 5: Refinamento e Exportação

*   [ ] Adicionar botão para copiar o código gerado para a área de transferência.
*   [ ] Refinar a qualidade do código gerado (formatação, otimizações Tailwind).
*   [ ] Implementar suporte para mais propriedades do Figma (Auto Layout avançado, constraints, componentes, etc.).
*   [ ] Melhorar a performance do canvas e da geração de código.
*   [ ] Considerar a exportação do código como um arquivo `.tsx`.

### Fase 6: Funcionalidades Futuras (Pós-MVP)

*   [ ] Explorar endpoints de prototipagem do Figma.
*   [ ] Plugin Figma para enviar seleção diretamente para a ferramenta.
*   [ ] Suporte para edição de componentes Figma e mapeamento para componentes React existentes.
*   [ ] Sincronização bidirecional (Código <-> Visual)?
*   [ ] Integração com Storybook ou outras ferramentas de visualização.
*   [ ] Extensão de navegador para inspeção/edição? 


