import React, { useState, useEffect } from "react";
import { Mic, MicOff, Loader2, Key } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import Waveform from "./Waveform";
import { initializeGemini, initializePolly, synthesizeSpeech } from "@/utils/aiServices";

const VoiceAssistant = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [response, setResponse] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const { toast } = useToast();

  // API Keys state
  const [geminiKey, setGeminiKey] = useState(() => localStorage.getItem("geminiKey") || "");
  const [awsAccessKey, setAwsAccessKey] = useState(() => localStorage.getItem("awsAccessKey") || "");
  const [awsSecretKey, setAwsSecretKey] = useState(() => localStorage.getItem("awsSecretKey") || "");

  const saveKeys = () => {
    localStorage.setItem("geminiKey", geminiKey);
    localStorage.setItem("awsAccessKey", awsAccessKey);
    localStorage.setItem("awsSecretKey", awsSecretKey);
    toast({
      title: "API Keys Saved",
      description: "Your API keys have been saved securely in local storage.",
    });
  };

  const processAudioResponse = async (text: string) => {
    try {
      if (!geminiKey || !awsAccessKey || !awsSecretKey) {
        toast({
          title: "Missing API Keys",
          description: "Please enter all required API keys.",
          variant: "destructive",
        });
        return;
      }

      const model = initializeGemini(geminiKey);
      const polly = initializePolly(awsAccessKey, awsSecretKey);

      // Generate response using Gemini
      const result = await model.generateContent(text);
      const response = await result.response;
      const responseText = response.text();
      setResponse(responseText);

      // Convert response to speech using Amazon Polly
      const audioUrl = await synthesizeSpeech(polly, responseText);
      const audio = new Audio(audioUrl);
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
    }
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      setTranscript("");
    } else {
      setIsProcessing(true);
      // Simulated transcript for now - replace with actual speech-to-text
      const sampleTranscript = "How do I create a new page in Bubble.io?";
      setTranscript(sampleTranscript);
      processAudioResponse(sampleTranscript).finally(() => {
        setIsProcessing(false);
      });
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
          <div className="grid gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-1">Gemini API Key</label>
              <Input
                type="password"
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                placeholder="Enter Gemini API Key"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">AWS Access Key</label>
              <Input
                type="password"
                value={awsAccessKey}
                onChange={(e) => setAwsAccessKey(e.target.value)}
                placeholder="Enter AWS Access Key"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">AWS Secret Key</label>
              <Input
                type="password"
                value={awsSecretKey}
                onChange={(e) => setAwsSecretKey(e.target.value)}
                placeholder="Enter AWS Secret Key"
              />
            </div>
            <Button onClick={saveKeys} className="w-full">
              <Key className="w-4 h-4 mr-2" />
              Save API Keys
            </Button>
          </div>

          <div className="flex flex-col items-center justify-center space-y-6">
            <div className="relative">
              <Button
                onClick={toggleRecording}
                className={`w-16 h-16 rounded-full ${
                  isRecording ? "bg-red-500 hover:bg-red-600" : "bg-primary hover:bg-primary/90"
                }`}
                disabled={isProcessing || !geminiKey || !awsAccessKey || !awsSecretKey}
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
        </div>

        <div className="text-center text-sm text-gray-500">
          <p>Tip: Click the microphone button to start asking your question about Bubble.io</p>
        </div>
      </div>
    </div>
  );
};

export default VoiceAssistant;