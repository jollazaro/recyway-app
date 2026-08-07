import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { SplashScreenComponent } from './core/components/splash-screen/splash-screen.component';
import { ThemeService } from './core/services/theme.service';
import { LanguageService } from './core/services/language.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, IonApp, IonRouterOutlet, SplashScreenComponent],
  templateUrl: 'app.component.html',
})
export class AppComponent {
  /** Inyectar ThemeService y LanguageService para inicializar tema e i18n al arrancar */
  private readonly themeService = inject(ThemeService);
  private readonly languageService = inject(LanguageService);

  /** Mostrar la pantalla Splash al iniciar la app */
  showSplash = true;

  /** Ocultar Splash al finalizar las animaciones */
  onSplashFinished(): void {
    this.showSplash = false;
  }
}
