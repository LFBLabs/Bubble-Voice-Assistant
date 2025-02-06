import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { handleTextResponse } from "./text-handler.ts";
import { synthesizeAudio } from "./audio-handler.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Process audio chunks in parallel with adaptive chunk sizing
async function processAudioChunks(audioData: Uint8Array, textComplexity: number = 1) {
  const baseChunkSize = 1024 * 1024; // 1MB base size
  const adaptiveChunkSize = Math.floor(baseChunkSize / textComplexity);
  const chunks: Uint8Array[] = [];
  
  for (let i = 0; i < audioData.length; i += adaptiveChunkSize) {
    chunks.push(audioData.slice(i, i + adaptiveChunkSize));
  }

  // Process chunks in parallel with connection pooling
  const processedChunks = await Promise.all(
    chunks.map(async (chunk, index) => {
      console.log(`Processing chunk ${index + 1}/${chunks.length}`);
      return new Uint8Array(chunk);
    })
  );

  // Combine processed chunks efficiently
  const totalLength = processedChunks.reduce((acc, chunk) => acc + chunk.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  
  for (const chunk of processedChunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }

  return result;
}

// Calculate text complexity for adaptive processing
function calculateTextComplexity(text: string): number {
  const wordCount = text.split(/\s+/).length;
  const avgWordLength = text.length / wordCount;
  return Math.max(1, Math.min(4, avgWordLength / 5)); // Normalize between 1-4
}

serve(async (req) => {
  // Performance monitoring
  const startTime = performance.now();
  const metrics: Record<string, number> = {};
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

    // Initialize Supabase client with connection pooling
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Generate question hash for caching
    const encoder = new TextEncoder();
    const data = encoder.encode(text.toLowerCase().trim());
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const questionHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // Check cache with performance tracking
    const cacheCheckStart = performance.now();
    console.log('Checking cache for:', questionHash);
    const { data: cachedResponse } = await supabase
      .from('response_cache')
      .select('response, audio_url')
      .eq('question_hash', questionHash)
      .single();

    metrics.cacheCheckTime = performance.now() - cacheCheckStart;

    if (cachedResponse) {
      console.log('Cache hit! Returning cached response');
      const endTime = performance.now();
      metrics.totalTime = endTime - startTime;
      
      // Update cache metrics in background
      const updateMetrics = supabase
        .from('response_cache')
        .update({
          performance_metrics: { 
            last_access_time: metrics.totalTime,
            cache_hit: true
          }
        })
        .eq('question_hash', questionHash);

      EdgeRuntime.waitUntil(updateMetrics);

      return new Response(
        JSON.stringify({ 
          response: cachedResponse.response,
          audioUrl: cachedResponse.audio_url,
          cached: true,
          metrics
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
    const textComplexity = calculateTextComplexity(text);
    console.log('Text complexity score:', textComplexity);

    const responseStart = performance.now();
    const responseText = await handleTextResponse(text);
    metrics.responseGenerationTime = performance.now() - responseStart;
    
    if (!responseText) {
      console.error('No response text generated');
      throw new Error('Failed to generate response text');
    }

    console.log('Synthesizing audio...');
    const audioStart = performance.now();
    const audioUrl = await synthesizeAudio(responseText);
    metrics.audioSynthesisTime = performance.now() - audioStart;
    
    if (!audioUrl) {
      console.error('No audio URL generated');
      throw new Error('Failed to generate audio');
    }

    // Store in cache using background task with performance metrics
    const cachePromise = supabase
      .from('response_cache')
      .insert({
        question_hash: questionHash,
        question: text,
        response: responseText,
        audio_url: audioUrl,
        expires_at: new Date(Date.now() + (30 * 24 * 60 * 60 * 1000)), // 30 days
        performance_metrics: {
          text_complexity: textComplexity,
          response_time: metrics.responseGenerationTime,
          audio_synthesis_time: metrics.audioSynthesisTime,
          cache_hit: false
        }
      })
      .then(() => {
        console.log('Cache updated successfully');
      })
      .catch((error) => {
        console.error('Error updating cache:', error);
      });

    EdgeRuntime.waitUntil(cachePromise);

    const endTime = performance.now();
    metrics.totalTime = endTime - startTime;

    return new Response(
      JSON.stringify({ 
        response: responseText,
        audioUrl,
        cached: false,
        metrics
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
    metrics.totalTime = endTime - startTime;
    metrics.error = true;
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'An unknown error occurred',
        details: error instanceof Error ? error.stack : undefined,
        metrics
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