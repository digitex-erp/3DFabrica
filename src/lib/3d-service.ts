import * as THREE from "three";
import { GLTFLoader, GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { disposeTexture, disposeMaterial, FABRIC_PRESETS, type FabricType } from "./texture-service";

/**
 * 3D Service for fabric visualization
 * Fixed: Proper memory management and resource disposal
 */

// Store loaded resources for cleanup
const loadedResources = new Map<string, THREE.Texture | GLTF>();
const modelCache = new Map<string, GLTF>();

/**
 * Conversion options
 */
export interface ConversionOptions {
  format: "gltf" | "fbx";
  quality: "basic" | "advanced";
}

/**
 * Conversion result
 */
export interface ConversionResult {
  modelUrl: string;
  format: string;
  previewUrl: string;
}

/**
 * Model load options
 */
export interface ModelLoadOptions {
  dracoPath?: string;
  crossOrigin?: string;
}

const DEFAULT_MODEL_OPTIONS: ModelLoadOptions = {
  dracoPath: "https://www.gstatic.com/draco/versioned/decoders/1.5.6/",
  crossOrigin: "anonymous",
};

/**
 * Load a GLTF/GLB 3D model with Draco compression support
 */
export async function loadModel(
  url: string,
  options: ModelLoadOptions = {}
): Promise<GLTF> {
  const opts = { ...DEFAULT_MODEL_OPTIONS, ...options };

  // Check cache first
  if (modelCache.has(url)) {
    return modelCache.get(url)!;
  }

  return new Promise((resolve, reject) => {
    const loader = new GLTFLoader();

    // Set up Draco decoder
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath(opts.dracoPath!);
    loader.setDRACOLoader(dracoLoader);

    loader.load(
      url,
      (gltf) => {
        // Cache the model
        modelCache.set(url, gltf);
        loadedResources.set(url, gltf as unknown as THREE.Texture);
        
        resolve(gltf);
      },
      (progress) => {
        console.log(`Model loading: ${(progress.loaded / progress.total) * 100}%`);
      },
      (error) => {
        console.error("Model load error:", error);
        reject(new Error(`Failed to load model: ${url}`));
      }
    );
  });
}

/**
 * Apply texture to a model mesh
 */
export function applyTextureToModel(
  gltf: GLTF,
  texture: THREE.Texture,
  fabricType: FabricType = "cotton"
): void {
  const preset = FABRIC_PRESETS[fabricType];

  gltf.scene.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      // Dispose old material textures to prevent memory leak
      if (child.material) {
        disposeMaterial(child.material);
      }

      // Create new fabric material
      const material = new THREE.MeshStandardMaterial({
        map: texture,
        roughness: preset.roughness,
        sheen: preset.sheen,
        sheenRoughness: preset.sheenRoughness,
        sheenColor: preset.sheenColor,
        metalness: 0,
        side: THREE.FrontSide,
      });

      child.material = material;
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
}

/**
 * Validate image with proper memory cleanup
 * Fixed: Now properly revokes object URL
 */
export function validateImage(file: File): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    
    img.onload = () => {
      // ✅ FIX: Properly revoke the object URL to prevent memory leak
      URL.revokeObjectURL(objectUrl);
      
      // Check if image dimensions are sufficient
      const isValid = img.width >= 1024 && img.height >= 1024;
      resolve(isValid);
    };
    
    img.onerror = () => {
      // ✅ FIX: Also revoke on error
      URL.revokeObjectURL(objectUrl);
      resolve(false);
    };
    
    img.src = objectUrl;
  });
}

/**
 * Get image dimensions with proper cleanup
 */
export function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    
    img.onload = () => {
      // ✅ FIX: Revoke after getting dimensions
      URL.revokeObjectURL(objectUrl);
      resolve({ width: img.width, height: img.height });
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Failed to load image"));
    };
    
    img.src = objectUrl;
  });
}

/**
 * Clean up all loaded 3D resources
 * Call this when unmounting the viewer component
 */
export function disposeAllResources(): void {
  // Dispose all cached textures and models
  loadedResources.forEach((resource) => {
    if (resource instanceof THREE.Texture) {
      disposeTexture(resource);
    } else if (resource instanceof THREE.Group) {
      // For GLTF scenes
      resource.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          disposeMaterial(child.material);
          child.geometry?.dispose();
        }
      });
    }
  });

  loadedResources.clear();
  modelCache.clear();
}

/**
 * Clean up a specific model
 */
export function disposeModel(url: string): void {
  const model = modelCache.get(url);
  if (model) {
    model.scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        disposeMaterial(child.material);
        child.geometry?.dispose();
      }
    });
    modelCache.delete(url);
    loadedResources.delete(url);
  }
}

/**
 * Convert image file to data URL (for preview)
 */
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = () => {
      resolve(reader.result as string);
    };
    
    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };
    
    reader.readAsDataURL(file);
  });
}

/**
 * Mock conversion function (would normally call Blender API)
 */
export const convertToModel = async (
  imageUrl: string,
  options: ConversionOptions
): Promise<ConversionResult> => {
  // Simulate API call to Blender service
  await new Promise((resolve) => setTimeout(resolve, 2000));

  return {
    modelUrl: `https://storage.example.com/models/${Date.now()}.${options.format}`,
    format: options.format,
    previewUrl: `https://storage.example.com/previews/${Date.now()}.jpg`,
  };
};

/**
 * Preload common models
 */
export function preloadModels(modelUrls: string[]): Promise<GLTF[]> {
  return Promise.all(modelUrls.map((url) => loadModel(url)));
}
