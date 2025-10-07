import { TranscriptSegment } from '../interfaces/transcript';
import dotenv from 'dotenv';
import { Parser } from 'json2csv';

dotenv.config();

export async function normalizeTranscript(
  transcript: Record<string, TranscriptSegment[] | string>
): Promise<{ normalizedTranscript: string }> {
  // Flatten all transcript segments into a single array
  const allSegments: TranscriptSegment[] = [];
  const languages = ['en', 'hi', 'ta', 'bn', 'mr'];

  for (const lang of languages) {
    const segments = transcript[lang];
    if (Array.isArray(segments)) {
      allSegments.push(...segments);
    }
  }

  if (allSegments.length === 0) {
    console.warn('No valid transcript segments found:', transcript);
    return {
      normalizedTranscript: 'No transcript available',
    };
  }

  // Convert to CSV
  try {
    const fields = ['startTime', 'endTime', 'text', 'speaker']; // adjust according to TranscriptSegment
    const parser = new Parser({ fields });
    const csv = parser.parse(allSegments);
    return {
      normalizedTranscript: csv,
    };
  } catch (err) {
    console.error('Failed to convert transcript to CSV:', err);
    return {
      normalizedTranscript: 'Error converting transcript to CSV',
    };
  }
}
