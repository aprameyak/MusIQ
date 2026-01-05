import { Request, Response, NextFunction } from 'express';

import hpp from 'hpp';

export const hppMiddleware = hpp();

export const applyHpp = hppMiddleware;

export const securityMiddleware = (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline';"
  );

  next();
};
