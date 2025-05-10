/**
 * Semantic Analyzer
 * 
 * Funções avançadas para análise semântica de elementos de design do Figma.
 * Extrai significado, propósito, hierarquia e contexto dos elementos.
 */

import { inferNodeRole } from '@/lib/nodeAnalyzer';

/**
 * Tipos de tags semânticas para componentes
 */
export type SemanticTag = 
  // Navegação
  | 'navigation' | 'nav_item' | 'menu' | 'tab' | 'breadcrumb'
  // Ações
  | 'primary_cta' | 'secondary_cta' | 'tertiary_cta' | 'destructive_action'
  // Formulários
  | 'form' | 'login_input' | 'signup_input' | 'search_input' | 'form_submit'
  // Conteúdo
  | 'hero' | 'feature' | 'testimonial' | 'pricing' | 'faq'
  // Feedback
  | 'success_message' | 'error_message' | 'warning' | 'info' | 'loading'
  // Layout
  | 'header' | 'footer' | 'sidebar' | 'modal' | 'drawer' | 'card' | 'list_item'
  // Texto
  | 'heading' | 'subheading' | 'body_text' | 'caption' | 'label'
  // Outros
  | 'avatar' | 'icon' | 'divider' | 'image' | 'video' | 'audio' | 'chart' | 'unknown';

/**
 * Interface para hierarquia e propósito de um elemento
 */
export interface ElementContext {
  semanticTag: SemanticTag;
  purpose?: string;
  userAction?: string;
  userFlow?: string;
  expectedUser?: {
    persona?: string;
    funnelStage?: string;
    intent?: string;
  };
  parentContext?: string;
  childrenSummary?: string;
}

/**
 * Atribui tags semânticas a um node com base em suas características
 */
export function assignSemanticTag(node: any): SemanticTag {
  if (!node) return 'unknown';
  
  const name = (node.name || '').toLowerCase();
  const text = getNodeText(node)?.toLowerCase() || '';
  const role = inferNodeRole(node);
  
  // Verificar texto para inferir propósito
  if (text) {
    // CTAs e botões
    if (role === 'button' || name.includes('button') || name.includes('btn')) {
      if (
        text.match(/sign(\s|-)?(up|in)|register|create account|join|subscribe/i) ||
        name.includes('signup') || name.includes('register')
      ) {
        return 'primary_cta';
      }
      
      if (
        text.match(/log(\s|-)?(in|out)|sign(\s|-)?out|exit|quit/i) ||
        name.includes('login') || name.includes('logout')
      ) {
        return 'primary_cta';
      }
      
      if (
        text.match(/submit|send|save|apply|confirm|ok|yes|continue|next/i) ||
        name.includes('submit') || name.includes('save')
      ) {
        return 'primary_cta';
      }
      
      if (
        text.match(/cancel|back|previous|return/i) ||
        name.includes('cancel') || name.includes('back')
      ) {
        return 'secondary_cta';
      }
      
      if (
        text.match(/delete|remove|clear|reset/i) ||
        name.includes('delete') || name.includes('remove')
      ) {
        return 'destructive_action';
      }
      
      return 'secondary_cta';
    }
    
    // Inputs
    if (role === 'input' || name.includes('input') || name.includes('field')) {
      if (
        text.match(/email|e-mail|username/i) ||
        name.includes('email') || name.includes('username')
      ) {
        return 'login_input';
      }
      
      if (
        text.match(/password|senha/i) ||
        name.includes('password') || name.includes('senha')
      ) {
        return 'login_input';
      }
      
      if (
        text.match(/search|busca|find/i) ||
        name.includes('search') || name.includes('busca')
      ) {
        return 'search_input';
      }
      
      if (
        text.match(/name|nome|first name|last name/i) ||
        name.includes('name') || name.includes('nome')
      ) {
        return 'signup_input';
      }
      
      return 'form_submit';
    }
  }
  
  // Verificar nome do node
  if (name) {
    // Navegação
    if (
      name.includes('nav') || 
      name.includes('menu') || 
      name.includes('header') ||
      name.includes('navbar')
    ) {
      return 'navigation';
    }
    
    if (name.includes('menu-item') || name.includes('nav-item')) {
      return 'nav_item';
    }
    
    if (name.includes('tab')) {
      return 'tab';
    }
    
    // Seções de conteúdo
    if (name.includes('hero') || name.includes('banner')) {
      return 'hero';
    }
    
    if (name.includes('feature')) {
      return 'feature';
    }
    
    if (name.includes('testimonial') || name.includes('review')) {
      return 'testimonial';
    }
    
    if (name.includes('pricing') || name.includes('plan')) {
      // Verificar se parece um heading pelo tamanho da fonte
      if (node.style && node.style.fontSize && node.style.fontSize >= 18) {
        return 'heading';
      }
      return 'body_text';
    }
    
    // Layout
    if (name.includes('header')) {
      return 'header';
    }
    
    if (name.includes('footer')) {
      return 'footer';
    }
    
    if (name.includes('sidebar') || name.includes('side-bar')) {
      return 'sidebar';
    }
    
    if (name.includes('modal') || name.includes('dialog')) {
      return 'modal';
    }
    
    if (name.includes('drawer')) {
      return 'drawer';
    }
    
    if (name.includes('card')) {
      return 'card';
    }
    
    if (name.includes('list-item') || name.includes('item')) {
      return 'list_item';
    }
    
    // Feedback
    if (
      name.includes('success') || 
      name.includes('confirmation') ||
      name.includes('thank')
    ) {
      return 'success_message';
    }
    
    if (name.includes('error') || name.includes('alert')) {
      return 'error_message';
    }
    
    if (name.includes('warning')) {
      return 'warning';
    }
    
    if (name.includes('info')) {
      return 'info';
    }
    
    if (name.includes('loading') || name.includes('spinner')) {
      return 'loading';
    }
  }
  
  // Mapear com base no role inferido
  switch (role) {
    case 'button': return 'secondary_cta';
    case 'input': return 'form_submit';
    case 'checkbox': return 'form_submit';
    case 'radio': return 'form_submit';
    case 'select': return 'form_submit';
    case 'card': return 'card';
    case 'header': return 'header';
    case 'footer': return 'footer';
    case 'sidebar': return 'sidebar';
    case 'modal': return 'modal';
    case 'tabs': return 'tab';
    case 'accordion': return 'faq';
    case 'carousel': return 'feature';
    case 'toggle': return 'form_submit';
    case 'avatar': return 'avatar';
    case 'badge': return 'info';
    case 'tooltip': return 'info';
    case 'progress': return 'loading';
    case 'alert': return 'info';
    case 'table': return 'list_item';
    case 'list': return 'list_item';
    case 'divider': return 'divider';
    case 'icon': return 'icon';
    case 'heading': return 'heading';
    case 'paragraph': return 'body_text';
    case 'form': return 'form';
    case 'container': return 'unknown';
    case 'frame': return 'unknown';
    case 'group': return 'unknown';
    case 'component': return 'unknown';
    case 'instance': return 'unknown';
    case 'rectangle': return 'unknown';
    case 'text': return 'body_text';
    default: return 'unknown';
  }
}

/**
 * Extrai o texto de um node (se for TEXT)
 */
export function getNodeText(node: any): string | null {
  if (!node) return null;
  
  if (node.type === 'TEXT' && node.characters) {
    return node.characters;
  }
  
  return null;
}

/**
 * Analisa a hierarquia e propósito de um elemento
 */
export function analyzeElementContext(node: any): ElementContext {
  const semanticTag = assignSemanticTag(node);
  const result: ElementContext = { semanticTag };
  
  // Determinar propósito com base na tag semântica
  switch (semanticTag) {
    case 'primary_cta':
      result.purpose = 'Chamar atenção para a ação principal que o usuário deve realizar';
      result.userAction = 'Clicar para avançar no fluxo principal';
      break;
    case 'secondary_cta':
      result.purpose = 'Oferecer uma alternativa à ação principal';
      result.userAction = 'Clicar para uma ação alternativa ou menos importante';
      break;
    case 'destructive_action':
      result.purpose = 'Permitir que o usuário realize uma ação destrutiva ou irreversível';
      result.userAction = 'Clicar com cautela, possivelmente após confirmação';
      break;
    case 'login_input':
      result.purpose = 'Coletar credenciais para autenticação';
      result.userAction = 'Inserir informações de login';
      result.userFlow = 'Autenticação';
      break;
    case 'signup_input':
      result.purpose = 'Coletar informações para criação de conta';
      result.userAction = 'Inserir informações de cadastro';
      result.userFlow = 'Registro';
      break;
    case 'search_input':
      result.purpose = 'Permitir que o usuário busque conteúdo';
      result.userAction = 'Digitar termos de busca';
      break;
    case 'navigation':
    case 'nav_item':
      result.purpose = 'Permitir navegação entre seções ou páginas';
      result.userAction = 'Navegar para outra área do aplicativo/site';
      break;
    case 'hero':
      result.purpose = 'Apresentar a mensagem principal ou chamada para ação';
      result.userAction = 'Absorver a mensagem principal e possivelmente agir';
      break;
    case 'form':
      result.purpose = 'Coletar informações do usuário';
      result.userAction = 'Preencher e enviar dados';
      break;
    // Outros casos...
  }
  
  // Inferir contexto do usuário esperado
  if (semanticTag === 'login_input' || semanticTag === 'primary_cta' && getNodeText(node)?.toLowerCase().includes('log')) {
    result.expectedUser = {
      persona: 'Usuário existente',
      funnelStage: 'Autenticação',
      intent: 'Acessar uma conta existente'
    };
  } else if (semanticTag === 'signup_input' || semanticTag === 'primary_cta' && getNodeText(node)?.toLowerCase().match(/sign(\s|-)?(up)|register|create/)) {
    result.expectedUser = {
      persona: 'Novo usuário',
      funnelStage: 'Aquisição',
      intent: 'Criar uma nova conta'
    };
  } else if (semanticTag === 'search_input') {
    result.expectedUser = {
      persona: 'Usuário em busca de conteúdo específico',
      funnelStage: 'Engajamento',
      intent: 'Encontrar informação ou produto específico'
    };
  }
  
  // Analisar filhos para contexto adicional
  if (node.children && Array.isArray(node.children) && node.children.length > 0) {
    const childrenTypes = node.children.map((child: any) => assignSemanticTag(child));
    const uniqueTypes = [...new Set(childrenTypes)];
    
    result.childrenSummary = `Contém ${uniqueTypes.length} tipos de elementos: ${uniqueTypes.join(', ')}`;
    
    // Inferir propósito do container com base nos filhos
    if (semanticTag === 'unknown' || semanticTag === 'card') {
      if (childrenTypes.includes('login_input') || childrenTypes.includes('form_submit') && childrenTypes.some((t: string) => t.includes('login'))) {
        result.semanticTag = 'form';
        result.purpose = 'Formulário de login para autenticação de usuários';
        result.userFlow = 'Autenticação';
      } else if (childrenTypes.includes('signup_input') || childrenTypes.includes('form_submit') && childrenTypes.some((t: string) => t.includes('signup'))) {
        result.semanticTag = 'form';
        result.purpose = 'Formulário de cadastro para novos usuários';
        result.userFlow = 'Registro';
      } else if (childrenTypes.includes('primary_cta') && childrenTypes.includes('heading')) {
        result.semanticTag = 'hero';
        result.purpose = 'Seção principal com chamada para ação';
      }
    }
  }
  
  return result;
}

/**
 * Analisa o fluxo de navegação com base em protótipos do Figma
 */
export function analyzeNavigationFlow(node: any): string[] {
  const flows: string[] = [];
  
  // Verificar se o node tem reações/interações
  if (node.reactions && Array.isArray(node.reactions)) {
    node.reactions.forEach((reaction: any) => {
      if (reaction.action && reaction.destinationId) {
        const trigger = reaction.trigger || 'ON_CLICK';
        const action = reaction.action;
        const destination = reaction.destinationId;
        
        flows.push(`Quando o usuário ${humanizeTrigger(trigger)}, ${humanizeAction(action)} para ${destination}`);
      }
    });
  }
  
  // Recursivamente verificar filhos
  if (node.children && Array.isArray(node.children)) {
    node.children.forEach((child: any) => {
      const childFlows = analyzeNavigationFlow(child);
      flows.push(...childFlows);
    });
  }
  
  return flows;
}

/**
 * Converte trigger de protótipo para texto legível
 */
function humanizeTrigger(trigger: string): string {
  switch (trigger) {
    case 'ON_CLICK': return 'clica';
    case 'ON_DRAG': return 'arrasta';
    case 'ON_HOVER': return 'passa o mouse';
    case 'ON_PRESS': return 'pressiona';
    case 'ON_LONG_PRESS': return 'pressiona longamente';
    default: return trigger.toLowerCase().replace('on_', '');
  }
}

/**
 * Converte action de protótipo para texto legível
 */
function humanizeAction(action: string): string {
  switch (action) {
    case 'NAVIGATE': return 'navega';
    case 'SWAP': return 'troca para';
    case 'OPEN_OVERLAY': return 'abre overlay';
    case 'CLOSE_OVERLAY': return 'fecha overlay';
    case 'BACK': return 'volta';
    default: return action.toLowerCase();
  }
}

/**
 * Gera uma descrição textual do node e seu propósito
 */
export function generateNarration(node: any): string {
  if (!node) return '';
  
  const semanticTag = assignSemanticTag(node);
  const context = analyzeElementContext(node);
  const flows = analyzeNavigationFlow(node);
  
  let narration = '';
  
  // Descrição básica
  narration += `Esta ${getElementTypeDescription(node)} representa `;
  
  switch (semanticTag) {
    case 'primary_cta':
    case 'secondary_cta':
    case 'destructive_action':
      narration += `um botão de ação ${getButtonTypeDescription(semanticTag)}`;
      const buttonText = getNodeText(node);
      if (buttonText) {
        narration += ` com o texto "${buttonText}"`;
      }
      break;
    case 'login_input':
    case 'signup_input':
    case 'search_input':
    case 'form_submit':
      narration += `um campo de entrada ${getInputTypeDescription(semanticTag)}`;
      break;
    case 'form':
      narration += 'um formulário ';
      if (context.purpose?.includes('login')) {
        narration += 'de login';
      } else if (context.purpose?.includes('cadastro')) {
        narration += 'de cadastro';
      } else if (context.purpose?.includes('busca')) {
        narration += 'de busca';
      } else {
        narration += 'para coleta de dados';
      }
      break;
    case 'navigation':
    case 'nav_item':
    case 'menu':
    case 'tab':
      narration += 'um elemento de navegação';
      break;
    case 'hero':
      narration += 'uma seção principal (hero) com destaque visual';
      break;
    case 'header':
      narration += 'um cabeçalho';
      break;
    case 'footer':
      narration += 'um rodapé';
      break;
    case 'card':
      narration += 'um card contendo informações agrupadas';
      break;
    default:
      narration += `um elemento do tipo ${semanticTag}`;
  }
  
  narration += '. ';
  
  // Adicionar propósito
  if (context.purpose) {
    narration += `Seu propósito é ${context.purpose}. `;
  }
  
  // Adicionar ação esperada do usuário
  if (context.userAction) {
    narration += `Espera-se que o usuário ${context.userAction}. `;
  }
  
  // Adicionar informações sobre filhos
  if (context.childrenSummary) {
    narration += context.childrenSummary + '. ';
  }
  
  // Adicionar fluxos de navegação
  if (flows.length > 0) {
    narration += 'Interações: ';
    narration += flows.join('. ') + '. ';
  }
  
  // Adicionar contexto do usuário
  if (context.expectedUser) {
    narration += 'Contexto do usuário: ';
    if (context.expectedUser.persona) {
      narration += `direcionado a ${context.expectedUser.persona}`;
    }
    if (context.expectedUser.funnelStage) {
      narration += ` na etapa de ${context.expectedUser.funnelStage}`;
    }
    if (context.expectedUser.intent) {
      narration += ` com intenção de ${context.expectedUser.intent}`;
    }
    narration += '. ';
  }
  
  return narration;
}

/**
 * Obtém descrição do tipo de elemento
 */
function getElementTypeDescription(node: any): string {
  if (!node) return 'elemento';
  
  switch (node.type) {
    case 'FRAME': return 'tela/frame';
    case 'GROUP': return 'grupo';
    case 'COMPONENT': return 'componente';
    case 'COMPONENT_SET': return 'conjunto de componentes';
    case 'INSTANCE': return 'instância';
    case 'TEXT': return 'texto';
    default: return 'elemento';
  }
}

/**
 * Obtém descrição do tipo de botão
 */
function getButtonTypeDescription(semanticTag: SemanticTag): string {
  switch (semanticTag) {
    case 'primary_cta': return 'principal';
    case 'secondary_cta': return 'secundário';
    case 'destructive_action': return 'destrutivo';
    default: return '';
  }
}

/**
 * Obtém descrição do tipo de input
 */
function getInputTypeDescription(semanticTag: SemanticTag): string {
  switch (semanticTag) {
    case 'login_input': return 'para autenticação';
    case 'signup_input': return 'para cadastro';
    case 'search_input': return 'para busca';
    case 'form_submit': return 'de formulário';
    default: return '';
  }
}

/**
 * Converte o contexto semântico para JSON estruturado
 */
export function generateSemanticJSON(node: any): any {
  if (!node) return null;
  
  const semanticTag = assignSemanticTag(node);
  const context = analyzeElementContext(node);
  const text = getNodeText(node);
  
  const result: any = {
    type: semanticTag,
    name: node.name || 'Unnamed',
  };
  
  // Adicionar texto se existir
  if (text) {
    result.text = text;
  }
  
  // Adicionar propósito
  if (context.purpose) {
    result.purpose = context.purpose;
  }
  
  // Adicionar ação esperada
  if (context.userAction) {
    result.expectedAction = context.userAction;
  }
  
  // Adicionar fluxo
  if (context.userFlow) {
    result.flow = context.userFlow;
  }
  
  // Adicionar contexto do usuário
  if (context.expectedUser) {
    result.userContext = context.expectedUser;
  }
  
  // Processar filhos recursivamente
  if (node.children && Array.isArray(node.children) && node.children.length > 0) {
    result.children = node.children.map((child: any) => generateSemanticJSON(child));
  }
  
  return result;
}
