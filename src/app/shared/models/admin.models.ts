/**
 * Petición para provisionar un nuevo Tenant.
 * Coincide con TenantRequest en el backend.
 */
export interface TenantRequest {
  tenantId: string; // Patrón: ^[a-z][a-z0-9_]*$
}

/**
 * Petición para realizar impersonación (Admin Switch Tenant).
 * Coincide con TenantSwitchRequest en el backend.
 */
export interface TenantSwitchRequest {
  targetTenantId: string;
}

/**
 * Petición para asignar/revocar un rol a un usuario.
 * Coincide con RoleRequest en el backend.
 */
export interface RoleRequest {
  role: string;
}

/**
 * Representa los detalles de un usuario en el panel de administración.
 * Coincide con el listado de usuarios de GET /api/admin/users.
 */
export interface UserAdminDetails {
  id: number;
  username: string;
  email?: string;
  enabled: boolean;
  roles: string[];
  tenantId?: string;
  [key: string]: unknown; // Permite propiedades adicionales dinámicas
}
