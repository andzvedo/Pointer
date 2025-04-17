import React, { useState } from 'react'
import '../styles/Interface.css'

interface FurnitureSettings {
  type: string;
  dimensions: {
    width: number;
    height: number;
    depth: number;
  };
  material: string;
  color: string;
}

const Interface: React.FC = () => {
  const [settings, setSettings] = useState<FurnitureSettings>({
    type: 'shelf',
    dimensions: {
      width: 1,
      height: 0.1,
      depth: 0.5
    },
    material: 'wood',
    color: '#8B4513'
  })

  const furnitureTypes = [
    { id: 'shelf', name: 'Prateleira' },
    { id: 'house', name: 'Casa' },
    { id: 'scratcher', name: 'Arranhador' },
    { id: 'bench', name: 'Banco' }
  ]

  const materials = [
    { id: 'wood', name: 'Madeira' },
    { id: 'metal', name: 'Metal' },
    { id: 'fabric', name: 'Tecido' }
  ]

  const handleSettingsChange = (
    key: string,
    value: string | number | Record<string, number>
  ) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }))
  }

  return (
    <div className="interface-container">
      <h2>Editor de Móveis para Gatos</h2>
      
      <div className="section">
        <h3>Tipo de Móvel</h3>
        <select
          value={settings.type}
          onChange={(e) => handleSettingsChange('type', e.target.value)}
        >
          {furnitureTypes.map(type => (
            <option key={type.id} value={type.id}>
              {type.name}
            </option>
          ))}
        </select>
      </div>

      <div className="section">
        <h3>Dimensões</h3>
        <div className="dimensions-controls">
          <label>
            Largura:
            <input
              type="range"
              min="0.1"
              max="2"
              step="0.1"
              value={settings.dimensions.width}
              onChange={(e) => handleSettingsChange('dimensions', {
                ...settings.dimensions,
                width: parseFloat(e.target.value)
              })}
            />
            <span>{settings.dimensions.width}m</span>
          </label>
          <label>
            Altura:
            <input
              type="range"
              min="0.1"
              max="2"
              step="0.1"
              value={settings.dimensions.height}
              onChange={(e) => handleSettingsChange('dimensions', {
                ...settings.dimensions,
                height: parseFloat(e.target.value)
              })}
            />
            <span>{settings.dimensions.height}m</span>
          </label>
          <label>
            Profundidade:
            <input
              type="range"
              min="0.1"
              max="2"
              step="0.1"
              value={settings.dimensions.depth}
              onChange={(e) => handleSettingsChange('dimensions', {
                ...settings.dimensions,
                depth: parseFloat(e.target.value)
              })}
            />
            <span>{settings.dimensions.depth}m</span>
          </label>
        </div>
      </div>

      <div className="section">
        <h3>Material</h3>
        <select
          value={settings.material}
          onChange={(e) => handleSettingsChange('material', e.target.value)}
        >
          {materials.map(material => (
            <option key={material.id} value={material.id}>
              {material.name}
            </option>
          ))}
        </select>
      </div>

      <div className="section">
        <h3>Cor</h3>
        <input
          type="color"
          value={settings.color}
          onChange={(e) => handleSettingsChange('color', e.target.value)}
        />
      </div>

      <div className="actions">
        <button className="primary">Adicionar Móvel</button>
        <button className="secondary">Salvar Projeto</button>
      </div>
    </div>
  )
}

export default Interface 