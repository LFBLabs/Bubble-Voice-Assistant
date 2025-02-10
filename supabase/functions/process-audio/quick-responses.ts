
import { greetingPatterns, greetingResponses, thankYouResponses, commonQuestionPatterns, fallbackResponse } from "./ai-config.ts";
import { formatResponseForSpeech } from "./text-formatting.ts";

export function getQuickResponse(text: string): string | null {
  const lowerText = text.toLowerCase().trim();
  
  // Check for greetings
  for (const pattern of greetingPatterns) {
    if (pattern.test(lowerText)) {
      return formatResponseForSpeech(
        greetingResponses[Math.floor(Math.random() * greetingResponses.length)]
      );
    }
  }
  
  // Check for common questions
  for (const { pattern, response } of commonQuestionPatterns) {
    if (pattern.test(lowerText)) {
      return formatResponseForSpeech(response);
    }
  }
  
  // Enhanced gratitude detection with more specific patterns and word boundaries
  const gratitudePatterns = [
    /\b(?:thank(?:s|\syou|\syou\sso\smuch)?)\b/i,
    /\bthx\b/i,
    /\bappreciate(?:\sit|\syou)?\b/i,
    /\b(?:i\sam\s)?grateful\b/i,
    /\b(?:that(?:'s|\sis|\swas)\s)?helpful\b/i,
    /\b(?:great|good)\s+(?:job|work|help)\b/i,
    /\bwell\s+done\b/i,
    /\bnice\s+(?:job|work|one)\b/i
  ];
  
  // Check each gratitude pattern
  for (const pattern of gratitudePatterns) {
    if (pattern.test(lowerText)) {
      const response = thankYouResponses[Math.floor(Math.random() * thankYouResponses.length)];
      return formatResponseForSpeech(response);
    }
  }
  
  return null;
}
