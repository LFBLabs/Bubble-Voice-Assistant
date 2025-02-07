
export function calculateTextComplexity(text: string): number {
  // Consider multiple factors for complexity
  const wordCount = text.split(/\s+/).length;
  const avgWordLength = text.length / wordCount;
  const questionMarks = (text.match(/\?/g) || []).length;
  const technicalTerms = (text.match(/\b(workflow|database|component|function|api|integration|plugin|element|variable)\b/gi) || []).length;
  
  // Calculate complexity score (1-5 scale)
  let score = 1;
  
  // Length factor
  if (wordCount > 15) score += 1;
  if (wordCount > 30) score += 1;
  
  // Word complexity factor
  if (avgWordLength > 5) score += 0.5;
  if (avgWordLength > 7) score += 0.5;
  
  // Question complexity
  if (questionMarks > 1) score += 0.5;
  
  // Technical terms factor
  if (technicalTerms > 0) score += 0.5;
  if (technicalTerms > 2) score += 0.5;
  
  // Normalize score between 1-5
  return Math.max(1, Math.min(5, score));
}
