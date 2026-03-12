import React, { useState, useEffect, useMemo } from "react";
import { useGLTF, Environment, ContactShadows, Html, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { loadSeamlessTexture, FABRIC_PRESETS, type FabricType } from "@/lib/texture-service";

interface SceneProps {
  fabricUrl?: string;
  fabricType?: FabricType;
  modelUrl: string;
  tiling?: number;
  rotation?: number;
  roughness?: number;
}

function Model({ 
  url,
  texture, 
  fabricType = "cotton",
  roughness 
}: { 
  url: string;
  texture?: THREE.Texture; 
  fabricType?: FabricType;
  roughness?: number;
}) {
  const { scene } = useGLTF(url);
  const preset = (fabricType ? FABRIC_PRESETS[fabricType] : FABRIC_PRESETS.cotton) || FABRIC_PRESETS.cotton;
  
  const material = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      map: texture,
      color: new THREE.Color(0xffffff),
      roughness: roughness ?? preset.roughness,
      metalness: 0,
      side: THREE.DoubleSide,
    });
  }, [texture, preset, roughness]);

  useEffect(() => {
    scene.traverse((child) => {
      if ((child as any).isMesh) {
        (child as THREE.Mesh).material = material;
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }, [scene, material]);

  const scale = url.includes("sofa") ? 2 : 1.5;
  const position: [number, number, number] = url.includes("sofa") ? [0, 0, 0] : [0, -0.5, 0];

  return <primitive object={scene} scale={scale} position={position} />;
}

export default function Scene({ 
  fabricUrl, 
  fabricType = "cotton",
  modelUrl,
  tiling = 4,
  rotation = 0,
  roughness
}: SceneProps) {
  const [texture, setTexture] = useState<THREE.Texture>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!fabricUrl) {
      setTexture(undefined);
      return;
    }

    let isMounted = true;
    setLoading(true);

    loadSeamlessTexture(fabricUrl, { 
      repeatX: tiling, 
      repeatY: tiling, 
      wrap: "repeat", 
      anisotropy: 8 
    })
      .then((tex) => {
        if (isMounted) { 
          tex.rotation = (rotation * Math.PI) / 180;
          setTexture(tex); 
          setLoading(false); 
        }
      })
      .catch(() => { if (isMounted) setLoading(false); });

    return () => { isMounted = false; };
  }, [fabricUrl, tiling, rotation]);

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={1.2} castShadow shadow-mapSize={[2048, 2048]} />
      <pointLight position={[-5, 5, -5]} intensity={0.6} />
      <Environment preset="apartment" />
      
      {loading ? (
        <Html center>
          <div className="flex flex-col items-center gap-3 bg-white/90 backdrop-blur-sm px-6 py-4 rounded-xl shadow-xl border border-gray-100">
            <div className="w-6 h-6 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-medium text-gray-700">Mapping texture...</span>
          </div>
        </Html>
      ) : (
        <Model url={modelUrl} texture={texture} fabricType={fabricType} roughness={roughness} />
      )}

      <ContactShadows position={[0, 0, 0]} opacity={0.4} scale={15} blur={2} far={4} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#f8fafc" roughness={1} />
      </mesh>
      
      <OrbitControls 
        enablePan 
        enableZoom 
        minDistance={2.5} 
        maxDistance={12} 
        minPolarAngle={Math.PI / 6} 
        maxPolarAngle={Math.PI / 2.1} 
        makeDefault
      />
    </>
  );
}
