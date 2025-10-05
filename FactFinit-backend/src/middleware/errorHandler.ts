import { Request, Response, NextFunction } from 'express';

export default function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  res.status(400).json({ error: err.message || 'Something went wrong' });
}