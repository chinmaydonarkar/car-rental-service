import { Request, Response, NextFunction } from 'express';

export function extractToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Authorization header missing' });
  }
  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }
  // Attach token to request for downstream handlers
  (req as any).token = token;
  next();
} 