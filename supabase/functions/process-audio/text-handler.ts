import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { GoogleGenerativeAI } from "npm:@google/generative-ai";
import { greetingPatterns, greetingResponses, thankYouResponses } from "./ai-config.ts";
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts";
import { calculateTextComplexity } from "./text-complexity.ts";

// Enhanced cache key generation with better normalization
async function generateCacheKey(text: string): Promise<string> {
  const normalizedText = text.toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')  // Normalize whitespace
    .replace(/[.,!?;:]$/g, '') // Remove trailing punctuation
    .replace(/(?:the|a|an) /g, '')  // Remove articles
    .replace(/\b(?:is|are|was|were)\b/g, '');  // Remove common verbs
  
  const encoder = new TextEncoder();
  const data = encoder.encode(normalizedText);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Enhanced response formatting with smart punctuation handling
function formatResponseForSpeech(text: string): string {
  const numberWords = ['First', 'Second', 'Third', 'Fourth', 'Fifth', 'Sixth', 'Seventh', 'Eighth', 'Ninth', 'Tenth'];
  
  let formattedText = text
    // Convert numbered lists
    .replace(/(\d+\.\s)/g, (match, number) => {
      const num = parseInt(number);
      return num <= numberWords.length ? `${numberWords[num-1]}, ` : `${number}`;
    })
    // Improve natural pauses
    .replace(/[;:]|(?<=[.!?])\s+(?=[A-Z])/g, '... ')
    // Product name consistency
    .replace(/Bubble\.io/g, 'Bubble')
    // Smart quote handling
    .replace(/"([^"]+)"/g, '$1')
    // Remove multiple spaces
    .replace(/\s+/g, ' ')
    // Improve sentence breaks for speech
    .replace(/(?<=[.!?])\s+/g, '... ')
    .trim();

  return formattedText;
}

// Optimized quick response system with context awareness
function getQuickResponse(text: string): string | null {
  const lowerText = text.toLowerCase();
  
  // Enhanced greeting detection
  for (const pattern of greetingPatterns) {
    if (pattern.test(lowerText)) {
      return formatResponseForSpeech(
        greetingResponses[Math.floor(Math.random() * greetingResponses.length)]
      );
    }
  }
  
  // Enhanced gratitude detection with context awareness
  const gratitudeKeywords = ['thank', 'thanks', 'appreciate', 'grateful', 'helpful', 'great job', 'good job'];
  if (gratitudeKeywords.some(keyword => lowerText.includes(keyword))) {
    return formatResponseForSpeech(
      thankYouResponses[Math.floor(Math.random() * thankYouResponses.length)]
    );
  }
  
  return null;
}

export async function handleTextResponse(text: string) {
  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    throw new Error('Invalid or empty text input');
  }

  // Quick response check before any DB operations
  const quickResponse = getQuickResponse(text);
  if (quickResponse) {
    console.log('Quick response generated');
    return quickResponse;
  }

  // Initialize Supabase client
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Generate cache key
  const questionHash = await generateCacheKey(text);

  // Optimized cache check with better indexing
  const { data: cachedResponse } = await supabase
    .from('response_cache')
    .select('response, performance_metrics')
    .eq('question_hash', questionHash)
    .single();

  if (cachedResponse) {
    console.log('Cache hit in text handler', 
      cachedResponse.performance_metrics ? 
      `Previous response time: ${cachedResponse.performance_metrics.response_time}ms` : 
      'No performance metrics available'
    );
    return formatResponseForSpeech(cachedResponse.response);
  }

  try {
    let geminiKey = Deno.env.get('GEMINI_API_KEY');
    
    if (!geminiKey) {
      console.log('Fetching Gemini API key from database...');
      const { data: apiKeyData, error: apiKeyError } = await supabase
        .from('api_keys')
        .select('gemini_key')
        .limit(1);

      if (apiKeyError) throw new Error('Failed to fetch Gemini API key');
      if (apiKeyData?.[0]?.gemini_key) geminiKey = apiKeyData[0].gemini_key;
    }

    if (!geminiKey) throw new Error('Gemini API key not configured');

    // Fetch knowledge base in parallel with other operations
    const knowledgeBasePromise = supabase
      .from('knowledge_base')
      .select('content')
      .eq('active', true);

    const complexity = calculateTextComplexity(text);
    console.log('Text complexity score:', complexity);

    const genAI = new GoogleGenerativeAI(geminiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // Wait for knowledge base
    const { data: knowledgeBase, error: knowledgeError } = await knowledgeBasePromise;
    if (knowledgeError) throw new Error('Failed to fetch knowledge base');

    const knowledgeBaseContent = knowledgeBase?.map(k => k.content).join('\n\n') || '';
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

Primary Knowledge Base:
${knowledgeBaseContent}

Important Notes:
- Your knowledge is strictly limited to Bubble and its ecosystem
- If asked about unrelated topics, politely redirect to Bubble-related discussions
- Always refer to the platform simply as "Bubble"
- If unsure about something, be honest and stick to what you know
- Use natural transitions between ideas

User Question: ${text}`;

    console.log('Generating response with Gemini...');
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const responseText = response.text();

    if (!responseText) {
      throw new Error('Empty response from Gemini');
    }

    console.log('Successfully generated response');
    return formatResponseForSpeech(responseText);

  } catch (error) {
    console.error('Error generating response:', error);
    throw error;
  }
}
