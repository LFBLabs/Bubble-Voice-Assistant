import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { GoogleGenerativeAI } from "npm:@google/generative-ai";
import { greetingPatterns, greetingResponses, thankYouResponses, getGeminiPrompt } from "./ai-config.ts";

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

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const result = await model.generateContent([
    { text: getGeminiPrompt(knowledgeBaseContext) },
    { text }
  ]);

  if (!result || !result.response) {
    throw new Error('Failed to generate AI response');
  }

  const response = await result.response;
  const responseText = response.text().substring(0, 1000);
  console.log('Technical response generated, length:', responseText.length);
  
  return responseText;
}