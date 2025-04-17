import React, { useRef } from 'react'
import * as THREE from 'three'

interface CatFurnitureProps {
  position: [number, number, number]
}

const CatFurniture: React.FC<CatFurnitureProps> = ({ position }) => {
  const meshRef = useRef<THREE.Mesh>(null)

  // Exemplo básico de prateleira
  return (
    <mesh
      ref={meshRef}
      position={position}
      castShadow
      receiveShadow
    >
      <boxGeometry args={[1, 0.1, 0.5]} />
      <meshStandardMaterial
        color="#8B4513"
        roughness={0.7}
        metalness={0.1}
      />
    </mesh>
  )
}

export default CatFurniture 