import { GoogleGenerativeAI, GenerateContentRequest } from '@google/generative-ai';
import { TranscriptSegment } from '../interfaces/transcript';
import dotenv from 'dotenv';

dotenv.config();

// Custom error class for normalization failures
class NormalizationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NormalizationError';
  }
}

export async function normalizeTranscript(
  transcript: Record<string, TranscriptSegment[] | string>
): Promise<{ normalizedTranscript: string }> {
  // Validate input
  if (!transcript || typeof transcript !== 'object' || Object.keys(transcript).length === 0) {
    console.warn('Invalid or empty transcript input:', transcript);
    return { normalizedTranscript: 'No transcript data provided for normalization.' };
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
  // Use gemini-2.5-flash-lite for cost-efficient, high-throughput text processing
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });

  // Define supported languages (prioritize English for faster processing)
  const languages = ['en', 'hi', 'ta', 'bn', 'mr'];

  // Process transcripts sequentially, stopping at the first successful normalization
  let normalizedTranscript = '';
  for (const lang of languages) {
    if (!transcript[lang]) {
      console.debug(`No transcript for language: ${lang}`);
      continue;
    }

    if (!Array.isArray(transcript[lang])) {
      console.warn(`Transcript for ${lang} is not an array:`, typeof transcript[lang]);
      continue;
    }

    const segments = transcript[lang] as TranscriptSegment[];
    if (segments.length === 0) {
      console.warn(`Empty transcript segments for language: ${lang}`);
      continue;
    }

    // Validate segments
    const validSegments = segments.filter(
      seg => typeof seg.text === 'string' && seg.text.trim() !== '' && typeof seg.lang === 'string'
    );
    if (validSegments.length === 0) {
      console.warn(`No valid segments for language: ${lang}`);
      continue;
    }

    // Combine segments (limit to 8000 chars to stay within model limits)
    const combinedText = validSegments
      .map(seg => seg.text.trim())
      .join(' ')
      .slice(0, 8000)
      .trim();

    if (!combinedText) {
      console.warn(`Combined text is empty for language: ${lang}`);
      continue;
    }

    // Construct prompt for Gemini
    const prompt = `
You are an expert transcript normalizer. Process the provided transcript text as follows:
1. Merge sentences into a single, cohesive English paragraph.
2. Correct grammatical errors and enhance sentence clarity and flow.
3. If the text is not in English, translate it to English while preserving meaning and context.
4. Remove filler words (e.g., "uh", "um", "you know", "like", "er", "ah") and repetitive phrases.
5. Ensure the output is concise, professional, and free of embellishments.
6. If the input is too fragmented or invalid, return a brief English summary (e.g., "Transcript too fragmented to normalize").

Respond ONLY with a valid JSON object containing the "normalizedTranscript" field. Do not include additional text, explanations, or markdown.

Example Input: "Uh, hello um this is a test you know."
Example Output: {"normalizedTranscript": "Hello, this is a test."}

Input: "${combinedText.replace(/"/g, '\\"').replace(/\n/g, ' ')}"
Output: {"normalizedTranscript": "Your processed paragraph here"}
`;

    // Retry logic with exponential backoff
    let attempts = 0;
    const maxAttempts = 3;
    const baseDelay = 2000; // 2s base delay
    let lastError: unknown;

    while (attempts < maxAttempts) {
      attempts++;
      try {
        console.debug(`Attempt ${attempts} to normalize transcript for ${lang} (input length: ${combinedText.length} chars)`);

        const request: GenerateContentRequest = {
          contents: [
            {
              role: 'user', // Explicitly set role to 'user'
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.2, // Low temperature for deterministic output
            topP: 0.8,
            maxOutputTokens: 2048, // Sufficient for a paragraph
          },
        };

        const result = await model.generateContent(request, { timeout: 45000 });
        const responseText = result.response.text().replace(/```json\n|\n|```/g, '').trim();

        // Parse and validate response
        const parsedResponse = JSON.parse(responseText) as { normalizedTranscript: string };
        const normalized = parsedResponse.normalizedTranscript?.trim();

        if (!normalized || normalized.length < 10) {
          throw new NormalizationError(`Invalid or too short normalized transcript for ${lang}: ${normalized}`);
        }

        // Validate output quality
        if (normalized.toLowerCase().includes('cannot be processed') || normalized === combinedText) {
          throw new NormalizationError(`Normalization for ${lang} returned unchanged or error output`);
        }

        normalizedTranscript = normalized;
        console.info(`Successfully normalized transcript from ${lang} (output length: ${normalized.length} chars)`);
        break; // Exit on success
      } catch (error: unknown) {
        lastError = error;
        console.error(`Normalization attempt ${attempts} for ${lang} failed:`, error instanceof Error ? error.message : error);

        if (attempts === maxAttempts) {
          console.warn(`All ${maxAttempts} attempts failed for ${lang}. Last error:`, lastError instanceof Error ? lastError.message : lastError);
          break;
        }

        const delay = baseDelay * Math.pow(2, attempts - 1);
        console.debug(`Retrying for ${lang} after ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    // Exit language loop if normalization succeeded
    if (normalizedTranscript) {
      break;
    }
  }

  // Fallback normalization if Gemini fails
  if (!normalizedTranscript) {
    console.warn('Gemini normalization failed for all languages. Applying fallback normalization.');

    // Aggregate all valid segments
    const allSegments: TranscriptSegment[] = [];
    for (const lang of languages) {
      if (transcript[lang] && Array.isArray(transcript[lang])) {
        const segments = (transcript[lang] as TranscriptSegment[]).filter(
          seg => typeof seg.text === 'string' && seg.text.trim() !== '' && typeof seg.lang === 'string'
        );
        allSegments.push(...segments);
      }
    }

    let fallbackText = allSegments
      .map(seg => seg.text.trim())
      .join(' ')
      .slice(0, 8000)
      .trim();

    if (!fallbackText) {
      console.warn('No valid segments for fallback normalization.');
      return { normalizedTranscript: 'No usable transcript segments available for normalization.' };
    }

    // Enhanced local normalization
    normalizedTranscript = fallbackText
      .replace(/\b(uh|um|uhm|er|ah|like|you know|I mean|so like|right)\b/gi, '') // Remove fillers
      .replace(/\s+/g, ' ') // Normalize spaces
      .replace(/([.!?])\s*([A-Z])/g, '$1 $2') // Fix punctuation spacing
      .replace(/([a-z])([A-Z])/g, '$1. $2') // Add periods for run-on sentences
      .replace(/(\w)\s*([.!?])\s*(\w)/g, '$1$2 $3') // Ensure proper punctuation
      .split(/[.!?]+/)
      .map(sentence => sentence.trim())
      .filter(sentence => sentence.length > 0)
      .map(sentence => {
        const cleaned = sentence.charAt(0).toUpperCase() + sentence.slice(1).trim();
        return cleaned.endsWith('.') || cleaned.endsWith('!') || cleaned.endsWith('?') ? cleaned : cleaned + '.';
      })
      .join(' ')
      .trim();

    if (!normalizedTranscript || normalizedTranscript.split('.').length < 2) {
      normalizedTranscript = `Locally normalized transcript: ${normalizedTranscript || 'Transcript too fragmented to normalize.'}`;
    }

    console.info(`Fallback normalization applied (output length: ${normalizedTranscript.length} chars)`);
  }

  return { normalizedTranscript };
}