import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../environments/environment';

/**
 * apiPrefixInterceptor — Interceptor que antepone la Base URL del backend.
 *
 * Aplica ÚNICAMENTE a peticiones de API (que comiencen con '/api' o 'api/').
 * Evita modificar peticiones de recursos estáticos como los archivos i18n ('assets/i18n/*.json').
 */
export const apiPrefixInterceptor: HttpInterceptorFn = (req, next) => {
  const url = req.url;

  // Solo anteponer la URL de la API si es una llamada a la API (/api/...) y no una URL absoluta
  const isApiRequest = url.startsWith('/api') || url.startsWith('api/');
  const isAbsolute = url.startsWith('http://') || url.startsWith('https://');

  if (isApiRequest && !isAbsolute) {
    const fullUrl = `${environment.apiUrl}${url.startsWith('/') ? '' : '/'}${url}`;
    req = req.clone({ url: fullUrl });
  }

  return next(req);
};
