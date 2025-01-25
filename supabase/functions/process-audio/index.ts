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
    let responseText = '';

    // Simple greeting check with basic pattern
    if (/^(hi|hello|hey)\b/i.test(text.trim())) {
      responseText = "Hi! I'm here to help you with Bubble.io. What would you like to know?";
    } else {
      // Initialize Supabase client
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      console.log('Fetching knowledge base entries...');
      
      // Fetch relevant knowledge base entries with a strict limit
      const { data: entries, error: dbError } = await supabase
        .from('knowledge_base')
        .select('content')
        .limit(2); // Reduced limit to prevent large context

      if (dbError) {
        console.error('Database error:', dbError);
        throw new Error('Failed to fetch knowledge base entries');
      }

      console.log('Knowledge base entries fetched:', entries?.length);

      // Process context with strict length limits
      const context = entries
        ?.map(entry => entry.content?.substring(0, 500) || '') // Limit each entry
        .join('\n')
        .substring(0, 1000); // Overall context limit

      // Initialize Gemini
      const genAI = new GoogleGenerativeAI(Deno.env.get('GEMINI_API_KEY') ?? '');
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      console.log('Generating AI response...');

      try {
        // Generate response with a more focused prompt
        const prompt = `As a Bubble.io expert, provide a clear and concise response (max 200 words) to this question: ${text}

Context (if relevant):
${context}`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        
        if (!response) {
          throw new Error('Empty response from AI');
        }

        responseText = response.text();
        if (typeof responseText !== 'string' || !responseText) {
          throw new Error('Invalid response format from AI');
        }

        // Strictly limit response length
        responseText = responseText.substring(0, 500);
        console.log('Successfully generated response:', responseText);
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

    console.log('Generating speech...');

    // Generate speech with strict limits
    const speechResponse = await polly.synthesizeSpeech({
      Text: responseText.substring(0, 500), // Ensure text length is limited
      OutputFormat: "mp3",
      VoiceId: "Danielle",
      Engine: "neural",
      SampleRate: "24000"
    });

    if (!speechResponse.AudioStream) {
      throw new Error('Failed to generate audio');
    }

    // Convert audio to base64 efficiently
    const audioData = new Uint8Array(await speechResponse.AudioStream.transformToByteArray());
    const audioBase64 = btoa(String.fromCharCode(...audioData));
    const audioUrl = `data:audio/mpeg;base64,${audioBase64}`;

    console.log('Successfully processed request');

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
        error: error instanceof Error ? error.message : 'An unexpected error occurred'
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