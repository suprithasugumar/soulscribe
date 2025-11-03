import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Square, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface AudioRecorderProps {
  onAudioUploaded: (url: string) => void;
}

export const AudioRecorder = ({ onAudioUploaded }: AudioRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
        await uploadAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      toast.success("Recording started");
    } catch (error) {
      toast.error("Could not access microphone");
      console.error(error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const uploadAudio = async (audioBlob: Blob) => {
    setIsUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const fileName = `${user.id}/${Date.now()}.webm`;
      
      const { error: uploadError } = await supabase.storage
        .from("voice-notes")
        .upload(fileName, audioBlob);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("voice-notes")
        .getPublicUrl(fileName);

      onAudioUploaded(publicUrl);
      toast.success("Voice note recorded!");
    } catch (error: any) {
      toast.error("Failed to save voice note");
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex gap-2">
      {!isRecording && !isUploading && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={startRecording}
          className="transition-all hover:scale-105"
        >
          <Mic className="h-4 w-4 mr-2" />
          Record Voice
        </Button>
      )}
      {isRecording && (
        <Button
          type="button"
          variant="destructive"
          size="sm"
          onClick={stopRecording}
          className="animate-pulse"
        >
          <Square className="h-4 w-4 mr-2" />
          Stop Recording
        </Button>
      )}
      {isUploading && (
        <Button type="button" variant="outline" size="sm" disabled>
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          Uploading...
        </Button>
      )}
    </div>
  );
};
