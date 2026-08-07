import { TranslateLoader } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap, timeout } from 'rxjs/operators';

/**
 * BackendTranslateLoader — Cargador dinámico de i18n con respaldo local inmediato.
 *
 * Flujo:
 * 1. Carga primero los textos locales de respaldo `/assets/i18n/{lang}.json` (instantáneo desde la raíz).
 * 2. Intenta fusionar los textos personalizados del backend `GET /api/i18n/messages?lang={lang}`.
 * 3. Si el backend está offline o tarda > 2s, mantiene el diccionario local garantizando
 *    que NUNCA se muestren claves sin traducir (ej: APP.NAME).
 */
export class BackendTranslateLoader implements TranslateLoader {
  constructor(private readonly http: HttpClient) {}

  getTranslation(lang: string): Observable<Record<string, string>> {
    // Es CRÍTICO incluir la barra inicial '/' para que en rutas como /login la URL no se resuelva a /login/assets/i18n/es.json
    const fallbackUrl = `/assets/i18n/${lang}.json`;
    const backendUrl = `/api/i18n/messages?lang=${lang}`;

    return this.http.get<Record<string, string>>(fallbackUrl).pipe(
      switchMap((localDict) => {
        return this.http.get<Record<string, string>>(backendUrl).pipe(
          timeout(2000),
          map((remoteDict) => ({ ...localDict, ...remoteDict })),
          catchError(() => of(localDict))
        );
      }),
      catchError((err) => {
        console.error('[BackendTranslateLoader] Error cargando fallback local:', err);
        return of({});
      })
    );
  }
}
