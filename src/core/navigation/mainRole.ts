import type { UserRole } from '../services/auth';

// si tiene varios roles, entra al de más privilegios (y ese grupo de pantallas es el que existe)
export function mainRole(roles: UserRole[]): UserRole {
  if (roles.includes('ADMIN')) return 'ADMIN';
  if (roles.includes('OPERATOR')) return 'OPERATOR';
  return 'CLIENT';
}
