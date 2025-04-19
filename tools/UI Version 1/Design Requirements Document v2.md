º# Design Requirements Document

**Este documento serve como a única fonte de verdade para implementação do fluxo. Não altere estilos, espaçamentos ou hierarquia sem consultar este guia.**

---

## Especificações Detalhadas do Design

### 1. Hierarquia Completa  
- **Document Root**: "Version 1"

1. **Frame “1”** (EntryPointScreen)  
   • id: `ast-360:10360`  
   • figmaPath: `["Version 1","1"]`  
   • Filhos:  
     - **Instance** `Figma URL Input`  
       • id: `ast-360:10361`  
       • componentId: `360:10361`  
       • figmaPath: `["Version 1","1","Figma URL Input"]`  
     - **Button** & **Icons** (campo de URL e ação “Go”)

2. **Frame “2”** (Loading/ProcessingScreen)  
   • id: `ast-360:10626`  
   • figmaPath: `["Version 1","2"]`  
   • Filhos: Spinner, texto "Loading…", layout centralizado.

3. **Frame “3”** (Processing State)  
   • id: `ast-360:10631`  
   • figmaPath: `["Version 1","3"]`  
   • Filhos:  
     - **Instance** `Figma URL Processing States`  
       • Sub‑frames: `Pointer`, `Navigation Items` (Icons), texto "Processing"

4. **Frame “4”** (URL Input State)  
   • id: `ast-360:10646`  
   • figmaPath: `["Version 1","4"]`  
   • Filhos: Frame “Gradient” (invisível), **Instance** `Figma URL Processing States` (pointer + nav)

5. **Frame “5”** (DataExtractedScreen)  
   • id: `ast-359-9532`  
   • figmaPath: `["Version 1","5"]`  
   • Filhos:  
     - **Frame** “Data Extracted”:  
       • “Data Layers”: **Code block** (header + código) e “Frame 55” (código extraído)  
       • “SVG preview”: retângulo “EMU” + “image 11”  
     - **Instance** “Actions bar”: botão + ícones

6. **Frame “6”** (PreviewScreen)  
   • id: `ast-360:11110`  
   • figmaPath: `["Version 1","6"]`  
   • Filhos: `Figma URL Processing States`, Frame “URL” (texto da URL), Frame “Pointer”, Data Extracted (visível=false)

---

### 2. Tokens e Estilos

#### Cores (Global Tokens)  
- Primary Blue: `#002d5b` (rgb(0,45,91))  
- White: `#ffffff`  
- Light Gray: `#f2f2f2` / `#e5e5e5`  
- Medium Gray: `#898989`  
- Dark Gray: `#525252`  
- Accent Gray: `#555555`

#### Tipografia  
- **Code/Text**: Source Code Pro / .SF NS Mono, 12 px, line-height 18–20 px, peso 400  
- **UI Text**: Inter, 14–16 px, line-height 20–24 px, peso 400–700

#### Espaçamentos & Layout  
- **Paddings**: 8 px (botões, action bar, inputs), 200 px lateral (telas desktop)  
- **Item Spacing**: 8 px (icons/text), 16 px (action bar), 8 px (flex containers)

#### Bordas & Radius  
- Border width: 1 px INSIDE; cor: `#e3e8ef` / `#e5e5e5`  
- Border radius: 8 px (interativos), 4 px (inputs)

#### Opacidades & Efeitos  
- Ícones inativos: 50%; texto URL: 50%  
- dropShadow: rgba(0,0,0,0.25), offset (0,2), radius 4, spread 0

---

### 3. Componentização

| Figma Instance                  | React Component             |
| --------------------------------| --------------------------- |
| Figma URL Processing States     | `<FigmaUrlProcessing />`    |
| Pointer                         | `<Pointer />`               |
| Navigation Items                | `<NavigationItems />`       |
| Icons (por componentId)         | `<Icon name="..." />`     |
| Button                          | `<Button />`                |
| Actions bar                     | `<ActionsBar />`            |
| Data Extracted                  | `<DataExtracted />`         |
| Data Layers                     | `<DataLayers />`            |
| Code block                      | `<CodeBlock />`             |
| Code block header               | `<CodeBlockHeader />`       |
| SVG preview / image 11          | `<SvgPreview />`            |
| URL text field                  | `<Input type="url" />`    |
| Status message “Processing”     | `<StatusMessage />`         |

---

### 4. Responsividade

- **Constraints**: vertical (TOP/TOP_BOTTOM/SCALE), horizontal (LEFT/LEFT_RIGHT/SCALE)  
- **Flex Layout**:  
  - HORIZONTAL → `flex flex-row justify-between items-center`  
  - VERTICAL → `flex flex-col space-y-{n} p-{n}`  
- **Media Queries**: padding lateral 200 px em desktop; responsivo via Tailwind breakpoints

---

### 5. Acessibilidade

- Frames: `<section>`/`<div role="group">` com `aria-label`  
- Textos: `<p>`/`<span>`  
- Botões: `<button aria-label>` + `disabled`  
- Inputs: `<input type="url" aria-label="Figma URL">`  
- Ícones: `<svg aria-hidden="true">` ou `<img alt="">`  
- Nav: `<nav><ul><li>`

---

### 6. Exemplos de Conteúdo Final

- **Status**: "Processing", "Success", "Error", "Data Extracted"  
- **URLs**: `https://www.figma.com/...`  
- **SVGs**: `143-580.svg`, `288-2656.svg`, `137-212.svg`  
- **JSON Code Block**:
  ```json
  { "node": { "id": "40000337:16761", "name": "Home", ... } }
  ```

---

### Resumo & Próximos Passos
1. Tokens globais (cores, tipografia, espaçamentos)  
2. Mapeamento Figma → React (componentização)  
3. Estilos & constraints → classes Tailwind  
4. Responsividade via flex e breakpoints Tailwind  
5. Acessibilidade semântica e ARIA  
6. [Nice-to-have] Automatizar extração de tokens e SVGs
