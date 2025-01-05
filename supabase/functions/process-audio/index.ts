import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { GoogleGenerativeAI } from "npm:@google/generative-ai";
import { 
  PollyClient, 
  SynthesizeSpeechCommand 
} from "npm:@aws-sdk/client-polly";
import { createClient } from "npm:@supabase/supabase-js@2";

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
    console.log('Received text:', text);

    // Check if it's a casual greeting
    const greetingPatterns = [
      /^(hi|hello|hey|good morning|good afternoon|good evening|howdy)/i,
      /^how are you/i,
      /^what('s)? up/i
    ];

    const isGreeting = greetingPatterns.some(pattern => pattern.test(text.trim()));

    let responseText;
    if (isGreeting) {
      // Handle casual conversation
      const genAI = new GoogleGenerativeAI(Deno.env.get('GEMINI_API_KEY'));
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      const casualPrompt = `You are a friendly AI assistant. Respond warmly but briefly (under 100 characters) to this greeting: "${text}"`;
      const result = await model.generateContent(casualPrompt);
      responseText = result.response.text().slice(0, 100);
    } else {
      // Handle Bubble.io related questions
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_ANON_KEY') ?? ''
      );

      const { data: knowledgeBaseEntries, error: fetchError } = await supabase
        .from('knowledge_base')
        .select('title, content, url, type')
        .limit(5);

      if (fetchError) {
        console.error('Error fetching knowledge base:', fetchError);
        throw new Error('Failed to fetch knowledge base data');
      }

      const context = knowledgeBaseEntries
        .map(entry => `${entry.title}: ${entry.content || ''}`).join(' ');

      const genAI = new GoogleGenerativeAI(Deno.env.get('GEMINI_API_KEY'));
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const technicalPrompt = `As a Bubble.io expert, provide a concise response (under 400 characters) to this question: ${text}. Context: ${context}`;
      const result = await model.generateContent(technicalPrompt);
      responseText = result.response.text().slice(0, 400);
    }

    console.log('Generated response:', responseText);

    // Convert to speech using AWS Polly
    const polly = new PollyClient({
      region: 'us-east-1',
      credentials: {
        accessKeyId: Deno.env.get('AWS_ACCESS_KEY'),
        secretAccessKey: Deno.env.get('AWS_SECRET_KEY')
      }
    });

    console.log('Synthesizing speech...');
    const command = new SynthesizeSpeechCommand({
      Text: responseText,
      OutputFormat: 'mp3',
      VoiceId: 'Joanna',
      Engine: 'neural'
    });

    const audioStream = await polly.send(command);
    
    // Convert AudioStream to Uint8Array
    const audioData = await new Response(audioStream.AudioStream).arrayBuffer();
    const uint8Array = new Uint8Array(audioData);
    
    // Convert to base64
    const base64Audio = btoa(String.fromCharCode(...uint8Array));
    const audioUrl = `data:audio/mp3;base64,${base64Audio}`;

    return new Response(
      JSON.stringify({ response: responseText, audioUrl }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in process-audio function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});