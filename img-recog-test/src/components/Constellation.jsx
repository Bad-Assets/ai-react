import React, { useRef, useState } from "react";
import { Line } from "@react-three/drei";
import { useThree, useFrame } from "@react-three/fiber";
import Star from "./Star";
import * as THREE from "three";

//A component made up of star components. It handles its own movement independently

const Constellation = ({
  location,
  speed,
  colorSeed,
  creationTime,
  lifeSpan,
  amount,
  offsetString,
}) => {

  const { camera } = useThree()
  let constellationArray = []; //array to hold star components
  let colors; //variable to store color arrays
  const randomLengths = [
    Math.floor(Math.random() * (8 - 5) + 5),
    Math.floor(Math.random() * (6 - 3) + 3),
    Math.floor(Math.random() * (4 - 3) + 3),
  ]; //array to hold different randomly generated array lengths. This randomizes how many stars are in a given constellation//outdated. Used for testing

  // console.log("before split: ", offsetString);
  //convert offset string from database to 2d array
  let offsetArrays = offsetString.split(" | ");
  // console.log("split array: ", offsetArrays);
  // console.log("Amount: ", amount);
  // console.log("Offset array length: ", offsetArrays.length);
  // console.log(amount === offsetArrays.length ? offsetArrays : "Nothing...");
  // const [enteredPlanetRange, setEnteredPlanetRange] = useState(false);
  // const [initialPosition, setInitialPosition] = useState(location);
  

  //This loop handles the randomization and initialization of each individual star in a given constellation.
  //if you wanna change any property of an individual star in a constellation, this is where you do it
  for (let i = 0; i < amount; i++) {
    // console.log("Offset Arrays: ", offsetArrays[i]);

    //random location offet to make sure that the star comps are more naturally spaced out
    let singleOffset = offsetArrays[i].split(", ");
    // console.log("split: ", offsetArrays[i]);

    //maps through inital locations on every loop to add offset to stars AND randomize star scale every loop
    const newPosition = location.map(
      (coord, index) => coord + parseFloat(singleOffset[index])
    );
    const sScale = Math.floor(Math.random() * (6 - 4) - 4); //star scale randomizer

    //determines colors of individual stars. Right now, it's semi-random/array based
    switch (colorSeed) {
      case 1:
        colors = ["magenta"];
        break;
      case 2:
        colors = ["cyan"];
        break;
      case 3:
        colors = ["yellow"];
        break;
      case 4:
        colors = ["violet"];
        break;
      case 5:
        colors = ["white"];
        break;
      case 6:
        colors = ["green"];
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

  let orbit = false;

  //this creates a mini animation loop to change loaction/orientation values over time
  useFrame(({ clock }) => {
    // Rotate the mesh around the Y axis
    // meshRef.current.rotation.y += 0.0001;
    const elapsedTime = clock.getElapsedTime();
    //const angle = elapsedTime * speed;
    const angle = elapsedTime * 2;


    //orbit the location [0,0,0]
    // meshRef.current.position.x = 15 * Math.cos(elapsedTime * speed);
    // meshRef.current.position.z = 15 * Math.sin(elapsedTime * speed);

    let planet = "purple"

    let targetX, targetY, targetZ, planetSize;

    switch (planet) {
      case "blue":
        targetX = 50;
        targetY = 50;
        targetZ = 45;
        planetSize = 12;
        break;
      case "red":
        targetX = 75;
        targetY = 0;
        targetZ = -25;
        planetSize = 15;
        break;
      case "yellow":
        targetX = -35;
        targetY = 30;
        targetZ = 45;
        planetSize = 20;
        break;
      case "white":
        targetX = 20;
        targetY = 10;
        targetZ = -55;
        planetSize = 15;
        break;
      case "purple":
        targetX = -50;
        targetY = 20;
        targetZ = -25;
        planetSize = 14;
        break;
      default:
        targetX = 0;
        targetY = 0;
        targetZ = 0;
        planetSize = 12;
        break;
    }

    orbit = true;

    const vec = new THREE.Vector3(targetX, targetY, targetZ);

    if (meshRef.current.position.x <= targetX && !orbit) {
      meshRef.current.position.x += 0.1
    } else if (meshRef.current.position.x > targetX && !orbit) {
      meshRef.current.position.x -= 0.1
    }

    if (meshRef.current.position.y <= targetY && !orbit) {
      meshRef.current.position.y += 0.1
    } else if (meshRef.current.position.y > targetY && !orbit) {
      meshRef.current.position.y -= 0.1
    }

    if (meshRef.current.position.z <= targetZ && !orbit) {
      meshRef.current.position.z += 0.1
    } else if (meshRef.current.position.z > targetZ && !orbit) {
      meshRef.current.position.z -= 0.1
    }

    if (Math.abs(meshRef.current.position.x - (Math.cos(angle) * 4 + targetX)) <= 5 && Math.abs(meshRef.current.position.y - targetY) <= 5 && Math.abs(meshRef.current.position.z - (Math.sin(angle) * 4 + targetZ)) <= 5) {

      console.log("orbit is true")
      orbit = true
    }

    // console.log("meshRef.current.position.x - (Math.cos(angle) * 4 + targetX) ", meshRef.current.position.x - (Math.cos(angle) * 4 + targetX))
    // console.log("meshRef.current.position.y - targetY", meshRef.current.position.y - targetY)
    // console.log("meshRef.current.position.z - (Math.sin(angle) * 4 + targetZ)", meshRef.current.position.z - (Math.sin(angle) * 4 + targetZ))


    if(orbit){
      meshRef.current.position.y = targetY;
      meshRef.current.position.x = Math.cos(angle) * planetSize + targetX;
      meshRef.current.position.z = Math.sin(angle) * planetSize + targetZ;

    }
  });

  // useFrame(() => {
  //   let initCoord = [4, -5, 10];
  //   meshRef.current.position.lerp(initCoord, 0.1)
  //   //camera.position.set(initCoord);
  //   console.log("use frame inside constellation")
  // });


  return (
    <>
      <mesh ref={meshRef} position={location}>
        {constellationArray.map((object, index) => (
          <Star
            key={index}
            location={object.location}
            color={colors[0]}
            starScale={object.scale}
          />
        ))}
        {lines}
      </mesh>
    </>
  );
};

export default Constellation;
