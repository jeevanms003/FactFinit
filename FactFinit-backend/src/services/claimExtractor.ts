import { GoogleGenerativeAI } from '@google/generative-ai';
import { TranscriptSegment, Claim } from '../interfaces/transcript';

export async function extractClaimsFromRawTranscript(
  transcript: Record<string, TranscriptSegment[] | string>
): Promise<{ normalizedTranscript: string; claims: Claim[] }> {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  const claims: Claim[] = [];
  let normalizedTranscript: string = '';

  // Combine all segments into a single paragraph
  const allSegments: TranscriptSegment[] = [];
  const languages = ['en', 'hi', 'ta', 'bn', 'mr'];
  for (const lang of languages) {
    if (typeof transcript[lang] !== 'string') {
      allSegments.push(...(transcript[lang] as TranscriptSegment[]));
    }
  }

  if (allSegments.length === 0) {
    return { normalizedTranscript: 'No translatable transcript available', claims: [] };
  }

  // Merge into a single paragraph
  const combinedText = allSegments.map(t => t.text).join(' ');

  // Prompt for Gemini
  const prompt = `
You are a financial claim extractor and translator. For the given transcript:
1. Merge all sentences into a single cohesive paragraph.
2. Normalize the paragraph: fix incomplete sentences, grammar, and remove fillers.
3. Translate any non-English text to English (support hi, ta, bn, mr).
4. Extract all factual financial or investment-related claims.
5. Return a JSON object with:
   - normalizedTranscript: A single string containing the normalized English paragraph.
   - claims: Array of {text: string} for financial claims.
Example input: "हिंदी टेक्स्ट incomplete sentence... Bitcoin will moon"
Example output: {
  "normalizedTranscript": "Complete Hindi text translated to English. Bitcoin will rise significantly.",
  "claims": [
    {"text": "Bitcoin will rise significantly"}
  ]
}
Transcript:
${combinedText}
`;

  try {
    const result = await model.generateContent(prompt);
    let responseText = result.response.text();

    // Strip markdown (e.g., ```json\n...\n```)
    responseText = responseText.replace(/```json\n|\n```/g, '').trim();

    // Parse JSON response
    const parsedResponse = JSON.parse(responseText) as {
      normalizedTranscript: string;
      claims: Claim[];
    };

    normalizedTranscript = parsedResponse.normalizedTranscript;
    claims.push(...parsedResponse.claims);
  } catch (error) {
    console.error('LLM processing failed:', error);
    normalizedTranscript = 'Normalization and translation failed';
  }

  return { normalizedTranscript, claims };
}