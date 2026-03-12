import React from "react";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { FABRIC_PRESETS, type FabricType } from "@/lib/texture-service";
import { Sofa, DoorClosed } from "lucide-react";

interface StudioControlsProps {
  tiling: number;
  setTiling: (v: number) => void;
  rotation: number;
  setRotation: (v: number) => void;
  roughness: number;
  setRoughness: (v: number) => void;
  fabricType: FabricType;
  setFabricType: (v: FabricType) => void;
  selectedModel: string;
  setSelectedModel: (v: string) => void;
}

const MODELS = [
  { id: "sofa", name: "Modern Sofa", icon: <Sofa className="w-4 h-4" />, url: "https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/sofa/model.gltf" },
  { id: "curtain", name: "Curtain", icon: <DoorClosed className="w-4 h-4" />, url: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Curtain/glTF/Curtain.gltf" },
];

export default function StudioControls({
  tiling,
  setTiling,
  rotation,
  setRotation,
  roughness,
  setRoughness,
  fabricType,
  setFabricType,
  selectedModel,
  setSelectedModel
}: StudioControlsProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Label className="text-sm font-medium text-slate-700">3D Model</Label>
        <div className="grid grid-cols-2 gap-2">
          {MODELS.map((model) => (
            <Button
              key={model.id}
              variant={selectedModel === model.url ? "default" : "outline"}
              className="flex items-center gap-2 justify-center py-6 h-auto"
              onClick={() => setSelectedModel(model.url)}
            >
              {model.icon}
              <span className="text-xs">{model.name}</span>
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <Label className="text-sm font-medium text-slate-700">Fabric Preset</Label>
        <Select value={fabricType} onValueChange={(v) => setFabricType(v as FabricType)}>
          <SelectTrigger className="w-full bg-white border-slate-200">
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            {Object.keys(FABRIC_PRESETS).map((type) => (
              <SelectItem key={type} value={type} className="capitalize">
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium text-slate-700">Tiling Scale</Label>
          <span className="text-xs font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-500">{tiling}x</span>
        </div>
        <Slider
          value={[tiling]}
          onValueChange={(v) => setTiling(v[0])}
          min={1}
          max={10}
          step={0.5}
          className="py-2"
        />
        <p className="text-[10px] text-slate-400">Controls how many times the pattern repeats</p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium text-slate-700">Pattern Rotation</Label>
          <span className="text-xs font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-500">{rotation}°</span>
        </div>
        <Slider
          value={[rotation]}
          onValueChange={(v) => setRotation(v[0])}
          min={0}
          max={360}
          step={15}
          className="py-2"
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium text-slate-700">Surface Roughness</Label>
          <span className="text-xs font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-500">{Math.round(roughness * 100)}%</span>
        </div>
        <Slider
          value={[roughness]}
          onValueChange={(v) => setRoughness(v[0])}
          min={0}
          max={1}
          step={0.05}
          className="py-2"
        />
        <p className="text-[10px] text-slate-400">0 is shiny/reflective, 1 is completely matte</p>
      </div>
    </div>
  );
}
