import React, { useEffect } from "react";
import { Loader2 } from "lucide-react";
import AuthUI from "./AuthUI";
import Header from "./Header";
import VoiceContainer from "./VoiceContainer";
import NotesSection from "./NotesSection";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { useVoiceRecording } from "@/hooks/useVoiceRecording";
import { useAudioResponse } from "@/hooks/useAudioResponse";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const VoiceAssistant = () => {
  const { session, loading } = useSupabaseAuth();
  const { isProcessing, response, processAudioResponse } = useAudioResponse();
  const { isRecording, transcript, toggleRecording } = useVoiceRecording(processAudioResponse);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (session?.user?.user_metadata?.should_change_password) {
      toast({
        title: "Security Notice",
        description: "Please change your password for security purposes.",
        action: (
          <button
            onClick={() => navigate("/settings")}
            className="bg-primary text-white px-3 py-1 rounded-md text-sm"
          >
            Change Password
          </button>
        ),
      });
    }
  }, [session, navigate, toast]);

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
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-6 flex flex-col min-h-screen">
        <Header 
          title="Bubble.io Voice Assistant"
          description="Ask questions about Bubble.io and get instant voice responses"
        />

        <div className="flex-1 flex flex-col gap-6">
          <VoiceContainer
            isRecording={isRecording}
            isProcessing={isProcessing}
            toggleRecording={toggleRecording}
            transcript={transcript}
            response={response}
          />

          <NotesSection />
        </div>

        <div className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4 mb-2">
          <p className="px-4">Tip: Click the microphone button to start asking your question about Bubble.io</p>
        </div>
      </div>
    </div>
  );
};

export default VoiceAssistant;