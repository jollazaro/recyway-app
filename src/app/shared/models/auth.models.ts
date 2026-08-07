/**
 * Petición de inicio de sesión con credenciales
 * Coincide con AuthRequest.java
 */
export interface AuthRequest {
  email: string;
  password: string;
}

/**
 * Petición de inicio de sesión con Google (SSO)
 */
export interface GoogleAuthRequest {
  idToken: string;
}

/**
 * Respuesta del backend tras autenticarse o refrescar token
 * Coincide con AuthResponse.java
 */
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
}

/**
 * Petición para solicitar un nuevo access token
 * Coincide con RefreshTokenRequest.java
 */
export interface RefreshTokenRequest {
  refreshToken: string;
}

/**
 * Petición de registro público de usuarios
 * Coincide con RegisterRequest.java (requiere Ley 25.326 privacyPolicyAccepted)
 */
export interface RegisterRequest {
  email: string;
  password: string;
  privacyPolicyAccepted: boolean;
}

/**
 * Sesión activa del usuario decodificada del JWT
 */
export interface UserSession {
  username: string;
  email?: string;
  roles: string[];
  tenantId?: string;
  exp?: number;
}
