import React, { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import ApiKeysForm from "./ApiKeysForm";
import VoiceRecorder from "./VoiceRecorder";
import { initializeGemini, synthesizeSpeech } from "@/utils/aiServices";
import { supabase } from "@/integrations/supabase/client";

const VoiceAssistant = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [response, setResponse] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // API Keys state
  const [geminiKey, setGeminiKey] = useState("");
  const [awsAccessKey, setAwsAccessKey] = useState("");
  const [awsSecretKey, setAwsSecretKey] = useState("");

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        loadApiKeys();
      }
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        loadApiKeys();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadApiKeys = async () => {
    try {
      const { data, error } = await supabase
        .from('api_keys')
        .select('*')
        .maybeSingle();

      if (error) {
        console.error('Error loading API keys:', error);
        toast({
          title: "Error",
          description: "Failed to load API keys",
          variant: "destructive",
        });
        return;
      }

      if (data) {
        setGeminiKey(data.gemini_key || '');
        setAwsAccessKey(data.aws_access_key || '');
        setAwsSecretKey(data.aws_secret_key || '');
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to load API keys",
        variant: "destructive",
      });
    }
  };

  const processAudioResponse = async (text: string) => {
    try {
      if (!geminiKey) {
        toast({
          title: "Missing API Key",
          description: "Please enter your Gemini API key.",
          variant: "destructive",
        });
        return;
      }

      const model = initializeGemini(geminiKey);

      // Generate response using Gemini
      const result = await model.generateContent(text);
      const response = await result.response;
      const responseText = response.text();
      setResponse(responseText);

      // Convert response to speech using Edge Function
      const audioUrl = await synthesizeSpeech(responseText);
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white p-6">
        <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-2xl font-bold text-center mb-6">Welcome to Bubble.io Voice Assistant</h1>
          <Auth
            supabaseClient={supabase}
            appearance={{ theme: ThemeSupa }}
            theme="light"
            providers={['google']}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white p-6">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-12">
          <div className="flex justify-end mb-4">
            <Button
              variant="outline"
              onClick={() => supabase.auth.signOut()}
              className="text-sm"
            >
              Sign Out
            </Button>
          </div>
          <h1 className="text-4xl font-bold text-primary mb-4">Bubble.io Voice Assistant</h1>
          <p className="text-gray-600">Ask questions about Bubble.io and get instant voice responses</p>
        </header>

        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <ApiKeysForm
            geminiKey={geminiKey}
            setGeminiKey={setGeminiKey}
            awsAccessKey={awsAccessKey}
            setAwsAccessKey={setAwsAccessKey}
            awsSecretKey={awsSecretKey}
            setAwsSecretKey={setAwsSecretKey}
            session={session}
          />

          <VoiceRecorder
            isRecording={isRecording}
            isProcessing={isProcessing}
            toggleRecording={toggleRecording}
            disabled={!geminiKey || !awsAccessKey || !awsSecretKey}
            transcript={transcript}
            response={response}
          />
        </div>

        <div className="text-center text-sm text-gray-500">
          <p>Tip: Click the microphone button to start asking your question about Bubble.io</p>
        </div>
      </div>
    </div>
  );
};

export default VoiceAssistant;
