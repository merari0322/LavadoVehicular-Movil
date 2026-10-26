import { request } from '../../api/httpClient';

// permisos de los 3 roles fijos (admin, Gestión > Roles) contra el security-service
// (/admin/roles-permissions). ADR-015: los roles son fijos (ADMIN/OPERATOR/CLIENT), solo sus
// permisos se editan; no hay crear ni borrar rol.

export type RoleCode = 'ADMIN' | 'OPERATOR' | 'CLIENT';

export interface PermissionView {
  id: number;
  code: string;
  name: string;
  resource: string;
  action: string;
}

export interface RolePermissionsView {
  role: RoleCode;
  permissionIds: number[];
}

export interface RolePermissionsMatrix {
  permissions: PermissionView[];
  roles: RolePermissionsView[];
}

export const rolePermissionsService = {
  matrix(): Promise<RolePermissionsMatrix> {
    return request<RolePermissionsMatrix>('GET', '/admin/roles-permissions');
  },

  update(role: RoleCode, permissionIds: number[]): Promise<RolePermissionsView> {
    return request<RolePermissionsView>('PUT', '/admin/roles-permissions/' + role, { body: { permissionIds } });
  },
};
