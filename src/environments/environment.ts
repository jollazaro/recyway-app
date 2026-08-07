import { Capacitor } from '@capacitor/core';

// Entorno de Desarrollo Local

/**
 * Función que resuelve la URL base de la API según la plataforma activa (Android, iOS o Web).
 * - Android (Emulador AVD): http://10.0.2.2:8080 (Alias de host)
 * - iOS (Simulador): http://localhost:8080
 * - Web (Navegador): http://localhost:8080
 */
function resolveApiUrl(): string {
  const platform = Capacitor.getPlatform();

  if (platform === 'android') {
    // El emulador de Android AVD mapea el localhost del PC en 10.0.2.2
    //cloudflared tunnel --url http://localhost:8080 

    return 'https://temp-names-sodium-suse.trycloudflare.com';
  }

  if (platform === 'ios') {
    // El simulador de iOS comparte directamente el localhost de la máquina host
    return 'https://temp-names-sodium-suse.trycloudflare.com';
  }

  // Web (Navegador)
  return 'http://localhost:8080';
}

export const environment = {
  production: false,
  apiUrl: resolveApiUrl(),
  defaultTenantId: 'recyway-core',
};
