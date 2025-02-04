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

      const audio = new Audio(audioUrl);
      setIsPlaying(true);
      
      audio.onerror = (e) => {
        console.error('Audio playback error:', e);
        toast({
          title: "Error",
          description: "Failed to play audio response.",
          variant: "destructive",
        });
        setIsPlaying(false);
      };

      audio.play();
      audio.onended = () => setIsPlaying(false);

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