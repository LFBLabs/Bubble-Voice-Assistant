import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { GoogleGenerativeAI } from "npm:@google/generative-ai";
import { greetingPatterns, greetingResponses, thankYouResponses } from "./ai-config.ts";
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts";
import { calculateTextComplexity } from "./text-complexity.ts";

function formatResponseForSpeech(text: string): string {
  return text
    // Replace numbered lists with natural language
    .replace(/(\d+\.\s)/g, (match, number) => {
      const words = ['First', 'Second', 'Third', 'Fourth', 'Fifth', 'Sixth', 'Seventh', 'Eighth', 'Ninth', 'Tenth'];
      const num = parseInt(number);
      return num <= words.length ? `${words[num-1]}, ` : `${number}`;
    })
    // Add natural pauses for complex sentences, but not for greetings
    .replace(/[;:]|(?<=[.!?])\s+(?=[A-Z])/g, '... ')
    // Replace Bubble.io with just Bubble
    .replace(/Bubble\.io/g, 'Bubble')
    // Clean up multiple spaces
    .replace(/\s+/g, ' ')
    .trim();
}

export async function handleTextResponse(text: string) {
  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    throw new Error('Invalid or empty text input');
  }

  // Initialize Supabase client
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Generate hash for caching
  const encoder = new TextEncoder();
  const data = encoder.encode(text.toLowerCase().trim());
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const questionHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  // Check cache
  const { data: cachedResponse } = await supabase
    .from('response_cache')
    .select('response')
    .eq('question_hash', questionHash)
    .single();

  if (cachedResponse) {
    console.log('Cache hit in text handler');
    return formatResponseForSpeech(cachedResponse.response);
  }

  // Process greetings
  const lowerText = text.toLowerCase();
  for (const pattern of greetingPatterns) {
    if (pattern.test(lowerText)) {
      const randomResponse = greetingResponses[Math.floor(Math.random() * greetingResponses.length)];
      return formatResponseForSpeech(randomResponse);
    }
  }

  // Process thank you messages
  if (lowerText.includes('thank you') || lowerText.includes('thanks')) {
    const randomResponse = thankYouResponses[Math.floor(Math.random() * thankYouResponses.length)];
    return formatResponseForSpeech(randomResponse);
  }

  try {
    let geminiKey = Deno.env.get('GEMINI_API_KEY');
    
    if (!geminiKey) {
      console.log('Gemini API key not found in environment variables, checking database...');
      const { data: apiKeyData, error: apiKeyError } = await supabase
        .from('api_keys')
        .select('gemini_key')
        .limit(1);

      if (apiKeyError) {
        console.error('Error fetching Gemini API key from database:', apiKeyError);
        throw new Error('Failed to fetch Gemini API key');
      }

      if (apiKeyData && apiKeyData.length > 0 && apiKeyData[0].gemini_key) {
        geminiKey = apiKeyData[0].gemini_key;
      }
    }

    if (!geminiKey) {
      console.error('No Gemini API key available in environment or database');
      throw new Error('Gemini API key not configured');
    }

    const { data: knowledgeBase, error: knowledgeError } = await supabase
      .from('knowledge_base')
      .select('content')
      .eq('active', true);

    if (knowledgeError) {
      console.error('Error fetching knowledge base:', knowledgeError);
      throw new Error('Failed to fetch knowledge base');
    }

    const knowledgeBaseContent = knowledgeBase?.map(k => k.content).join('\n\n') || '';

    const complexity = calculateTextComplexity(text);
    console.log('Text complexity score:', complexity);

    console.log('Initializing Gemini AI...');
    const genAI = new GoogleGenerativeAI(geminiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    console.log('Selected model: gemini-pro');
    
    const maxWords = complexity >= 3 ? 300 : 150;

    const prompt = `You are a friendly, conversational AI assistant focused on providing detailed information about Bubble. Speak naturally as if you're having a casual conversation, while maintaining professionalism.

Primary Knowledge Base (USE THIS AS YOUR PRIMARY SOURCE):
${knowledgeBaseContent}

Guidelines for your responses:
1. Use conversational language and avoid sounding scripted
2. Instead of numbered lists, use words like "First," "Next," "Then," "Finally"
3. Write numbers as words (e.g., "three" instead of "3")
4. Focus exclusively on Bubble topics
5. Explain concepts clearly without being too technical
6. Keep responses under ${maxWords} words while being thorough
7. Use natural transitions between ideas
8. If unsure about something, be honest and stick to what you know
9. Always refer to the platform simply as "Bubble"

Format your response in a conversational way, as if you're speaking to a friend who's learning about Bubble.

User Question: ${text}`;

    console.log('Sending prompt to Gemini...');
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const responseText = response.text();

    if (!responseText) {
      throw new Error('Empty response from Gemini');
    }

    console.log('Successfully generated response from Gemini');
    return formatResponseForSpeech(responseText);

  } catch (error) {
    console.error('Error generating response with Gemini:', error);
    throw error;
  }
}
