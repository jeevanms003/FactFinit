import { Router, Request, Response, NextFunction } from 'express';
import { VerifyRequest } from '../interfaces/verifyRequest';
import { TranscriptSegment } from '../interfaces/transcript';
import { detectPlatform } from '../utils/platformDetector';
import { extractYouTubeId } from '../utils/youtubeIdExtractor';
import { extractInstagramId } from '../utils/instagramIdExtractor';
import { fetchYouTubeTranscript } from '../services/youtubeTranscript';
import { fetchInstagramTranscript } from '../services/instagramTranscript';
import { normalizeTranscript } from '../services/factChecker';
import { TranscriptModel } from '../models/transcriptModel';

const router = Router();

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { videoURL, platform: providedPlatform, language }: VerifyRequest = req.body;

    if (!videoURL || videoURL.trim() === '') {
      throw new Error('videoURL is required and cannot be empty');
    }

    // Clean URL
    let cleanedURL = videoURL.trim();
    if (!cleanedURL.startsWith('http://') && !cleanedURL.startsWith('https://')) {
      cleanedURL = `https://${cleanedURL}`;
    }
    try {
      new URL(cleanedURL);
    } catch {
      throw new Error('Invalid videoURL format');
    }

    // Normalize platform
    const normalizedPlatform = providedPlatform
      ? providedPlatform.toLowerCase() === 'youtube'
        ? 'YouTube'
        : providedPlatform.toLowerCase() === 'instagram'
        ? 'Instagram'
        : providedPlatform
      : detectPlatform(cleanedURL);

    if (normalizedPlatform === 'Unknown') {
      throw new Error('Unsupported platform');
    }

    // Check for cached transcript
    const cachedTranscript = await TranscriptModel.findOne({ videoURL: cleanedURL }).lean();
    if (cachedTranscript) {
      console.log(`Returning cached transcript for ${cleanedURL}`);
      return res.status(200).json({
        message: 'Transcript retrieved from cache',
        data: {
          videoURL: cleanedURL,
          platform: normalizedPlatform,
          transcript: cachedTranscript.transcript,
          normalizedTranscript: cachedTranscript.normalizedTranscript,
        },
      });
    }

    const desiredLanguages = ['en', 'hi', 'ta', 'bn', 'mr'];
    if (language && !desiredLanguages.includes(language)) {
      desiredLanguages.push(language);
    }

    let transcript: Record<string, TranscriptSegment[] | string>;
    if (normalizedPlatform === 'YouTube') {
      const videoId = extractYouTubeId(cleanedURL);
      if (!videoId) {
        throw new Error('Could not extract YouTube video ID');
      }
      console.log(`Processing YouTube video ID: ${videoId}`);
      transcript = await fetchYouTubeTranscript(videoId, desiredLanguages);
    } else if (normalizedPlatform === 'Instagram') {
      const videoId = extractInstagramId(cleanedURL);
      if (!videoId) {
        throw new Error('Could not extract Instagram video ID');
      }
      console.log(`Processing Instagram video ID: ${videoId}`);
      transcript = await fetchInstagramTranscript(cleanedURL, desiredLanguages);
    } else {
      throw new Error('Platform not supported');
    }

    if (!transcript || Object.keys(transcript).length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Transcript not found for this video.',
      });
    }

    const { normalizedTranscript } = await normalizeTranscript(transcript);

    await TranscriptModel.create({
      videoURL: cleanedURL,
      platform: normalizedPlatform,
      transcript,
      normalizedTranscript,
    });

    res.status(200).json({
      message: 'Transcript processed successfully',
      data: {
        videoURL: cleanedURL,
        platform: normalizedPlatform,
        transcript,
        normalizedTranscript,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;