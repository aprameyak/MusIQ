import { Router } from 'express';
import { AuthService } from '../services/auth.service';
import { supabaseService } from '../services/supabase.service';
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
      const { email, username, password, firstName, lastName } = req.body;
      await authService.signup(email, username, password, firstName, lastName);

      res.json({
        success: true,
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
      const tokens = await authService.login(email, password);

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
  '/forgot-password',
  authLimiter,
  async (req, res, next) => {
    try {
      const { email } = req.body;
      await authService.forgotPassword(email);
      res.json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.'
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
  async (_req, res, next) => {
    try {


      await authService.logout();
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

      const { password_hash: _, ...userData } = user;

      res.json({
        success: true,
        data: userData
      });
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  '/reset-password',
  authLimiter,
  async (req, res, next) => {
    try {
      const { code, newPassword } = req.body;

      if (!code || !newPassword) {
        res.status(400).json({
          success: false,
          error: {
            code: '400',
            message: 'Code and new password are required'
          }
        });
        return;
      }

      const { session } = await supabaseService.verifyOtp(code, 'recovery');

      if (!session) {
        res.status(400).json({
          success: false,
          error: {
            code: '400',
            message: 'Invalid or expired reset code'
          }
        });
        return;
      }

      await supabaseService.updatePassword(session.access_token, newPassword);

      res.json({
        success: true,
        message: 'Password updated successfully'
      });
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  '/verify-email',
  authLimiter,
  async (req, res, next) => {
    try {
      const { code } = req.body;

      if (!code) {
        res.status(400).json({
          success: false,
          error: {
            code: '400',
            message: 'Code is required'
          }
        });
        return;
      }

      res.json({
        success: true,
        message: 'Code processed successfully'
      });
    } catch (error) {
      next(error);
    }
  }
);



router.post(
  '/update-password',
  authMiddleware,
  async (req: AuthRequest, res, next) => {
    try {
      const { newPassword } = req.body;

      if (!newPassword) {
        res.status(400).json({
          success: false,
          error: {
            code: '400',
            message: 'New password is required'
          }
        });
        return;
      }

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
      if (!user || !user.supabase_auth_id) {
        res.status(404).json({
          success: false,
          error: {
            code: '404',
            message: 'User not found'
          }
        });
        return;
      }


      await supabaseService.updateUserPassword(user.supabase_auth_id, newPassword);

      res.json({
        success: true,
        message: 'Password updated successfully'
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;