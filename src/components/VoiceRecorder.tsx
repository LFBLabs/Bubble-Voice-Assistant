import React from "react";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Waveform from "./Waveform";

interface VoiceRecorderProps {
  isRecording: boolean;
  isProcessing: boolean;
  toggleRecording: () => void;
  transcript: string;
  response: string;
}

const VoiceRecorder = ({
  isRecording,
  isProcessing,
  toggleRecording,
  transcript,
  response,
}: VoiceRecorderProps) => {
  return (
    <div className="flex flex-col items-center justify-center space-y-6">
      <div className="relative">
        <Button
          onClick={toggleRecording}
          className={`w-16 h-16 rounded-full ${
            isRecording ? "bg-red-500 hover:bg-red-600" : "bg-primary hover:bg-primary/90"
          }`}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : isRecording ? (
            <MicOff className="w-6 h-6" />
          ) : (
            <Mic className="w-6 h-6" />
          )}
        </Button>
        {isRecording && (
          <div className="absolute -inset-4">
            <div className="w-24 h-24 rounded-full bg-primary/20 animate-pulse" />
          </div>
        )}
      </div>

      {isRecording && <Waveform />}

      {transcript && (
        <div className="w-full bg-gray-50 rounded-lg p-4 mt-4">
          <h3 className="font-semibold mb-2">Your Question:</h3>
          <p className="text-gray-700">{transcript}</p>
        </div>
      )}

      {response && (
        <div className="w-full bg-purple-50 rounded-lg p-4 mt-4">
          <h3 className="font-semibold mb-2">Assistant Response:</h3>
          <p className="text-gray-700">{response}</p>
        </div>
      )}
    </div>
  );
};

export default VoiceRecorder;