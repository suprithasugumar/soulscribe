import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ImageIcon, Video, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { AudioRecorder } from "./AudioRecorder";
import { useLanguage } from "@/hooks/useLanguage";

interface MediaUploaderProps {
  onMediaUploaded: (urls: string[]) => void;
  currentUrls: string[];
}

export const MediaUploader = ({ onMediaUploaded, currentUrls }: MediaUploaderProps) => {
  const [uploading, setUploading] = useState(false);
  const { t } = useLanguage();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const uploadPromises = Array.from(files).map(async (file) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${Math.random()}.${fileExt}`;
        const bucket = type === 'image' ? 'journal-images' : 'journal-videos';

        const { error: uploadError, data } = await supabase.storage
          .from(bucket)
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from(bucket)
          .getPublicUrl(fileName);

        return publicUrl;
      });

      const newUrls = await Promise.all(uploadPromises);
      onMediaUploaded([...currentUrls, ...newUrls]);
      toast.success(t.uploadSuccess);
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(t.uploadError);
    } finally {
      setUploading(false);
    }
  };

  const removeMedia = (url: string) => {
    onMediaUploaded(currentUrls.filter(u => u !== url));
  };

  const handleAudioUploaded = (url: string) => {
    onMediaUploaded([...currentUrls, url]);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={uploading}
          className="relative"
        >
          <input
            type="file"
            accept="image/*"
            multiple
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={(e) => handleFileUpload(e, 'image')}
          />
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4 mr-2" />}
          {t.addImages}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={uploading}
          className="relative"
        >
          <input
            type="file"
            accept="video/*"
            multiple
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={(e) => handleFileUpload(e, 'video')}
          />
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Video className="h-4 w-4 mr-2" />}
          {t.addVideos}
        </Button>
        <AudioRecorder onAudioUploaded={handleAudioUploaded} />
      </div>

      {currentUrls.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {currentUrls.map((url, index) => (
            <div key={index} className="relative group">
              {url.includes('journal-images') ? (
                <img src={url} alt={`Upload ${index + 1}`} className="w-full h-24 object-cover rounded" />
              ) : url.includes('journal-videos') ? (
                <video src={url} controls className="w-full h-24 object-cover rounded" />
              ) : url.includes('voice-notes') ? (
                <audio src={url} controls className="w-full rounded" />
              ) : null}
              <button
                type="button"
                onClick={() => removeMedia(url)}
                className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
