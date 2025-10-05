import { Router, Request, Response, NextFunction } from 'express';
import { VerifyRequest } from '../interfaces/verifyRequest';
import { TranscriptSegment, Claim } from '../interfaces/transcript';
import { detectPlatform } from '../utils/platformDetector';
import { fetchYouTubeTranscript } from '../services/youtubeTranscript';
import { fetchInstagramTranscript } from '../services/instagramTranscript';
import { extractClaimsFromRawTranscript } from '../services/claimExtractor';
import { TranscriptModel } from '../models/transcriptModel';

const router = Router();

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { videoURL, platform: providedPlatform, language }: VerifyRequest = req.body;

    if (!videoURL) {
      throw new Error('videoURL is required');
    }

    try {
      new URL(videoURL);
    } catch {
      throw new Error('Invalid videoURL format');
    }

    const normalizedPlatform = providedPlatform
      ? providedPlatform.toLowerCase() === 'youtube'
        ? 'YouTube'
        : providedPlatform.toLowerCase() === 'instagram'
        ? 'Instagram'
        : providedPlatform
      : detectPlatform(videoURL);

    if (normalizedPlatform === 'Unknown') {
      return res.status(400).json({ error: 'Unsupported platform' });
    }

    const desiredLanguages = ['en', 'hi', 'ta', 'bn', 'mr'];
    if (language && !desiredLanguages.includes(language)) {
      desiredLanguages.push(language);
    }

    let transcript: Record<string, TranscriptSegment[] | string>;
    if (normalizedPlatform === 'YouTube') {
      const url = new URL(videoURL);
      const videoId = url.searchParams.get('v') || videoURL.split('/').pop() || '';
      if (!videoId) {
        throw new Error('Invalid YouTube video ID');
      }
      transcript = await fetchYouTubeTranscript(videoId, desiredLanguages);
    } else if (normalizedPlatform === 'Instagram') {
      transcript = await fetchInstagramTranscript(videoURL, desiredLanguages);
    } else {
      throw new Error('Platform not supported');
    }

    if (!transcript || Object.keys(transcript).length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Transcript not found for this video.',
      });
    }

    const { normalizedTranscript, claims } = await extractClaimsFromRawTranscript(transcript);

    await TranscriptModel.create({
      videoURL,
      platform: normalizedPlatform,
      transcript,
      normalizedTranscript,
      claims,
    });

    res.status(200).json({
      message: 'Transcript processed successfully',
      data: {
        videoURL,
        platform: normalizedPlatform,
        transcript,
        normalizedTranscript,
        claims,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;