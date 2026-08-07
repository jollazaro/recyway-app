import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { IonContent, IonSpinner } from '@ionic/angular/standalone';

import { AuthService } from '../../../core/services/auth.service';
import { TenantService } from '../../../core/services/tenant.service';
import { ThemeService } from '../../../core/services/theme.service';
import { LanguageService } from '../../../core/services/language.service';

export type AuthTab = 'login' | 'register';

/**
 * LoginPage — Pantalla de Autenticación (Login y Registro Ultraligero).
 *
 * Características UX:
 * - 2 Pestañas: Ingresar y Registrarse.
 * - Registro ultraligero: solo Email, Password y Aceptación de Privacidad (Ley 25.326).
 * - Generación automática de Username único en backend/registro (actualizable en Perfil).
 * - Sección informativa de Aliados (Recolectores/Eco-Puntos) integrada en la vista de Registro.
 */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslatePipe,
    IonContent,
    IonSpinner,
  ],
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  readonly tenantService = inject(TenantService);
  readonly themeService = inject(ThemeService);
  readonly languageService = inject(LanguageService);
  private readonly translate = inject(TranslateService);

  /** Pestaña activa ('login' | 'register') */
  activeTab: AuthTab = 'login';

  /** Visibilidad de contraseña */
  showPassword = false;

  /** Estado de carga durante peticiones HTTP */
  isLoading = false;

  /** Mensaje de error a desplegar */
  errorMessage: string | null = null;

  /** Mensaje de éxito a desplegar */
  successMessage: string | null = null;

  /** Formulario reactivo de Login */
  loginForm: FormGroup = this.fb.group({
    tenantId: [this.tenantService.currentTenantId() || 'recyway-core', [Validators.required]],
    email: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    rememberMe: [false],
  });

  /** Formulario reactivo de Registro Público (Sin campo username) */
  registerForm: FormGroup = this.fb.group({
    tenantId: [this.tenantService.currentTenantId() || 'recyway-core', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: [
      '',
      [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z]).{8,}$/),
      ],
    ],
    privacyPolicyAccepted: [false, [Validators.requiredTrue]],
  });

  /** Cambiar de pestaña ('login' | 'register') */
  setTab(tab: AuthTab): void {
    this.activeTab = tab;
    this.errorMessage = null;
    this.successMessage = null;
  }

  /** Alternar visibilidad de contraseña */
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  /** Enviar Formulario de Login */
  onLoginSubmit(): void {
    this.errorMessage = null;
    this.successMessage = null;

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const { tenantId, email, password } = this.loginForm.value;
    this.tenantService.setTenantId(tenantId);
    this.isLoading = true;

    this.authService.login({ email, password }).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/home']);
      },
      error: (err) => {
        this.isLoading = false;
        if (err.status === 401) {
          this.errorMessage = this.translate.instant('AUTH.INVALID_CREDENTIALS');
        } else if (err.status === 0) {
          this.errorMessage = this.translate.instant('ERRORS.NETWORK_ERROR');
        } else {
          this.errorMessage = this.translate.instant('ERRORS.GENERIC');
        }
      },
    });
  }

  /** Enviar Formulario de Registro Público */
  onRegisterSubmit(): void {
    this.errorMessage = null;
    this.successMessage = null;

    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    const { tenantId, email, password, privacyPolicyAccepted } = this.registerForm.value;
    this.tenantService.setTenantId(tenantId);

    this.isLoading = true;

    this.authService
      .register({ email, password, privacyPolicyAccepted })
      .subscribe({
        next: () => {
          this.isLoading = false;
          this.successMessage = this.translate.instant('AUTH.REGISTER_SUCCESS');
          this.loginForm.patchValue({ email: email, password });
          this.setTab('login');
        },
        error: (err) => {
          this.isLoading = false;
          if (err.status === 400) {
            this.errorMessage = this.translate.instant('ERRORS.BAD_REQUEST');
          } else if (err.status === 0) {
            this.errorMessage = this.translate.instant('ERRORS.NETWORK_ERROR');
          } else {
            this.errorMessage = this.translate.instant('ERRORS.GENERIC');
          }
        },
      });
  }

  /** Inicio de sesión / Registro unificado con Google */
  loginWithGoogle(): void {
    console.log('Autenticación con Google SSO iniciada');
  }

  /** Alternar tema claro/oscuro */
  toggleTheme(): void {
    this.themeService.toggleTheme();
  }
}
