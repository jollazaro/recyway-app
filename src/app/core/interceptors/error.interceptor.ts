import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject, Injector } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { catchError, throwError } from 'rxjs';

/**
 * errorInterceptor — Interceptor Global de Errores HTTP.
 *
 * Mapea los códigos de estado HTTP a claves i18n de traducción
 * y registra los errores en la consola para depuración.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const injector = inject(Injector);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let translationKey = 'ERRORS.GENERIC';

      if (error.status === 0) {
        translationKey = 'ERRORS.NETWORK_ERROR';
      } else {
        switch (error.status) {
          case 400:
            translationKey = 'ERRORS.BAD_REQUEST';
            break;
          case 403:
            translationKey = 'ERRORS.FORBIDDEN';
            break;
          case 404:
            translationKey = 'ERRORS.NOT_FOUND';
            break;
          case 500:
            translationKey = 'ERRORS.SERVER_ERROR';
            break;
        }
      }

      // Log para depuración en desarrollo (petición perezosa)
      const translate = injector.get(TranslateService);
      console.warn(`[HTTP Error ${error.status}]`, req.url, translate.instant(translationKey));

      return throwError(() => error);
    })
  );
};
