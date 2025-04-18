# Exportador Inteligente de Design Figma para LLM e Codegen

## Fluxo Geral do Pipeline

```
Figma (API) → JSON filtrado → AST customizada → Codegen (LLM/engine)
```

1. **Figma (API):** Download do design como JSON bruto.
2. **JSON filtrado:** Filtro para manter só propriedades essenciais.
3. **AST customizada:** Conversão para árvore sintática pronta para codegen.
4. **Codegen:** Geração de código (LLM, AI assistant ou engine própria).

---

## Visão Geral

Desenvolver um pipeline que exporta dados de designs do Figma em uma **AST (Abstract Syntax Tree)** customizada, compacta e semanticamente rica. O pipeline segue as etapas: Figma (API) → JSON filtrado → AST → Codegen. Cada etapa é bem definida e desacoplada, permitindo evolução e automação.

---

## Racional

- **Problema Atual:** O JSON da API do Figma é excessivamente grande, profundo e inclui muitos dados irrelevantes, tornando-o impraticável para LLMs, codegen e automação.
- **Objetivo:** Gerar uma AST enxuta e estruturada, contendo tudo que afeta o layout, interações, comportamento e contexto visual, pronta para ser consumida por LLMs ou engines de geração de código.
- **Benefícios:**
  - Facilita a transformação do design em múltiplos targets de código (React, Flutter, HTML, etc).
  - Permite evoluir o pipeline sem acoplamento ao formato bruto do Figma.
  - Torna o processo mais testável, extensível e robusto.
  - Garante fidelidade visual e comportamental.
  - Permite automação total da geração de código a partir do design.

---

## Escopo

**Inclui:**
- Extração dos dados do Figma e parsing para JSON filtrado.
- Conversão do JSON filtrado para AST.
- Exportação de propriedades essenciais para renderização pixel-perfect, interações e comportamento.
- Inclusão de imagens de referência dos frames/componentes.
- Estrutura AST amigável para codegen e LLMs (rasa, sem ruído, nomes claros).
- Pipeline automatizado de extração, filtragem, parsing, transformação e exportação.

**Não inclui:**
- Renderização visual do JSON/AST (apenas exportação e validação).
- Integração com múltiplas ferramentas de design além do Figma (por ora).

---

## Estrutura da AST

Cada node da AST representa um elemento do design (Frame, Component, Text, etc), com propriedades padronizadas para facilitar codegen.

Exemplo de node AST:
```json
{
  "type": "Component",
  "name": "Button",
  "props": {
    "variant": "primary",
    "size": "md"
  },
  "style": {
    "width": 120,
    "height": 40
  },
  "children": [...]
}
```

---

## Requisitos Funcionais

1. **Extração e filtragem (JSON filtrado)**
   - Download do JSON bruto do Figma.
   - Filtragem para manter apenas propriedades essenciais (layout, estilo, interações, hierarquia, componentes, etc).

2. **Parsing e transformação para AST**
   - Conversão do JSON filtrado em uma AST enxuta.
   - Flattening, normalização de propriedades, resolução de componentes, enriquecimento com imagens, tokens, etc.

3. **Validação da AST**
   - Garantir que a árvore está consistente, sem nós inválidos, e pronta para codegen.

4. **Geração de Código (Codegen)**
   - Converter a AST para código (React, Vue, Flutter, HTML/CSS, etc) — via LLM, AI assistant ou engine própria.

5. **Validação e Testes**
   - Testes automatizados e visuais para garantir fidelidade ao design original.

6. **Documentação**
   - Documentar a estrutura da AST, exemplos e rationale.

---

## Etapas e Tarefas

### 1. Extração e Filtragem (JSON filtrado)
- [ ] Buscar JSON bruto da API do Figma.
- [ ] Filtrar propriedades essenciais e salvar JSON enxuto.

### 2. Parsing e Transformação para AST
- [ ] Converter o JSON filtrado em uma AST limpa.
- [ ] Implementar flattening da árvore, removendo wrappers desnecessários.
- [ ] Garantir que componentes reutilizáveis sejam referenciados, não duplicados.
- [ ] Enriquecer a AST com imagens de referência e tokens de design.

### 3. Validação da AST
- [ ] Validar integridade, consistência e semântica da AST.

### 4. Geração de Código (Codegen)
- [ ] Implementar (ou integrar) codegen para React, HTML, etc, a partir da AST.
- [ ] Integrar com LLMs/AI assistant para geração automática.

### 5. Validação e Testes
- [ ] Validar visualmente (render comparativo com Figma).
- [ ] Validar com LLMs (testar geração de código a partir da AST).
- [ ] Ajustar pipeline conforme feedback.

### 6. Documentação
- [ ] Documentar estrutura da AST, exemplos e rationale de cada campo.
- [ ] Documentar como rodar o pipeline e customizar.

---

## Critérios de Aceite

- O JSON filtrado contém apenas propriedades essenciais para renderização, interações e comportamento.
- A AST inclui imagens de referência dos frames/componentes.
- O pipeline é automatizado e fácil de rodar.
- A AST é compreendida por LLMs e permite geração de código fiel ao design sem intervenção manual.
- Documentação clara e exemplos disponíveis.

---

## Roadmap de Tarefas

1. Pesquisa e checklist de propriedades essenciais
2. Extração e filtragem (JSON filtrado)
3. Parsing e transformação para AST
4. Transformações e enriquecimento da AST
5. Validação da AST
6. Geração de código (codegen)
7. Automação do pipeline
8. Validação visual e com LLMs
9. Documentação e exemplos

---
