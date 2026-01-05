import { NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';
import { AuditService } from '../security/audit.service';

const auditService = new AuditService();

export const auditMiddleware = (action: string, resourceType?: string) => {
  return async (req: AuthRequest, res: any, next: NextFunction): Promise<void> => {
    // Log after response is sent
    const originalSend = res.send;
    res.send = function (data: any) {
      // Extract resource ID from params or body
      const resourceId = req.params.id || req.body?.id || req.body?.musicItemId;

      auditService.log({
        userId: req.userId,
        action,
        resourceType: resourceType || req.route?.path,
        resourceId,
        ipAddress: req.ip || req.socket.remoteAddress || undefined,
        userAgent: req.headers['user-agent'] || undefined,
        metadata: {
          method: req.method,
          path: req.path,
          statusCode: res.statusCode
        }
      }).catch(err => {
        // Don't break the request if audit logging fails
        console.error('Audit logging error:', err);
      });

      return originalSend.call(this, data);
    };

    next();
  };
};

