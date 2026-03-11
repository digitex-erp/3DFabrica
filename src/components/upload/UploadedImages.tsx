import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Image, CheckCircle2 } from "lucide-react";
import { initializePayment } from "@/lib/payment-service";
import { convertToModel } from "@/lib/3d-service";

interface UploadedImage {
  id: string;
  filename: string;
  thumbnailUrl: string;
  status: "pending" | "completed";
  convertedModelUrl?: string;
}

interface UploadedImagesProps {
  images?: UploadedImage[];
  selectedImages?: string[];
  onSelectImage?: (id: string) => void;
  onConvert?: (id: string) => void;
}

const EmptyState = ({ showTutorial = false }) => (
  <div className="flex flex-col items-center justify-center h-full text-gray-500 p-6">
    {showTutorial ? (
      <div className="text-center w-full">
        <h4 className="font-medium mb-4 text-lg">How It Works</h4>
        <div className="relative aspect-video w-full max-w-md mx-auto rounded-lg overflow-hidden shadow-lg mb-4 bg-gray-100">
          <img
            src="https://images.unsplash.com/photo-1581375383680-7101dc5cb5f4?w=600"
            alt="Tutorial thumbnail"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <Button
              variant="outline"
              className="text-white border-white hover:text-white hover:bg-white/20"
            >
              Watch Tutorial
            </Button>
          </div>
        </div>
        <p className="text-sm text-gray-600">
          Learn how to digitize your fabrics in 3D
        </p>
      </div>
    ) : (
      <>
        <Image className="w-12 h-12 mb-4 opacity-50" />
        <p>No images yet</p>
        <p className="text-sm">Upload images to get started</p>
      </>
    )}
  </div>
);

const UploadedImages = ({
  images = [],
  selectedImages = [],
  onSelectImage = () => {},
  onConvert = async (id: string) => {
    try {
      // First attempt payment
      const payment = await initializePayment({
        items: [{ id, name: "3D Conversion", amount: 1000 }],
        addons: { qrCode: true }, // Enable QR code generation by default
      });

      if (payment.success) {
        // If payment successful, start conversion
        const result = await convertToModel(id, {
          format: "gltf",
          quality: "advanced",
        });
        console.log("Conversion result:", result);
      }
    } catch (error) {
      console.error("Conversion failed:", error);
    }
  },
}: UploadedImagesProps) => {
  const pendingImages = images.filter((img) => img.status === "pending");
  const completedImages = images.filter((img) => img.status === "completed");

  return (
    <div className="grid md:grid-cols-2 gap-6 bg-white rounded-lg p-6">
      {/* Pending Conversions */}
      <Card className="p-4 h-[600px] flex flex-col">
        <h3 className="text-lg font-semibold mb-4">Pending Conversions</h3>
        {pendingImages.length === 0 ? (
          <EmptyState showTutorial={true} />
        ) : (
          <ScrollArea className="flex-1">
            <div className="space-y-4 pr-4">
              {pendingImages.map((image) => (
                <Card key={image.id} className="p-4">
                  <div className="flex gap-4">
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100">
                      <img
                        src={image.thumbnailUrl}
                        alt={image.filename}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium truncate">{image.filename}</p>
                      <Button
                        onClick={() => onConvert(image.id)}
                        className="mt-2 w-full bg-[#4CAF50] hover:bg-[#45a049]"
                      >
                        Convert to 3D (₹1000)
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}
      </Card>

      {/* Completed Orders */}
      <Card className="p-4 h-[600px] flex flex-col">
        <h3 className="text-lg font-semibold mb-4">Completed Orders</h3>
        <ScrollArea className="flex-1">
          {completedImages.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="space-y-4 pr-4">
              {completedImages.map((image) => (
                <Card key={image.id} className="p-4">
                  <div className="flex gap-4">
                    <Checkbox
                      checked={selectedImages.includes(image.id)}
                      onCheckedChange={() => onSelectImage(image.id)}
                      className="mt-1"
                    />
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100">
                      <img
                        src={image.thumbnailUrl}
                        alt={image.filename}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium truncate">{image.filename}</p>
                      <div className="flex items-center gap-1 text-sm text-[#4CAF50] mt-1">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Conversion Complete</span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </Card>
    </div>
  );
};

export default UploadedImages;
