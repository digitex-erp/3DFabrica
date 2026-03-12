import React, { useState, useCallback, useRef, Suspense, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { type FabricType, FABRIC_PRESETS } from "../lib/texture-service";
import { uploadFabricImage } from "../lib/fabric-upload";
import { validateImageFile } from "../lib/fabric-validation";
import Sidebar from "../components/studio/Sidebar";
import Scene from "../components/studio/Scene";
import StudioControls from "../components/studio/StudioControls";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

const SAMPLE_FABRICS = [
  { id: "f1", name: "Premium Cotton", type: "upholstery", category: "cotton", color: "#e2e8f0" },
  { id: "f2", name: "Deep Velvet", type: "curtain", category: "velvet", color: "#450a0a" },
  { id: "f3", name: "Natural Linen", type: "upholstery", category: "linen", color: "#fef3c7" },
  { id: "f4", name: "Modern Jacquard", type: "upholstery", category: "jacquard", color: "#1e293b" },
  { id: "f5", name: "Fine Silk", type: "curtain", category: "silk", color: "#fdf2f8" },
  { id: "f6", name: "Rustic Leather", type: "upholstery", category: "leather", color: "#78350f" },
];

export default function Studio() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  console.log("Studio: Component rendering...");

  useEffect(() => {
    console.log("Studio: Component mounted");
  }, []);
  
  // Sidebar State
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  
  // Fabric Selection State
  const [selectedFabric, setSelectedFabric] = useState<any>(SAMPLE_FABRICS[0]);
  const [customFabrics, setCustomFabrics] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  
  // 3D Scene Controls
  const [selectedModel, setSelectedModel] = useState("https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/sofa/model.gltf");
  const [tiling, setTiling] = useState(4);
  const [rotation, setRotation] = useState(0);
  const [roughness, setRoughness] = useState<number>(FABRIC_PRESETS.cotton.roughness);
  const [fabricType, setFabricType] = useState<FabricType>("cotton");

  const handleFabricSelect = (fabric: any) => {
    setSelectedFabric(fabric);
    setFabricType(fabric.category as FabricType);
    setRoughness(FABRIC_PRESETS[fabric.category as FabricType]?.roughness || 0.5);
  };

  const handleUpload = useCallback(async (file: File) => {
    setIsUploading(true);
    try {
      const validation = await validateImageFile(file, { minWidth: 512, minHeight: 512 });
      if (!validation.valid) {
        toast({
          title: "Upload Failed",
          description: validation.error || "Image must be at least 512x512 pixels",
          variant: "destructive",
        });
        return;
      }

      const result = await uploadFabricImage(file, { name: file.name, category: "upholstery" });
      if (result.success && result.imageUrl) {
        const newFabric = {
          id: `custom-${Date.now()}`,
          name: file.name.split('.')[0],
          url: result.imageUrl,
          category: "upholstery",
          isCustom: true
        };
        setCustomFabrics(prev => [newFabric, ...prev]);
        setSelectedFabric(newFabric);
        toast({
          title: "Success",
          description: "Fabric uploaded and mapped successfully!",
        });
      } else {
        throw new Error(result.error || "Upload failed");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  }, [toast]);

  const handleExportPDF = async () => {
    const fabricName = selectedFabric?.name || "Custom Fabric";
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>${fabricName} - Technical Sheet</title>
          <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body class="p-10 font-sans text-slate-800 bg-white">
          <div class="max-w-4xl mx-auto border-2 border-slate-100 p-8 rounded-2xl shadow-sm">
            <header class="flex justify-between items-center mb-12 border-b pb-6">
              <div>
                <h1 class="text-3xl font-bold text-slate-900">3DFabrica Studio</h1>
                <p class="text-slate-500 italic mt-1 font-medium">Digital Fabric Technical Sheet</p>
              </div>
              <div class="text-right">
                <p class="font-bold text-blue-600">ID: FAB-${Date.now().toString().slice(-6)}</p>
                <p class="text-slate-400 text-sm">${new Date().toLocaleDateString()}</p>
              </div>
            </header>

            <div class="grid grid-cols-2 gap-12 mb-12">
              <div class="space-y-6">
                <h2 class="text-xl font-bold uppercase tracking-wider text-slate-400">Specifications</h2>
                <div class="space-y-4">
                  <div class="flex justify-between py-2 border-b border-slate-50">
                    <span class="text-slate-500">Fabric Name</span>
                    <span class="font-bold text-slate-900">${fabricName}</span>
                  </div>
                  <div class="flex justify-between py-2 border-b border-slate-50">
                    <span class="text-slate-500">Category</span>
                    <span class="font-bold text-slate-900 capitalize">${selectedFabric?.category || "Upholstery"}</span>
                  </div>
                  <div class="flex justify-between py-2 border-b border-slate-50">
                    <span class="text-slate-500">Tiling Scale</span>
                    <span class="font-bold text-slate-900 font-mono">${tiling}x</span>
                  </div>
                  <div class="flex justify-between py-2 border-b border-slate-50">
                    <span class="text-slate-500">Rotation</span>
                    <span class="font-bold text-slate-900 font-mono">${rotation}°</span>
                  </div>
                  <div class="flex justify-between py-2 border-b border-slate-50">
                    <span class="text-slate-500">Surface Roughness</span>
                    <span class="font-bold text-slate-900 font-mono">${Math.round(roughness * 100)}%</span>
                  </div>
                </div>
              </div>
              
              <div class="bg-slate-50 rounded-2xl p-6 flex flex-col items-center justify-center space-y-4">
                <h2 class="text-sm font-bold uppercase tracking-widest text-slate-400 mb-2">Texture Sample</h2>
                <div class="w-full aspect-square rounded-xl shadow-lg border-4 border-white overflow-hidden bg-slate-200">
                  ${selectedFabric?.url || selectedFabric?.color ? 
                    `<div style="width:100%;height:100%;${selectedFabric.url ? `background-image:url(${selectedFabric.url});background-size:cover;` : `background-color:${selectedFabric.color};`}"></div>` : 
                    '<div class="w-full h-full flex items-center justify-center text-slate-300">No Sample</div>'
                  }
                </div>
              </div>
            </div>

            <footer class="mt-20 pt-10 border-t text-center text-slate-400 text-sm italic">
              <p>Generated via 3DFabrica. All 3D parameters are standardized for manufacturing simulation.</p>
              <p class="mt-2 font-semibold text-slate-900 not-italic">© 2026 3DFabrica Technology. All rights reserved.</p>
            </footer>
          </div>
          <script>window.onload = function() { window.print(); window.close(); }</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const activeTextureUrl = selectedFabric?.isCustom ? selectedFabric.url : (selectedFabric ? `/textures/${selectedFabric.category}.jpg` : undefined);

  return (
    <div className="h-screen bg-slate-50 overflow-hidden flex flex-col">
      <Sidebar
        isExpanded={isSidebarExpanded}
        setExpanded={setIsSidebarExpanded}
        fabrics={SAMPLE_FABRICS}
        selectedFabricId={selectedFabric?.id}
        onSelectFabric={handleFabricSelect}
        onUploadClick={() => fileInputRef.current?.click()}
        customFabrics={customFabrics}
        onExportPDF={handleExportPDF}
        controls={
          <StudioControls
            tiling={tiling}
            setTiling={setTiling}
            rotation={rotation}
            setRotation={setRotation}
            roughness={roughness}
            setRoughness={setRoughness}
            fabricType={fabricType}
            setFabricType={(type) => {
               setFabricType(type);
               setRoughness(FABRIC_PRESETS[type].roughness);
            }}
            selectedModel={selectedModel}
            setSelectedModel={setSelectedModel}
          />
        }
      />

      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleUpload(file);
        }}
      />

      <main className={`flex-1 transition-all duration-300 relative ${isSidebarExpanded ? "ml-80" : "ml-16"}`}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-slate-50 to-slate-100" />
        
        <div className="absolute top-6 left-6 z-10 flex flex-col gap-1">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">FABRIC PREVIEW</h1>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Real-time Rendering</span>
          </div>
        </div>

        <div className="absolute top-6 right-6 z-10 flex gap-2">
           <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-xl border border-white shadow-sm flex items-center gap-3">
              <div 
                className="w-4 h-4 rounded-full border border-slate-200" 
                style={{ backgroundColor: selectedFabric?.color || '#ccc' }} 
              />
              <span className="text-sm font-bold text-slate-700">{selectedFabric?.name || "Custom Fabric"}</span>
           </div>
        </div>

        <Canvas 
          shadows 
          camera={{ position: [4, 3, 6], fov: 45 }} 
          gl={{ 
            antialias: true, 
            toneMapping: THREE.ACESFilmicToneMapping, 
            toneMappingExposure: 1.1 
          }}
        >
          <Suspense fallback={
            <Html center>
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                <span className="text-sm font-medium text-slate-500">Loading 3D Model...</span>
              </div>
            </Html>
          }>
            <Scene 
              fabricUrl={activeTextureUrl} 
              fabricType={fabricType} 
              modelUrl={selectedModel}
              tiling={tiling}
              rotation={rotation}
              roughness={roughness}
            />
          </Suspense>
        </Canvas>

        {isUploading && (
          <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] z-50 flex items-center justify-center">
            <div className="bg-white px-8 py-10 rounded-3xl shadow-2xl border border-slate-100 flex flex-col items-center gap-4 text-center">
              <div className="relative">
                 <div className="w-16 h-16 border-4 border-blue-500/20 rounded-full" />
                 <Loader2 className="w-16 h-16 text-blue-500 animate-spin absolute top-0 left-0" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Uploading Fabric</h3>
                <p className="text-slate-500 text-sm mt-1">Extracting patterns and generating seamless mapping...</p>
              </div>
            </div>
          </div>
        )}

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-2xl border border-white shadow-xl z-10">
           <div className="flex items-center gap-8">
              <div className="flex flex-col">
                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Controls</span>
                 <span className="text-xs text-slate-600">Drag to Rotate • Scroll to Zoom</span>
              </div>
              <div className="h-8 w-[1px] bg-slate-200" />
              <div className="flex flex-col">
                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</span>
                 <span className="text-xs text-emerald-600 font-medium">Ready for Export</span>
              </div>
           </div>
        </div>
      </main>
    </div>
  );
}
