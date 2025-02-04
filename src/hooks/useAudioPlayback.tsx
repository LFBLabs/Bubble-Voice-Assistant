import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export const useAudioPlayback = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const { toast } = useToast();

  const playAudio = async (audioUrl: string) => {
    if (!audioUrl.startsWith('data:audio/mpeg;base64,')) {
      throw new Error('Invalid audio data format');
    }

    const base64Data = audioUrl.split(',')[1];
    const binaryData = atob(base64Data);
    const arrayBuffer = new ArrayBuffer(binaryData.length);
    const uint8Array = new Uint8Array(arrayBuffer);
    
    for (let i = 0; i < binaryData.length; i++) {
      uint8Array[i] = binaryData.charCodeAt(i);
    }
    
    const audioBlob = new Blob([uint8Array], { type: 'audio/mpeg' });
    const objectUrl = URL.createObjectURL(audioBlob);
    
    const audio = new Audio();
    audio.src = objectUrl;
    
    audio.onerror = (e) => {
      console.error('Audio playback error:', e);
      URL.revokeObjectURL(objectUrl);
      toast({
        title: "Error",
        description: "Failed to play audio response.",
        variant: "destructive",
      });
      setIsPlaying(false);
    };

    audio.onended = () => {
      URL.revokeObjectURL(objectUrl);
      setIsPlaying(false);
    };

    await audio.load();
    setIsPlaying(true);
    
    try {
      await audio.play();
    } catch (playError) {
      console.error('Audio play error:', playError);
      URL.revokeObjectURL(objectUrl);
      toast({
        title: "Error",
        description: "Failed to start audio playback. Please ensure audio is enabled in your browser.",
        variant: "destructive",
      });
      setIsPlaying(false);
    }
  };

  return {
    isPlaying,
    playAudio
  };
};