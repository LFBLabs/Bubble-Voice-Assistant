
export function calculateTextComplexity(text: string): number {
  // Enhanced complexity factors
  const sentenceCount = (text.match(/[.!?]+/g) || []).length;
  const words = text.split(/\s+/);
  const wordCount = words.length;
  const avgWordLength = text.length / wordCount;
  const uniqueWords = new Set(words.map(w => w.toLowerCase())).size;
  const lexicalDiversity = uniqueWords / wordCount;
  
  // Technical terms with expanded vocabulary
  const technicalTerms = (text.match(/\b(workflow|database|component|function|api|integration|plugin|element|variable|interface|endpoint|middleware|webhook|authentication|configuration|deployment|parameter|dependency|framework|lifecycle)\b/gi) || []).length;
  
  // Calculate weighted complexity score (1-5 scale)
  let score = 1;
  
  // Length and structure complexity
  if (wordCount > 15) score += 0.5;
  if (wordCount > 30) score += 0.5;
  if (sentenceCount > 2) score += 0.5;
  
  // Vocabulary complexity
  if (avgWordLength > 5) score += 0.5;
  if (avgWordLength > 7) score += 0.5;
  if (lexicalDiversity > 0.8) score += 0.5;
  
  // Technical complexity
  if (technicalTerms > 0) score += 0.5;
  if (technicalTerms > 2) score += 0.5;
  if (technicalTerms > 4) score += 0.5;
  
  // Query complexity
  const isCompoundQuestion = text.includes(" and ") || text.includes(" or ");
  if (isCompoundQuestion) score += 0.5;
  
  // Normalize score between 1-5
  return Math.max(1, Math.min(5, score));
}
