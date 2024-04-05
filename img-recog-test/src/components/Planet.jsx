import React, { useRef } from 'react'
import { useGLTF } from '@react-three/drei'

export default function Planet(props) {
  const groupRef = useRef()
  const { nodes, materials } = useGLTF('/public/iceplanet.gltf')

  useFrame(({ clock }) => {
    // Rotate the mesh around the Y axis
    // meshRef.current.rotation.y += 0.0001;
    const elapsedTime = clock.getElapsedTime();
    //orbit the location [0,0,0]
    groupRef.current.position.x = 15 * Math.cos(elapsedTime * (Math.random() * (0.2 - 0.1) - 0.1));
    groupRef.current.position.z = 15 * Math.sin(elapsedTime * (Math.random() * (0.2 - 0.1) - 0.1));
  });

  return (
    <group ref={groupRef} {...props} dispose={null}>
      <mesh castShadow receiveShadow geometry={nodes.Curve007_1.geometry} material={materials['Material.001']} />
      <mesh castShadow receiveShadow geometry={nodes.Curve007_2.geometry} material={materials['Material.002']} />
    </group>
  )
}

useGLTF.preload('/public/iceplanet.gltf')