import { Injectable, signal, computed, inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { TenantService } from './tenant.service';
import {
  AuthRequest,
  AuthResponse,
  GoogleAuthRequest,
  RefreshTokenRequest,
  RegisterRequest,
  UserSession,
} from '../../shared/models/auth.models';
import { TenantSwitchRequest } from '../../shared/models/admin.models';

/**
 * AuthService — Servicio de Autenticación y Gestión de Sesión JWT.
 *
 * Inyecta `ApiService` por composición.
 * Mantiene el estado de sesión reactivo mediante Angular Signals.
 * Maneja el almacenamiento de tokens (Access Token y Refresh Token).
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(ApiService);
  private readonly tenantService = inject(TenantService);

  private readonly ACCESS_TOKEN_KEY = 'recyway_access_token';
  private readonly REFRESH_TOKEN_KEY = 'recyway_refresh_token';

  /** Signal con la sesión del usuario actual */
  readonly currentUser = signal<UserSession | null>(this.loadSavedSession());

  /** Signal derivado que indica si el usuario está autenticado */
  readonly isAuthenticated = computed(() => !!this.currentUser());

  /** Flag para evitar llamadas concurrentes de refresh token */
  readonly isRefreshing = signal<boolean>(false);

  /**
   * Iniciar sesión contra el backend (POST /api/auth/login).
   */
  login(credentials: AuthRequest): Observable<AuthResponse> {
    return this.api.post<AuthResponse>('/api/auth/login', credentials).pipe(
      tap((response) => this.handleAuthSuccess(response)),
      catchError((error) => {
        this.clearSession();
        return throwError(() => error);
      })
    );
  }

  /**
   * Autenticación / Registro con Google SSO (POST /api/auth/google).
   */
  loginWithGoogle(idToken: string): Observable<AuthResponse> {
    const body: GoogleAuthRequest = { idToken };
    return this.api.post<AuthResponse>('/api/auth/google', body).pipe(
      tap((response) => this.handleAuthSuccess(response)),
      catchError((error) => {
        this.clearSession();
        return throwError(() => error);
      })
    );
  }

  /**
   * Registrar nuevo usuario (POST /api/auth/register).
   */
  register(data: RegisterRequest): Observable<string> {
    return this.api.post<string>('/api/auth/register', data);
  }

  /**
   * Refrescar access token mediante el refresh token (POST /api/auth/refresh-token).
   */
  refreshToken(): Observable<AuthResponse> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      this.logout();
      return throwError(() => new Error('No refresh token available'));
    }

    this.isRefreshing.set(true);
    const body: RefreshTokenRequest = { refreshToken };

    return this.api.post<AuthResponse>('/api/auth/refresh-token', body).pipe(
      tap((response) => {
        this.handleAuthSuccess(response);
        this.isRefreshing.set(false);
      }),
      catchError((error) => {
        this.isRefreshing.set(false);
        this.logout();
        return throwError(() => error);
      })
    );
  }

  /**
   * Cerrar sesión local y revocar en backend (POST /api/auth/logout).
   */
  logout(): void {
    const refreshToken = this.getRefreshToken();
    if (refreshToken) {
      this.api.post<void>('/api/auth/logout', { refreshToken }).subscribe({
        error: () => {}, // Ignorar errores en logout
      });
    }
    this.clearSession();
  }

  /**
   * Permite a un Admin obtener un token válido para otro Tenant.
   * POST /api/auth/impersonate
   */
  impersonate(targetTenantId: string): Observable<AuthResponse> {
    const body: TenantSwitchRequest = { targetTenantId };
    return this.api.post<AuthResponse>('/api/auth/impersonate', body).pipe(
      tap((response) => this.handleAuthSuccess(response))
    );
  }

  /** Obtiene el Access Token almacenado */
  getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  /** Obtiene el Refresh Token almacenado */
  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  // ---- Métodos Privados ----

  private handleAuthSuccess(response: AuthResponse): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, response.accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, response.refreshToken);

    const session = this.decodeToken(response.accessToken);
    this.currentUser.set(session);

    // Sincronizar el tenantId de la sesión con el TenantService si está presente
    if (session?.tenantId) {
      this.tenantService.setTenantId(session.tenantId);
    }
  }

  private clearSession(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    this.currentUser.set(null);
  }

  private loadSavedSession(): UserSession | null {
    const token = this.getAccessToken();
    if (!token) return null;

    const session = this.decodeToken(token);
    // Verificar si el token ya expiró (exp en segundos)
    if (session?.exp && session.exp * 1000 < Date.now()) {
      this.clearSession();
      return null;
    }

    return session;
  }

  /**
   * Decodifica el payload de un token JWT estándar sin librerías externas.
   */
  private decodeToken(token: string): UserSession | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;

      const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
      return {
        username: payload.sub || payload.username || '',
        email: payload.email,
        roles: payload.roles || payload.authorities || [],
        tenantId: payload.tenantId,
        exp: payload.exp,
      };
    } catch {
      return null;
    }
  }
}
