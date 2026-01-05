import { Request, Response, NextFunction } from 'express';
// @ts-ignore - hpp doesn't have types
import hpp from 'hpp';

// HTTP Parameter Pollution protection
export const hppMiddleware = hpp();

// Apply HPP middleware
export const applyHpp = hppMiddleware;

// Security headers middleware
export const securityMiddleware = (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  // Additional security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Content Security Policy
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline';"
  );

  next();
};

