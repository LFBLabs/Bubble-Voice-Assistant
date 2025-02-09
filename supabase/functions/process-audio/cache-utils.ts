
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts";

export async function generateCacheKey(text: string): Promise<string> {
  const normalizedText = text.toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[.,!?;:]$/g, '')
    .replace(/(?:the|a|an) /g, '')
    .replace(/\b(?:is|are|was|were)\b/g, '');
  
  const encoder = new TextEncoder();
  const data = encoder.encode(normalizedText);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
