import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { RotateCw, ZoomIn, Move } from "lucide-react";
import { motion } from "framer-motion";

interface FabricPreviewProps {
  modelUrl?: string;
  onRotate?: (angle: number) => void;
  onZoom?: (level: number) => void;
  onPan?: (x: number, y: number) => void;
}

const FabricPreview = ({
  modelUrl = "https://images.unsplash.com/photo-1567017469553-d1c52d90c6dc?q=80&w=600&h=400&fit=crop",
  onRotate = () => {},
  onZoom = () => {},
  onPan = () => {},
}: FabricPreviewProps) => {
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(100);

  const handleRotate = (newRotation: number) => {
    setRotation(newRotation);
    onRotate(newRotation);
  };

  const handleZoom = (newZoom: number[]) => {
    setZoom(newZoom[0]);
    onZoom(newZoom[0]);
  };

  return (
    <Card className="w-[600px] h-[400px] p-4 bg-white">
      <div className="flex flex-col h-full gap-4">
        <div className="relative flex-1 bg-gray-100 rounded-lg overflow-hidden">
          <motion.img
            src={modelUrl}
            alt="Fabric Preview"
            className="w-full h-full object-cover"
            animate={{ rotate: rotation }}
            style={{ scale: zoom / 100 }}
          />
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <RotateCw className="w-4 h-4" />
            <span className="text-sm">Rotation</span>
          </div>
          <Slider
            value={[rotation]}
            onValueChange={(value) => handleRotate(value[0])}
            max={360}
            step={1}
          />

          <div className="flex items-center gap-2 mt-2">
            <ZoomIn className="w-4 h-4" />
            <span className="text-sm">Zoom</span>
          </div>
          <Slider
            value={[zoom]}
            onValueChange={handleZoom}
            min={50}
            max={200}
            step={1}
          />

          <div className="flex justify-between mt-2">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
              onClick={() => onPan(-10, 0)}
            >
              <Move className="w-4 h-4" /> Pan Left
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
              onClick={() => onPan(10, 0)}
            >
              Pan Right <Move className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default FabricPreview;
