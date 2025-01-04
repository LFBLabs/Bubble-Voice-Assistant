import React, { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import AuthUI from "./AuthUI";
import Header from "./Header";
import VoiceContainer from "./VoiceContainer";
import NotesSection from "./NotesSection";

const VoiceAssistant = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [response, setResponse] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const processAudioResponse = async (text: string) => {
    try {
      setIsProcessing(true);
      const result = await supabase.functions.invoke('process-audio', {
        body: { text }
      });

      if (result.error) {
        throw new Error(result.error.message);
      }

      const responseText = result.data.response;
      setResponse(responseText);

      // Play audio response
      const audio = new Audio(result.data.audioUrl);
      setIsPlaying(true);
      audio.play();
      audio.onended = () => setIsPlaying(false);
    } catch (error) {
      console.error("Error processing response:", error);
      toast({
        title: "Error",
        description: "An error occurred while processing your request.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      setTranscript("");
    } else {
      // Simulated transcript for now - replace with actual speech-to-text
      const sampleTranscript = "How do I create a new page in Bubble.io?";
      setTranscript(sampleTranscript);
      processAudioResponse(sampleTranscript);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  if (!session) {
    return <AuthUI />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white p-6">
      <div className="max-w-4xl mx-auto">
        <Header 
          title="Bubble.io Voice Assistant"
          description="Ask questions about Bubble.io and get instant voice responses"
        />

        <VoiceContainer
          isRecording={isRecording}
          isProcessing={isProcessing}
          toggleRecording={toggleRecording}
          transcript={transcript}
          response={response}
        />

        <NotesSection />

        <div className="text-center text-sm text-gray-500">
          <p>Tip: Click the microphone button to start asking your question about Bubble.io</p>
        </div>
      </div>
    </div>
  );
};

export default VoiceAssistant;