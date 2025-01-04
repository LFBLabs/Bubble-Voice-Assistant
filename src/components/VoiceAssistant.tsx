import React, { useState, useRef } from "react";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import AuthUI from "./AuthUI";
import Header from "./Header";
import VoiceContainer from "./VoiceContainer";
import NotesSection from "./NotesSection";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";

const VoiceAssistant = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [response, setResponse] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const { session, loading } = useSupabaseAuth();
  const { toast } = useToast();
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);

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

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];

      mediaRecorder.current.ondataavailable = (event) => {
        audioChunks.current.push(event.data);
      };

      mediaRecorder.current.onstop = async () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/wav' });
        
        // Create speech recognition instance with proper type checking
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
          toast({
            title: "Error",
            description: "Speech recognition is not supported in your browser.",
            variant: "destructive",
          });
          return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        
        recognition.onresult = (event: SpeechRecognitionEvent) => {
          const transcript = Array.from(event.results)
            .map(result => result[0].transcript)
            .join('');
          setTranscript(transcript);
          processAudioResponse(transcript);
        };
        
        recognition.start();
      };

      mediaRecorder.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error starting recording:", error);
      toast({
        title: "Error",
        description: "Could not access microphone. Please check your permissions.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop();
      mediaRecorder.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  const toggleRecording = () => {
    if (!isRecording) {
      startRecording();
    } else {
      stopRecording();
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