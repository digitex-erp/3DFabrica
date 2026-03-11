import { z } from "zod";

/**
 * Fabric upload validation schema
 * Uses Zod for runtime validation
 */
export const fabricUploadSchema = z.object({
  name: z
    .string()
    .min(1, "Fabric name is required")
    .max(100, "Fabric name must be under 100 characters"),
  description: z
    .string()
    .max(500, "Description must be under 500 characters")
    .optional(),
  category: z
    .enum(["upholstery", "curtain", "carpet", "wallpaper", "other"])
    .default("upholstery"),
  material: z
    .enum(["cotton", "silk", "wool", "polyester", "linen", "velvet", "leather", "other"])
    .optional(),
  pattern: z
    .enum(["solid", "striped", "floral", "geometric", "abstract", "other"])
    .optional(),
  color: z.string().optional(),
});

export type FabricUploadData = z.infer<typeof fabricUploadSchema>;

/**
 * Image validation options
 */
export const imageValidationSchema = z.object({
  minWidth: z.number().min(256).default(1024),
  minHeight: z.number().min(256).default(1024),
  maxSizeMB: z.number().min(1).default(20),
  allowedTypes: z.array(z.string()).default(["image/jpeg", "image/png", "image/webp"]),
});

export type ImageValidationOptions = z.infer<typeof imageValidationSchema>;

/**
 * Validate image file
 */
export async function validateImageFile(
  file: File,
  options: ImageValidationOptions = {}
): Promise<{ valid: boolean; error?: string; dimensions?: { width: number; height: number } }> {
  const schema = imageValidationSchema.parse(options);
  
  // Check file type
  if (!schema.allowedTypes.includes(file.type)) {
    return { 
      valid: false, 
      error: `Invalid file type. Allowed: ${schema.allowedTypes.join(", ")}` 
    };
  }
  
  // Check file size
  if (file.size > schema.maxSizeMB * 1024 * 1024) {
    return { 
      valid: false, 
      error: `File too large. Maximum size: ${schema.maxSizeMB}MB` 
    };
  }
  
  // Check dimensions
  return new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      
      if (img.width < schema.minWidth || img.height < schema.minHeight) {
        resolve({
          valid: false,
          error: `Image too small. Minimum: ${schema.minWidth}x${schema.minHeight}px`,
          dimensions: { width: img.width, height: img.height }
        });
      } else {
        resolve({
          valid: true,
          dimensions: { width: img.width, height: img.height }
        });
      }
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve({ valid: false, error: "Failed to load image" });
    };
    
    img.src = objectUrl;
  });
}

/**
 * Generate unique fabric ID
 */
export function generateFabricId(): string {
  return `fabric_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Validate fabric data
 */
export function validateFabricData(data: unknown): FabricUploadData {
  return fabricUploadSchema.parse(data);
}
