# Guía de Arquitectura Frontend: RecyWay App

Este documento define los estándares, arquitectura y buenas prácticas para el desarrollo de la aplicación cliente (Web/Mobile) de RecyWay. 

La aplicación cliente utiliza un enfoque de **Un Solo Proyecto (Single Codebase)** llamado `recyway-app`. Todo el código fuente se unificará y se compilará para Web, Android y iOS desde el mismo lugar.

---

## 0. Inicio rápido: Creación del proyecto desde cero 🚀

Para arrancar el proyecto `recyway-app` con el stack definitivo (**Angular + Ionic + Capacitor + Tailwind CSS v4**), el equipo debe seguir estos pasos exactos desde la terminal:

### A. Instalar herramientas globales
```bash
npm install -g @ionic/cli @angular/cli
```

### B. Crear el proyecto base (Angular + Ionic)
Ejecutar este comando en la carpeta raíz de tus proyectos (junto a `recyway-backend`):
```bash
ionic start recyway-app blank --type=angular --capacitor
cd recyway-app
```

### C. Configurar Capacitor (Mobile)
Inicializa Capacitor y añade las plataformas móviles:
```bash
npx cap init recyway-app com.recyway.app
npm install @capacitor/android @capacitor/ios
npx cap add android
npx cap add ios
```

### D. Instalar y configurar Tailwind CSS v4
Tailwind CSS v4 utiliza un enfoque **CSS-first** — no requiere archivo `tailwind.config.js` ni comando `init`. La configuración se realiza directamente en CSS.

#### 1. Instalar dependencias:
```bash
npm install -D tailwindcss @tailwindcss/postcss postcss
```

#### 2. Crear archivo `.postcssrc.json` en la raíz del proyecto:
```json
{
  "plugins": {
    "@tailwindcss/postcss": {}
  }
}
```

#### 3. Importar Tailwind en `src/global.scss`:
Añadir la siguiente línea **al inicio** del archivo, antes de los imports de Ionic:
```scss
@use "tailwindcss";
```

> **Nota sobre SCSS**: Se usa `@use` en lugar de `@import` para evitar las advertencias de deprecación de Dart Sass 3.0. Tailwind v4 se procesa a través de PostCSS, no de Sass, por lo que ambas directivas funcionan, pero `@use` es la recomendada en archivos `.scss`.

---

## 1. Configuración Clave: Día 1 📋

Antes de comenzar a desarrollar funcionalidades, el proyecto debe aplicar estas 5 reglas de configuración estructural:

### Paso 1: Consistencia Visual (Material Design)
Para asegurar que la aplicación se vea exactamente igual en la Web, Android e iOS (evitando las diferencias visuales nativas de Safari/iOS), se debe forzar el modo **Material Design** en la configuración raíz de Ionic.

El proyecto usa **Standalone Components** (sin `NgModules`), por lo que la configuración se aplica mediante `provideIonicAngular()` en `src/main.ts`:

```typescript
import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular({ mode: 'md' }), // Fuerza Material Design globalmente
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideHttpClient(withInterceptors([])), // Se agregarán interceptores aquí
  ],
});
```

### Paso 2: Temas y Diseño Unificados
Todas las variables de diseño **deben** centralizarse. Define tus colores primarios, tipografías y bordes **únicamente en el archivo `src/theme/variables.scss` de Ionic**. No utilices colores quemados (hardcoded) en el código HTML ni en componentes que rompan la paleta principal.

**Integración con Tailwind CSS v4**: Para extender o personalizar el tema de Tailwind, utiliza la directiva `@theme` directamente en `src/global.scss`. Esto reemplaza al antiguo `tailwind.config.js`:

```scss
@use "tailwindcss";

@theme {
  --color-primary: #2dd36f;    /* Verde RecyWay */
  --color-secondary: #3dc2ff;
  --color-danger: #eb445a;
  --font-sans: 'Inter', sans-serif;
}
```

### Paso 3: Modo Claro y Oscuro (Dark/Light Mode)
El sistema debe estar preparado desde el día 1 para soportar temas dinámicos:

1. **Ionic**: Utiliza las variables CSS bajo `@media (prefers-color-scheme: dark)` o la clase `.ion-palette-dark` en tu `variables.scss`. El import `@ionic/angular/css/palettes/dark.system.css` en `global.scss` ya habilita el dark mode automático basado en las preferencias del sistema operativo.

2. **Tailwind CSS v4**: Por defecto, Tailwind v4 respeta `prefers-color-scheme: dark` automáticamente con el prefijo `dark:`. Para habilitar adicionalmente el **toggle manual por clase** (necesario para el `ThemeService`), añadir en `global.scss`:
   ```scss
   @use "tailwindcss";

   /* Habilita dark mode tanto por media query del sistema como por clase .dark */
   @custom-variant dark (&:where(.dark, .dark *));
   ```
   Esto permite que `dark:bg-gray-900` se active cuando exista la clase `.dark` en el `<html>` o `<body>`.

3. **Angular Service**: Crea un `ThemeService` en `src/app/core/services/theme.service.ts` que permita al usuario cambiar manualmente entre Claro, Oscuro o "Predeterminado del Sistema". El servicio debe agregar/remover la clase `dark` e `ion-palette-dark` en el `<body>` para sincronizar Ionic y Tailwind.

### Paso 4: Internacionalización y Manejo de Idioma (i18n)
La app debe soportar múltiples idiomas sin necesidad de hardcodear texto en el HTML.

1. Instala la librería **`@ngx-translate/core`** y su loader HTTP:
   ```bash
   npm install @ngx-translate/core @ngx-translate/http-loader
   ```

2. Configura el servicio de traducción en `src/main.ts` usando la API standalone:
   ```typescript
   import { provideTranslateService } from '@ngx-translate/core';
   import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';

   // Dentro del array de providers:
   provideTranslateService({
     loader: provideTranslateHttpLoader({
       prefix: './assets/i18n/',
       suffix: '.json'
     }),
     defaultLanguage: 'es'
   }),
   ```

3. Crea los archivos de traducciones base en formato JSON: `src/assets/i18n/es.json` y `src/assets/i18n/en.json`.

4. En cada componente standalone que necesite traducciones, importa directamente:
   ```typescript
   import { TranslatePipe, TranslateDirective } from '@ngx-translate/core';

   @Component({
     imports: [TranslatePipe, TranslateDirective],
     template: `<h1>{{ 'HOME.TITLE' | translate }}</h1>`
   })
   ```

5. Crea un `LanguageService` en `src/app/core/services/language.service.ts` que al arrancar la app lea el idioma del dispositivo (mediante `Capacitor Device Plugin` o `navigator.language`). Si el idioma no está soportado, usa Español (`es`) por defecto.

### Paso 5: Integración de Lógicas Externas
Para librerías externas que necesiten configuración de colores mediante TypeScript (ej: **Ngx-charts** o **Mapbox/Leaflet**), **debes leer las variables CSS del `:root`** desde tus componentes de Angular. Esto garantiza que si el `ThemeService` cambia a modo oscuro, los mapas y gráficos se actualicen automáticamente sin tocar código duro.

```typescript
// Ejemplo: leer variable CSS desde TypeScript
const primaryColor = getComputedStyle(document.documentElement)
  .getPropertyValue('--ion-color-primary').trim();
```

---

## 2. Estructura de Carpetas (Clean Architecture)

Organiza el proyecto dentro de `src/app/` siguiendo esta convención:

```text
src/
 ├── app/
 │    ├── core/                      # Singleton global (servicios base)
 │    │    ├── interceptors/         # authInterceptor, errorInterceptor (funciones)
 │    │    ├── guards/               # AuthGuards para proteger rutas
 │    │    └── services/             # AuthService, ThemeService, LanguageService
 │    ├── shared/                    # Componentes UI Ionic/Tailwind reutilizables
 │    │    ├── components/
 │    │    └── models/               # DTOs Globales (Interfaces TS)
 │    ├── features/                  # Módulos perezosos (Lazy loaded)
 │    │    ├── auth/                 # Login / Registro
 │    │    ├── orders/               # Creación y gestión de Órdenes (Mapas)
 │    │    └── profile/              # Perfil de usuario (A desarrollar en backend)
 ├── assets/
 │    └── i18n/                      # Archivos de idioma (es.json, en.json)
 ├── theme/
 │    └── variables.scss             # Única fuente de verdad de diseño (Colores Light/Dark)
 └── environments/                   # Variables de entorno
```

> **Nota sobre Standalone Components**: Al usar componentes standalone, no se necesitan `NgModules` (`.module.ts`). En su lugar, cada componente declara sus imports directamente en el decorador `@Component({ imports: [...] })`. Las rutas lazy-loaded utilizan `loadComponent` en lugar de `loadChildren`:
> ```typescript
> {
>   path: 'auth',
>   loadComponent: () => import('./features/auth/login/login.page').then(m => m.LoginPage)
> }
> ```

---

## 3. Gestión del Cliente HTTP y Seguridad 🔐

> [!IMPORTANT]  
> El backend utiliza **seguridad basada en JWT con expiración corta (15 min)** y **Refresh Tokens (7 días)**. Es crítico implementar la lógica de interceptores en Angular correctamente para no perder la sesión.

Para interactuar con el backend, se usará el `HttpClient` nativo de Angular, configurado con `provideHttpClient()` en `src/main.ts`.

### Interceptor de Autenticación (Functional Interceptor)
En Angular con Standalone Components, los interceptores se definen como **funciones** (no clases). Crea el archivo `src/app/core/interceptors/auth.interceptor.ts`:

```typescript
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, switchMap, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getAccessToken();

  // 1. Inyectar el Token
  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // 2. Renovación Automática (Refresh Token)
      if (error.status === 401 && !req.url.includes('/auth/refresh-token')) {
        return authService.refreshToken().pipe(
          switchMap(() => {
            const newToken = authService.getAccessToken();
            const retryReq = req.clone({
              setHeaders: { Authorization: `Bearer ${newToken!}` }
            });
            return next(retryReq);
          }),
          catchError(() => {
            // Si falla el refresh: borrar tokens y redirigir al Login
            authService.logout();
            return throwError(() => error);
          })
        );
      }
      return throwError(() => error);
    })
  );
};
```

Registrarlo en `src/main.ts`:
```typescript
provideHttpClient(withInterceptors([authInterceptor, errorInterceptor])),
```

---

## 4. Modelos de Datos y DTOs

El frontend **debe** crear Interfaces de TypeScript que reflejen exactamente los DTOs de las APIs Java del backend. Estas interfaces se ubican en `src/app/shared/models/`.

*   **Evitar tipos dinámicos**: Nunca usar `any` para las respuestas HTTP.
*   **Ejemplo de flujo**:
    1.  UI emite evento para crear orden.
    2.  Se mapea a la interfaz `OrderRequest`.
    3.  El `OrderService` realiza el `HttpClient.post<OrderResponse>(...)`.
    4.  La vista consume un `Observable<OrderResponse>` fuertemente tipado.

---

## 5. Manejo Global de Errores

El backend devuelve códigos de estado HTTP estándar. Crea un interceptor funcional de errores en `src/app/core/interceptors/error.interceptor.ts` para procesarlos y traducirlos usando `@ngx-translate`:

```typescript
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const translate = inject(TranslateService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let messageKey = 'ERRORS.GENERIC';

      switch (error.status) {
        case 400: messageKey = 'ERRORS.BAD_REQUEST'; break;
        case 403: messageKey = 'ERRORS.FORBIDDEN'; break;
        case 500: messageKey = 'ERRORS.SERVER_ERROR'; break;
      }

      // Mostrar mensaje traducido al usuario (vía toast, alert, etc.)
      console.error(translate.instant(messageKey));
      return throwError(() => error);
    })
  );
};
```

*   **400 (Bad Request)**: Problema de validación. Mostrar mensaje traducido al usuario ("Datos incorrectos").
*   **403 (Forbidden)**: El rol del JWT no permite la acción. Mostrar "Permisos insuficientes" (traducido).
*   **500 (Internal Error)**: Error en Java/PostgreSQL. Mostrar "Servicio no disponible momentáneamente" y ocultar detalles técnicos.

> [!NOTE]  
> **Transparencia de Infraestructura**: El backend está montado con arquitectura *Blue-Green Deployment*. Esto significa que cuando el backend se actualiza a nuevas versiones, no habrá cortes de conexión. Tu App en Angular no necesita configuraciones especiales de reintentos por caídas de servidor; el backend siempre estará en línea.
