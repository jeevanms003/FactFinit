import { Router, Request, Response, NextFunction } from 'express';
import { VerifyRequest } from '../interfaces/verifyRequest';

const router = Router();

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { videoURL, platform, language }: VerifyRequest = req.body;

    // Validate required fields
    if (!videoURL) {
      throw new Error('videoURL is required');
    }

    // Updated regex to handle query parameters
    const urlPattern = /^(https?:\/\/)([\w.-]+)\.([a-z]{2,6})(\/[\w\-._~:/?#[\]@!$&'()*+,;=]*)?$/;
    if (!urlPattern.test(videoURL)) {
      throw new Error('Invalid videoURL format');
    }

    res.status(200).json({
      message: 'Video verification request received',
      data: { videoURL, platform, language },
    });
  } catch (error) {
    next(error);
  }
});

export default router;