import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { GoogleGenerativeAI } from "npm:@google/generative-ai";
import { Polly } from "npm:@aws-sdk/client-polly";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const greetingPatterns = [
  /^(hi|hello|hey|good morning|good afternoon|good evening|howdy|sup|what'?s up|yo|hiya|greetings)/i,
];

const greetingResponses = [
  "Hey! I'm excited to chat about Bubble.io with you. What's on your mind?",
  "Hi there! I'd love to help you out with Bubble.io today. What can I explain?",
  "Hey! Always happy to talk about Bubble.io. What would you like to know?",
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData = await req.json();
    const { text } = requestData;
    
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      throw new Error('Invalid or empty text input');
    }

    let responseText: string;
    const isGreeting = greetingPatterns.some(pattern => pattern.test(text.trim()));

    if (isGreeting) {
      responseText = greetingResponses[Math.floor(Math.random() * greetingResponses.length)];
    } else {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      const { data: knowledgeBaseEntries, error: fetchError } = await supabase
        .from('knowledge_base')
        .select('title, content')
        .limit(3); // Further reduced limit

      if (fetchError) {
        console.error('Error fetching knowledge base:', fetchError);
        throw new Error('Failed to fetch knowledge base data');
      }

      const context = knowledgeBaseEntries
        .map(entry => `${entry.title}: ${entry.content || ''}`.slice(0, 200))
        .join('\n')
        .slice(0, 500); // Further reduced context length

      const genAI = new GoogleGenerativeAI(Deno.env.get('GEMINI_API_KEY'));
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      const prompt = `Answer this Bubble.io question concisely:\n${text}\n\nContext:\n${context}`;
      const result = await model.generateContent(prompt);
      
      if (!result?.response) {
        throw new Error('No response from AI model');
      }

      responseText = result.response.text().slice(0, 300); // Reduced max length
    }

    const polly = new Polly({
      region: "us-east-1",
      credentials: {
        accessKeyId: Deno.env.get('AWS_ACCESS_KEY'),
        secretAccessKey: Deno.env.get('AWS_SECRET_KEY')
      }
    });

    const speechResponse = await polly.synthesizeSpeech({
      Text: responseText,
      OutputFormat: "mp3",
      VoiceId: "Danielle",
      Engine: "neural",
      SampleRate: "24000"
    });

    if (!speechResponse.AudioStream) {
      throw new Error('No audio stream returned from AWS Polly');
    }

    const audioData = new Uint8Array(await speechResponse.AudioStream.transformToByteArray());
    const audioBase64 = btoa(String.fromCharCode(...audioData));
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
    console.error('Error in process-audio function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'An unknown error occurred'
      }),
      { 
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 500,
      }
    );
  }
});