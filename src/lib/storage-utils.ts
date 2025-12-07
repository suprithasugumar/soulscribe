import { supabase } from "@/integrations/supabase/client";

/**
 * Extracts the file path from a storage URL
 * Handles both public URLs and signed URLs
 */
export function extractPathFromStorageUrl(url: string): { bucket: string; path: string } | null {
  try {
    // Match patterns like: /storage/v1/object/public/bucket-name/path or /storage/v1/object/sign/bucket-name/path
    const storageMatch = url.match(/\/storage\/v1\/object\/(?:public|sign)\/([^\/]+)\/(.+?)(?:\?|$)/);
    if (storageMatch) {
      return { bucket: storageMatch[1], path: storageMatch[2] };
    }
    
    // Match bucket name from URL path directly
    const bucketPatterns = ['journal-images', 'journal-videos', 'voice-notes'];
    for (const bucket of bucketPatterns) {
      if (url.includes(bucket)) {
        const pathMatch = url.match(new RegExp(`${bucket}/([^?]+)`));
        if (pathMatch) {
          return { bucket, path: pathMatch[1] };
        }
      }
    }
    
    return null;
  } catch {
    return null;
  }
}

/**
 * Creates a signed URL for a storage object
 * Falls back to the original URL if signing fails
 */
export async function createSignedUrl(url: string, expiresIn: number = 3600): Promise<string> {
  const pathInfo = extractPathFromStorageUrl(url);
  if (!pathInfo) {
    console.warn("Could not extract path from URL:", url);
    return url;
  }

  try {
    const { data, error } = await supabase.storage
      .from(pathInfo.bucket)
      .createSignedUrl(pathInfo.path, expiresIn);

    if (error) {
      console.error("Error creating signed URL:", error);
      return url;
    }

    return data.signedUrl;
  } catch (error) {
    console.error("Error in createSignedUrl:", error);
    return url;
  }
}

/**
 * Creates signed URLs for multiple storage objects
 */
export async function createSignedUrls(urls: string[], expiresIn: number = 3600): Promise<string[]> {
  const results = await Promise.all(urls.map(url => createSignedUrl(url, expiresIn)));
  return results;
}
