'use client';

import { Suspense } from 'react';
import { ShadcnComponentName, getShadcnComponent } from '@/lib/dynamic-components';

interface DynamicComponentProps {
  componentName: ShadcnComponentName;
  props?: Record<string, any>;
}

export function DynamicComponent({ componentName, props = {} }: DynamicComponentProps) {
  const Component = getShadcnComponent(componentName);

  return (
    <Suspense fallback={<div>Loading {componentName}...</div>}>
      <Component {...props} />
    </Suspense>
  );
}

// Example usage component
export function DynamicComponentExample() {
  return (
    <div className="space-y-4 p-4">
      <DynamicComponent 
        componentName="Button" 
        props={{ 
          children: "Dynamic Button",
          onClick: () => alert("Button clicked!")
        }} 
      />

      <DynamicComponent 
        componentName="Input" 
        props={{ 
          placeholder: "Dynamic Input",
          type: "text"
        }} 
      />
    </div>
  );
}
