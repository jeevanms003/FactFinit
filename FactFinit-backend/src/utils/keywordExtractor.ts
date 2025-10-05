export function extractKeywords(claimText: string): string[] {
  const keywords = claimText
    .toLowerCase()
    .match(/\b(bitcoin|crypto|stock|invest|price|market|rise|double|prediction|return|tech|finance|economy|bull|bear)\b/gi) || [];
  return [...new Set(keywords)]; // Deduplicate
}