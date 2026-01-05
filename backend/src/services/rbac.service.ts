import { getDatabasePool } from '../database/connection';
import { logger } from '../config/logger';

export interface Role {
  id: string;
  name: string;
  description: string;
}

export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
}

export class RBACService {
  private pool = getDatabasePool();

  async createRole(name: string, description?: string): Promise<Role> {
    const result = await this.pool.query(
      'INSERT INTO roles (name, description) VALUES ($1, $2) RETURNING *',
      [name, description || null]
    );

    logger.info('Role created', { roleId: result.rows[0].id, name });
    return result.rows[0];
  }

  async createPermission(name: string, resource: string, action: string): Promise<Permission> {
    const result = await this.pool.query(
      'INSERT INTO permissions (name, resource, action) VALUES ($1, $2, $3) RETURNING *',
      [name, resource, action]
    );

    logger.info('Permission created', { permissionId: result.rows[0].id, name });
    return result.rows[0];
  }

  async assignPermissionToRole(roleId: string, permissionId: string): Promise<void> {
    await this.pool.query(
      'INSERT INTO role_permissions (role_id, permission_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [roleId, permissionId]
    );

    logger.info('Permission assigned to role', { roleId, permissionId });
  }

  async assignRoleToUser(userId: string, roleId: string): Promise<void> {
    await this.pool.query(
      'INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [userId, roleId]
    );

    logger.info('Role assigned to user', { userId, roleId });
  }

  async getUserRoles(userId: string): Promise<Role[]> {
    const result = await this.pool.query(
      `SELECT r.* FROM roles r
       JOIN user_roles ur ON r.id = ur.role_id
       WHERE ur.user_id = $1`,
      [userId]
    );

    return result.rows;
  }

  async getRolePermissions(roleId: string): Promise<Permission[]> {
    const result = await this.pool.query(
      `SELECT p.* FROM permissions p
       JOIN role_permissions rp ON p.id = rp.permission_id
       WHERE rp.role_id = $1`,
      [roleId]
    );

    return result.rows;
  }

  async getUserPermissions(userId: string): Promise<Permission[]> {
    const result = await this.pool.query(
      `SELECT DISTINCT p.* FROM permissions p
       JOIN role_permissions rp ON p.id = rp.permission_id
       JOIN user_roles ur ON rp.role_id = ur.role_id
       WHERE ur.user_id = $1`,
      [userId]
    );

    return result.rows;
  }

  async hasPermission(userId: string, resource: string, action: string): Promise<boolean> {
    const result = await this.pool.query(
      `SELECT COUNT(*) as count
       FROM user_roles ur
       JOIN role_permissions rp ON ur.role_id = rp.role_id
       JOIN permissions p ON rp.permission_id = p.id
       WHERE ur.user_id = $1 AND p.resource = $2 AND p.action = $3`,
      [userId, resource, action]
    );

    return parseInt(result.rows[0].count) > 0;
  }
}

