export interface TranscriptSegment {
  text: string;
  start: number;
  duration?: number;
  lang: string;
}

export interface Claim {
  text: string; // Financial/investment claim
}