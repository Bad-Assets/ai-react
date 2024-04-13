import React, { useRef } from "react";
import { Line } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import Star from "./Star";

//A component made up of star components. It handles its own movement independently

const Constellation = ({
  location,
  speed,
  colorSeed,
  creationTime,
  lifeSpan,
  amount,
}) => {
  let constellationArray = []; //array to hold star components
  let colors; //variable to store color arrays
  const randomLengths = [
    Math.floor(Math.random() * (8 - 5) + 5),
    Math.floor(Math.random() * (6 - 3) + 3),
    Math.floor(Math.random() * (4 - 3) + 3),
  ]; //array to hold different randomly generated array lengths. This randomizes how many stars are in a given constellation//outdated. Used for testing

  //This loop handles the randomization and initialization of each individual star in a given constellation.
  //if you wanna change any property of an individual star in a constellation, this is where you do it
  for (let i = 0; i < amount; i++) {
    const offset = [
      Math.random() * (8 - 3) - 3,
      Math.random() * (6 - 4) - 4,
      Math.random() * (4 - 3) - 3,
    ]; //random location offet to make sure that the star comps are more naturally spaced out

    //maps through inital locations on every loop to add offset to stars AND randomize star scale every loop
    const newPosition = location.map((coord, index) => coord + offset[index]);
    const sScale = Math.floor(Math.random() * (6 - 4) - 4); //star scale randomizer

    //determines colors of individual stars. Right now, it's semi-random/array based
    switch (colorSeed) {
      case 1:
        colors = ["violet", "mediumVioletRed", "plum"];
        break;
      case 2:
        colors = ["lightBlue", "cyan", "aquamarine"];
        break;
      case 3:
        colors = ["pink", "beige", "salmon"];
        break;
      case 4:
        colors = ["yellow", "neonYellow", "vanilla"];
        break;
      case 5:
        colors = ["white"];
        break;
      case 6:
        colors = [
          "violet",
          "mediumVioletRed",
          "plum",
          "lightBlue",
          "cyan",
          "aquamarine",
          "pink",
          "beige",
          "salmon",
          "yellow",
          "neonYellow",
          "vanilla",
          "white",
        ];
        break;
    }

    constellationArray[i] = { location: newPosition, scale: sScale };
  }

  const lines = []; //array to hold lines drawn between stars
  for (let i = 0; i < constellationArray.length - 1; i++) {
    lines.push(
      <Line
        key={i}
        points={[
          constellationArray[i].location,
          constellationArray[i + 1].location,
        ]}
        color={[0.8, 0.8, 0.8, 0.1]}
        lineWidth={1}
      />
    );
  }

  const meshRef = useRef();

  //this creates a mini animation loop to change loaction/orientation values over time
  useFrame(({ clock }) => {
    // Rotate the mesh around the Y axis
    // meshRef.current.rotation.y += 0.0001;
    const elapsedTime = clock.getElapsedTime();
    //orbit the location [0,0,0]
    meshRef.current.position.x = 15 * Math.cos(elapsedTime * speed);
    meshRef.current.position.z = 15 * Math.sin(elapsedTime * speed);
  });

  return (
    <>
      <mesh ref={meshRef} position={location}>
        {constellationArray.map((object, index) => (
          <Star
            key={index}
            location={object.location}
            color={colors[Math.floor(Math.random() * (3.1 - 0) - 0)]}
            starScale={object.scale}
          />
        ))}
        {lines}
      </mesh>
    </>
  );
};

export default Constellation;
