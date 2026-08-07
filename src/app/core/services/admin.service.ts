import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import {
  TenantRequest,
  RoleRequest,
  UserAdminDetails,
} from '../../shared/models/admin.models';

/**
 * AdminService — Gestiona las operaciones administrativas de usuarios y tenants.
 *
 * Se comunica con el backend mediante `ApiService` utilizando composición.
 */
@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly api = inject(ApiService);

  /**
   * Obtiene la lista de todos los usuarios registrados en el tenant actual.
   * GET /api/admin/users
   */
  listUsers(): Observable<UserAdminDetails[]> {
    return this.api.get<UserAdminDetails[]>('/api/admin/users');
  }

  /**
   * Asigna un rol específico a un usuario.
   * POST /api/admin/users/{userId}/roles
   */
  assignRole(userId: number, role: string): Observable<string> {
    const body: RoleRequest = { role };
    return this.api.post<string>(`/api/admin/users/${userId}/roles`, body);
  }

  /**
   * Revoca un rol específico de un usuario.
   * DELETE /api/admin/users/{userId}/roles/{role}
   */
  revokeRole(userId: number, role: string): Observable<string> {
    return this.api.delete<string>(`/api/admin/users/${userId}/roles/${role}`);
  }

  /**
   * Habilita o deshabilita a un usuario en el tenant actual.
   * PATCH /api/admin/users/{userId}/status?enabled={true/false}
   */
  toggleUserStatus(userId: number, enabled: boolean): Observable<string> {
    const path = `/api/admin/users/${userId}/status?enabled=${enabled}`;
    return this.api.patch<string>(path);
  }

  /**
   * Provisiona un nuevo tenant (municipio o cliente) en la plataforma.
   * POST /api/tenants
   */
  createTenant(tenantId: string): Observable<string> {
    const body: TenantRequest = { tenantId };
    return this.api.post<string>('/api/tenants', body);
  }
}
