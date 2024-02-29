import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Instances, Instance } from "@react-three/drei";

const StarFX = ({ location, color, starScale }) => {
//   location = [0, 0, 0];
//   color = "white";
//   starScale = 0.5;

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
      Math.random() * (2 - 1) - 1,
      Math.random() * (2 - 1) - 1,
    ]; //random location offet to make sure that the star comps are more naturally spaced out

    //maps through inital locations on every loop to add offset to stars AND randomize star scale every loop
    const newPosition = location.map((coord, index) => coord + offset[index]);
    const sScale = Math.random() * (0.02 - 0.01) - 0.01; //star scale randomizer
    const speedMult = Math.floor(Math.random() * (3 - 1) - 1);
    starArray[i] = { location: newPosition, scale: sScale, speed: speedMult };
  }

  // Add this component to the render-loop, rotate the mesh every frame
  useFrame((state, delta) => (ref.current.rotation.x -= delta / 5));

  // Return the view, these are regular Threejs elements expressed in JSX
  return (
    <>
      <mesh position={location} ref={ref} scale={starScale}>
        <Instances limit={100} range={100}>
          <sphereGeometry args={[0.02, 128]} />
          <meshStandardMaterial
            emissive={"white"}
            emissiveIntensity={10}
            toneMapped={true}
          />
          <Instance scale={0.1} position={[0.01, 0.01, 0.01]} />
        </Instances>

        <Instances limit={10} range={10}>
          <sphereGeometry args={[0.02, 128]} />
          <meshStandardMaterial
            emissive={color}
            emissiveIntensity={10}
            toneMapped={true}
          />
          <Instance scale={0.1} position={[0.01, 0.01, 0.01]} />
        </Instances>
        {starArray.map((object, index) => (
          <mesh
            key={index}
            position={[Math.random() * (0.02 - 0.01) - 0.01, 0.01, 0.01]}
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
      </mesh>
    </>
  );
};

export default StarFX;
