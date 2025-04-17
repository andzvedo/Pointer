import React from 'react'
import { Environment, Grid } from '@react-three/drei'
import CatFurniture from './CatFurniture'

const Scene: React.FC = () => {
  return (
    <>
      {/* Iluminação */}
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={1}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />

      {/* Ambiente */}
      <Environment preset="apartment" />
      <Grid
        infiniteGrid
        cellSize={1}
        sectionSize={3}
        fadeDistance={50}
        fadeStrength={1}
      />

      {/* Móveis para Gatos */}
      <CatFurniture position={[0, 0, 0]} />
    </>
  )
}

export default Scene 