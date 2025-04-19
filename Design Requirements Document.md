# Design Requirements Document

## Visão Geral

Este documento descreve, em detalhes exaustivos, todos os requisitos visuais, funcionais e de interação do fluxo de telas do aplicativo de processamento de URLs do Figma. Ele foi elaborado a partir da triangulação entre o SVG/XML do fluxo completo de mockups e o AST extraído do Figma (`design-ast.json`). O objetivo é garantir que qualquer desenvolvedor ou LLM consiga implementar uma UI 100% pixel perfect, fiel ao design original, apenas com base neste documento.

---

## Tokens Globais de Design

- **Cores**:
  - Primária: `hsl(221 83% 53%)`
  - Fundo geral: `#F2F2F2`
  - Branco: `#FFFFFF`
  - Borda padrão: `#E5E5E5`
  - Sucesso: `#07750B`
  - Erro: `#E53E3E`
  - Texto principal: `#222222`
  - Texto secundário/neutro: `#555555`
- **Tipografia**:
  - Fonte: "Inter"
  - Pesos: 400 (normal), 600 (semibold)
  - Tamanhos: 14px, 16px, 20px (títulos)
  - Letter spacing e line height conforme AST
- **Espaçamentos e Bordas**:
  - Padding de inputs/cards: 16px
  - Border radius: 8px
  - Gap entre elementos: 12px a 24px
  - Altura dos botões: 36px (sm), 40px (default), 44px (lg)
- **Sombras**:
  - Leve: `box-shadow: 0 2px 8px rgba(0,0,0,0.04);`
- **Ícones**:
  - SVG inline, tamanho 24x24px
- **Estados**:
  - Disabled: opacidade 0.5
  - Focus: borda azul primária
  - Hover: alteração leve de fundo ou sombra

---

## Estrutura Geral do Fluxo

O fluxo é composto por 7 telas principais, cada uma representando um estado ou etapa do processamento da URL do Figma. Cada tela é um frame isolado, com agrupamento lógico de elementos e transições claras entre estados.

---

## Tela 1 – Entry Point (Input da URL do Figma)

### Objetivo
Usuário insere a URL do arquivo Figma.

### Hierarquia e Elementos
- **Frame principal**: Centralizado, fundo `#F2F2F2`.
- **Input Field**
  - Node: `FigmaUrlInput`
  - Tipo: `RECTANGLE`
  - Cor: `#FFFFFF`
  - Borda: `#E5E5E5` (1px)
  - Radius: 8px
  - Padding: 16px
  - Placeholder: "Cole a URL do Figma aqui"
  - Fonte: Inter, 16px, cor `#222222`
- **Botão Primário**
  - Node: `SubmitButton`
  - Tipo: `RECTANGLE`
  - Cor: `hsl(221 83% 53%)`
  - Texto: "Extrair"
  - Radius: 8px
  - Altura: 40px
  - Fonte: Inter, 16px, cor `#FFFFFF`
- **Ícone de ação**
  - Node: `SendIcon`
  - Tipo: `VECTOR`
  - Cor: `#222222`
  - Tamanho: 24x24px

### Estados
- Input: idle, focus (borda azul), preenchido, disabled
- Botão: idle, hover, active, disabled

### Interações
- Input: recebe foco, digitação, blur, Enter
- Botão: clique ou Enter envia a URL

### Observações
- Espaçamento vertical entre input e botão: 16px
- Input e botão centralizados no frame

#### Arquivos Complementares
- PNG: `tools/UI Version 1/Mockup/PNG/1-Entry Point_1.png`
- SVG: `tools/UI Version 1/Mockup/SVG/1-Entry Point_1.svg`
- XML: `tools/UI Version 1/Mockup/XML/1-Entry Point_1.xml`
- AST (todos os detalhes de nodes, estilos e hierarquia): `tools/UI Version 1/Structure/design-ast.json` (procure por "FigmaUrlInput", "SubmitButton", "SendIcon")
- Fluxo completo: `tools/UI Version 1/Mockup/SVG/Fluxo completo.svg`, `tools/UI Version 1/Mockup/XML/Fluxo completo.xml`

---

## Tela 2 – Validação/Processamento Inicial

### Objetivo
Indicar que a URL está sendo validada/processada.

### Hierarquia e Elementos
- **Frame principal**: Igual à Tela 1
- **Input Field**
  - Disabled (opacidade 0.5)
- **Botão**
  - Estado loading (exibe spinner)
- **Spinner**
  - Node: `LoadingSpinner`
  - Tipo: `VECTOR`
  - Cor: `hsl(221 83% 53%)`
  - Tamanho: 24x24px
- **Mensagem opcional**: "Validando URL...", fonte 14px, cor `#555555`

### Estados
- Input e botão desabilitados
- Spinner animado

### Interações
- Nenhuma interação enquanto loading

### Observações
- Feedback visual claro de processamento

#### Arquivos Complementares
- PNG: `tools/UI Version 1/Mockup/PNG/2.png`
- SVG: `tools/UI Version 1/Mockup/SVG/2.svg`
- XML: (fluxo completo)
- AST: `tools/UI Version 1/Structure/design-ast.json` (procure por "LoadingSpinner", "FigmaUrlInput", "SubmitButton")
- Fluxo completo: `tools/UI Version 1/Mockup/SVG/Fluxo completo.svg`, `tools/UI Version 1/Mockup/XML/Fluxo completo.xml`

---

## Tela 3 – Erro de Validação

### Objetivo
Exibir mensagem de erro caso a URL seja inválida.

### Hierarquia e Elementos
- **Frame principal**: Igual à Tela 1
- **Input Field**
  - Borda: `#E53E3E` (vermelha, 1px)
  - Sombra leve
- **Mensagem de erro**
  - Node: `ErrorMessage`
  - Texto: "URL inválida. Tente novamente."
  - Cor: `#E53E3E`
  - Fonte: Inter, 14px, semibold
  - Posição: abaixo do input, espaçamento 8px
- **Botão**
  - Estado normal, pronto para novo envio

### Estados
- Input: erro (borda vermelha), shake animation
- Mensagem: fade-in

### Interações
- Input: digitação habilitada
- Botão: clique ou Enter tenta novamente

### Observações
- Mensagem de erro sempre visível enquanto houver erro

#### Arquivos Complementares
- PNG: `tools/UI Version 1/Mockup/PNG/3.png`
- SVG: `tools/UI Version 1/Mockup/SVG/3.svg`
- XML: (fluxo completo)
- AST: `tools/UI Version 1/Structure/design-ast.json` (procure por "ErrorMessage", "FigmaUrlInput", "SubmitButton")
- Fluxo completo: `tools/UI Version 1/Mockup/SVG/Fluxo completo.svg`, `tools/UI Version 1/Mockup/XML/Fluxo completo.xml`

---

## Tela 4 – Sucesso

### Objetivo
Indicar que a URL foi aceita e os dados extraídos com sucesso.

### Hierarquia e Elementos
- **Frame principal**: Igual à Tela 1
- **Input Field**: Disabled (opacidade 0.5)
- **Ícone de sucesso**
  - Node: `SuccessIcon`
  - Tipo: `VECTOR`
  - Cor: `#07750B`
  - Tamanho: 24x24px
  - Posição: à direita do input
- **Mensagem de sucesso**
  - Node: `SuccessMessage`
  - Texto: "Dados extraídos com sucesso!"
  - Cor: `#07750B`
  - Fonte: Inter, 14px, semibold
  - Posição: abaixo do input
- **Botão**
  - Disabled

### Estados
- Feedback visual de sucesso (ícone + mensagem)

### Interações
- Avanço automático após timeout OU botão "Próximo"

### Observações
- Mensagem e ícone aparecem com fade-in

#### Arquivos Complementares
- PNG: `tools/UI Version 1/Mockup/PNG/4.png`
- SVG: `tools/UI Version 1/Mockup/SVG/4.svg`
- XML: (fluxo completo)
- AST: `tools/UI Version 1/Structure/design-ast.json` (procure por "SuccessIcon", "SuccessMessage", "FigmaUrlInput")
- Fluxo completo: `tools/UI Version 1/Mockup/SVG/Fluxo completo.svg`, `tools/UI Version 1/Mockup/XML/Fluxo completo.xml`

---

## Tela 5 – Exibição dos Dados Extraídos

### Objetivo
Mostrar ao usuário os dados extraídos do arquivo Figma.

### Hierarquia e Elementos
- **Frame principal**: Card maior, fundo branco, sombra leve
- **Lista de componentes**
  - Node: `ComponentList`
  - Cada item:
    - Node: `ComponentItem`
    - Nome do componente (Inter, 16px, `#222222`)
    - Ícone do tipo (SVG, 24x24px)
    - Botão de ação (ex: copiar, node `CopyButton`, ícone de copiar)
    - Espaçamento entre itens: 12px
- **Botão de ação global**
  - Node: `CopyAllButton`
  - Texto: "Copiar tudo"
  - Ícone: `CopyIcon`
  - Cor: primária
  - Altura: 40px

### Estados
- Hover nos itens da lista (fundo `#F2F2F2`)
- Botão de copiar: idle, hover, sucesso (feedback visual)

### Interações
- Clique em item: seleciona/destaca
- Botão de copiar: copia conteúdo, mostra feedback

### Observações
- Card centralizado, padding 24px

#### Arquivos Complementares
- PNG: `tools/UI Version 1/Mockup/PNG/5.png`
- SVG: `tools/UI Version 1/Mockup/SVG/5.svg`
- XML: (fluxo completo)
- AST: `tools/UI Version 1/Structure/design-ast.json` (procure por "ComponentList", "ComponentItem", "CopyButton")
- Fluxo completo: `tools/UI Version 1/Mockup/SVG/Fluxo completo.svg`, `tools/UI Version 1/Mockup/XML/Fluxo completo.xml`

---

## Tela 6 – Pré-visualização

### Objetivo
Permitir ao usuário visualizar os SVGs/componentes extraídos.

### Hierarquia e Elementos
- **Frame principal**: Card grande, fundo branco, borda `#E5E5E5`, sombra leve
- **Área de preview**
  - Node: `PreviewArea`
  - SVG inline, centralizado
  - Fundo branco, padding 24px
- **Botões de ação**
  - Node: `DownloadButton`, ícone de download
  - Node: `CopySVGButton`, ícone de copiar
  - Cor: primária
  - Altura: 40px
  - Espaçamento entre botões: 12px

### Estados
- Hover nos botões (leve alteração de cor/sombra)
- Feedback ao copiar/baixar (ex: tooltip ou mensagem)

### Interações
- Clique em botões executa ação

### Observações
- Área de preview com borda e sombra para destaque

#### Arquivos Complementares
- PNG: `tools/UI Version 1/Mockup/PNG/6.png`
- SVG: `tools/UI Version 1/Mockup/SVG/6.svg`
- XML: (fluxo completo)
- AST: `tools/UI Version 1/Structure/design-ast.json` (procure por "PreviewArea", "DownloadButton", "CopySVGButton")
- Fluxo completo: `tools/UI Version 1/Mockup/SVG/Fluxo completo.svg`, `tools/UI Version 1/Mockup/XML/Fluxo completo.xml`

---

## Tela 7 – Preview Final/Exportação

### Objetivo
Exibir o SVG final/exportável e ações finais.

### Hierarquia e Elementos
- **Frame principal**: Card de destaque, fundo branco, sombra forte
- **Área de destaque para SVG final**
  - Node: `FinalSVGArea`
  - SVG inline, centralizado
  - Padding 32px
- **Botão de exportação**
  - Node: `ExportButton`
  - Texto: "Exportar SVG"
  - Cor: primária
  - Altura: 44px
  - Fonte: Inter, 16px, cor `#FFFFFF`
- **Feedback de exportação**
  - Mensagem: "SVG exportado com sucesso!"
  - Cor: `#07750B`, fonte 14px

### Estados
- Botão: idle, hover, loading, sucesso
- Feedback aparece após exportação

### Interações
- Clique em exportar inicia download
- Feedback visual após sucesso

### Observações
- Card centralizado, espaçamento generoso

#### Arquivos Complementares
- PNG: `tools/UI Version 1/Mockup/PNG/7.png`
- SVG: `tools/UI Version 1/Mockup/SVG/7.svg`
- XML: (fluxo completo)
- AST: `tools/UI Version 1/Structure/design-ast.json` (procure por "FinalSVGArea", "ExportButton")
- Fluxo completo: `tools/UI Version 1/Mockup/SVG/Fluxo completo.svg`, `tools/UI Version 1/Mockup/XML/Fluxo completo.xml`

---

## Observações Finais

- Todos os elementos devem ser implementados como componentes React reutilizáveis, seguindo os nomes dos nodes do AST.
- As transições entre telas devem ser suaves, com animações de fade ou slide quando apropriado.
- Todos os estados (idle, loading, erro, sucesso, disabled) devem ser representados visualmente conforme descrito.
- Os espaçamentos, cores, fontes e tamanhos devem ser rigorosamente respeitados para garantir pixel perfect.
- Ícones devem ser SVG inline, extraídos do AST ou do SVG original.
- Mensagens e feedbacks devem ser claros, visíveis e acessíveis.

---

**Este documento serve como a única fonte de verdade para implementação do fluxo. Não altere estilos, espaçamentos ou hierarquia sem consultar este guia.**
