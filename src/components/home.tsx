import React, { useState } from "react";
import PricingPlans from "./pricing/PricingPlans";
import { Button } from "@/components/ui/button";
import Header from "./navigation/Header";
import ThreeDViewer from "./hero/ThreeDViewer";
import UploadZone from "./upload/UploadZone";
import UploadedImages from "./upload/UploadedImages";
import CartFooter from "./cart/CartFooter";
import FabricPreview from "./preview/FabricPreview";
import { calculateEcoImpact } from "@/lib/fabric-service";
import { initializePayment } from "@/lib/payment-service";
import { convertToModel } from "@/lib/3d-service";

import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();
  const [selectedImages, setSelectedImages] = useState<string[]>([]);

  const handleSelectImage = (id: string) => {
    setSelectedImages((prev) =>
      prev.includes(id) ? prev.filter((imgId) => imgId !== id) : [...prev, id],
    );
  };

  const handleCheckout = async () => {
    try {
      // Calculate total eco impact
      const totalPaperSaved = calculateEcoImpact(selectedImages.length);
      console.log(`Total paper saved: ${totalPaperSaved}kg`);

      // Initialize payment with selected images
      const payment = await initializePayment({
        items: selectedImages.map((id) => ({
          id,
          name: "3D Conversion",
          amount: 1000,
        })),
        addons: {
          qrCode: true, // Enable QR code generation by default
          bulkUpload: selectedImages.length >= 50, // Enable bulk upload discount if applicable
        },
      });

      if (payment.success) {
        // Start conversion process for all selected images
        const conversions = selectedImages.map((id) =>
          convertToModel(id, {
            format: "gltf",
            quality: "advanced",
          }),
        );

        await Promise.all(conversions);
        console.log("All conversions completed");
      }
    } catch (error) {
      console.error("Checkout failed:", error);
    }
  };

  const [uploadedImages, setUploadedImages] = useState<
    Array<{
      id: string;
      filename: string;
      thumbnailUrl: string;
      status: "pending" | "completed";
    }>
  >([]);

  const handleFileAccepted = async (file: File) => {
    const newImage = {
      id: crypto.randomUUID(),
      filename: file.name,
      thumbnailUrl: URL.createObjectURL(file),
      status: "pending" as const,
    };
    setUploadedImages((prev) => [...prev, newImage]);
  };
  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="pt-[72px] bg-[#4CAF50] text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl lg:text-5xl font-bold">
                Transform Fabrics into 3D Catalogs
              </h1>
              <p className="text-lg text-gray-300">
                Reduce Waste. Earn ₹500/Scan.
              </p>
              <Button
                size="lg"
                className="bg-white text-[#1B365D] hover:bg-gray-100"
                onClick={() => navigate("/studio")}
              >
                Start Free Trial
              </Button>
            </div>
            <div className="h-[500px] rounded-lg overflow-hidden">
              <ThreeDViewer />
            </div>
          </div>
        </div>
      </section>

      {/* Upload Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Upload Your Fabric
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Get started by uploading your fabric images. We support
              high-quality JPG and PNG files for the best results.
            </p>
          </div>
          <div className="max-w-4xl mx-auto space-y-8">
            <UploadZone onFileAccepted={handleFileAccepted} />
            <UploadedImages
              images={uploadedImages}
              selectedImages={selectedImages}
              onSelectImage={handleSelectImage}
            />
          </div>
        </div>
      </section>

      {/* Preview Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Interactive Preview
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Explore your digitized fabric in 3D. Rotate, zoom, and examine
              every detail with our interactive preview tools.
            </p>
          </div>
          <div className="flex justify-center">
            <FabricPreview />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <PricingPlans />

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 bg-gray-50 rounded-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                High-Quality Rendering
              </h3>
              <p className="text-gray-600">
                Experience your fabrics in stunning detail with our advanced
                rendering technology.
              </p>
            </div>
            <div className="p-6 bg-gray-50 rounded-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Real-Time Interaction
              </h3>
              <p className="text-gray-600">
                Manipulate and explore your 3D fabric models in real-time with
                intuitive controls.
              </p>
            </div>
            <div className="p-6 bg-gray-50 rounded-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Easy Integration
              </h3>
              <p className="text-gray-600">
                Seamlessly integrate your 3D fabric models into your existing
                workflow.
              </p>
            </div>
          </div>
        </div>
      </section>
      <CartFooter
        selectedCount={selectedImages.length}
        totalAmount={selectedImages.length * 1000}
        onCheckout={handleCheckout}
      />
    </div>
  );
};

export default Home;
