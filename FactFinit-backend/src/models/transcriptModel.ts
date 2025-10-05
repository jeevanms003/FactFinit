import { Schema, model, Document } from 'mongoose';
import { TranscriptSegment, Claim } from '../interfaces/transcript';

interface ITranscript extends Document {
  videoURL: string;
  platform: string;
  transcript: Record<string, TranscriptSegment[] | string>;
  normalizedTranscript: string;
  claims: Claim[];
}

const TranscriptSchema = new Schema<ITranscript>({
  videoURL: { type: String, required: true },
  platform: { type: String, required: true },
  transcript: { type: Schema.Types.Mixed, required: true },
  normalizedTranscript: { type: String, default: '' },
  claims: [{ text: String }],
});

export const TranscriptModel = model<ITranscript>('Transcript', TranscriptSchema);