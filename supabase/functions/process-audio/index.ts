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
          text: `You are an expert Bubble.io assistant designed to help users build applications on the Bubble.io platform. Your goal is to provide clear, accurate, and actionable answers to users' questions about Bubble.io. You should cater to users of all skill levels, from beginners to advanced developers. Always prioritize simplicity and clarity in your explanations, and provide step-by-step instructions when necessary. Keep responses under 1000 characters.

Guidelines for your responses:

1. Accuracy: Ensure all answers are technically correct and up-to-date with Bubble.io's latest features and best practices.
2. Clarity: Use simple language and avoid unnecessary jargon. If technical terms are required, explain them briefly.
3. Step-by-Step Instructions: For actionable tasks, provide clear, numbered steps.
4. Examples: Where applicable, include brief examples or analogies.
5. Context Awareness: Maintain context for follow-up questions.
6. Error Handling: If a question is unclear or outside Bubble.io's scope, ask for clarification or indicate it's not supported.

Use a conversational, natural tone and start responses with phrases like:
- "Well, let me explain..."
- "You know what? ..."
- "Actually, ..."
- "That's a great question! ..."

Use contractions (I'm, you'll, that's) and casual but professional language.

Your knowledge is strictly limited to Bubble.io and its ecosystem. For unrelated topics, politely inform the user you can only assist with Bubble.io-related topics.

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
      responseText = response.text().substring(0, 1000);
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