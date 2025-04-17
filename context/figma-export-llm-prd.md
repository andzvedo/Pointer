# Exportador Inteligente de Design Figma para LLM

## Visão Geral

Desenvolver um pipeline que exporta dados de designs do Figma em um formato JSON altamente fiel ao visual, mas enxuto, contendo apenas informações essenciais para renderização, interações e comportamento, além de imagens de referência. O objetivo é que esse JSON seja o contexto completo para uma LLM gerar código ou documentação sem necessidade de intervenção manual.

---

## Racional

- **Problema Atual:** O JSON da API do Figma é excessivamente grande, profundo e inclui muitos dados irrelevantes, tornando-o impraticável para LLMs e outras ferramentas de automação.
- **Objetivo:** Gerar um JSON compacto, mas completo, contendo tudo que afeta o layout, interações e comportamento, além de imagens de referência para enriquecer o contexto.
- **Benefícios:**  
  - Reduz drasticamente o tamanho dos arquivos.
  - Facilita a compreensão e uso por LLMs.
  - Garante fidelidade visual e comportamental.
  - Permite automação de geração de código sem intervenção manual.

---

## Escopo

**Inclui:**
- Exportação de propriedades essenciais para renderização pixel-perfect.
- Exportação de propriedades de interações e comportamento.
- Inclusão de imagens de referência dos frames/componentes.
- Estrutura JSON amigável para LLMs (rasa, sem ruído, nomes claros).
- Pipeline automatizado de extração, filtragem e exportação.

**Não inclui:**
- Renderização visual do JSON (apenas exportação).
- Integração com múltiplas ferramentas de design além do Figma (por ora).

---

## Requisitos Funcionais

1. **Filtragem inteligente de propriedades**
   - Exportar apenas propriedades que afetam visual, layout, interações e comportamento.
   - Remover metadados, valores padrão e propriedades irrelevantes.

2. **Estruturação do JSON**
   - Estrutura rasa, clara e fácil de navegar.
   - Separação explícita entre layout, estilo e comportamento.
   - Inclusão de referências a componentes, não duplicação.

3. **Exportação de imagens de referência**
   - Obter imagens dos frames/componentes principais via API do Figma.
   - Incluir URLs (ou base64, se necessário) no JSON exportado.

4. **Exportação de interações e comportamento**
   - Incluir informações de prototipagem, links, ações e eventos.

5. **Automação do pipeline**
   - Processo automatizado de extração, filtragem, enriquecimento e exportação.

6. **Validação**
   - Testes de renderização para garantir fidelidade visual.
   - Testes com LLMs para garantir compreensão e uso eficiente.

---

## Etapas e Tarefas

### 1. Pesquisa e Mapeamento
- [ ] Levantar todas as propriedades relevantes dos nodes Figma (layout, estilo, interação) usando a documentação oficial.
- [ ] Criar checklist por tipo de node (FRAME, TEXT, RECTANGLE, etc).

### 2. Implementação do Filtro de Propriedades
- [ ] Desenvolver função que percorre o JSON do Figma e remove propriedades irrelevantes.
- [ ] Implementar lógica para não exportar valores padrão.
- [ ] Garantir que só elementos visíveis sejam exportados.

### 3. Estruturação do JSON
- [ ] Definir estrutura final do JSON (layout, children, style, behavior, imageUrl).
- [ ] Implementar flattening da árvore, removendo wrappers desnecessários.
- [ ] Garantir que componentes reutilizáveis sejam referenciados, não duplicados.

### 4. Exportação de Imagens
- [ ] Integrar com o endpoint de imagens da Figma API.
- [ ] Obter imagens dos frames/componentes principais.
- [ ] Incluir URLs (ou base64) no JSON exportado.

### 5. Exportação de Interações
- [ ] Mapear campos de prototipagem/interação na API do Figma.
- [ ] Incluir esses dados no JSON, estruturando de forma clara para LLMs.

### 6. Automação do Pipeline
- [ ] Criar script CLI (Node.js/Python) que executa todas as etapas: fetch → filter → enrich → export.
- [ ] Permitir configuração (ex: exportar por frame, por componente, etc).

### 7. Validação e Testes
- [ ] Validar visualmente (render comparativo com Figma).
- [ ] Validar com LLMs (testar geração de código a partir do JSON).
- [ ] Ajustar filtro conforme feedback.

### 8. Documentação
- [ ] Documentar estrutura do JSON, exemplos e rationale de cada campo.
- [ ] Documentar como rodar o pipeline e customizar.

---

## Critérios de Aceite

- O JSON exportado contém apenas propriedades essenciais para renderização, interações e comportamento.
- O JSON inclui imagens de referência dos frames/componentes.
- O pipeline é automatizado e fácil de rodar.
- O JSON é compreendido por LLMs e permite geração de código fiel ao design sem intervenção manual.
- Documentação clara e exemplos disponíveis.

---

## Roadmap de Tarefas

1. Pesquisa e checklist de propriedades essenciais
2. Implementação do filtro de propriedades
3. Definição e implementação da estrutura JSON
4. Exportação de imagens de referência
5. Exportação de interações e comportamento
6. Automação do pipeline
7. Validação visual e com LLMs
8. Documentação e exemplos

---
