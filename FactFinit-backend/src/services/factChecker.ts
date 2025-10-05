import { GoogleGenerativeAI } from '@google/generative-ai';
import { TranscriptSegment } from '../interfaces/transcript';
import { NewsArticle } from '../interfaces/newsArticle';
import dotenv from 'dotenv';

dotenv.config();

export interface FactCheckResult {
  isTrue: boolean;
  verificationDescription: string;
  confidence: number;
  articles: NewsArticle[];
}

export async function factCheckTranscript(
  transcript: Record<string, TranscriptSegment[] | string>
): Promise<{ normalizedTranscript: string; factCheck: FactCheckResult }> {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  let normalizedTranscript: string = '';

  // Combine all segments into a single paragraph
  const allSegments: TranscriptSegment[] = [];
  const languages = ['en', 'hi', 'ta', 'bn', 'mr'];
  for (const lang of languages) {
    if (typeof transcript[lang] !== 'string') {
      allSegments.push(...(transcript[lang] as TranscriptSegment[]));
    }
  }

  if (allSegments.length === 0) {
    return {
      normalizedTranscript: 'No translatable transcript available',
      factCheck: {
        isTrue: false,
        verificationDescription: 'No transcript available for fact-checking.',
        confidence: 0,
        articles: [],
      },
    };
  }

  // Merge into a single paragraph
  const combinedText = allSegments.map(t => t.text).join(' ');

  // Gemini Prompt: Normalize transcript and fact-check
  const prompt = `
You are a financial fact-checker. For the given transcript:
1. Merge all sentences into a single cohesive English paragraph.
2. Normalize the paragraph: fix incomplete sentences, grammar, and remove fillers (e.g., "uh", "you know").
3. Translate any non-English text to English (support hi, ta, bn, mr).
4. Perform fact-checking on the financial or investment-related content in the normalized transcript:
   - Fetch the top 10 news articles or sources relevant to the transcript's financial content (provide title, URL, source name, publication date, and optional description).
   - Determine if the financial content is true or false based on the articles.
   - Provide a detailed explanation (100-200 words) of why the content is true or false.
   - Assign a confidence score (0 to 1, where 1 is highest confidence) based on the reliability of the articles and evidence strength.
5. Return a JSON object with:
   - normalizedTranscript: A single string containing the normalized English paragraph.
   - factCheck: An object with { isTrue: boolean, verificationDescription: string, confidence: number, articles: {title: string, url: string, source: string, publishedAt: string, description?: string}[] }.
Example input: "हिंदी टेक्स्ट incomplete sentence... Bitcoin will double in price by 2026."
Example output: {
  "normalizedTranscript": "Complete Hindi text translated to English. Bitcoin will double in price by 2026.",
  "factCheck": {
    "isTrue": false,
    "verificationDescription": "Analysis of recent articles suggests uncertainty in Bitcoin's price trajectory due to market volatility and regulatory concerns. Most sources predict moderate growth but not a doubling by 2026.",
    "confidence": 0.85,
    "articles": [
      {"title": "Bitcoin Outlook 2026", "url": "https://example.com", "source": "Reuters", "publishedAt": "2025-10-01", "description": "Market analysis..."}
    ]
  }
}
Transcript:
${combinedText}
`;

  try {
    const result = await model.generateContent(prompt);
    let responseText = result.response.text();

    // Strip markdown
    responseText = responseText.replace(/```json\n|\n```/g, '').trim();

    // Parse JSON response
    const parsedResponse = JSON.parse(responseText) as {
      normalizedTranscript: string;
      factCheck: FactCheckResult;
    };

    return {
      normalizedTranscript: parsedResponse.normalizedTranscript,
      factCheck: {
        isTrue: parsedResponse.factCheck.isTrue,
        verificationDescription: parsedResponse.factCheck.verificationDescription,
        confidence: parsedResponse.factCheck.confidence,
        articles: parsedResponse.factCheck.articles,
      },
    };
  } catch (error) {
    console.error('LLM fact-checking failed:', error);
    return {
      normalizedTranscript: 'Normalization and fact-checking failed',
      factCheck: {
        isTrue: false,
        verificationDescription: 'Fact-checking failed due to an error.',
        confidence: 0,
        articles: [],
      },
    };
  }
}