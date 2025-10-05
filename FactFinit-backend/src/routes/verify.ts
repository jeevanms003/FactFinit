import { Router, Request, Response, NextFunction } from 'express';
import { VerifyRequest } from '../interfaces/verifyRequest';
import { TranscriptSegment } from '../interfaces/transcript';
import { detectPlatform } from '../utils/platformDetector';
import { fetchYouTubeTranscript } from '../services/youtubeTranscript';
import { fetchInstagramTranscript } from '../services/instagramTranscript';
import { TranscriptModel } from '../models/transcriptModel';

const router = Router();

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { videoURL, platform: providedPlatform, language }: VerifyRequest = req.body;

    // Validate required fields
    if (!videoURL) {
      throw new Error('videoURL is required');
    }

    // Validate URL format
    try {
      new URL(videoURL);
    } catch {
      throw new Error('Invalid videoURL format');
    }

    // Normalize platform (case-insensitive)
    const normalizedPlatform = providedPlatform
      ? providedPlatform.toLowerCase() === 'youtube'
        ? 'YouTube'
        : providedPlatform.toLowerCase() === 'instagram'
        ? 'Instagram'
        : providedPlatform
      : detectPlatform(videoURL);

    // Check for unsupported platform
    if (normalizedPlatform === 'Unknown') {
      return res.status(400).json({ error: 'Unsupported platform' });
    }

    // Use default languages, include provided language if specified
    const desiredLanguages = ['en', 'hi'];
    if (language && !desiredLanguages.includes(language)) {
      desiredLanguages.push(language);
    }

    // Fetch transcript based on platform
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

    // Check if transcript is empty
    if (!transcript || Object.keys(transcript).length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Transcript not found for this video.',
      });
    }

    // Store in MongoDB
    await TranscriptModel.create({ videoURL, platform: normalizedPlatform, transcript });

    // Send response
    res.status(200).json({
      message: 'Transcript fetched successfully',
      data: { videoURL, platform: normalizedPlatform, transcript },
    });
  } catch (error) {
    next(error);
  }
});

export default router;