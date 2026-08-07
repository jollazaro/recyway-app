import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * SplashScreenComponent — Pantalla de presentación con logo SVG animado.
 *
 * Utiliza las animaciones de `dark.html` y `light.html` adaptadas con
 * soporte para el sistema de temas Cyber Eco (Modo Claro/Oscuro).
 * Emite el evento `finished` al completar la barra de carga (~3.2 segundos).
 */
@Component({
  selector: 'app-splash-screen',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './splash-screen.component.html',
  styleUrls: ['./splash-screen.component.scss'],
})
export class SplashScreenComponent implements OnInit {
  /** Evento emitido al finalizar la animación para que el padre lo oculte */
  @Output() finished = new EventEmitter<void>();

  /** Controla la clase de desvanecimiento gradual (fade-out) */
  isFadingOut = false;

  ngOnInit(): void {
    // Iniciar el desvanecimiento a los 3 segundos y emitir el evento finalizado a los 3.4s
    setTimeout(() => {
      this.isFadingOut = true;
    }, 3000);

    setTimeout(() => {
      this.finished.emit();
    }, 3400);
  }
}
