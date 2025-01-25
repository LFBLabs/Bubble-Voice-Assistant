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
  /^(thanks|thank you|thanks a lot|thank you so much|appreciated|great help)/i
];

const greetingResponses = [
  "Hey! I'm excited to chat about Bubble.io with you. What's on your mind?",
  "Hi there! I'd love to help you out with Bubble.io today. What can I explain?",
  "Hey! Always happy to talk about Bubble.io. What would you like to know?",
];

const thankYouResponses = [
  "You're welcome! Feel free to ask me anything else about Bubble.io.",
  "Glad I could help! Let me know if you have any other questions about Bubble.io.",
  "My pleasure! I'm here to help you learn more about Bubble.io whenever you need.",
];

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

    console.log('Processing text input:', text);
    let responseText: string;

    const isGreeting = greetingPatterns[0].test(text.trim());
    const isThankYou = greetingPatterns[1].test(text.trim());

    if (isThankYou) {
      responseText = thankYouResponses[Math.floor(Math.random() * thankYouResponses.length)];
      console.log('Thank you detected, sending quick response');
    } else if (isGreeting) {
      responseText = greetingResponses[Math.floor(Math.random() * greetingResponses.length)];
      console.log('Greeting detected, sending quick response');
    } else {
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

      const genAI = new GoogleGenerativeAI(Deno.env.get('GEMINI_API_KEY'));
      if (!genAI) {
        throw new Error('Failed to initialize Gemini AI');
      }

      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent([
        { 
          text: `You are a friendly and helpful voice assistant that explains Bubble.io concepts. Keep responses under 400 characters.
                Use a conversational, natural tone like you're chatting with a friend. Start responses with phrases like:
                - "Well, let me explain..."
                - "You know what? ..."
                - "Actually, ..."
                - "That's a great question! ..."
                Use contractions (I'm, you'll, that's) and casual language, but stay professional.
                Avoid technical jargon unless necessary.
                
                Here is some relevant documentation about Bubble.io to help inform your response:
                ${knowledgeBaseContext}
                
                Please use this knowledge to provide accurate, friendly information about Bubble.io.`
        },
        { text }
      ]);

      if (!result || !result.response) {
        throw new Error('Failed to generate AI response');
      }

      const response = await result.response;
      responseText = response.text().substring(0, 400);
      console.log('Technical response generated, length:', responseText.length);
    }

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

    console.log('Synthesizing speech with AWS Polly...');

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

    console.log('Successfully generated audio stream');

    const audioData = new Uint8Array(await speechResponse.AudioStream.transformToByteArray());
    const audioBase64 = btoa(String.fromCharCode(...audioData));
    const audioUrl = `data:audio/mpeg;base64,${audioBase64}`;

    console.log('Successfully converted audio to base64');

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