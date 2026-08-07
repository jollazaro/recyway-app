/**
 * Tipos de materiales de reciclaje permitidos.
 */
export type MaterialType = 'PLASTIC' | 'GLASS' | 'PAPER' | 'METAL' | 'OTHER';

/**
 * Estados posibles de una orden de reciclaje.
 */
export type OrderStatus =
  | 'CREATED'
  | 'ASSIGNED'
  | 'IN_ROUTE'
  | 'COLLECTED'
  | 'ARRIVED_POINT'
  | 'COMPLETED'
  | 'CANCELLED';

/**
 * Petición para crear una nueva orden de reciclaje.
 * Coincide con OrderRequest en el backend.
 */
export interface OrderRequest {
  materialType: MaterialType;
  quantity?: number;
  latitude: number;
  longitude: number;
  photoUrl?: string;
}

/**
 * Respuesta del backend con el detalle de una orden de reciclaje.
 * Coincide con OrderResponse en el backend.
 */
export interface OrderResponse {
  id: string; // UUID string
  userId: number;
  collectorId?: number;
  materialType: MaterialType;
  quantity?: number;
  status: OrderStatus;
  latitude: number;
  longitude: number;
  photoUrl?: string;
  qualityRating?: number;
  createdAt: string; // ISO Date-Time string
}
