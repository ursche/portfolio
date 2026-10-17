import { createBrowserSupabase } from "@/lib/supabase/client";

const BUCKET = "blog-images";
const MAX_BYTES = 5 * 1024 * 1024;
const TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif", "image/avif"];

/** Uploads straight from the browser; storage RLS only accepts allowlisted authors. */
export async function uploadImage(file: File): Promise<string> {
  if (!TYPES.includes(file.type)) throw new Error("Use a PNG, JPEG, WebP, GIF or AVIF image.");
  if (file.size > MAX_BYTES) throw new Error("Images must be 5 MB or smaller.");

  const ext = file.name.split(".").pop()?.toLowerCase() || "img";
  const path = `posts/${crypto.randomUUID()}.${ext}`;
  const storage = createBrowserSupabase().storage.from(BUCKET);

  const { error } = await storage.upload(path, file, {
    cacheControl: "31536000",
    contentType: file.type,
  });
  if (error) throw new Error(error.message);

  return storage.getPublicUrl(path).data.publicUrl;
}
