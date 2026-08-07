import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

/**
 * authInterceptor — Interceptor de Autenticación JWT.
 *
 * 1. Inyecta el header `Authorization: Bearer <accessToken>` en las peticiones.
 * 2. Si el backend responde 401 (Unauthorized) y no es login/refresh,
 *    llama a AuthService.refreshToken() y reintenta la petición fallida.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getAccessToken();

  // Inyectar el token de acceso si existe y no está ya presente
  let authReq = req;
  if (token && !req.headers.has('Authorization')) {
    authReq = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Manejar error 401 para renovación automática de token
      const isAuthEndpoint = req.url.includes('/api/auth/login') || req.url.includes('/api/auth/refresh-token');

      if (error.status === 401 && !isAuthEndpoint) {
        return authService.refreshToken().pipe(
          switchMap((authResponse) => {
            const retryReq = req.clone({
              setHeaders: { Authorization: `Bearer ${authResponse.accessToken}` },
            });
            return next(retryReq);
          }),
          catchError((refreshError) => {
            authService.logout();
            return throwError(() => refreshError);
          })
        );
      }

      return throwError(() => error);
    })
  );
};
