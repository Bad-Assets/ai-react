import React, { useState, useEffect, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  Stars,
  CameraControls,
  PerspectiveCamera,
} from "@react-three/drei";

const sceneCam = ({ target, location }) => {
  const cameraRef = useRef();

  useFrame(() => {
    // Example: Set the camera to look at the origin [0, 0, 0]
    cameraRef.current.lookAt(target[0], target[1], target[2]);
  });

  return (
    <>
      <PerspectiveCamera
        makeDefault={
          target[0] === 0 && target[1] === 0 && target[2] === 0 ? false : true
        } // This makes this camera the default camera for the scene
        ref={cameraRef} // Reference to the camera
        position={location} // Initial position of the camera
      />
    </>
  );
};

export default sceneCam;
