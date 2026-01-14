import { Request, Response, NextFunction } from 'express';
import nacl from 'tweetnacl';
import { CustomError } from './error.middleware';
import { logger } from '../config/logger';

export interface DiscordRequest extends Request {
  rawBody?: Buffer;
}

export const discordAuthMiddleware = (
  req: DiscordRequest,
  _res: Response,
  next: NextFunction
): void => {
  try {
    const signature = req.get('X-Signature-Ed25519');
    const timestamp = req.get('X-Signature-Timestamp');
    const publicKey = process.env.DISCORD_PUBLIC_KEY;

    if (!publicKey) {
      logger.error('DISCORD_PUBLIC_KEY not configured');
      throw new CustomError('Discord authentication not configured', 500);
    }

    if (!signature || !timestamp) {
      throw new CustomError('Missing Discord signature headers', 401);
    }

    
    const rawBody = req.rawBody;
    if (!rawBody || !Buffer.isBuffer(rawBody)) {
      throw new CustomError('Invalid request body - raw body required', 400);
    }

    const bodyString = rawBody.toString('utf8');
    const message = Buffer.from(timestamp + bodyString);
    const signatureBuffer = Buffer.from(signature, 'hex');
    const publicKeyBuffer = Buffer.from(publicKey, 'hex');

    const isValid = nacl.sign.detached.verify(
      message,
      signatureBuffer,
      publicKeyBuffer
    );

    if (!isValid) {
      logger.warn('Invalid Discord signature', {
        signature: signature.substring(0, 10) + '...',
        timestamp
      });
      throw new CustomError('Invalid Discord signature', 401);
    }

    const requestTimestamp = parseInt(timestamp, 10);
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const timeDifference = Math.abs(currentTimestamp - requestTimestamp);

    if (timeDifference > 5 * 60) {
      logger.warn('Discord request timestamp too old', {
        requestTimestamp,
        currentTimestamp,
        timeDifference
      });
      throw new CustomError('Request timestamp too old', 401);
    }

    

    next();
  } catch (error) {
    if (error instanceof CustomError) {
      next(error);
    } else {
      logger.error('Discord auth middleware error', { error });
      next(new CustomError('Discord authentication failed', 500));
    }
  }
};
