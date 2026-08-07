import { Injectable, signal, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

/** Idiomas soportados */
export type AppLanguage = 'es' | 'en';

/** Lista de códigos de idioma soportados */
const SUPPORTED_LANGUAGES: AppLanguage[] = ['es', 'en'];

/** Idioma por defecto */
const DEFAULT_LANGUAGE: AppLanguage = 'es';

/**
 * LanguageService — Gestiona el idioma/localización de la aplicación.
 *
 * Sincroniza el estado del idioma con TranslateService (@ngx-translate),
 * detecta el idioma del dispositivo/navegador y lo persiste en localStorage.
 */
@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly translate = inject(TranslateService);
  private readonly STORAGE_KEY = 'recyway-language';

  /** Signal con el idioma actual */
  readonly currentLanguage = signal<AppLanguage>(this.detectLanguage());

  constructor() {
    const initialLang = this.currentLanguage();
    this.translate.setFallbackLang(DEFAULT_LANGUAGE);
    this.translate.use(initialLang);
    document.documentElement.lang = initialLang;
  }

  /**
   * Cambia el idioma de la aplicación.
   * @param lang - Código de idioma ('es' o 'en')
   */
  setLanguage(lang: AppLanguage): void {
    this.currentLanguage.set(lang);
    localStorage.setItem(this.STORAGE_KEY, lang);
    document.documentElement.lang = lang;
    this.translate.use(lang);
  }

  /**
   * Obtiene la lista de idiomas soportados.
   */
  getSupportedLanguages(): AppLanguage[] {
    return [...SUPPORTED_LANGUAGES];
  }

  // ---- Métodos Privados ----

  /**
   * Detecta el idioma preferido del usuario.
   * Prioridad: localStorage > navigator.language > fallback 'es'
   */
  private detectLanguage(): AppLanguage {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (saved && this.isSupported(saved)) {
      return saved as AppLanguage;
    }

    const browserLang = typeof navigator !== 'undefined' ? navigator.language?.split('-')[0] : null;
    if (browserLang && this.isSupported(browserLang)) {
      return browserLang as AppLanguage;
    }

    return DEFAULT_LANGUAGE;
  }

  private isSupported(lang: string): boolean {
    return SUPPORTED_LANGUAGES.includes(lang as AppLanguage);
  }
}
