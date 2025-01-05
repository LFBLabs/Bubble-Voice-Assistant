import { useState, useRef } from "react";
import { useToast } from "@/components/ui/use-toast";
import type { SpeechRecognitionEvent } from "@/types/speech-recognition";

export const useVoiceRecording = (onTranscriptComplete: (transcript: string) => void) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const { toast } = useToast();
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const recognition = useRef<any>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];

      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        toast({
          title: "Error",
          description: "Speech recognition is not supported in your browser.",
          variant: "destructive",
        });
        return;
      }

      recognition.current = new SpeechRecognition();
      recognition.current.continuous = true;
      recognition.current.interimResults = true;
      
      recognition.current.onresult = (event: SpeechRecognitionEvent) => {
        const currentTranscript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join('');
        setTranscript(currentTranscript);
      };

      recognition.current.onend = () => {
        if (isRecording && transcript) {
          onTranscriptComplete(transcript);
        }
      };

      mediaRecorder.current.ondataavailable = (event) => {
        audioChunks.current.push(event.data);
      };

      mediaRecorder.current.start();
      recognition.current.start();
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
      setIsRecording(false);
      
      if (recognition.current) {
        recognition.current.stop();
      }
      
      mediaRecorder.current.stop();
      const tracks = mediaRecorder.current.stream.getTracks();
      tracks.forEach(track => track.stop());
      
      if (transcript) {
        onTranscriptComplete(transcript);
      }
    }
  };

  const toggleRecording = () => {
    if (!isRecording) {
      startRecording();
    } else {
      stopRecording();
    }
  };

  return {
    isRecording,
    transcript,
    toggleRecording
  };
};