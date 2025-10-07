// src/services/factChecker.ts
import { GoogleGenerativeAI } from '@google/generative-ai';
import { TranscriptSegment } from '../interfaces/transcript';
import dotenv from 'dotenv';

dotenv.config();

export async function normalizeTranscript(
  transcript: Record<string, TranscriptSegment[] | string>
): Promise<{ normalizedTranscript: string }> {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  // Step 1: Extract and prioritize transcript segments
  const allSegments: TranscriptSegment[] = [];
  let englishTranscript = '';
  const languages = ['en', 'hi', 'ta', 'bn', 'mr'];

  // Prioritize English transcript if available
  if (transcript['en'] && Array.isArray(transcript['en'])) {
    allSegments.push(...(transcript['en'] as TranscriptSegment[]));
    englishTranscript = allSegments.map(t => t.text).join(' ').trim();
  } else {
    // Collect segments from other languages
    for (const lang of languages) {
      if (transcript[lang] && Array.isArray(transcript[lang])) {
        allSegments.push(...(transcript[lang] as TranscriptSegment[]));
      }
    }
  }

  // If no valid segments, return a default message
  if (allSegments.length === 0) {
    console.warn('No valid transcript segments found:', transcript);
    return {
      normalizedTranscript: 'No translatable transcript available',
    };
  }

  // Step 2: Combine segments into a single text (limit to 5000 chars for API safety)
  const combinedText = allSegments.map(t => t.text).join(' ').slice(0, 5000).trim();
  if (!combinedText) {
    console.warn('Combined transcript is empty');
    return {
      normalizedTranscript: 'No translatable transcript available',
    };
  }

  // Step 3: Construct a more robust prompt
  const prompt = `
You are a professional transcript normalizer. Your task is to convert the provided transcript into a single, cohesive English paragraph. Follow these steps:
1. Translate any non-English text to English, preserving the original meaning.
2. Fix grammatical errors and improve sentence structure for clarity.
3. Remove filler words (e.g., "uh", "um", "you know", "like") and repetitive phrases.
4. Combine fragmented sentences into a natural, readable paragraph.
5. If the input is empty or cannot be normalized, return a brief English summary indicating the issue.
Return the result as a JSON object with only the "normalizedTranscript" field.

Input: "${combinedText.replace(/"/g, '\\"')}"
Output format: {"normalizedTranscript": "string"}
`;

  // Step 4: Retry logic with exponential backoff
  let attempts = 0;
  const maxAttempts = 3;
  const baseDelay = 2000; // 2 seconds
  let lastError: any;

  while (attempts < maxAttempts) {
    attempts++;
    try {
      console.log(`Attempt ${attempts} to normalize transcript (length: ${combinedText.length} chars)`);
      const result = await model.generateContent(prompt, { timeout: 20000 });
      const responseText = result.response.text().replace(/json\n|\n/g, '').trim();

      // Parse and validate response
      try {
        const parsedResponse = JSON.parse(responseText) as { normalizedTranscript: string };
        const normalized = parsedResponse.normalizedTranscript?.trim();

        if (!normalized) {
          console.warn('Gemini returned empty normalizedTranscript:', parsedResponse);
          throw new Error('Empty normalized transcript');
        }

        // Basic validation: Ensure output is in English and not just the input
        if (normalized === combinedText) {
          console.warn('Gemini returned unchanged input');
          throw new Error('Normalization produced no changes');
        }

        return { normalizedTranscript: normalized };
      } catch (parseError) {
        console.error('Failed to parse Gemini response:', parseError, 'Raw response:', responseText);
        throw parseError;
      }
    } catch (error: any) {
      lastError = error;
      console.error(`Normalization attempt ${attempts} failed:`, error.message);

      if (attempts === maxAttempts) {
        console.warn(`All ${maxAttempts} attempts failed`);
        break;
      }

      const delay = baseDelay * Math.pow(2, attempts);
      console.log(`Retrying after ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  // Step 5: Fallback with basic normalization
  console.warn('Falling back to basic normalization due to repeated failures');
  let fallback = englishTranscript || combinedText;

  // Basic cleanup: Remove common fillers and normalize spaces
  fallback = fallback
    .replace(/\b(uh|um|you know|like)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

  return {
    normalizedTranscript: fallback || 'Normalization failed due to repeated errors',
  };
}