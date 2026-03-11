// Supabase Edge Function: Process Fabric
// This API endpoint allows Bell24h to upload fabric images and receive tiled preview URLs
// For: https://github.com/digitex-erp/3DFabrica

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface FabricRequest {
  imageUrl: string;
  fabricType?: "cotton" | "silk" | "velvet" | "leather" | "wool" | "linen" | "polyester";
  repeatX?: number;
  repeatY?: number;
  userId?: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Get Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request body
    const { imageUrl, fabricType = "cotton", repeatX = 4, repeatY = 4, userId } = await req.json() as FabricRequest;

    // Validate required fields
    if (!imageUrl) {
      return new Response(
        JSON.stringify({ error: "imageUrl is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Download image from URL
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error("Failed to fetch image");
    }
    const imageBuffer = await imageResponse.arrayBuffer();
    const imageBlob = new Blob([imageBuffer]);

    // Generate unique ID
    const fabricId = `fabric_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Upload original to storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("fabrics")
      .upload(`${fabricId}_original.${getExtension(imageUrl)}`, imageBlob, {
        cacheControl: "3600",
        upsert: false,
        contentType: imageResponse.headers.get("content-type") || "image/jpeg",
      });

    if (uploadError) {
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("fabrics")
      .getPublicUrl(`${fabricId}_original.${getExtension(imageUrl)}`);

    const originalUrl = urlData.publicUrl;

    // Store metadata in database
    const { error: dbError } = await supabase.from("fabrics").insert({
      id: fabricId,
      name: `Fabric ${fabricId}`,
      category: "upholstery",
      material: fabricType,
      image_url: originalUrl,
      tiled_url: originalUrl, // In production, this would be processed/tiled version
      repeat_x: repeatX,
      repeat_y: repeatY,
      user_id: userId,
      created_at: new Date().toISOString(),
      status: "processed",
    });

    if (dbError) {
      console.warn("Database insert warning:", dbError.message);
    }

    // Return response
    return new Response(
      JSON.stringify({
        success: true,
        fabricId,
        originalUrl,
        tiledUrl: originalUrl, // Would be processed tiled version
        fabricType,
        repeatX,
        repeatY,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error processing fabric:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

/**
 * Get file extension from URL
 */
function getExtension(url: string): string {
  const match = url.match(/\.([^.]+)$/);
  return match ? match[1].toLowerCase() : "jpg";
}
