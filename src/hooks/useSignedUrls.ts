import { useState, useEffect, useCallback } from "react";
import { createSignedUrls, createSignedUrl } from "@/lib/storage-utils";

/**
 * Hook to manage signed URLs for media files
 * Automatically refreshes URLs before they expire
 */
export function useSignedUrls(urls: string[] | undefined, refreshInterval: number = 3300000) {
  const [signedUrls, setSignedUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshUrls = useCallback(async () => {
    if (!urls || urls.length === 0) {
      setSignedUrls([]);
      setLoading(false);
      return;
    }

    try {
      const signed = await createSignedUrls(urls);
      setSignedUrls(signed);
    } catch (error) {
      console.error("Error refreshing signed URLs:", error);
      // Fall back to original URLs
      setSignedUrls(urls);
    } finally {
      setLoading(false);
    }
  }, [urls]);

  useEffect(() => {
    refreshUrls();

    // Refresh URLs before they expire (default: 55 minutes for 1-hour expiry)
    const interval = setInterval(refreshUrls, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshUrls, refreshInterval]);

  return { signedUrls, loading, refresh: refreshUrls };
}

/**
 * Hook to manage a single signed URL
 */
export function useSignedUrl(url: string | undefined, refreshInterval: number = 3300000) {
  const [signedUrl, setSignedUrl] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const refreshUrl = useCallback(async () => {
    if (!url) {
      setSignedUrl("");
      setLoading(false);
      return;
    }

    try {
      const signed = await createSignedUrl(url);
      setSignedUrl(signed);
    } catch (error) {
      console.error("Error refreshing signed URL:", error);
      setSignedUrl(url);
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    refreshUrl();

    const interval = setInterval(refreshUrl, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshUrl, refreshInterval]);

  return { signedUrl, loading, refresh: refreshUrl };
}
