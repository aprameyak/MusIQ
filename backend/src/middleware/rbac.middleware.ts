import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';
import { CustomError } from './error.middleware';
import { getDatabasePool } from '../database/connection';

export const requireRole = (...roles: string[]) => {
  return async (req: AuthRequest, _res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.userRole) {
        throw new CustomError('Unauthorized', 401);
      }

      if (!roles.includes(req.userRole)) {
        throw new CustomError('Forbidden: Insufficient permissions', 403);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

export const requirePermission = (resource: string, action: string) => {
  return async (req: AuthRequest, _res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.userId) {
        throw new CustomError('Unauthorized', 401);
      }

      const pool = getDatabasePool();
      
      const permissionResult = await pool.query(
        `SELECT COUNT(*) as count
         FROM user_roles ur
         JOIN role_permissions rp ON ur.role_id = rp.role_id
         JOIN permissions p ON rp.permission_id = p.id
         WHERE ur.user_id = $1 AND p.resource = $2 AND p.action = $3`,
        [req.userId, resource, action]
      );

      if (parseInt(permissionResult.rows[0].count) === 0) {
        throw new CustomError('Forbidden: Insufficient permissions', 403);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

export const requireOwnership = (_userIdField: string = 'user_id') => {
  return async (req: AuthRequest, _res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.userId) {
        throw new CustomError('Unauthorized', 401);
      }

      const resourceId = req.params.id;
      if (!resourceId) {
        throw new CustomError('Resource ID required', 400);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
