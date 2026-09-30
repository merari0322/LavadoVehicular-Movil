import { CUSTOMER_API_URL } from '../../api/config';
import { request } from '../../api/httpClient';

// contratos del customer-service (/api/v1/vehicles), los mismos que usa la web.
// La placa llega sin guion (ABC123) para enviar y con guion (ABC-123) para mostrar.
export interface VehicleResponse {
  id: number;
  licensePlate: string;
  licensePlateFormatted: string;
  vehicleType: string;
  vehicleTypeId: number;
  vehicleTypeName: string;
  brand: string;
  model: string;
  color: string;
  createdAt: string;
}

// cuerpo que esperan POST y PUT /vehicles
export interface VehicleRequest {
  licensePlate: string;
  vehicleType: string;
  brand: string;
  model: string;
  color: string;
}

const options = { baseUrl: CUSTOMER_API_URL };

// vehículos del cliente con sesión abierta. El id del cliente nunca viaja en el cuerpo:
// el servidor lo saca del token JWT.
export const vehicleService = {
  list(): Promise<VehicleResponse[]> {
    return request<VehicleResponse[]>('GET', '/vehicles', options);
  },

  register(body: VehicleRequest): Promise<VehicleResponse> {
    return request<VehicleResponse>('POST', '/vehicles', { ...options, body });
  },

  // PUT completo: siempre viajan todos los campos
  update(id: number, body: VehicleRequest): Promise<VehicleResponse> {
    return request<VehicleResponse>('PUT', `/vehicles/${id}`, { ...options, body });
  },

  // borrado lógico: el backend responde 204 sin cuerpo
  remove(id: number): Promise<void> {
    return request<void>('DELETE', `/vehicles/${id}`, options);
  },
};
