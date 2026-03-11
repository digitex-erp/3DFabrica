import React, { useState, useRef, useCallback, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows, Html } from "@react-three/drei";
import * as THREE from "three";
import { loadSeamlessTexture, FABRIC_PRESETS, type FabricType, disposeTexture } from "../lib/texture-service";
import { uploadFabricImage } from "../lib/fabric-upload";
import { validateImageFile } from "../lib/fabric-validation";

const SAMPLE_FABRICS = [
  { id: "f1", name: "Ocean Blue Weave", type: "upholstery", category: "cotton", color: "#1e3a5f" },
  { id: "f2", name: "Velvet Crush", type: "curtain", category: "velvet", color: "#722f37" },
  { id: "f3", name: "Cream Linen", type: "upholstery", category: "linen", color: "#f5f5dc" },
  { id: "f4", name: "Charcoal Wool", type: "upholstery", category: "wool", color: "#36454f" },
  { id: "f5", name: "Emerald Silk", type: "curtain", category: "silk", color: "#50c878" },
  { id: "f6", name: "Terracotta Rust", type: "upholstery", category: "cotton", color: "#e2725b" },
];

function SofaModel({ texture, fabricType }: { texture?: THREE.Texture; fabricType?: FabricType }) {
  const preset = (fabricType ? FABRIC_PRESETS[fabricType] : FABRIC_PRESETS.cotton) || FABRIC_PRESETS.cotton;
  
  const material = React.useMemo(() => {
    return new THREE.MeshStandardMaterial({
      map: texture,
      color: new THREE.Color(0xffffff),
      roughness: preset.roughness,
      metalness: 0,
      side: THREE.DoubleSide,
    });
  }, [texture, preset]);

  return (
    <group>
      <mesh position={[0, 0.4, 0]} castShadow receiveShadow material={material}>
        <boxGeometry args={[2.2, 0.4, 1]} />
      </mesh>
      <mesh position={[0, 0.9, -0.35]} castShadow receiveShadow material={material}>
        <boxGeometry args={[2.2, 0.8, 0.3]} />
      </mesh>
      <mesh position={[-1, 0.65, 0]} castShadow receiveShadow material={material}>
        <boxGeometry args={[0.2, 0.5, 1]} />
      </mesh>
      <mesh position={[1, 0.65, 0]} castShadow receiveShadow material={material}>
        <boxGeometry args={[0.2, 0.5, 1]} />
      </mesh>
      <mesh position={[-0.5, 0.7, 0.05]} castShadow receiveShadow material={material}>
        <boxGeometry args={[0.7, 0.15, 0.7]} />
      </mesh>
      <mesh position={[0.5, 0.7, 0.05]} castShadow receiveShadow material={material}>
        <boxGeometry args={[0.7, 0.15, 0.7]} />
      </mesh>
      {[[-0.9, 0.1, 0.35], [0.9, 0.1, 0.35], [-0.9, 0.1, -0.35], [0.9, 0.1, -0.35]].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]} castShadow>
          <cylinderGeometry args={[0.05, 0.05, 0.2, 8]} />
          <meshStandardMaterial color="#4a3728" roughness={0.8} />
        </mesh>
      ))}
    </group>
  );
}

function Scene({ fabricUrl, fabricType }: { fabricUrl?: string; fabricType?: FabricType }) {
  const [texture, setTexture] = useState<THREE.Texture>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!fabricUrl) {
      setTexture(undefined);
      return;
    }

    let isMounted = true;
    setLoading(true);

    loadSeamlessTexture(fabricUrl, { repeatX: 4, repeatY: 4, wrap: "repeat", anisotropy: 4 })
      .then((tex) => {
        if (isMounted) { setTexture(tex); setLoading(false); }
      })
      .catch(() => { if (isMounted) setLoading(false); });

    return () => { isMounted = false; };
  }, [fabricUrl]);

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={1} castShadow shadow-mapSize={[2048, 2048]} />
      <pointLight position={[-5, 5, -5]} intensity={0.5} />
      <Environment preset="apartment" />
      {loading ? (
        <Html center>
          <div className="flex items-center gap-2 bg-white/90 px-4 py-2 rounded-lg">
            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm">Loading texture...</span>
          </div>
        </Html>
      ) : (
        <SofaModel texture={texture} fabricType={fabricType} />
      )}
      <ContactShadows position={[0, 0, 0]} opacity={0.4} scale={10} blur={2} far={4} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#ffffff" roughness={0.9} />
      </mesh>
      <OrbitControls enablePan enableZoom minDistance={2} maxDistance={10} minPolarAngle={Math.PI / 6} maxPolarAngle={Math.PI / 2} />
    </>
  );
}

function Sidebar({ fabrics, selectedFabric, onSelectFabric, onUpload, isExpanded, setExpanded }: {
  fabrics: typeof SAMPLE_FABRICS;
  selectedFabric?: typeof SAMPLE_FABRICS[0];
  onSelectFabric: (f: typeof SAMPLE_FABRICS[0]) => void;
  onUpload: (f: File) => void;
  isExpanded: boolean;
  setExpanded: (v: boolean) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onUpload(file);
  };

  return (
    <aside
      id="sidebar"
      className={`fixed left-0 top-0 h-full bg-white shadow-xl z-50 transition-all duration-300 ${isExpanded ? "w-72" : "w-16"}`}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
    >
      <div className="p-4 h-full overflow-y-auto">
        {!isExpanded ? (
          <div className="flex flex-col items-center gap-4 pt-4">
            <button className="p-2 hover:bg-gray-100 rounded-lg" title="Upload">📤</button>
            <button className="p-2 hover:bg-gray-100 rounded-lg" title="Fabrics">🧵</button>
            <button className="p-2 hover:bg-gray-100 rounded-lg" title="Export">📄</button>
          </div>
        ) : (
          <>
            <h2 className="text-lg font-bold mb-4">3DFabrica Studio</h2>
            <input type="file" ref={fileInputRef} accept="image/*" className="hidden" onChange={handleFileChange} />
            <button onClick={() => fileInputRef.current?.click()} className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 mb-4">
              + Upload Fabric
            </button>
            <div className="space-y-2">
              <h3 className="font-semibold text-sm text-gray-500 uppercase">Select Fabric</h3>
              {fabrics.map((f) => (
                <button
                  key={f.id}
                  onClick={() => onSelectFabric(f)}
                  className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                    selectedFabric?.id === f.id ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded" style={{ backgroundColor: f.color }} />
                    <div>
                      <p className="font-medium text-sm">{f.name}</p>
                      <p className="text-xs text-gray-500 capitalize">{f.category}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent("export-pdf"))}
              className="w-full mt-4 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700"
            >
              📄 Export PDF
            </button>
          </>
        )}
      </div>
    </aside>
  );
}

async function generatePDF(fabricName: string, logoUrl?: string) {
  // Simple browser print-to-PDF
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;
  
  printWindow.document.write(`
    <html>
    <head><title>${fabricName} Catalog</title>
    <style>
      body { font-family: Arial, sans-serif; padding: 40px; }
      .header { text-align: center; margin-bottom: 40px; }
      .logo { max-width: 150px; }
      .title { font-size: 24px; margin: 20px 0; }
      .footer { margin-top: 40px; text-align: center; color: #666; }
    </style>
    </head>
    <body>
      <div class="header">
        ${logoUrl ? `<img src="${logoUrl}" class="logo" />` : ""}
        <h1 class="title">3DFabrica Catalog</h1>
        <h2>${fabricName}</h2>
      </div>
      <div class="footer">
        <p>Generated with 3DFabrica</p>
        <p>© 2026 3DFabrica</p>
      </div>
      <script>window.onload = function() { window.print(); window.close(); }</script>
    </body>
    </html>
  `);
  printWindow.document.close();
}

export default function Studio() {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [selectedFabric, setSelectedFabric] = useState<typeof SAMPLE_FABRICS[0]>();
  const [customTextureUrl, setCustomTextureUrl] = useState<string>();
  const [isUploading, setIsUploading] = useState(false);
  const [logo, setLogo] = useState<string>();

  const handleUpload = useCallback(async (file: File) => {
    setIsUploading(true);
    try {
      const validation = await validateImageFile(file, { minWidth: 512, minHeight: 512 });
      if (!validation.valid) {
        alert(validation.error || "Invalid image");
        return;
      }
      const result = await uploadFabricImage(file, { name: file.name, category: "upholstery" });
      if (result.success && result.imageUrl) {
        setCustomTextureUrl(result.imageUrl);
        setSelectedFabric(undefined);
      } else {
        alert(result.error || "Upload failed");
      }
    } finally {
      setIsUploading(false);
    }
  }, []);

  useEffect(() => {
    const handler = () => generatePDF(selectedFabric?.name || "Custom_Fabric", logo);
    window.addEventListener("export-pdf", handler);
    return () => window.removeEventListener("export-pdf", handler);
  }, [selectedFabric, logo]);

  const activeTextureUrl = customTextureUrl || (selectedFabric ? `/textures/${selectedFabric.category}.jpg` : undefined);

  return (
    <div className="min-h-screen bg-white">
      <Sidebar
        fabrics={SAMPLE_FABRICS}
        selectedFabric={selectedFabric}
        onSelectFabric={(f) => { setSelectedFabric(f); setCustomTextureUrl(undefined); }}
        onUpload={handleUpload}
        isExpanded={isSidebarExpanded}
        setExpanded={setIsSidebarExpanded}
      />
      <main className={`transition-all duration-300 ${isSidebarExpanded ? "ml-72" : "ml-16"}`}>
        <header className="bg-white border-b px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">Fabric Studio</h1>
          <div className="flex items-center gap-4">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = () => setLogo(reader.result as string);
                  reader.readAsDataURL(file);
                }
              }}
              className="text-sm"
              title="Upload logo"
            />
            <span className="text-sm text-gray-500">Logo</span>
          </div>
        </header>
        <div className="h-[calc(100vh-73px)]">
          <Canvas shadows camera={{ position: [3, 2, 5], fov: 50 }} gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.2 }}>
            <Scene fabricUrl={activeTextureUrl} fabricType={selectedFabric?.category as FabricType} />
          </Canvas>
          {(selectedFabric || customTextureUrl) && (
            <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg">
              <p className="font-medium">{selectedFabric?.name || "Custom Fabric"}</p>
              <p className="text-sm text-gray-500 capitalize">{selectedFabric?.category || "Upholstery"} • {selectedFabric?.type || "Custom"}</p>
            </div>
          )}
          {isUploading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="bg-white rounded-lg p-6 text-center">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p>Uploading fabric...</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
