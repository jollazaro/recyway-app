import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

/**
 * ApiService — Cliente genérico HTTP por COMPOSICIÓN.
 *
 * En lugar de herencia (`extends BaseApiService`), los servicios de dominio
 * (como AuthService, OrderService, etc.) inyectan este servicio.
 *
 * Trabaja en conjunto con la pipeline de interceptores HTTP (apiPrefix, tenant, auth, error).
 */
@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);

  /**
   * Realiza una petición GET tipada.
   * @param path Ruta relativa (ej: '/api/auth/test')
   * @param params Parámetros de consulta opcionales
   */
  get<T>(path: string, params?: HttpParams): Observable<T> {
    return this.http.get<T>(path, { params });
  }

  /**
   * Realiza una petición POST tipada.
   * @param path Ruta relativa (ej: '/api/auth/login')
   * @param body Cuerpo de la petición
   */
  post<T>(path: string, body?: unknown): Observable<T> {
    return this.http.post<T>(path, body);
  }

  /**
   * Realiza una petición PUT tipada.
   * @param path Ruta relativa
   * @param body Cuerpo de la petición
   */
  put<T>(path: string, body?: unknown): Observable<T> {
    return this.http.put<T>(path, body);
  }

  /**
   * Realiza una petición DELETE tipada.
   * @param path Ruta relativa
   */
  delete<T>(path: string): Observable<T> {
    return this.http.delete<T>(path);
  }

  /**
   * Realiza una petición PATCH tipada.
   * @param path Ruta relativa
   * @param body Cuerpo de la petición opcional
   */
  patch<T>(path: string, body?: unknown): Observable<T> {
    return this.http.patch<T>(path, body);
  }
}
