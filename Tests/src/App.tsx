import React from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import Scene from './components/Scene'
import Interface from './components/Interface'
import './styles/App.css'

const App: React.FC = () => {
  return (
    <div className="app-container">
      <div className="canvas-container">
        <Canvas
          camera={{ position: [5, 5, 5], fov: 75 }}
          shadows
        >
          <Scene />
          <OrbitControls />
        </Canvas>
      </div>
      <Interface />
    </div>
  )
}

export default App 