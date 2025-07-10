import { Request, Response, NextFunction } from 'express';
import { ZodType } from 'zod';

export function validateBody(schema: ZodType<any, any, any>) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: 'Invalid request body',
        details: result.error.issues.map(e => ({
          path: e.path.join('.'),
          message: e.message
        }))
      });
    }
    req.body = result.data; // Use parsed data
    next();
  };
} 