import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

/**
 * TenantService — Gestiona la resolución y selección del Tenant/Municipio activo.
 *
 * Estrategia de resolución:
 * 1. Web: Extrae subdominio (ej: caba.recyway.com -> 'caba').
 * 2. Mobile/Local: Lee de localStorage o utiliza el tenant por defecto.
 */
@Injectable({ providedIn: 'root' })
export class TenantService {
  private readonly http = inject(HttpClient);
  private readonly STORAGE_KEY = 'recyway-tenant-id';

  /** Signal con el tenantId activo */
  readonly currentTenantId = signal<string>(this.resolveInitialTenant());

  /**
   * Cambia el tenant activo y lo persiste.
   * @param tenantId ID del municipio/empresa (ej: 'caba', 'cordoba', 'santafe')
   */
  setTenantId(tenantId: string): void {
    const sanitized = tenantId.trim().toLowerCase();
    if (this.currentTenantId() === sanitized) return;

    this.currentTenantId.set(sanitized);
    localStorage.setItem(this.STORAGE_KEY, sanitized);
  }

  /**
   * Verifica en el backend si un tenantId existe.
   * Llama a GET /api/auth/check-tenant/{tenantId}
   */
  checkTenantExists(tenantId: string): Observable<boolean> {
    const sanitized = tenantId.trim().toLowerCase();
    if (!sanitized) return of(false);

    return this.http.get<void>(`${environment.apiUrl}/api/auth/check-tenant/${sanitized}`).pipe(
      map(() => true),
      catchError(() => of(false))
    );
  }

  // ---- Métodos Privados ----

  private resolveInitialTenant(): string {
    // 1. Extraer subdominio en la web
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      if (hostname.includes('.recyway.com') && !hostname.startsWith('www')) {
        return hostname.split('.')[0].toLowerCase();
      }
    }

    // 2. Leer de localStorage o usar fallback de environment
    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (saved) {
      return saved.toLowerCase();
    }

    return environment.defaultTenantId || 'recyway-core';
  }
}
