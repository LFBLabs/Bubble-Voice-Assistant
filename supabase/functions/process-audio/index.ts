import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { GoogleGenerativeAI } from "npm:@google/generative-ai";
import { Polly } from "npm:@aws-sdk/client-polly";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simplified greeting pattern
const greetingPattern = /^(hi|hello|hey)/i;

const greetingResponse = "Hi! I'm here to help you with Bubble.io. What would you like to know?";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text } = await req.json();
    
    if (!text?.trim()) {
      throw new Error('Invalid or empty text input');
    }

    let responseText: string;

    // Simple greeting check
    if (greetingPattern.test(text.trim())) {
      responseText = greetingResponse;
    } else {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      );

      const { data: entries } = await supabase
        .from('knowledge_base')
        .select('content')
        .limit(2);

      const context = entries
        ?.map(entry => entry.content || '')
        .join(' ')
        .slice(0, 200) || '';

      const genAI = new GoogleGenerativeAI(Deno.env.get('GEMINI_API_KEY')!);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      const prompt = `Question about Bubble.io: ${text}\nContext: ${context}\nProvide a brief, helpful response.`;
      const result = await model.generateContent(prompt);
      responseText = result.response?.text().slice(0, 200) || 'Sorry, I could not generate a response.';
    }

    const polly = new Polly({
      region: "us-east-1",
      credentials: {
        accessKeyId: Deno.env.get('AWS_ACCESS_KEY')!,
        secretAccessKey: Deno.env.get('AWS_SECRET_KEY')!
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
      throw new Error('Failed to generate audio');
    }

    const audioData = new Uint8Array(await speechResponse.AudioStream.transformToByteArray());
    const audioBase64 = btoa(String.fromCharCode(...audioData));
    const audioUrl = `data:audio/mpeg;base64,${audioBase64}`;

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
      JSON.stringify({ error: error.message }),
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