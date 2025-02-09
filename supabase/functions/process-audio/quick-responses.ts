
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
  
  // Enhanced gratitude detection
  const gratitudePatterns = [
    /\b(?:thank|thanks)\b/i,
    /\bthx\b/i,
    /appreciate/i,
    /grateful/i,
    /helpful/i,
    /(?:great|good)\s+(?:job|work|help)/i,
    /well\s+done/i
  ];
  
  if (gratitudePatterns.some(pattern => pattern.test(lowerText))) {
    return formatResponseForSpeech(
      thankYouResponses[Math.floor(Math.random() * thankYouResponses.length)]
    );
  }
  
  return null;
}
