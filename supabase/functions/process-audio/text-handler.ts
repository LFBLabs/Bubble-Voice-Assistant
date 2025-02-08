
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
  if (lowerText.includes('thank') || 
      lowerText.includes('thanks') || 
      lowerText.includes('appreciate') || 
      lowerText.includes('helpful') ||
      lowerText.includes('great job')) {
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

    const prompt = `You are a friendly, conversational AI assistant focused on providing detailed information about Bubble. Your goal is to help users understand and succeed with Bubble while following these guidelines:

1. Accuracy: Always provide technically correct and up-to-date information about Bubble's features and best practices.
2. Clarity: Use simple language and explain any technical terms briefly.
3. Step-by-Step Instructions: For actionable tasks, provide clear, numbered steps using words like "First," "Next," "Then," etc.
4. Examples: Include brief, relevant examples when explaining concepts.
5. Context Awareness: Remember context from the conversation for follow-up questions.
6. Error Handling: If a question is unclear or outside Bubble's scope, ask for clarification or explain that you can only help with Bubble-related topics.

Communication Style:
- Use a conversational, natural tone
- Use contractions (I'm, you'll, that's)
- Keep responses under ${maxWords} words while being thorough
- Always start responses with one of these phrases:
  - "Well, let me explain..."
  - "You know what? ..."
  - "Actually, ..."
  - "That's a great question! ..."

Primary Knowledge Base (USE THIS AS YOUR PRIMARY SOURCE):
${knowledgeBaseContent}

Important Notes:
- Your knowledge is strictly limited to Bubble and its ecosystem
- If asked about unrelated topics, politely redirect to Bubble-related discussions
- Always refer to the platform simply as "Bubble"
- If unsure about something, be honest and stick to what you know
- Use natural transitions between ideas

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

