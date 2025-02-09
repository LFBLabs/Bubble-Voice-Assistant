
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { GoogleGenerativeAI } from "npm:@google/generative-ai";
import { calculateTextComplexity } from "./text-complexity.ts";
import { formatResponseForSpeech } from "./text-formatting.ts";
import { getQuickResponse } from "./quick-responses.ts";
import { generateCacheKey } from "./cache-utils.ts";

export async function handleTextResponse(text: string) {
  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    throw new Error('Invalid or empty text input');
  }

  const quickResponse = getQuickResponse(text);
  if (quickResponse) {
    console.log('Quick response generated');
    return quickResponse;
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  const questionHash = await generateCacheKey(text);

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

    const knowledgeBasePromise = supabase
      .from('knowledge_base')
      .select('content')
      .eq('active', true);

    const complexity = calculateTextComplexity(text);
    console.log('Text complexity score:', complexity);

    const genAI = new GoogleGenerativeAI(geminiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const { data: knowledgeBase, error: knowledgeError } = await knowledgeBasePromise;
    if (knowledgeError) throw new Error('Failed to fetch knowledge base');

    const knowledgeBaseContent = knowledgeBase?.map(k => k.content).join('\n\n') || '';
    const maxWords = complexity >= 3 ? 300 : 150;

    const prompt = `You are a friendly, conversational AI assistant focused on providing detailed information about Bubble. Your goal is to help users understand and succeed with Bubble while following these guidelines:

1. Response Start Format:
   For questions about processes, tutorials, or how-to's:
   - Start with "That's a great question!" or "Absolutely!" or "Of course!"
   
   For technical explanations or concept clarifications:
   - Start with "Let me explain..." or "The key point here is..." or "To clarify..."
   
   For agreeing or emphasizing:
   - Start with "Exactly!" or "Indeed!" or "You're spot on!"
   
   When offering a different perspective:
   - Start with "I understand your perspective, but..." or "While that's true, it's worth considering..."

2. Communication Guidelines:
   - Accuracy: Always provide technically correct and up-to-date information about Bubble's features and best practices
   - Clarity: Use simple language and explain technical terms
   - Natural Flow: Avoid bullet points or numbered lists in speech
   - Conversational: Use contractions (I'm, you'll, that's)
   - Keep responses under ${maxWords} words while being thorough
   - Use natural transitions between ideas
   - Avoid phrases like "You know what?" or "Actually"

Primary Knowledge Base:
${knowledgeBaseContent}

Important Notes:
- Your knowledge is strictly limited to Bubble and its ecosystem
- If asked about unrelated topics, politely redirect to Bubble-related discussions
- Always refer to the platform simply as "Bubble"
- If unsure about something, be honest and stick to what you know

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
