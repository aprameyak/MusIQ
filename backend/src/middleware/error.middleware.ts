import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export class CustomError extends Error implements AppError {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorMiddleware = (
  err: AppError,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  const errorDetails: any = {
    error: message,
    path: req.path,
    method: req.method,
    statusCode,
    service: 'musiq-api'
  };

  if (err.stack) {
    errorDetails.stack = err.stack;
  }

  if ((err as any).code) {
    errorDetails.code = (err as any).code;
  }

  logger.error('Request error', errorDetails);

  const isDatabaseError = 
    (err as any).code === '57P01' || 
    (err as any).code === '57P02' || 
    (err as any).code === '57P03' ||
    (err as any).code === 'ECONNRESET' ||
    (err as any).code === 'ETIMEDOUT' ||
    message.includes('Connection terminated') ||
    message.includes('Connection closed');

  if (isDatabaseError && statusCode === 500) {
    return res.status(503).json({
      success: false,
      error: {
        code: '503',
        message: 'Database temporarily unavailable. Please try again.'
      }
    });
  }

  res.status(statusCode).json({
    success: false,
    error: {
      code: statusCode.toString(),
      message: process.env.NODE_ENV === 'production' && statusCode === 500
        ? 'Internal Server Error'
        : message,
      ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
    }
  });
};
