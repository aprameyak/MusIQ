import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  
  const roles = await knex('roles').insert([
    { name: 'user', description: 'Standard user' },
    { name: 'moderator', description: 'Content moderator' },
    { name: 'admin', description: 'System administrator' }
  ]).returning('*');

  const permissions = await knex('permissions').insert([
    
    { name: 'Create Rating', resource: 'ratings', action: 'create' },
    { name: 'Read Rating', resource: 'ratings', action: 'read' },
    { name: 'Update Rating', resource: 'ratings', action: 'update' },
    { name: 'Delete Rating', resource: 'ratings', action: 'delete' },
    
    { name: 'Read User', resource: 'users', action: 'read' },
    { name: 'Update User', resource: 'users', action: 'update' },
    { name: 'Delete User', resource: 'users', action: 'delete' },
    
    { name: 'Read Music', resource: 'music', action: 'read' },
    { name: 'Create Music', resource: 'music', action: 'create' },
    { name: 'Update Music', resource: 'music', action: 'update' },
    { name: 'Delete Music', resource: 'music', action: 'delete' },
    
    { name: 'Admin All', resource: 'admin', action: 'all' }
  ]).returning('*');

  const userRole = roles.find(r => r.name === 'user');
  const moderatorRole = roles.find(r => r.name === 'moderator');
  const adminRole = roles.find(r => r.name === 'admin');

  if (userRole) {
    await knex('role_permissions').insert([
      { role_id: userRole.id, permission_id: permissions.find(p => p.resource === 'ratings' && p.action === 'create')!.id },
      { role_id: userRole.id, permission_id: permissions.find(p => p.resource === 'ratings' && p.action === 'read')!.id },
      { role_id: userRole.id, permission_id: permissions.find(p => p.resource === 'users' && p.action === 'read')!.id },
      { role_id: userRole.id, permission_id: permissions.find(p => p.resource === 'music' && p.action === 'read')!.id }
    ]);
  }

  if (moderatorRole) {
    const moderatorPermissions = [
      ...permissions.filter(p => p.resource === 'ratings'),
      ...permissions.filter(p => p.resource === 'users' && p.action !== 'delete'),
      ...permissions.filter(p => p.resource === 'music')
    ];

    await knex('role_permissions').insert(
      moderatorPermissions.map(p => ({
        role_id: moderatorRole.id,
        permission_id: p.id
      }))
    );
  }

  if (adminRole) {
    await knex('role_permissions').insert(
      permissions.map(p => ({
        role_id: adminRole.id,
        permission_id: p.id
      }))
    );
  }
}
