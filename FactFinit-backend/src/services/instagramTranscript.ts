import axios from 'axios';
import { TranscriptSegment } from '../interfaces/transcript';

export async function fetchInstagramTranscript(
  videoURL: string,
  languages: string[]
): Promise<Record<string, TranscriptSegment[] | string>> {
  const result: Record<string, TranscriptSegment[] | string> = {};
  const SUPADATA_API_ENDPOINT = process.env.SUPADATA_API_ENDPOINT || 'https://api.supadata.com/transcript';

  // Fetch transcripts for all languages concurrently
  const transcriptPromises = languages.map(async (lang) => {
    try {
      const response = await axios.post(
        SUPADATA_API_ENDPOINT,
        { url: videoURL, lang },
        {
          headers: { Authorization: `Bearer ${process.env.SUPADATA_API_KEY}` },
          timeout: 10000, // 10-second timeout
        }
      );
      const transcriptRaw = response.data.transcript;
      if (!transcriptRaw || !Array.isArray(transcriptRaw)) {
        return { lang, data: `No transcript data returned for ${lang}` };
      }
      return {
        lang,
        data: transcriptRaw.map((seg: any) => ({
          text: seg.text || '',
          start: seg.start ? seg.start / 1000 : 0,
          duration: seg.duration ? seg.duration / 1000 : undefined,
          lang,
        })),
      };
    } catch (error) {
      console.error(`Failed to fetch Instagram transcript for ${lang}:`, error);
      return { lang, data: `Transcript not available in ${lang}` };
    }
  });

  const results = await Promise.all(transcriptPromises);
  results.forEach(({ lang, data }) => {
    result[lang] = data;
  });

  return result;
}