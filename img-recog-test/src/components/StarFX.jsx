import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import glsl from "glslify";
import { MeshDistortMaterial } from "@react-three/drei";

const vertexShader = glsl`
  varying vec2 vUv;
  uniform float time;
  attribute float aOffset;

  void main() {
    vUv = uv;
    vec3 newPosition = position;

    // Add random displacement to vertices based on noise
    newPosition += normalize(position) * (0.02 + 0.01 * sin(time * 1.0));

    // Apply offset to each vertex to create radial particle emission for flames
    float flameAmplitude = 0.01; // Controls the size of the flames
    float flameFrequency = 1.0; // Controls the frequency of the flame waves
    float flameOffset = flameAmplitude * sin(time * flameFrequency + aOffset); // Calculate offset based on time and offset attribute
    newPosition += normalize(position) * flameOffset;

    // Apply additional offset to create radial particle emission for embers/sparks
    float emberAmplitude = 0.01; // Controls the size of the embers/sparks
    float emberFrequency = 20.0; // Controls the frequency of the ember/spark waves
    float emberOffset = emberAmplitude * sin(time * emberFrequency + aOffset) * 0.1; // Calculate offset based on time and offset attribute
    newPosition += normalize(position) * emberOffset;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
  }
`;

const fragmentShader = glsl`
  varying vec2 vUv;
  uniform vec3 baseColor;
  uniform vec3 baseEmissiveColor;
  uniform float baseEmissiveIntensity;

  void main() {
    vec2 uv = vUv;

    // Calculate the base emissive effect
    vec3 baseEmissive = baseEmissiveColor * baseEmissiveIntensity;

    // Calculate the final color by combining the base color with the emissive effect
    vec3 finalColor = baseColor + baseEmissive;

    // Output final color
    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

const StarFX = ({ location, color, starScale }) => {
  const ref = useRef();

  // Generate random offsets for each particle
  const offsets = useMemo(() => {
    const array = [];
    for (let i = 0; i < 1000; i++) {
      array.push(Math.random() * Math.PI * 2);
    }
    return new Float32Array(array);
  }, []);

  useFrame(({ clock }) => {
    ref.current.material.uniforms.time.value = clock.getElapsedTime();
    ref.current.rotation.x -= 0.01; // Optional: Rotate the star
  });

  return (
    <group>
      <mesh position={[0.01, 0.01, 0.01]} ref={ref} scale={starScale / 2}>
        <sphereGeometry args={[0.02, 128]} />
        <shaderMaterial
          uniforms={{
            color: { value: new THREE.Color(color) },
            baseEmissiveColor: { value: new THREE.Color(color) }, // Set base emissive color
            baseEmissiveIntensity: { value: 10 }, // Set base emissive intensity
            particleColor: { value: new THREE.Color(color) }, // Set particle color
            time: { value: 0 },
          }}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          attributes={{
            aOffset: { value: offsets },
          }}
        />
      </mesh>
      <mesh position={[0.01, 0.01, 0.01]} scale={1}>
        <sphereGeometry args={[0.02, 128]} />
        <MeshDistortMaterial
          distort={3}
          speed={1}
          color={"white"}
          emissive={color}
          emissiveIntensity={5}
        />
      </mesh>
    </group>
  );
};

export default StarFX;
