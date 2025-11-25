import { Request, Response, NextFunction } from 'express';

export default function errorMiddleware(err: any, _req: Request, res: Response, _next: NextFunction) {
  res.status(500).json({
    message: err.message,
    error: err?.errors
  });
}