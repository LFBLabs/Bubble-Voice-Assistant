
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export const useAudioPlayback = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const { toast } = useToast();

  const playAudio = async (audioUrl: string) => {
    console.log('Starting audio playback with format:', audioUrl.substring(0, 50) + '...');
    
    if (!audioUrl.startsWith('data:audio/mpeg;base64,')) {
      console.error('Invalid audio format:', audioUrl.substring(0, 50));
      throw new Error('Invalid audio data format');
    }

    try {
      // Optimize memory usage with streaming approach
      const base64Data = audioUrl.split(',')[1];
      const chunkSize = 1024 * 32; // 32KB chunks
      const chunks: Uint8Array[] = [];
      
      // Process audio in chunks to prevent memory spikes
      for (let i = 0; i < base64Data.length; i += chunkSize) {
        const chunk = base64Data.slice(i, Math.min(i + chunkSize, base64Data.length));
        const binaryChunk = atob(chunk);
        const uint8Chunk = new Uint8Array(binaryChunk.length);
        
        for (let j = 0; j < binaryChunk.length; j++) {
          uint8Chunk[j] = binaryChunk.charCodeAt(j);
        }
        
        chunks.push(uint8Chunk);
      }

      // Combine chunks efficiently
      const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
      const audioData = new Uint8Array(totalLength);
      let offset = 0;
      
      for (const chunk of chunks) {
        audioData.set(chunk, offset);
        offset += chunk.length;
      }
      
      const audioBlob = new Blob([audioData], { type: 'audio/mpeg' });
      const objectUrl = URL.createObjectURL(audioBlob);
      
      const audio = new Audio();
      audio.src = objectUrl;
      
      // Enhanced error handling
      audio.onerror = (e) => {
        console.error('Audio playback error:', e);
        URL.revokeObjectURL(objectUrl);
        toast({
          title: "Error",
          description: "Failed to play audio response. Please try again.",
          variant: "destructive",
        });
        setIsPlaying(false);
      };

      // Cleanup resources
      audio.onended = () => {
        console.log('Audio playback completed');
        URL.revokeObjectURL(objectUrl);
        setIsPlaying(false);
      };

      // Preload audio for smoother playback
      await audio.load();
      console.log('Audio loaded successfully');
      setIsPlaying(true);
      
      await audio.play();
      console.log('Audio playback started');
      
    } catch (error) {
      console.error('Audio processing error:', error);
      toast({
        title: "Error",
        description: "Failed to process audio. Please ensure audio is enabled in your browser.",
        variant: "destructive",
      });
      setIsPlaying(false);
      throw error;
    }
  };

  return {
    isPlaying,
    playAudio
  };
};
