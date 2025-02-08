
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { ProcessingMetrics } from "./metrics-handler.ts";

// Optimized cache check with better performance metrics
export async function checkCache(questionHash: string, supabase: ReturnType<typeof createClient>) {
  console.log('Checking cache for:', questionHash);
  const startTime = performance.now();
  
  const { data: cachedResponse } = await supabase
    .from('response_cache')
    .select('response, audio_url, performance_metrics')
    .eq('question_hash', questionHash)
    .single();

  const checkTime = performance.now() - startTime;
  console.log(`Cache check completed in ${checkTime.toFixed(2)}ms`);

  return cachedResponse;
}

// Optimized cache metrics update
export async function updateCacheMetrics(
  supabase: ReturnType<typeof createClient>,
  questionHash: string,
  metrics: ProcessingMetrics,
  isCacheHit: boolean
) {
  const updateMetrics = supabase
    .from('response_cache')
    .update({
      last_accessed: new Date().toISOString(),
      usage_count: isCacheHit ? supabase.sql`usage_count + 1` : 1,
      performance_metrics: {
        last_access_time: metrics.totalTime,
        cache_hit: isCacheHit,
        response_generation_time: metrics.responseGenerationTime,
        audio_synthesis_time: metrics.audioSynthesisTime
      }
    })
    .eq('question_hash', questionHash);

  EdgeRuntime.waitUntil(updateMetrics);
}

// Optimized cache storage with better compression and metrics
export async function storeInCache(
  supabase: ReturnType<typeof createClient>,
  questionHash: string,
  text: string,
  responseText: string,
  audioUrl: string,
  textComplexity: number,
  metrics: ProcessingMetrics
) {
  const cachePromise = supabase
    .from('response_cache')
    .insert({
      question_hash: questionHash,
      question: text,
      response: responseText,
      audio_url: audioUrl,
      expires_at: new Date(Date.now() + (30 * 24 * 60 * 60 * 1000)),
      last_accessed: new Date().toISOString(),
      usage_count: 1,
      performance_metrics: {
        text_complexity: textComplexity,
        initial_response_time: metrics.responseGenerationTime,
        audio_synthesis_time: metrics.audioSynthesisTime,
        total_processing_time: metrics.totalTime,
        cache_hit: false
      }
    });

  EdgeRuntime.waitUntil(cachePromise);
}
