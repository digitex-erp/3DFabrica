import React, { Suspense, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useTexture, Text } from "@react-three/drei";
import { Physics, usePlane, useBox } from "@react-three/cannon";
import * as THREE from "three";

interface ThreeDViewerProps {
  autoRotate?: boolean;
  backgroundColor?: string;
}

const Floor = () => {
  const [ref] = usePlane(() => ({
    rotation: [-Math.PI / 2, 0, 0],
    position: [0, -2, 0],
  }));

  return (
    <mesh ref={ref} receiveShadow>
      <planeGeometry args={[10, 10]} />
      <meshStandardMaterial color="#f0f0f0" />
    </mesh>
  );
};

const Fabric = ({
  position,
  textureUrl,
  name,
  description,
}: {
  position: [number, number, number];
  textureUrl: string;
  name: string;
  description: string;
}) => {
  const [ref] = useBox(() => ({
    mass: 1,
    position,
    args: [2, 2, 0.1],
  }));

  // Create a basic material with a color based on the fabric type
  const material = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: name.toLowerCase().includes("velvet")
        ? "#800020"
        : name.toLowerCase().includes("jacquard")
          ? "#4a4a4a"
          : "#8B4513",
      roughness: 0.7,
      metalness: 0.3,
    });
  }, [name]);

  return (
    <group>
      <mesh ref={ref} castShadow receiveShadow>
        <boxGeometry args={[2, 2, 0.1]} />
        <primitive object={material} attach="material" />
      </mesh>
      <Text
        position={[position[0], position[1] + 1.5, position[2]]}
        fontSize={0.3}
        color="white"
      >
        {`${name}\n${description}`}
      </Text>
    </group>
  );
};

const fabrics = [
  {
    name: "Velvet",
    description: "Luxurious and Plush",
    textureUrl: "velvet",
    position: [-2, 5, 0] as [number, number, number],
  },
  {
    name: "Jacquard",
    description: "Elegant and Intricate",
    textureUrl: "jacquard",
    position: [0, 7, 0] as [number, number, number],
  },
  {
    name: "PU Leather",
    description: "Durable and Modern",
    textureUrl: "leather",
    position: [2, 9, 0] as [number, number, number],
  },
];

const Scene = () => {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[5, 5, 5]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <Physics>
        <Floor />
        {fabrics.map((fabric, index) => (
          <Fabric key={index} {...fabric} />
        ))}
      </Physics>
    </>
  );
};

const ThreeDViewer = ({
  autoRotate = true,
  backgroundColor = "#1B365D",
}: ThreeDViewerProps) => {
  return (
    <div className="w-full h-full min-h-[500px] bg-[#1B365D]">
      <Canvas
        shadows
        camera={{ position: [0, 5, 10], fov: 50 }}
        style={{ background: backgroundColor }}
      >
        <Suspense fallback={null}>
          <Scene />
          <OrbitControls
            enableDamping
            dampingFactor={0.05}
            autoRotate={autoRotate}
            autoRotateSpeed={1}
          />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default ThreeDViewer;
