import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { GoogleGenerativeAI } from "npm:@google/generative-ai";
import { Polly } from "npm:@aws-sdk/client-polly";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData = await req.json();
    const { text } = requestData;
    
    console.log('Received request with text:', text);

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      throw new Error('Invalid or empty text input');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch relevant knowledge base entries
    console.log('Fetching knowledge base entries...');
    const { data: knowledgeBaseEntries, error: fetchError } = await supabase
      .from('knowledge_base')
      .select('title, content, url, type')
      .limit(10);

    if (fetchError) {
      console.error('Error fetching knowledge base:', fetchError);
      throw new Error('Failed to fetch knowledge base data');
    }

    // Format knowledge base entries for context
    const knowledgeBaseContext = knowledgeBaseEntries
      .map(entry => `${entry.title}${entry.content ? ': ' + entry.content : ''} (${entry.url})`)
      .join('\n');

    // Initialize Gemini AI
    const genAI = new GoogleGenerativeAI(Deno.env.get('GEMINI_API_KEY'));
    if (!genAI) {
      throw new Error('Failed to initialize Gemini AI');
    }

    // Generate response with proper error handling
    console.log('Generating AI response...');
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `You are a helpful voice assistant that explains Bubble.io concepts. Keep responses under 400 characters. 
                   Be direct and concise. Focus on the most important information. Avoid unnecessary details. 
                   Never use special characters or asterisks.
                   
                   Here is some relevant documentation about Bubble.io to help inform your response:
                   ${knowledgeBaseContext}
                   
                   Please use this knowledge to provide accurate information about Bubble.io.
                   
                   User question: ${text}`;

    const result = await model.generateContent(prompt);
    if (!result || !result.response) {
      throw new Error('Failed to generate AI response');
    }

    const responseText = result.response.text().slice(0, 400);
    console.log('Generated response:', responseText);

    // Initialize AWS Polly
    console.log('Initializing AWS Polly...');
    const polly = new Polly({
      region: "us-east-1",
      credentials: {
        accessKeyId: Deno.env.get('AWS_ACCESS_KEY'),
        secretAccessKey: Deno.env.get('AWS_SECRET_KEY')
      }
    });

    if (!polly) {
      throw new Error('Failed to initialize AWS Polly');
    }

    // Generate speech
    console.log('Synthesizing speech...');
    const speechResponse = await polly.synthesizeSpeech({
      Text: responseText,
      OutputFormat: "mp3",
      VoiceId: "Danielle",
      Engine: "generative",
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