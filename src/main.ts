import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { TranslateLoader, provideTranslateService } from '@ngx-translate/core';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';

// Interceptores HTTP funcionales
import { apiPrefixInterceptor } from './app/core/interceptors/api-prefix.interceptor';
import { tenantInterceptor } from './app/core/interceptors/tenant.interceptor';
import { authInterceptor } from './app/core/interceptors/auth.interceptor';
import { errorInterceptor } from './app/core/interceptors/error.interceptor';

// Cargador de traducciones desde Backend
import { BackendTranslateLoader } from './app/core/i18n/backend-translate.loader';

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular({ mode: 'md' }), // Fuerza Material Design globalmente
    provideRouter(routes, withPreloading(PreloadAllModules)),

    // Pipeline de Interceptores HTTP (Orden: Prefix -> Tenant -> Auth -> Error)
    provideHttpClient(
      withInterceptors([
        apiPrefixInterceptor,
        tenantInterceptor,
        authInterceptor,
        errorInterceptor,
      ])
    ),

    // Configuración de i18n con BackendTranslateLoader + Fallback Local
    provideTranslateService({
      loader: {
        provide: TranslateLoader,
        useFactory: (http: HttpClient) => new BackendTranslateLoader(http),
        deps: [HttpClient],
      },
      fallbackLang: 'es',
      lang: 'es',
    }),
  ],
});
