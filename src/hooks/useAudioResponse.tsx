import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useAudioResponse = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [response, setResponse] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const { toast } = useToast();

  const processAudioResponse = async (text: string) => {
    try {
      setIsProcessing(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Error",
          description: "Please sign in to continue.",
          variant: "destructive",
        });
        return;
      }

      console.log('Calling process-audio function with text:', text);
      const result = await supabase.functions.invoke('process-audio', {
        body: { text }
      });

      console.log('Received response:', result);

      if (result.error) {
        console.error('Function error:', result.error);
        throw new Error(result.error.message || 'Error processing audio response');
      }

      if (!result.data) {
        throw new Error('No data received from function');
      }

      const { response: responseText, audioUrl } = result.data;

      if (!responseText || !audioUrl) {
        throw new Error('Invalid response format from function');
      }

      setResponse(responseText);

      // Validate the audio URL format
      if (!audioUrl.startsWith('data:audio/mpeg;base64,')) {
        throw new Error('Invalid audio data format');
      }

      // Create a Blob from the base64 audio data
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
      
      // Set up event handlers before playing
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

      // Load the audio before playing
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

    } catch (error) {
      console.error("Error processing response:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred while processing your request.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    isProcessing,
    isPlaying,
    response,
    processAudioResponse
  };
};