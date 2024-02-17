import React, { useEffect, useRef } from "react";
import { Line } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import Star from "./Star";

//A component made up of star components. It handles its own movement independently

const Constellation = ({ location, speed, colorSeed }) => {
  let constellationArray = []; //array to hold star components
  const randomLengths = [
    Math.floor(Math.random() * (10 - 5) + 5),
    Math.floor(Math.random() * (6 - 3) + 3),
    Math.floor(Math.random() * (3 - 1) + 1),
  ]; //array to hold different randomly generated array lengths. This randomizes how many stars are in a given constellation

  for (
    let i = 0;
    i < randomLengths[Math.floor(Math.random() * (2 - 0) + 0)];
    i++
  ) {
    const offset = [
      Math.random() * (6 - 3) - 3,
      Math.random() * (6 - 3) - 3,
      Math.random() * (6 - 3) - 3,
    ]; //random location offet to make sure that the star comps are more naturally spaced out
    const newPosition = location.map((coord, index) => coord + offset[index]);

    constellationArray[i] = newPosition;
  }

  const lines = []; //array to hold lines drawn between stars
  for (let i = 0; i < constellationArray.length - 1; i++) {
    lines.push(
      <Line
        key={i}
        points={[constellationArray[i], constellationArray[i + 1]]}
        color={0xffffff}
      />
    );
  }

  const meshRef = useRef();

  //this creates a mini animation loop to change loaction/orientation values over time
  useFrame(({ clock }) => {
    // Rotate the mesh around the Y axis
    meshRef.current.rotation.y += 0.001;
    const elapsedTime = clock.getElapsedTime();
    //orbit the location [0,0,0]
    meshRef.current.position.x = 10 * Math.cos(elapsedTime * speed);
    meshRef.current.position.z = 10 * Math.sin(elapsedTime * speed);
  });

  return (
    <>
      <mesh ref={meshRef} position={location}>
        {constellationArray.map((newPosition, index) => (
          <Star key={index} location={newPosition} colorSeed={colorSeed} />
        ))}
        {<Star location={location} />}
        {lines}
      </mesh>
    </>
  );
};

export default Constellation;
