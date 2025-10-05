import { Schema, model, Document } from 'mongoose';
import { TranscriptSegment } from '../interfaces/transcript';

interface ITranscript extends Document {
  videoURL: string;
  platform: string;
  transcript: Record<string, TranscriptSegment[] | string>;
}

const TranscriptSchema = new Schema<ITranscript>({
  videoURL: { type: String, required: true },
  platform: { type: String, required: true },
  transcript: { type: Object, required: true },
});

export const TranscriptModel = model<ITranscript>('Transcript', TranscriptSchema);