export interface TranscriptSegment {
  text: string;
  start: number;
  duration: number | undefined; // Allow undefined
  lang: string;
}