'use client';

import dynamic from 'next/dynamic';
import { ComponentType } from 'react';

// Define the available component names
export type ShadcnComponentName = 
  | 'Button'
  | 'Card'
  | 'Dialog'
  | 'DropdownMenu'
  | 'Input'
  | 'Select'
  | 'Textarea';

// Map component names to their dynamic imports
const components: Record<ShadcnComponentName, ComponentType<any>> = {
  Button: dynamic(() => import('@/components/ui/button').then(mod => ({ default: mod.Button })), { ssr: false }),
  Card: dynamic(() => import('@/components/ui/card').then(mod => ({ default: mod.Card })), { ssr: false }),
  Dialog: dynamic(() => import('@/components/ui/dialog').then(mod => ({ default: mod.Dialog })), { ssr: false }),
  DropdownMenu: dynamic(() => import('@/components/ui/dropdown-menu').then(mod => ({ default: mod.DropdownMenu })), { ssr: false }),
  Input: dynamic(() => import('@/components/ui/input').then(mod => ({ default: mod.Input })), { ssr: false }),
  Select: dynamic(() => import('@/components/ui/select').then(mod => ({ default: mod.Select })), { ssr: false }),
  Textarea: dynamic(() => import('@/components/ui/textarea').then(mod => ({ default: mod.Textarea })), { ssr: false }),
};

export function getShadcnComponent(componentName: ShadcnComponentName): ComponentType<any> {
  const Component = components[componentName];
  if (!Component) {
    throw new Error(`Component ${componentName} not found`);
  }
  return Component;
}
