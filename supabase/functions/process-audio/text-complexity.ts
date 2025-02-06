export function calculateTextComplexity(text: string): number {
  const wordCount = text.split(/\s+/).length;
  const avgWordLength = text.length / wordCount;
  return Math.max(1, Math.min(4, avgWordLength / 5));
}