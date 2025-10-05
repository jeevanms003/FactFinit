import { Schema, model, Document } from 'mongoose';
import { TranscriptSegment } from '../interfaces/transcript';
import { NewsArticle } from '../interfaces/newsArticle';

interface IFactCheck {
  isTrue: boolean; // True if transcript content is verified, false if not
  verificationDescription: string; // Explanation of the verification
  confidence: number; // Confidence score (0 to 1)
  articles: NewsArticle[]; // Related articles
}

interface ITranscript extends Document {
  videoURL: string;
  platform: string;
  transcript: Record<string, TranscriptSegment[] | string>;
  normalizedTranscript: string;
  factCheck: IFactCheck;
}

const TranscriptSchema = new Schema<ITranscript>({
  videoURL: { type: String, required: true },
  platform: { type: String, required: true },
  transcript: { type: Object, required: true },
  normalizedTranscript: { type: String, required: true },
  factCheck: {
    isTrue: { type: Boolean, required: true },
    verificationDescription: { type: String, required: true },
    confidence: { type: Number, required: true },
    articles: [
      {
        title: { type: String, required: true },
        url: { type: String, required: true },
        source: { type: String, required: true },
        publishedAt: { type: String, required: true },
        description: { type: String },
      },
    ],
  },
});

export const TranscriptModel = model<ITranscript>('Transcript', TranscriptSchema);