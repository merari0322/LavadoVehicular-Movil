import { request } from '../../api/httpClient';

// dirección de contacto del perfil (security-service, /users/me/address, ADR-010). Antes se
// guardaba solo en el celular; ahora es la misma en la web y en cualquier dispositivo.
// Vacía significa que no tiene: guardarla vacía la borra.

interface AddressDto {
  address: string;
}

export const addressService = {
  async get(): Promise<string> {
    return (await request<AddressDto>('GET', '/users/me/address')).address ?? '';
  },

  async update(address: string): Promise<string> {
    return (await request<AddressDto>('PUT', '/users/me/address', { body: { address } })).address ?? '';
  },
};
