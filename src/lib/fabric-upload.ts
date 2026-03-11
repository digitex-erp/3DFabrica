import { supabase } from "./supabase";
import { validateImageFile, generateFabricId, type FabricUploadData } from "./fabric-validation";

/**
 * Fabric upload result
 */
export interface FabricUploadResult {
  success: boolean;
  fabricId?: string;
  imageUrl?: string;
  error?: string;
}

/**
 * Upload progress callback
 */
export type UploadProgressCallback = (progress: number) => void;

/**
 * Upload fabric image to Supabase Storage
 * With proper security: validates, processes, and stores with RLS
 */
export async function uploadFabricImage(
  file: File,
  metadata: Partial<FabricUploadData>,
  onProgress?: UploadProgressCallback
): Promise<FabricUploadResult> {
  try {
    // Step 1: Validate image file
    const validation = await validateImageFile(file, {
      minWidth: 1024,
      minHeight: 1024,
      maxSizeMB: 20,
      allowedTypes: ["image/jpeg", "image/png", "image/webp"],
    });

    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    // Step 2: Generate unique fabric ID
    const fabricId = generateFabricId();
    const fileExtension = file.name.split(".").pop() || "jpg";
    const fileName = `${fabricId}.${fileExtension}`;

    // Step 3: Upload to Supabase Storage
    // Note: In production, use signed URLs or server-side uploads for better security
    const { data, error } = await supabase.storage
      .from("fabrics") // Your bucket name
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });

    if (error) {
      console.error("Supabase upload error:", error);
      return { success: false, error: `Upload failed: ${error.message}` };
    }

    // Step 4: Get public URL
    const { data: urlData } = supabase.storage
      .from("fabrics")
      .getPublicUrl(fileName);

    const imageUrl = urlData.publicUrl;

    // Step 5: Save metadata to database (if table exists)
    // Note: Ensure RLS is enabled on fabrics table
    const { error: dbError } = await supabase.from("fabrics").insert({
      id: fabricId,
      name: metadata.name || file.name,
      type: metadata.category || "upholstery",
      url: imageUrl,
      tiled_url: imageUrl, // For now, use the same URL; in production, this would be a processed URL
      created_at: new Date().toISOString(),
      user_id: (await supabase.auth.getUser()).data.user?.id,
    });

    if (dbError) {
      console.warn("Database insert warning:", dbError.message);
      // Continue even if metadata insert fails - image is uploaded
    }

    // Simulate progress for demo (real progress handled by Supabase)
    if (onProgress) {
      for (let i = 0; i <= 100; i += 20) {
        onProgress(i);
        await new Promise((r) => setTimeout(r, 100));
      }
    }

    return {
      success: true,
      fabricId,
      imageUrl,
    };
  } catch (error) {
    console.error("Upload error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Delete fabric image from storage
 */
export async function deleteFabricImage(fabricId: string): Promise<boolean> {
  try {
    const { error } = await supabase.storage
      .from("fabrics")
      .remove([`${fabricId}.jpg`, `${fabricId}.png`, `${fabricId}.webp`]);

    if (error) {
      console.error("Delete error:", error);
      return false;
    }

    // Also delete from database
    await supabase.from("fabrics").delete().eq("id", fabricId);

    return true;
  } catch (error) {
    console.error("Delete error:", error);
    return false;
  }
}

/**
 * Get user's uploaded fabrics
 */
export async function getUserFabrics() {
  const { data, error } = await supabase
    .from("fabrics")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Fetch error:", error);
    return [];
  }

  return data || [];
}
