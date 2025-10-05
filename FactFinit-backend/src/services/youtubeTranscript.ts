import { fetchTranscript } from 'youtube-transcript-plus';
import { TranscriptSegment } from '../interfaces/transcript';

export async function fetchYouTubeTranscript(
  videoId: string,
  languages: string[]
): Promise<Record<string, TranscriptSegment[] | string>> {
  const result: Record<string, TranscriptSegment[] | string> = {};

  for (const lang of languages) {
    try {
      const transcriptRaw = await fetchTranscript(videoId, { lang });
      result[lang] = transcriptRaw.map(segment => ({
        text: segment.text,
        start: segment.offset / 1000, // Convert ms to seconds
        duration: segment.duration ? segment.duration / 1000 : undefined,
        lang,
      }));
    } catch (error) {
      result[lang] = `Transcript not available in ${lang}`;
    }
  }

  return result;
}