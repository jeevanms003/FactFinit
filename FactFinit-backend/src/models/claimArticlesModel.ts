import { Schema, model, Document } from 'mongoose';
import { NewsArticle } from '../interfaces/newsArticle';

interface IClaimArticles extends Document {
  claimText: string;
  articles: NewsArticle[];
  fetchedAt: Date;
}

const ClaimArticlesSchema = new Schema<IClaimArticles>({
  claimText: { type: String, required: true },
  articles: [
    {
      title: { type: String, required: true },
      url: { type: String, required: true },
      source: { type: String, required: true },
      publishedAt: { type: String, required: true },
      description: { type: String },
    },
  ],
  fetchedAt: { type: Date, default: Date.now },
});

export const ClaimArticlesModel = model<IClaimArticles>('ClaimArticles', ClaimArticlesSchema);