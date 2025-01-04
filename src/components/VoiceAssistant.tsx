import React, { useState } from "react";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Waveform from "./Waveform";

const VoiceAssistant = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [response, setResponse] = useState("");

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      // Start recording logic would go here
      setTranscript("");
    } else {
      // Stop recording and process logic would go here
      setIsProcessing(true);
      setTimeout(() => {
        setIsProcessing(false);
        setResponse("This is a sample response about Bubble.io. In a real implementation, this would come from the LLM.");
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white p-6">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-primary mb-4">Bubble.io Voice Assistant</h1>
          <p className="text-gray-600">Ask questions about Bubble.io and get instant voice responses</p>
        </header>

        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
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
                  <div className="w-24 h-24 rounded-full bg-primary/20 animate-pulse-ring" />
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
        </div>

        <div className="text-center text-sm text-gray-500">
          <p>Tip: Click the microphone button to start asking your question about Bubble.io</p>
        </div>
      </div>
    </div>
  );
};

export default VoiceAssistant;