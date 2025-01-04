import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { GoogleGenerativeAI } from "npm:@google/generative-ai";
import { Polly } from "npm:@aws-sdk/client-polly";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text } = await req.json();

    // Initialize Gemini with API key from secrets
    const genAI = new GoogleGenerativeAI(Deno.env.get('GEMINI_API_KEY'));
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    // Generate response using Gemini
    const result = await model.generateContent(text);
    const response = await result.response;
    const responseText = response.text();

    // Initialize AWS Polly
    const polly = new Polly({
      region: "us-east-1",
      credentials: {
        accessKeyId: Deno.env.get('AWS_ACCESS_KEY'),
        secretAccessKey: Deno.env.get('AWS_SECRET_KEY')
      }
    });

    // Convert text to speech
    const speechResponse = await polly.synthesizeSpeech({
      Text: responseText,
      OutputFormat: "mp3",
      VoiceId: "Joanna"
    });

    const audioStream = speechResponse.AudioStream;
    if (!audioStream) {
      throw new Error('No audio stream returned');
    }

    // Create a blob URL from the audio stream
    const audioBlob = new Blob([audioStream], { type: 'audio/mpeg' });
    const audioUrl = URL.createObjectURL(audioBlob);

    return new Response(
      JSON.stringify({ 
        response: responseText,
        audioUrl
      }),
      { 
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 400,
      }
    );
  }
});