import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { GoogleGenerativeAI } from "npm:@google/generative-ai";

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
    const result = await model.generateContent([
      { text: "You are a helpful voice assistant that explains Bubble.io concepts. Keep responses clear and concise. Never use special characters or asterisks in your responses. Format text in a natural, conversational way." },
      { text }
    ]);
    const response = await result.response;
    const responseText = response.text();

    // Convert text to speech using ElevenLabs
    const voiceId = "21m00Tcm4TlvDq8ikWAM"; // Rachel voice - clear and professional female voice
    const elevenLabsResponse = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": Deno.env.get('ELEVEN_LABS_API_KEY') || '',
        },
        body: JSON.stringify({
          text: responseText,
          model_id: "eleven_monolingual_v1",
          voice_settings: {
            stability: 0.75,
            similarity_boost: 0.75,
            style: 0.5,
            use_speaker_boost: true
          }
        }),
      }
    );

    if (!elevenLabsResponse.ok) {
      throw new Error('Failed to generate speech');
    }

    const audioArrayBuffer = await elevenLabsResponse.arrayBuffer();
    const audioBase64 = btoa(String.fromCharCode(...new Uint8Array(audioArrayBuffer)));
    const audioUrl = `data:audio/mpeg;base64,${audioBase64}`;

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