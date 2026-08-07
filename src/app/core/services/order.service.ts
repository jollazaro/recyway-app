import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { OrderRequest, OrderResponse } from '../../shared/models/order.models';

/**
 * OrderService — Gestiona el ciclo de vida de las órdenes de reciclaje.
 *
 * Se comunica con el backend mediante `ApiService` utilizando composición.
 */
@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly api = inject(ApiService);

  /**
   * Obtiene el historial de órdenes del usuario actual (consumidor o recolector).
   * GET /api/orders
   */
  getMyOrders(): Observable<OrderResponse[]> {
    return this.api.get<OrderResponse[]>('/api/orders');
  }

  /**
   * Crea una nueva orden de reciclaje en el sistema.
   * POST /api/orders
   */
  createOrder(order: OrderRequest): Observable<OrderResponse> {
    return this.api.post<OrderResponse>('/api/orders', order);
  }

  /**
   * Marca una orden como completada (confirmación del recolector/usuario).
   * PATCH /api/orders/{id}/complete
   */
  completeOrder(id: string): Observable<OrderResponse> {
    return this.api.patch<OrderResponse>(`/api/orders/${id}/complete`);
  }

  /**
   * Asigna un recolector específico a una orden de reciclaje.
   * PATCH /api/orders/{id}/assign?collectorId={collectorId}
   */
  assignCollector(id: string, collectorId: number): Observable<OrderResponse> {
    const path = `/api/orders/${id}/assign?collectorId=${collectorId}`;
    return this.api.patch<OrderResponse>(path);
  }
}
