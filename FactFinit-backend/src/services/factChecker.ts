import { GoogleGenerativeAI } from '@google/generative-ai';
import { TranscriptSegment } from '../interfaces/transcript';
import dotenv from 'dotenv';

dotenv.config();

export async function normalizeTranscript(
  transcript: Record<string, TranscriptSegment[] | string>
): Promise<{ normalizedTranscript: string }> {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  let normalizedTranscript: string = '';

  // Validate input transcript
  const allSegments: TranscriptSegment[] = [];
  const languages = ['en', 'hi', 'ta', 'bn', 'mr'];
  let englishTranscript = '';
  if (transcript['en'] && Array.isArray(transcript['en'])) {
    allSegments.push(...(transcript['en'] as TranscriptSegment[]));
    englishTranscript = allSegments.map(t => t.text).join(' ').slice(0, 5000);
  } else {
    for (const lang of languages) {
      if (typeof transcript[lang] !== 'string' && transcript[lang]) {
        allSegments.push(...(transcript[lang] as TranscriptSegment[]));
      }
    }
  }

  if (allSegments.length === 0) {
    console.warn('No valid transcript segments found:', transcript);
    return {
      normalizedTranscript: 'No translatable transcript available',
    };
  }

  // Merge into a single text and truncate to 5000 characters
  const combinedText = allSegments.map(t => t.text).join(' ').slice(0, 5000);
  if (!combinedText.trim()) {
    console.warn('Combined transcript is empty');
    return {
      normalizedTranscript: 'No translatable transcript available',
    };
  }

  // If English transcript is available and normalization fails, use it as fallback
  const fallbackTranscript = englishTranscript || combinedText;

  // Simplified Gemini Prompt
  const prompt = `
Normalize the following transcript into a single cohesive English paragraph. Fix grammar, remove fillers (e.g., "uh", "you know"), and translate any non-English text to English. Return a JSON object with only the "normalizedTranscript" field.
Input: "${combinedText.replace(/"/g, '\\"')}"
Output format: {"normalizedTranscript": "string"}
`;

  // Retry logic with exponential backoff
  let attempts = 0;
  const maxAttempts = 3;
  const baseDelay = 2000; // Start with 2 seconds
  while (attempts < maxAttempts) {
    attempts++;
    try {
      console.log(`Attempt ${attempts} to normalize transcript (length: ${combinedText.length} chars)`);
      const result = await model.generateContent(prompt, { timeout: 20000 }); // Increased to 20s
      let responseText = result.response.text().replace(/```json\n|\n```/g, '').trim();

      // Log raw response for debugging
      console.log('Gemini raw response:', responseText);

      // Attempt to parse JSON
      try {
        const parsedResponse = JSON.parse(responseText) as { normalizedTranscript: string };
        if (parsedResponse.normalizedTranscript) {
          return {
            normalizedTranscript: parsedResponse.normalizedTranscript,
          };
        } else {
          console.warn('Gemini response missing normalizedTranscript:', parsedResponse);
          return {
            normalizedTranscript: fallbackTranscript || 'Normalization failed: Empty response from Gemini',
          };
        }
      } catch (parseError) {
        console.error('Failed to parse Gemini response as JSON:', parseError, 'Raw response:', responseText);
        return {
          normalizedTranscript: fallbackTranscript || 'Normalization failed: Invalid JSON response',
        };
      }
    } catch (error: any) {
      console.error(`Transcript normalization attempt ${attempts} failed:`, error.message, error);
      if (attempts === maxAttempts) {
        console.warn(`All ${maxAttempts} normalization attempts failed, using fallback transcript`);
        return {
          normalizedTranscript: fallbackTranscript || 'Normalization failed due to an error after retries',
        };
      }
      // Exponential backoff: 2s, 4s, 8s
      const delay = baseDelay * Math.pow(2, attempts);
      console.log(`Retrying after ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  return {
    normalizedTranscript: fallbackTranscript || 'Normalization failed due to an error after retries',
  };
}