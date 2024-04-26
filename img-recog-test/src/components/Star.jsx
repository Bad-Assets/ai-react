import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import StarFX from "./StarFX";

const Star = ({ location, color, starScale }) => {
  const ref = useRef();

  useFrame((state, delta) => (ref.current.rotation.y += delta));

  const FX = () => {
    return <StarFX location={location} color={color} starScale={starScale} />;
  };

  return (
    <group position={location} ref={ref}>
      <mesh scale={starScale}>
        <sphereGeometry args={[0.02, 128]} />
        <meshStandardMaterial
          emissive={color}
          emissiveIntensity={10}
          toneMapped={true}
        />
      </mesh>
      {/* {FX()} */}
    </group>
  );
};

export default Star;
