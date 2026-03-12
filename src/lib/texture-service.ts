import * as THREE from "three";

/**
 * Texture processing options
 */
export interface TextureProcessingOptions {
  wrap?: "repeat" | "mirror" | "clamp";
  repeatX?: number;
  repeatY?: number;
  generateMipmaps?: boolean;
  anisotropy?: number;
  flipY?: boolean;
  encoding?: "sRGB" | "Linear";
}

const DEFAULT_OPTIONS: TextureProcessingOptions = {
  wrap: "repeat",
  repeatX: 4,
  repeatY: 4,
  generateMipmaps: true,
  anisotropy: 4,
  flipY: true,
  encoding: "sRGB",
};

/**
 * Load and process texture with seamless tiling
 * Uses RepeatWrapping for proper tiling
 */
export async function loadSeamlessTexture(
  imageUrl: string,
  options: TextureProcessingOptions = {}
): Promise<THREE.Texture> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  return new Promise((resolve, reject) => {
    const loader = new THREE.TextureLoader();

    loader.load(
      imageUrl,
      (texture) => {
        // Set wrapping mode for seamless tiling
        switch (opts.wrap) {
          case "repeat":
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            break;
          case "mirror":
            texture.wrapS = THREE.MirroredRepeatWrapping;
            texture.wrapT = THREE.MirroredRepeatWrapping;
            break;
          case "clamp":
            texture.wrapS = THREE.ClampToEdgeWrapping;
            texture.wrapT = THREE.ClampToEdgeWrapping;
            break;
        }

        // Set repeat count for tiling
        texture.repeat.set(opts.repeatX || 1, opts.repeatY || 1);

        // Set anisotropy for better diagonal lines
        if (opts.anisotropy) {
          texture.anisotropy = opts.anisotropy;
        }

        // Generate mipmaps for smooth scaling
        if (opts.generateMipmaps !== false) {
          texture.generateMipmaps = true;
          texture.minFilter = THREE.LinearMipmapLinearFilter;
        } else {
          texture.minFilter = THREE.LinearFilter;
        }

        texture.magFilter = THREE.LinearFilter;
        texture.flipY = opts.flipY !== false;

        // Set color encoding
        texture.colorSpace = opts.encoding === "sRGB" 
          ? THREE.SRGBColorSpace 
          : THREE.LinearSRGBColorSpace;

        texture.needsUpdate = true;

        resolve(texture);
      },
      undefined,
      (error) => {
        reject(new Error(`Failed to load texture: ${imageUrl}`));
      }
    );
  });
}

/**
 * PBR Material configuration for fabric
 */
export interface FabricPBRConfig {
  map?: THREE.Texture;
  color?: THREE.Color;
  roughness?: number;
  metalness?: number;
  normalScale?: number;
  aoIntensity?: number;
}

/**
 * Create PBR material optimized for fabric
 * Uses MeshStandardMaterial with fabric-specific tweaks
 */
export function createFabricMaterial(config: FabricPBRConfig = {}): THREE.MeshStandardMaterial {
  const material = new THREE.MeshStandardMaterial({
    // Base color texture
    map: config.map,
    color: config.color || new THREE.Color(0xffffff),

    // Fabric is typically non-metallic
    metalness: config.metalness ?? 0.0,

    // Fabric roughness varies by material type
    roughness: config.roughness ?? 0.8,

    // Normal map for fabric weave detail
    // normalScale: config.normalScale ?? new THREE.Vector2(1, 1),

    // Ambient occlusion
    // aoMap: config.aoMap,
    // aoMapIntensity: config.aoIntensity ?? 1.0,

  // Sheen for velvet-like materials - removed for compatibility
  // sheen: config.sheen ?? 0.0,
  // sheenRoughness: config.sheenRoughness ?? 0.5,
  // sheenColor: config.sheenColor || new THREE.Color(0xffffff),

    // Ensure proper rendering
    side: THREE.FrontSide,
    vertexColors: false,
  });

  return material;
}

/**
 * Approximate PBR maps from single fabric photo
 * Client-side generation (no AI required)
 */
export interface GeneratedPBRMaps {
  map: THREE.Texture | null;
  normalMap: THREE.Texture | null;
  roughnessMap: THREE.Texture | null;
}

/**
 * Generate approximate PBR maps from a single image
 * Uses canvas processing for basic normal/roughness approximation
 */
export async function generatePBRMaps(
  imageUrl: string
): Promise<GeneratedPBRMaps> {
  const texture = await loadSeamlessTexture(imageUrl, {
    repeatX: 4,
    repeatY: 4,
    encoding: "sRGB",
  });

  // For basic PBR, we use the same texture as map
  // Advanced: Use canvas to generate normal/roughness maps
  // This is a simplified version - could be enhanced with WebGL shaders

  return {
    map: texture,
    normalMap: null, // Would need Sobel edge detection
    roughnessMap: null, // Would need grayscale conversion
  };
}

/**
 * Dispose texture properly to prevent memory leaks
 */
export function disposeTexture(texture: THREE.Texture | null): void {
  if (texture) {
    texture.dispose();
  }
}

/**
 * Dispose material and all its textures
 */
export function disposeMaterial(material: THREE.Material): void {
  if (material instanceof THREE.MeshStandardMaterial) {
    disposeTexture(material.map);
    disposeTexture(material.normalMap);
    disposeTexture(material.roughnessMap);
    disposeTexture(material.aoMap);
    disposeTexture(material.displacementMap);
    disposeTexture(material.emissiveMap);
    disposeTexture(material.alphaMap);
    disposeTexture(material.envMap);
  }
  material.dispose();
}

/**
 * Fabric type presets for realistic rendering
 */
export const FABRIC_PRESETS = {
  cotton: {
    roughness: 0.85,
  },
  silk: {
    roughness: 0.3,
  },
  velvet: {
    roughness: 0.9,
  },
  leather: {
    roughness: 0.5,
  },
  wool: {
    roughness: 0.95,
  },
  linen: {
    roughness: 0.75,
  },
  polyester: {
    roughness: 0.4,
  },
  jacquard: {
    roughness: 0.6,
  },
} as const;

export type FabricType = keyof typeof FABRIC_PRESETS;
