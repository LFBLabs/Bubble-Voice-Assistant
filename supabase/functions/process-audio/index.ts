import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { GoogleGenerativeAI } from "npm:@google/generative-ai";
import { Polly } from "npm:@aws-sdk/client-polly";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const { text } = await req.json();
    
    if (!text?.trim()) {
      throw new Error('Invalid or empty text input');
    }

    // Initialize response text
    let responseText: string;

    // Simple greeting check with basic pattern
    if (/^(hi|hello|hey)\b/i.test(text.trim())) {
      responseText = "Hi! I'm here to help you with Bubble.io. What would you like to know?";
    } else {
      // Initialize Supabase client
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      // Fetch relevant knowledge base entries
      const { data: entries, error: dbError } = await supabase
        .from('knowledge_base')
        .select('content')
        .limit(3);

      if (dbError) {
        console.error('Database error:', dbError);
        throw new Error('Failed to fetch knowledge base entries');
      }

      // Process context with length limit
      const context = entries
        ?.map(entry => entry.content || '')
        .join(' ')
        .slice(0, 1000) || '';

      // Initialize Gemini
      const genAI = new GoogleGenerativeAI(Deno.env.get('GEMINI_API_KEY') ?? '');
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      try {
        // Generate response with context
        const prompt = `Question about Bubble.io: ${text}\nContext: ${context}\nProvide a clear, helpful response.`;
        const result = await model.generateContent(prompt);
        const response = result.response;
        
        if (!response) {
          throw new Error('Failed to generate AI response');
        }
        
        responseText = response.text();
        // Ensure we have a valid string and limit its length
        responseText = typeof responseText === 'string' ? responseText.slice(0, 800) : 'I apologize, but I could not generate a response.';
      } catch (aiError) {
        console.error('AI Generation error:', aiError);
        throw new Error('Failed to generate AI response');
      }
    }

    // Initialize Polly for text-to-speech
    const polly = new Polly({
      region: "us-east-1",
      credentials: {
        accessKeyId: Deno.env.get('AWS_ACCESS_KEY') ?? '',
        secretAccessKey: Deno.env.get('AWS_SECRET_KEY') ?? ''
      }
    });

    // Generate speech
    const speechResponse = await polly.synthesizeSpeech({
      Text: responseText,
      OutputFormat: "mp3",
      VoiceId: "Danielle",
      Engine: "neural",
      SampleRate: "24000"
    });

    if (!speechResponse.AudioStream) {
      throw new Error('Failed to generate audio');
    }

    // Convert audio to base64
    const audioData = new Uint8Array(await speechResponse.AudioStream.transformToByteArray());
    const audioBase64 = btoa(String.fromCharCode(...audioData));
    const audioUrl = `data:audio/mpeg;base64,${audioBase64}`;

    // Return response
    return new Response(
      JSON.stringify({ response: responseText, audioUrl }),
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
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
        details: error instanceof Error ? error.stack : undefined
      }),
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