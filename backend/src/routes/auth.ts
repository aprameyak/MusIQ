import { Router } from 'express';
import { AuthService } from '../services/auth.service';
import { authLimiter } from '../middleware/rate-limit.middleware';
import { validate, signupValidation, loginValidation } from '../middleware/validation.middleware';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';

const router = Router();
const authService = new AuthService();

router.post(
  '/signup',
  authLimiter,
  validate(signupValidation),
  async (req, res, next) => {
    try {
      const { email, username, password } = req.body;
      const tokens = await authService.signup(email, username, password);
      
      res.json({
        success: true,
        data: tokens,
        message: 'User created successfully'
      });
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  '/login',
  authLimiter,
  validate(loginValidation),
  async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const deviceId = req.headers['x-device-id'] as string;
      const ipAddress = req.ip || req.socket.remoteAddress || undefined;
      const userAgent = req.headers['user-agent'] || undefined;

      const tokens = await authService.login(email, password, deviceId, ipAddress, userAgent);
      
      res.json({
        success: true,
        data: tokens,
        message: 'Login successful'
      });
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  '/refresh',
  async (req, res, next) => {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        res.status(400).json({
          success: false,
          error: {
            code: '400',
            message: 'Refresh token is required'
          }
        });
        return;
      }

      const tokens = await authService.refreshToken(refreshToken);
      
      res.json({
        success: true,
        data: tokens,
        message: 'Token refreshed successfully'
      });
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  '/logout',
  authMiddleware,
  async (req, res, next) => {
    try {
      const { refreshToken } = req.body;

      if (refreshToken) {
        await authService.logout(refreshToken);
      }

      res.json({
        success: true,
        message: 'Logout successful'
      });
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  '/me',
  authMiddleware,
  async (req: AuthRequest, res, next) => {
    try {
      if (!req.userId) {
        res.status(401).json({
          success: false,
          error: {
            code: '401',
            message: 'Unauthorized'
          }
        });
        return;
      }

      const user = await authService.getUserById(req.userId);

      if (!user) {
        res.status(404).json({
          success: false,
          error: {
            code: '404',
            message: 'User not found'
          }
        });
        return;
      }

      const { password_hash, ...userData } = user;

      res.json({
        success: true,
        data: userData
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
