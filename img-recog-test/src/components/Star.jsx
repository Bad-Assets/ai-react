import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";

const Star = ({ location, color, starScale }) => {
  // This reference gives us direct access to the THREE.Mesh object
  const ref = useRef();
  // Add this component to the render-loop, rotate the mesh every frame
  useFrame((state, delta) => (ref.current.rotation.y += delta));
  // Return the view, these are regular Threejs elements expressed in JSX
  return (
    <>
      <mesh position={location} ref={ref} scale={starScale}>
        <sphereGeometry args={[0.02, 128]} />
        <meshStandardMaterial
          emissive={color}
          emissiveIntensity={10}
          toneMapped={true}
        />
      </mesh>
    </>
  );
};

export default Star;
