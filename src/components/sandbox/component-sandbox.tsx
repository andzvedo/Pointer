'use client';

import { useState, useCallback } from 'react';
import { DynamicComponent } from '../dynamic-component-example';
import { ShadcnComponentName } from '@/lib/dynamic-components';

// Define common props for each component type
const defaultProps: Record<ShadcnComponentName, Record<string, any>> = {
  Button: {
    children: 'Click me',
    variant: 'default',
    size: 'default',
    onClick: () => alert('Button clicked!'),
  },
  Input: {
    placeholder: 'Type something...',
    type: 'text',
  },
  Card: {
    children: 'Card content',
    className: 'p-4',
  },
  Dialog: {
    trigger: 'Open dialog',
    title: 'Dialog Title',
    description: 'Dialog description goes here',
  },
  DropdownMenu: {
    trigger: 'Open menu',
    items: ['Item 1', 'Item 2', 'Item 3'],
  },
  Select: {
    placeholder: 'Select an option',
    options: [
      { value: '1', label: 'Option 1' },
      { value: '2', label: 'Option 2' },
      { value: '3', label: 'Option 3' },
    ],
  },
  Textarea: {
    placeholder: 'Type your message...',
    rows: 4,
  },
};

export function ComponentSandbox() {
  const [selectedComponent, setSelectedComponent] = useState<ShadcnComponentName>('Button');
  const [customProps, setCustomProps] = useState<Record<string, any>>(() => ({
    ...defaultProps[selectedComponent]
  }));

  const handleComponentChange = useCallback((component: ShadcnComponentName) => {
    setSelectedComponent(component);
    setCustomProps(defaultProps[component]);
  }, []);

  const handlePropChange = useCallback((key: string, value: any) => {
    setCustomProps(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h1 className="mb-4 text-2xl font-bold">ShadCN Component Sandbox</h1>
          
          {/* Component Selector */}
          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium">Select Component:</label>
            <select 
              value={selectedComponent}
              onChange={(e) => handleComponentChange(e.target.value as ShadcnComponentName)}
              className="w-full rounded-md border p-2"
            >
              {Object.keys(defaultProps).map((comp) => (
                <option key={comp} value={comp}>
                  {comp}
                </option>
              ))}
            </select>
          </div>

          {/* Preview Section */}
          <div className="mb-6">
            <h2 className="mb-3 text-lg font-semibold">Preview</h2>
            <div className="rounded-lg border bg-white p-8">
              <DynamicComponent
                key={selectedComponent}
                componentName={selectedComponent}
                props={customProps}
              />
            </div>
          </div>

          {/* Props Editor */}
          <div>
            <h2 className="mb-3 text-lg font-semibold">Props</h2>
            <div className="space-y-4">
              {Object.entries(customProps).map(([key, value]) => {
                // Skip function props in the editor
                if (typeof value === 'function') return null;
                
                return (
                  <div key={key} className="flex items-start space-x-4">
                    <div className="w-1/3">
                      <label className="text-sm font-medium">{key}:</label>
                    </div>
                    <div className="w-2/3">
                      {typeof value === 'boolean' ? (
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={(e) => handlePropChange(key, e.target.checked)}
                          className="rounded border-gray-300"
                        />
                      ) : typeof value === 'number' ? (
                        <input
                          type="number"
                          value={value}
                          onChange={(e) => handlePropChange(key, Number(e.target.value))}
                          className="w-full rounded-md border p-2"
                        />
                      ) : (
                        <input
                          type="text"
                          value={value}
                          onChange={(e) => handlePropChange(key, e.target.value)}
                          className="w-full rounded-md border p-2"
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
