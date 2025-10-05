import { Request, Response, NextFunction } from 'express';

const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(400).json({
    error: err.message || 'Something went wrong',
  });
};

export default errorHandler;