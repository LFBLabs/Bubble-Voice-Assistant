import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { handleTextResponse } from "./text-handler.ts";
import { synthesizeAudio } from "./audio-handler.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Process audio chunks in parallel
async function processAudioChunks(audioData: Uint8Array, chunkSize: number = 1024 * 1024) {
  const chunks: Uint8Array[] = [];
  for (let i = 0; i < audioData.length; i += chunkSize) {
    chunks.push(audioData.slice(i, i + chunkSize));
  }

  // Process chunks in parallel
  const processedChunks = await Promise.all(
    chunks.map(async (chunk) => {
      return new Uint8Array(chunk);
    })
  );

  // Combine processed chunks
  const totalLength = processedChunks.reduce((acc, chunk) => acc + chunk.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  
  for (const chunk of processedChunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }

  return result;
}

serve(async (req) => {
  // Performance monitoring
  const startTime = performance.now();
  console.log('Processing request started');

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Parsing request body');
    const { text } = await req.json();
    
    if (!text || typeof text !== 'string') {
      console.error('Invalid or missing text in request');
      throw new Error('Invalid or missing text in request');
    }

    // Initialize Supabase client for caching
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Generate question hash for caching
    const encoder = new TextEncoder();
    const data = encoder.encode(text.toLowerCase().trim());
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const questionHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // Check cache first
    console.log('Checking cache for:', questionHash);
    const { data: cachedResponse } = await supabase
      .from('response_cache')
      .select('response, audio_url')
      .eq('question_hash', questionHash)
      .single();

    if (cachedResponse) {
      console.log('Cache hit! Returning cached response');
      const endTime = performance.now();
      console.log(`Request processed in ${endTime - startTime}ms (cached)`);
      
      return new Response(
        JSON.stringify({ 
          response: cachedResponse.response,
          audioUrl: cachedResponse.audio_url,
          cached: true
        }),
        { 
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    console.log('Cache miss. Generating new response...');
    const responseText = await handleTextResponse(text);
    
    if (!responseText) {
      console.error('No response text generated');
      throw new Error('Failed to generate response text');
    }

    console.log('Synthesizing audio...');
    const audioUrl = await synthesizeAudio(responseText);
    
    if (!audioUrl) {
      console.error('No audio URL generated');
      throw new Error('Failed to generate audio');
    }

    // Store in cache using background task
    const cachePromise = supabase
      .from('response_cache')
      .insert({
        question_hash: questionHash,
        question: text,
        response: responseText,
        audio_url: audioUrl
      })
      .then(() => {
        console.log('Cache updated successfully');
      })
      .catch((error) => {
        console.error('Error updating cache:', error);
      });

    // Use waitUntil for background caching
    EdgeRuntime.waitUntil(cachePromise);

    const endTime = performance.now();
    console.log(`Request processed in ${endTime - startTime}ms`);

    return new Response(
      JSON.stringify({ 
        response: responseText,
        audioUrl,
        cached: false,
        processingTime: endTime - startTime
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
    const endTime = performance.now();
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'An unknown error occurred',
        details: error instanceof Error ? error.stack : undefined,
        processingTime: endTime - startTime
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