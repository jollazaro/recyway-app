import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { TenantService } from '../services/tenant.service';

/**
 * tenantInterceptor — Interceptor Multi-Tenant.
 *
 * Inyecta automáticamente el header `X-Tenant-ID` en todas las peticiones
 * HTTP salientes hacia el backend para seleccionar el esquema/contexto del municipio.
 */
export const tenantInterceptor: HttpInterceptorFn = (req, next) => {
  const tenantService = inject(TenantService);
  const tenantId = tenantService.currentTenantId();

  if (tenantId && !req.headers.has('X-Tenant-ID')) {
    req = req.clone({
      setHeaders: { 'X-Tenant-ID': tenantId },
    });
  }

  return next(req);
};
