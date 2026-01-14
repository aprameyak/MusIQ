import { Request, Response, NextFunction } from 'express';
import nacl from 'tweetnacl';
import { logger } from '../config/logger';

export interface DiscordRequest extends Request {
  rawBody?: Buffer;
}

export const discordAuthMiddleware = (
  req: DiscordRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const signature = req.get('X-Signature-Ed25519');
    const timestamp = req.get('X-Signature-Timestamp');
    const publicKey = process.env.DISCORD_PUBLIC_KEY;

    if (!publicKey) {
      logger.error('DISCORD_PUBLIC_KEY not configured');
      res.status(500).json({ error: 'Server configuration error' });
      return;
    }

    if (!signature || !timestamp) {
      logger.warn('Missing Discord signature headers');
      res.status(401).json({ error: 'Missing signature headers' });
      return;
    }

    const rawBody = req.rawBody;
    if (!rawBody || !Buffer.isBuffer(rawBody)) {
      logger.warn('Invalid request body - raw body required');
      res.status(400).json({ error: 'Invalid request body' });
      return;
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
      res.status(401).json({ error: 'Invalid signature' });
      return;
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
      res.status(401).json({ error: 'Request timestamp too old' });
      return;
    }

    next();
  } catch (error) {
    logger.error('Discord auth middleware error', { error });
    res.status(500).json({ error: 'Authentication failed' });
  }
};
