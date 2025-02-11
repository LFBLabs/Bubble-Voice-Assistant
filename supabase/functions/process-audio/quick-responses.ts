
import { greetingPatterns, greetingResponses, thankYouResponses, commonQuestionPatterns, fallbackResponse } from "./ai-config.ts";
import { formatResponseForSpeech } from "./text-formatting.ts";

export function getQuickResponse(text: string): string | null {
  const lowerText = text.toLowerCase().trim();
  
  // Check for greetings (remove thanks-related patterns from here)
  if (/^(hi|hello|hey|good morning|good afternoon|good evening|howdy|sup|what'?s up|yo|hiya|greetings)/i.test(lowerText)) {
    return formatResponseForSpeech(
      greetingResponses[Math.floor(Math.random() * greetingResponses.length)]
    );
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
    /\b(?:that(?:'s|\sis|\swas)\s)?helpful\b/i
  ];

  // Specific compliment patterns
  const complimentPatterns = [
    /\b(?:great|good)\s+(?:job|work|help)\b/i,
    /\bwell\s+done\b/i,
    /\bnice\s+(?:job|work|one)\b/i,
    /\byou(?:'re|\sare)\s+(?:amazing|awesome|fantastic|excellent|brilliant|great)\b/i,
    /\bexcellent\s+(?:job|work|help)\b/i,
    /\bperfect\b/i,
    /\bbrilliant\b/i,
    /\bimpressive\b/i
  ];
  
  // Check for gratitude
  for (const pattern of gratitudePatterns) {
    if (pattern.test(lowerText)) {
      const response = thankYouResponses[Math.floor(Math.random() * thankYouResponses.length)];
      return formatResponseForSpeech(response);
    }
  }

  // Check for compliments
  for (const pattern of complimentPatterns) {
    if (pattern.test(lowerText)) {
      const complimentResponses = [
        "I'm delighted that I could be of help! Your kind words mean a lot. Is there anything else you'd like to know about Bubble?",
        "You're too kind! I really enjoy helping people learn about Bubble. What else would you like to explore?",
        "That's very kind of you to say! I'm here to help make your Bubble journey easier. What would you like to learn next?",
        "I'm blushing! Thank you for the kind words. Let me know if there's anything else you'd like to know about Bubble!",
        "Your enthusiasm makes my day! I'm here to help you succeed with Bubble. What other questions do you have?"
      ];
      return formatResponseForSpeech(complimentResponses[Math.floor(Math.random() * complimentResponses.length)]);
    }
  }
  
  return null;
}
