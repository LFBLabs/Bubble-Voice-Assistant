import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { ProcessingMetrics } from "./metrics-handler.ts";

export async function checkCache(questionHash: string, supabase: ReturnType<typeof createClient>) {
  console.log('Checking cache for:', questionHash);
  const { data: cachedResponse } = await supabase
    .from('response_cache')
    .select('response, audio_url')
    .eq('question_hash', questionHash)
    .single();

  return cachedResponse;
}

export async function updateCacheMetrics(
  supabase: ReturnType<typeof createClient>,
  questionHash: string,
  metrics: ProcessingMetrics,
  isCacheHit: boolean
) {
  const updateMetrics = supabase
    .from('response_cache')
    .update({
      performance_metrics: { 
        last_access_time: metrics.totalTime,
        cache_hit: isCacheHit
      }
    })
    .eq('question_hash', questionHash);

  EdgeRuntime.waitUntil(updateMetrics);
}

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
      performance_metrics: {
        text_complexity: textComplexity,
        response_time: metrics.responseGenerationTime,
        audio_synthesis_time: metrics.audioSynthesisTime,
        cache_hit: false
      }
    });

  EdgeRuntime.waitUntil(cachePromise);
}