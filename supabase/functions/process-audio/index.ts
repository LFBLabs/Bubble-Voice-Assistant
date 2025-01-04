import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { GoogleGenerativeAI } from "npm:@google/generative-ai";
import { Polly } from "npm:@aws-sdk/client-polly";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Common greetings patterns
const greetingPatterns = [
  /^(hi|hello|hey|good morning|good afternoon|good evening|howdy|sup|what'?s up|yo|hiya|greetings)/i,
];

// Quick greeting responses (under 50 chars)
const greetingResponses = [
  "Hi! How can I help you with Bubble.io today?",
  "Hello! Ready to help with Bubble.io!",
  "Hey there! Let's talk about Bubble.io!",
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text } = await req.json();
    let responseText: string;

    // Check if input is a greeting
    const isGreeting = greetingPatterns.some(pattern => pattern.test(text.trim()));

    if (isGreeting) {
      // Quickly return a random greeting response
      responseText = greetingResponses[Math.floor(Math.random() * greetingResponses.length)];
      console.log('Greeting detected, sending quick response');
    } else {
      // Process regular Bubble.io related question
      const genAI = new GoogleGenerativeAI(Deno.env.get('GEMINI_API_KEY'));
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const result = await model.generateContent([
        { text: "You are a helpful voice assistant that explains Bubble.io concepts. Keep responses clear and concise. Never use special characters or asterisks in your responses. Format text in a natural, conversational way." },
        { text }
      ]);
      const response = await result.response;
      responseText = response.text();
    }

    // Initialize AWS Polly
    const polly = new Polly({
      region: "us-east-1",
      credentials: {
        accessKeyId: Deno.env.get('AWS_ACCESS_KEY'),
        secretAccessKey: Deno.env.get('AWS_SECRET_KEY')
      }
    });

    // Convert text to speech using AWS Polly
    const speechResponse = await polly.synthesizeSpeech({
      Text: responseText,
      OutputFormat: "mp3",
      VoiceId: "Joanna"
    });

    const audioStream = speechResponse.AudioStream;
    if (!audioStream) {
      throw new Error('No audio stream returned');
    }

    // Convert audio stream to base64
    const audioArrayBuffer = await audioStream.arrayBuffer();
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