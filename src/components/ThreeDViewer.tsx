import React, { useEffect, useState, useRef, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows, useGLTF, Html } from "@react-three/drei";
import * as THREE from "three";
import { loadSeamlessTexture, createFabricMaterial, FABRIC_PRESETS, type FabricType, disposeTexture } from "../lib/texture-service";
import { disposeAllResources } from "../lib/3d-service";

/**
 * ThreeDViewerProps
 */
interface ThreeDViewerProps {
  fabricImageUrl?: string;
  fabricType?: FabricType;
  modelUrl?: string;
  autoRotate?: boolean;
  showControls?: boolean;
}

/**
 * Loading indicator component
 */
function Loader() {
  return (
    <Html center>
      <div className="flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="mt-2 text-sm text-gray-600">Loading model...</p>
      </div>
    </Html>
  );
}

/**
 * Sofa model component
 * Uses a simple box geometry as placeholder
 * Replace with actual GLTF model for production
 */
function SofaModel({ 
  texture, 
  fabricType = "cotton" 
}: { 
  texture?: THREE.Texture; 
  fabricType?: FabricType;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const preset = FABRIC_PRESETS[fabricType];

  // Animate subtle movement
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.05;
    }
  });

  // Create material based on fabric type
  const material = React.useMemo(() => {
    const mat = new THREE.MeshStandardMaterial({
      map: texture,
      color: new THREE.Color(0xffffff),
      roughness: preset.roughness,
      sheen: preset.sheen,
      sheenRoughness: preset.sheenRoughness,
      sheenColor: preset.sheenColor,
      metalness: 0,
      side: THREE.DoubleSide,
    });
    return mat;
  }, [texture, preset]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      material.dispose();
      if (texture) disposeTexture(texture);
    };
  }, [material, texture]);

  return (
    <group>
      {/* Seat */}
      <mesh ref={meshRef} position={[0, 0.4, 0]} castShadow receiveShadow material={material}>
        <boxGeometry args={[2.2, 0.4, 1]} />
      </mesh>
      
      {/* Backrest */}
      <mesh position={[0, 0.9, -0.35]} castShadow receiveShadow material={material}>
        <boxGeometry args={[2.2, 0.8, 0.3]} />
      </mesh>
      
      {/* Left armrest */}
      <mesh position={[-1, 0.65, 0]} castShadow receiveShadow material={material}>
        <boxGeometry args={[0.2, 0.5, 1]} />
      </mesh>
      
      {/* Right armrest */}
      <mesh position={[1, 0.65, 0]} castShadow receiveShadow material={material}>
        <boxGeometry args={[0.2, 0.5, 1]} />
      </mesh>
      
      {/* Cushions */}
      <mesh position={[-0.5, 0.7, 0.05]} castShadow receiveShadow material={material}>
        <boxGeometry args={[0.7, 0.15, 0.7]} />
      </mesh>
      <mesh position={[0.5, 0.7, 0.05]} castShadow receiveShadow material={material}>
        <boxGeometry args={[0.7, 0.15, 0.7]} />
      </mesh>
      
      {/* Legs */}
      {[[-0.9, 0.1, 0.35], [0.9, 0.1, 0.35], [-0.9, 0.1, -0.35], [0.9, 0.1, -0.35]].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]} castShadow>
          <cylinderGeometry args={[0.05, 0.05, 0.2, 8]} />
          <meshStandardMaterial color="#4a3728" roughness={0.8} />
        </mesh>
      ))}
    </group>
  );
}

/**
 * Scene component with lighting and environment
 */
function Scene({ 
  fabricImageUrl, 
  fabricType = "cotton",
  autoRotate = false 
}: { 
  fabricImageUrl?: string;
  fabricType?: FabricType;
  autoRotate?: boolean;
}) {
  const [texture, setTexture] = useState<THREE.Texture | undefined>();
  const [loading, setLoading] = useState(false);

  // Load texture when image URL changes
  useEffect(() => {
    if (!fabricImageUrl) {
      setTexture(undefined);
      return;
    }

    let isMounted = true;
    setLoading(true);

    loadSeamlessTexture(fabricImageUrl, {
      repeatX: 4,
      repeatY: 4,
      wrap: "repeat",
      anisotropy: 4,
    })
      .then((tex) => {
        if (isMounted) {
          setTexture(tex);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Failed to load texture:", err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [fabricImageUrl]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disposeAllResources();
    };
  }, []);

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[5, 5, 5]}
        intensity={1}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      <pointLight position={[-5, 5, -5]} intensity={0.5} />
      
      {/* Environment for reflections */}
      <Environment preset="apartment" />
      
      {/* Model */}
      {loading ? (
        <Loader />
      ) : (
        <SofaModel texture={texture} fabricType={fabricType} />
      )}
      
      {/* Ground shadow */}
      <ContactShadows
        position={[0, 0, 0]}
        opacity={0.4}
        scale={10}
        blur={2}
        far={4}
      />
      
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#f5f5f5" roughness={0.9} />
      </mesh>
      
      {/* Controls */}
      <OrbitControls
        autoRotate={autoRotate}
        autoRotateSpeed={0.5}
        enablePan={true}
        enableZoom={true}
        minDistance={2}
        maxDistance={10}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2}
      />
    </>
  );
}

/**
 * Main ThreeDViewer component
 * React Three Fiber canvas with fabric visualization
 */
export default function ThreeDViewer({
  fabricImageUrl,
  fabricType = "cotton",
  modelUrl,
  autoRotate = false,
  showControls = true,
}: ThreeDViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div 
      ref={containerRef}
      className="w-full h-full min-h-[400px] bg-gray-100 rounded-lg overflow-hidden"
    >
      <Canvas
        shadows
        camera={{ position: [3, 2, 5], fov: 50 }}
        gl={{ 
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2,
        }}
      >
        <Scene 
          fabricImageUrl={fabricImageUrl}
          fabricType={fabricType}
          autoRotate={autoRotate}
        />
      </Canvas>
      
      {/* Fabric info overlay */}
      {fabricImageUrl && (
        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg">
          <p className="text-sm font-medium text-gray-700 capitalize">
            {fabricType} Fabric
          </p>
          <p className="text-xs text-gray-500">
            {autoRotate ? "Auto-rotating" : "Drag to rotate"}
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * Preload a texture for faster initial render
 */
export function preloadTexture(url: string) {
  const loader = new THREE.TextureLoader();
  loader.load(url);
}
