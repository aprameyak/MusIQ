import { getDatabasePool } from '../database/connection';
import { logger } from '../config/logger';

export interface AuditLogData {
  userId?: string;
  action: string;
  resourceType?: string;
  resourceId?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
}

export class AuditService {
  private pool = getDatabasePool();

  async log(data: AuditLogData): Promise<void> {
    try {
      await this.pool.query(
        `INSERT INTO audit_logs (user_id, action, resource_type, resource_id, ip_address, user_agent, metadata)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          data.userId || null,
          data.action,
          data.resourceType || null,
          data.resourceId || null,
          data.ipAddress || null,
          data.userAgent || null,
          data.metadata ? JSON.stringify(data.metadata) : null
        ]
      );

      logger.info('Audit log created', data);
    } catch (error) {
      logger.error('Failed to create audit log', error);
      
    }
  }

  async getLogs(userId?: string, limit: number = 100): Promise<any[]> {
    let query = 'SELECT * FROM audit_logs WHERE 1=1';
    const params: any[] = [];
    let paramCount = 1;

    if (userId) {
      query += ` AND user_id = $${paramCount++}`;
      params.push(userId);
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramCount++}`;
    params.push(limit);

    const result = await this.pool.query(query, params);
    return result.rows;
  }
}

