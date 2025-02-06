import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { GoogleGenerativeAI } from "npm:@google/generative-ai";
import { greetingPatterns, greetingResponses, thankYouResponses } from "./ai-config.ts";
import { createHash } from "https://deno.land/std@0.204.0/hash/mod.ts";

export async function handleTextResponse(text: string) {
  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    throw new Error('Invalid or empty text input');
  }

  console.log('Processing text input:', text);
  
  const isGreeting = greetingPatterns[0].test(text.trim());
  const isThankYou = greetingPatterns[1].test(text.trim());

  if (isThankYou) {
    console.log('Thank you detected, sending quick response');
    return thankYouResponses[Math.floor(Math.random() * thankYouResponses.length)];
  }
  
  if (isGreeting) {
    console.log('Greeting detected, sending quick response');
    return greetingResponses[Math.floor(Math.random() * greetingResponses.length)];
  }

  // Initialize Supabase client
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Generate a hash of the question for cache lookup
  const questionHash = createHash("sha256")
    .update(text.toLowerCase().trim())
    .toString();

  console.log('Checking cache for question hash:', questionHash);

  // Check cache first
  const { data: cachedResponse, error: cacheError } = await supabase
    .from('response_cache')
    .select('response, audio_url, usage_count')
    .eq('question_hash', questionHash)
    .single();

  if (cacheError && cacheError.code !== 'PGRST116') {
    console.error('Error checking cache:', cacheError);
  }

  if (cachedResponse) {
    console.log('Cache hit! Returning cached response');
    // Update usage count
    await supabase
      .from('response_cache')
      .update({ usage_count: (cachedResponse.usage_count || 0) + 1 })
      .eq('question_hash', questionHash);

    return cachedResponse.response;
  }

  console.log('Cache miss. Generating new response...');

  // Fetch relevant knowledge base entries
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

  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const systemPrompt = `You are a helpful voice assistant specializing in Bubble.io. Format your responses in a natural, conversational way that's suitable for text-to-speech:

- Speak naturally as if having a conversation
- Instead of numbered lists, use transitions like "First," "Next," "Then," "Finally"
- Avoid special characters, symbols, or formatting that wouldn't be spoken
- Use complete sentences and natural pauses
- Keep responses concise and clear
- When explaining steps, connect them with natural transitions
- Use contractions and informal language where appropriate

Context from our knowledge base:
${knowledgeBaseContext}`;

  console.log('Generating response with Gemini 2.0 Flash...');
  const result = await model.generateContent([
    { text: systemPrompt },
    { text: `Please answer this question about Bubble.io in a natural, conversational way: ${text}` }
  ]);

  if (!result || !result.response) {
    throw new Error('Failed to generate AI response');
  }

  const response = await result.response;
  const responseText = response.text()
    .substring(0, 1000)
    .replace(/(\d+\.\s)/g, match => {
      const num = parseInt(match);
      const words = ['First', 'Second', 'Third', 'Fourth', 'Fifth', 'Sixth', 'Seventh', 'Eighth', 'Ninth', 'Tenth'];
      return num <= words.length ? `${words[num-1]}, ` : 'Next, ';
    })
    .replace(/\.\s+/g, '. ')
    .replace(/[*_#]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  console.log('Response generated with Gemini 2.0 Flash, length:', responseText.length);
  
  return responseText;
}
