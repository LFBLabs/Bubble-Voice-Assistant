import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { handleTextResponse } from "./text-handler.ts";
import { synthesizeAudio } from "./audio-handler.ts";
import { corsHeaders, handleCorsRequest } from "./cors-handler.ts";
import { createMetricsHandler } from "./metrics-handler.ts";
import { checkCache, updateCacheMetrics, storeInCache } from "./cache-handler.ts";
import { calculateTextComplexity } from "./text-complexity.ts";

serve(async (req) => {
  const metricsHandler = createMetricsHandler();
  console.log('Processing request started');

  const corsResponse = handleCorsRequest(req);
  if (corsResponse) return corsResponse;

  try {
    console.log('Parsing request body');
    const { text } = await req.json();
    
    if (!text || typeof text !== 'string') {
      console.error('Invalid or missing text in request');
      throw new Error('Invalid or missing text in request');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const encoder = new TextEncoder();
    const data = encoder.encode(text.toLowerCase().trim());
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const questionHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    const cacheCheckStart = performance.now();
    const cachedResponse = await checkCache(questionHash, supabase);
    metricsHandler.recordMetric('cacheCheckTime', performance.now() - cacheCheckStart);

    if (cachedResponse) {
      console.log('Cache hit! Returning cached response');
      const metrics = metricsHandler.finalizeMetrics();
      await updateCacheMetrics(supabase, questionHash, metrics, true);

      return new Response(
        JSON.stringify({ 
          response: cachedResponse.response,
          audioUrl: cachedResponse.audio_url,
          cached: true,
          metrics
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Cache miss. Generating new response...');
    const textComplexity = calculateTextComplexity(text);
    console.log('Text complexity score:', textComplexity);

    const responseStart = performance.now();
    const responseText = await handleTextResponse(text);
    metricsHandler.recordMetric('responseGenerationTime', performance.now() - responseStart);
    
    if (!responseText) {
      throw new Error('Failed to generate response text');
    }

    console.log('Synthesizing audio...');
    const audioStart = performance.now();
    const audioUrl = await synthesizeAudio(responseText);
    metricsHandler.recordMetric('audioSynthesisTime', performance.now() - audioStart);
    
    if (!audioUrl) {
      throw new Error('Failed to generate audio');
    }

    const metrics = metricsHandler.finalizeMetrics();
    await storeInCache(
      supabase,
      questionHash,
      text,
      responseText,
      audioUrl,
      textComplexity,
      metrics
    );

    return new Response(
      JSON.stringify({ 
        response: responseText,
        audioUrl,
        cached: false,
        metrics
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in process-audio function:', error);
    const metrics = metricsHandler.finalizeMetrics();
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'An unknown error occurred',
        details: error instanceof Error ? error.stack : undefined,
        metrics: { ...metrics, error: true }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});