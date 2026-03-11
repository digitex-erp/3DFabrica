import React, { useCallback, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useDropzone } from "react-dropzone";
import { Upload, X, FileText, CheckCircle } from "lucide-react";
import { Progress } from "../ui/progress";
import { Button } from "../ui/button";
import { Alert, AlertDescription } from "../ui/alert";
import { validateImage, convertToModel as processUpload } from "@/lib/3d-service";

interface UploadZoneProps {
  onFileAccepted?: (file: File) => void;
  maxSize?: number;
  acceptedFileTypes?: string[];
  isUploading?: boolean;
  uploadProgress?: number;
  error?: string;
}

const UploadZone = ({
  onFileAccepted = async (file: File) => {
    try {
      const isValid = await validateImage(file);
      if (!isValid) {
        throw new Error("Image dimensions must be at least 1024x1024 pixels");
      }
      const metadata = await processUpload(file.name, { format: "gltf", quality: "advanced" });
      console.log("Fabric metadata:", metadata);
    } catch (error) {
      console.error("Error processing file:", error);
    }
  },
  maxSize = 10 * 1024 * 1024, // 10MB default
  acceptedFileTypes = [".jpg", ".jpeg", ".png"],
  isUploading = false,
  uploadProgress = 0,
  error = "",
}: UploadZoneProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const { isAuthenticated, loginWithRedirect } = useAuth0();

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!isAuthenticated) {
        loginWithRedirect();
        return;
      }
      setSelectedFile(file);
      onFileAccepted(file);
    },
    [onFileAccepted],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": acceptedFileTypes,
    },
    maxSize,
    multiple: false,
  });

  const clearFile = () => {
    setSelectedFile(null);
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-lg">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors
          ${isDragActive ? "border-primary bg-primary/5" : "border-gray-300"}
          ${selectedFile ? "bg-gray-50" : "hover:bg-gray-50"}
        `}
      >
        <input {...getInputProps()} />

        {!selectedFile && (
          <div className="space-y-4">
            <div className="flex justify-center">
              <Upload className="h-12 w-12 text-gray-400" />
            </div>
            <div>
              <p className="text-lg font-medium text-gray-900">
                Upload Fabric Image (JPG/PNG, max 20MB)
              </p>
              <p className="text-sm text-gray-500">
                Drag and drop here or click to select
              </p>
            </div>
            <div className="text-xs text-gray-400">
              Supported formats: {acceptedFileTypes.join(", ")}
              <br />
              Maximum file size: {Math.floor(maxSize / 1024 / 1024)}MB
            </div>
          </div>
        )}

        {selectedFile && (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-gray-100 p-4 rounded">
              <div className="flex items-center space-x-3">
                <FileText className="h-6 w-6 text-gray-500" />
                <div className="text-sm">
                  <p className="font-medium text-gray-900">
                    {selectedFile.name}
                  </p>
                  <p className="text-gray-500">
                    {Math.round(selectedFile.size / 1024)} KB
                  </p>
                </div>
              </div>
              {!isUploading && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    clearFile();
                  }}
                >
                  <X className="h-5 w-5" />
                </Button>
              )}
            </div>

            {isUploading && (
              <div className="space-y-2">
                <Progress value={uploadProgress} className="w-full" />
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
              </div>
            )}

            {uploadProgress === 100 && (
              <div className="flex items-center justify-center space-x-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                <span>Upload complete!</span>
              </div>
            )}
          </div>
        )}
      </div>

      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default UploadZone;
