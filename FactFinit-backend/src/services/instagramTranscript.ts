import axios from 'axios';
import { TranscriptSegment } from '../interfaces/transcript';

export async function fetchInstagramTranscript(
  videoURL: string,
  languages: string[]
): Promise<Record<string, TranscriptSegment[] | string>> {
  const result: Record<string, TranscriptSegment[] | string> = {};
  const SUPADATA_API_ENDPOINT = process.env.SUPADATA_API_ENDPOINT || 'https://api.supadata.com/transcript';

  for (const lang of languages) {
    try {
      const response = await axios.post(
        SUPADATA_API_ENDPOINT,
        { url: videoURL, lang },
        { headers: { Authorization: `Bearer ${process.env.SUPADATA_API_KEY}` } }
      );
      const transcriptRaw = response.data.transcript;
      result[lang] = transcriptRaw.map((seg: any) => ({
        text: seg.text,
        start: seg.start / 1000,
        duration: seg.duration ? seg.duration / 1000 : undefined,
        lang,
      }));
    } catch (error) {
      result[lang] = `Transcript not available in ${lang}`;
    }
  }

  return result;
}