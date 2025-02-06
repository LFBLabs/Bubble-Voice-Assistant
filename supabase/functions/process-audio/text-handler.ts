import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { GoogleGenerativeAI } from "npm:@google/generative-ai";
import { greetingPatterns, greetingResponses, thankYouResponses } from "./ai-config.ts";

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

  // Updated to use Gemini-2.0-flash model
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  // Updated system prompt to generate more conversational, speech-friendly responses
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
    // Clean up any remaining numbers or special characters
    .replace(/(\d+\.\s)/g, match => {
      const num = parseInt(match);
      const words = ['First', 'Second', 'Third', 'Fourth', 'Fifth', 'Sixth', 'Seventh', 'Eighth', 'Ninth', 'Tenth'];
      return num <= words.length ? `${words[num-1]}, ` : 'Next, ';
    })
    // Add natural pauses
    .replace(/\.\s+/g, '. ')
    // Clean up any remaining special characters
    .replace(/[*_#]/g, '')
    // Ensure clean spacing
    .replace(/\s+/g, ' ')
    .trim();

  console.log('Response generated with Gemini 2.0 Flash, length:', responseText.length);
  
  return responseText;
}