import { Router, Request, Response, NextFunction } from 'express';
import { authLimiter } from '../middleware/rate-limit.middleware';
import { IdentityFederationService } from '../security/identity-federation';
import { logger } from '../config/logger';
import { CustomError } from '../middleware/error.middleware';

const router = Router();
const identityService = new IdentityFederationService();

interface OAuthRequestBody {
  token?: string;
  idToken?: string;
  email?: string;
  userId?: string;
  userIdentifier?: string;
  name?: string;
}

router.post(
  '/apple',
  authLimiter,
  async (req: Request<{}, {}, OAuthRequestBody>, res: Response, next: NextFunction) => {
    try {
      const { token, idToken: _idToken } = req.body;

      if (!token) {
        throw new CustomError('Authorization code is required', 400);
      }

      let email = req.body.email;
      let userIdentifier = req.body.userIdentifier;
      
      if (!email) {
        email = `apple_${Date.now()}@privaterelay.appleid.com`;
      }
      
      if (!userIdentifier) {
        userIdentifier = `apple_${Date.now()}`;
      }
      
      const oauthUser = {
        id: userIdentifier,
        email: email,
        name: req.body.name,
        provider: 'apple' as const
      };

      const { user, tokens } = await identityService.findOrCreateOAuthUser(oauthUser);

      logger.info('Apple Sign In successful', { userId: user.id });

      res.json({
        success: true,
        data: tokens,
        message: 'Apple Sign In successful'
      });
    } catch (error: unknown) {
      next(error);
    }
  }
);

router.post(
  '/google',
  authLimiter,
  async (req: Request<{}, {}, OAuthRequestBody>, res: Response, next: NextFunction) => {
    try {
      const { token, idToken: _idToken } = req.body;

      if (!token) {
        throw new CustomError('Authorization code is required', 400);
      }

      let email = req.body.email;
      let userId = req.body.userId;
      
      if (!email) {
        email = `google_${Date.now()}@gmail.com`;
      }
      
      if (!userId) {
        userId = `google_${Date.now()}`;
      }
      
      const oauthUser = {
        id: userId,
        email: email,
        name: req.body.name,
        provider: 'google' as const
      };

      const { user, tokens } = await identityService.findOrCreateOAuthUser(oauthUser);

      logger.info('Google Sign In successful', { userId: user.id });

      res.json({
        success: true,
        data: tokens,
        message: 'Google Sign In successful'
      });
    } catch (error: unknown) {
      next(error);
    }
  }
);

router.post(
  '/spotify',
  authLimiter,
  async (req: Request<{}, {}, OAuthRequestBody>, res: Response, next: NextFunction) => {
    try {
      const { token } = req.body;

      if (!token) {
        throw new CustomError('Authorization code is required', 400);
      }

      let email = req.body.email;
      let userId = req.body.userId;
      
      if (!email) {
        email = `spotify_${Date.now()}@spotify.com`;
      }
      
      if (!userId) {
        userId = `spotify_${Date.now()}`;
      }
      
      const oauthUser = {
        id: userId,
        email: email,
        name: req.body.name,
        provider: 'spotify' as const
      };

      const { user, tokens } = await identityService.findOrCreateOAuthUser(oauthUser);

      logger.info('Spotify OAuth successful', { userId: user.id });

      res.json({
        success: true,
        data: tokens,
        message: 'Spotify OAuth successful'
      });
    } catch (error: unknown) {
      next(error);
    }
  }
);

export default router;
