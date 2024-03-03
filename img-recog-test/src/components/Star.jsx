import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Instances, Instance } from "@react-three/drei";
import StarFX from "./StarFX";

const Star = ({ location, color, starScale }) => {
  // This reference gives us direct access to the THREE.Mesh object
  const ref = useRef();
  const starArray = [];
  const randomLengths = [
    Math.floor(Math.random() * (8 - 5) + 5),
    Math.floor(Math.random() * (6 - 3) + 3),
    Math.floor(Math.random() * (4 - 3) + 3),
  ];

  for (
    let i = 0;
    i < randomLengths[Math.floor(Math.random() * (2 - 0) + 0)];
    i++
  ) {
    const offset = [
      Math.random() * (1 - 0) - 0,
      Math.random() * (3 - 1) - 1,
      Math.random() * (2 - 1) - 1,
    ]; //random location offet to make sure that the star comps are more naturally spaced out

    //maps through inital locations on every loop to add offset to stars AND randomize star scale every loop
    const newPosition = location.map((coord, index) => coord + offset[index]);
    const sScale = Math.random() * (0.5 - 0.1) - 0; //star scale randomizer
    starArray[i] = { location: newPosition, scale: sScale };
  }

  // Add this component to the render-loop, rotate the mesh every frame
  useFrame((state, delta) => (ref.current.rotation.y += delta));
  // Return the view, these are regular Threejs elements expressed in JSX

  const FX = () => {
    return (
      <StarFX
        location={[0.001, 0.001, 0.001]}
        color={color}
        starScale={starScale}
      />
    );
  };
  return (
    <>
      <mesh position={location} ref={ref} scale={starScale}>
        <sphereGeometry args={[0.02, 128]} />
        <meshStandardMaterial
          emissive={color}
          emissiveIntensity={10}
          toneMapped={true}
        />

        <Instances limit={100} range={100}>
          <sphereGeometry args={[0.02, 128]} />
          <meshStandardMaterial
            emissive={"white"}
            emissiveIntensity={10}
            toneMapped={true}
          />
          <Instance scale={0.1} position={[0.05, 0.02, 0.05]} />
        </Instances>

        <Instances limit={10} range={10}>
          <sphereGeometry args={[0.02, 128]} />
          <meshStandardMaterial
            emissive={color}
            emissiveIntensity={10}
            toneMapped={true}
          />
          <Instance scale={0.1} position={[0.02, 0.02, 0.02]} />
        </Instances>
        {starArray.map((object, index) => (
          <mesh
            key={index}
            position={[Math.random() * (0.1, 0.01) - 0.01, 0.01, 0.01]}
            scale={object.scale}
          >
            <sphereGeometry args={[0.02, 128]} />
            <meshStandardMaterial
              emissive={color}
              emissiveIntensity={10}
              toneMapped={true}
            />
          </mesh>
        ))}
        {FX()}
      </mesh>
    </>
  );
};

export default Star;