import React, { useEffect } from "react";
import { Loader2 } from "lucide-react";
import AuthUI from "./AuthUI";
import Header from "./Header";
import VoiceContainer from "./VoiceContainer";
import NotesSection from "./NotesSection";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { useVoiceRecording } from "@/hooks/useVoiceRecording";
import { useAudioResponse } from "@/hooks/useAudioResponse";

const VoiceAssistant = () => {
  const { session, loading } = useSupabaseAuth();
  const { isProcessing, response, processAudioResponse } = useAudioResponse();
  const { isRecording, transcript, toggleRecording } = useVoiceRecording(processAudioResponse);

  // Cleanup function
  useEffect(() => {
    return () => {
      // Any cleanup code if needed
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center dark:bg-gray-900">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!session) {
    return <AuthUI />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white dark:from-gray-900 dark:to-gray-800 p-6">
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

        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
          <p>Tip: Click the microphone button to start asking your question about Bubble.io</p>
        </div>
      </div>
    </div>
  );
};

export default VoiceAssistant;
