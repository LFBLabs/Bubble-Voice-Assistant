import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAudioPlayback } from "./useAudioPlayback";

interface ProcessingMetrics {
  totalTime: number;
  cacheCheckTime?: number;
  responseGenerationTime?: number;
  audioSynthesisTime?: number;
  error?: boolean;
}

export const useAudioResponse = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [response, setResponse] = useState("");
  const [metrics, setMetrics] = useState<ProcessingMetrics | null>(null);
  const { isPlaying, playAudio } = useAudioPlayback();
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

      const { response: responseText, audioUrl, metrics: processingMetrics } = result.data;

      if (!responseText || !audioUrl) {
        throw new Error('Invalid response format from function');
      }

      setResponse(responseText);
      setMetrics(processingMetrics);

      // Log performance metrics
      if (processingMetrics) {
        console.log('Processing metrics:', {
          totalTime: `${processingMetrics.totalTime.toFixed(2)}ms`,
          cached: processingMetrics.cacheCheckTime ? 'Yes' : 'No',
          ...(processingMetrics.responseGenerationTime && {
            responseGeneration: `${processingMetrics.responseGenerationTime.toFixed(2)}ms`
          }),
          ...(processingMetrics.audioSynthesisTime && {
            audioSynthesis: `${processingMetrics.audioSynthesisTime.toFixed(2)}ms`
          })
        });
      }

      await playAudio(audioUrl);

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
    metrics,
    processAudioResponse
  };
};