import { Injectable, signal, effect } from '@angular/core';

export type ThemeMode = 'light' | 'dark' | 'system';

/**
 * ThemeService — Gestiona el cambio entre temas claro/oscuro/sistema.
 *
 * Sincroniza las clases de Ionic (`ion-palette-dark`) y Tailwind CSS v4 (`dark`)
 * en el elemento <body> para mantener consistencia entre ambos frameworks.
 *
 * Persiste la preferencia del usuario en localStorage.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly STORAGE_KEY = 'recyway-theme';
  private readonly mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

  /** Signal con el modo de tema actual */
  readonly mode = signal<ThemeMode>(this.loadSavedTheme());

  constructor() {
    // Aplicar el tema cada vez que cambie el signal
    effect(() => {
      this.applyTheme(this.mode());
    });

    // Escuchar cambios en la preferencia del sistema operativo
    this.mediaQuery.addEventListener('change', () => {
      if (this.mode() === 'system') {
        this.applyTheme('system');
      }
    });
  }

  /**
   * Establece el modo de tema.
   * @param mode - 'light', 'dark' o 'system'
   */
  setTheme(mode: ThemeMode): void {
    this.mode.set(mode);
    localStorage.setItem(this.STORAGE_KEY, mode);
  }

  /**
   * Cicla entre temas: sistema → claro → oscuro → sistema
   */
  toggleTheme(): void {
    const cycle: ThemeMode[] = ['system', 'light', 'dark'];
    const currentIndex = cycle.indexOf(this.mode());
    const nextIndex = (currentIndex + 1) % cycle.length;
    this.setTheme(cycle[nextIndex]);
  }

  /**
   * Retorna si el modo oscuro está activo actualmente (resuelto).
   */
  get isDark(): boolean {
    const mode = this.mode();
    if (mode === 'system') {
      return this.mediaQuery.matches;
    }
    return mode === 'dark';
  }

  // ---- Métodos Privados ----

  private loadSavedTheme(): ThemeMode {
    const saved = localStorage.getItem(this.STORAGE_KEY) as ThemeMode | null;
    if (saved && ['light', 'dark', 'system'].includes(saved)) {
      return saved;
    }
    return 'system';
  }

  private applyTheme(mode: ThemeMode): void {
    const shouldBeDark = mode === 'dark' || (mode === 'system' && this.mediaQuery.matches);
    const body = document.body;

    if (shouldBeDark) {
      body.classList.add('dark', 'ion-palette-dark');
    } else {
      body.classList.remove('dark', 'ion-palette-dark');
    }
  }
}
