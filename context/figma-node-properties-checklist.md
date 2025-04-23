# Checklist de Propriedades Relevantes por Tipo de Node (Figma)

Este checklist serve como referência para o filtro do pipeline de exportação Figma → JSON enxuto e amigável para LLMs.

---

## FRAME / COMPONENT / INSTANCE
- `id`, `name`
- `type`
- `visible`
- `absoluteBoundingBox` (posição e tamanho)
- `constraints`
- `layoutMode`, `primaryAxisAlignItems`, `counterAxisAlignItems`
- `primaryAxisSizingMode`, `counterAxisSizingMode`
- `itemSpacing`
- `paddingLeft`, `paddingRight`, `paddingTop`, `paddingBottom`
- `backgroundColor`, `fills`, `strokes`, `strokeWeight`, `cornerRadius`, `effects`, `blendMode`, `opacity`
- `children`
- `clipsContent`
- **Componentes/Instâncias:**
  - `componentId`, `componentPropertyReferences`, `overrides`
- **Imagens de referência:**
  - (adicionar campo customizado: `imageUrl`)

## RECTANGLE / VECTOR / ELLIPSE / POLYGON / STAR / LINE
- `id`, `name`
- `type`
- `visible`
- `absoluteBoundingBox`
- `constraints`
- `fills`, `strokes`, `strokeWeight`, `cornerRadius`, `effects`, `blendMode`, `opacity`
- `vectorPaths` (para vetores)
- `rotation`

## TEXT
- `id`, `name`
- `type`
- `visible`
- `absoluteBoundingBox`
- `constraints`
- `characters`
- `style` (fontFamily, fontSize, fontWeight, lineHeight, letterSpacing, textAlignHorizontal, textAlignVertical, fills/cor, textCase, textDecoration)
- `fills`, `strokes`, `strokeWeight`, `effects`, `blendMode`, `opacity`
- `rotation`

## GROUP / SECTION
- `id`, `name`
- `type`
- `visible`
- `absoluteBoundingBox`
- `children`

## INTERACTION (quando disponível)
- `reactions` (ações de prototipagem: onClick, hover, etc.)
- `prototypeStartNodeID`, `transitionNodeID`, `actions`, `events`

---

### Notas Gerais
- **Remover:** Propriedades de plugin, metadados, arrays vazios, valores padrão (ex: `visible: true`, `opacity: 1`).
- **Incluir:** Apenas propriedades que afetam o visual/renderização, layout responsivo, comportamento ou interações.
- **Imagens:** Adicionar campo customizado `imageUrl` para cada frame/componente relevante.
