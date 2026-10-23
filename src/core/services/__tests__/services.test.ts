/// <reference types="jest" />
import { ApiError } from '../../api/apiError';
import { registerAuthHooks } from '../../api/httpClient';
import { HttpAuthService } from '../auth/HttpAuthService';
import { bookingService } from '../booking/BookingService';
import { paymentService } from '../payments/PaymentService';

// respuesta falsa de fetch con el cuerpo en JSON
function respond(status: number, body?: unknown) {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    text: () => Promise.resolve(body === undefined ? '' : JSON.stringify(body)),
  } as Response);
}

const fetchMock = jest.fn();

beforeEach(() => {
  fetchMock.mockReset();
  globalThis.fetch = fetchMock as unknown as typeof fetch;
  registerAuthHooks({ getToken: () => 'token-de-prueba', onUnauthorized: jest.fn() });
});

describe('servicios del móvil contra el gateway', () => {
  it('login: manda el correo y la contraseña sin token y arma la sesión', async () => {
    fetchMock.mockReturnValue(respond(200, {
      accessToken: 'jwt', expiresAt: '2026-10-23T20:00:00Z',
      user: { id: 7, email: 'ana@gmail.com', documentNumber: '1', firstName: 'Ana', lastName: 'Ruiz',
        phone: null, roles: ['CLIENT'], active: true, lastLogin: null },
    }));

    const session = await new HttpAuthService().login({ email: 'ana@gmail.com', password: 'Lavado2026!' });

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toMatch(/\/auth\/login$/);
    expect(init.method).toBe('POST');
    expect(JSON.parse(init.body)).toEqual({ email: 'ana@gmail.com', password: 'Lavado2026!' });
    expect(init.headers.Authorization).toBeUndefined();
    expect(session.accessToken).toBe('jwt');
  });

  it('login con credenciales malas lanza ApiError con el código del backend', async () => {
    fetchMock.mockReturnValue(respond(401, { code: 'INVALID_CREDENTIALS' }));

    await expect(new HttpAuthService().login({ email: 'ana@gmail.com', password: 'mala' }))
      .rejects.toMatchObject({ code: 'INVALID_CREDENTIALS', status: 401 });
  });

  it('reservas: pide las del cliente con su token', async () => {
    fetchMock.mockReturnValue(respond(200, [{ id: 1, code: 'RES-1' }]));

    const list = await bookingService.myBookings();

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toMatch(/\/bookings\/me$/);
    expect(init.headers.Authorization).toBe('Bearer token-de-prueba');
    expect(list).toHaveLength(1);
  });

  it('pago: canjear un cupón manda la reserva y el código', async () => {
    fetchMock.mockReturnValue(respond(200, { promotionId: 1, discountAmount: 4000, newTotal: 36000 }));

    const result = await paymentService.redeemCoupon(7, 'VERANO10');

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toMatch(/\/loyalty\/redeem$/);
    expect(JSON.parse(init.body)).toEqual({ bookingId: 7, code: 'VERANO10' });
    expect(result.newTotal).toBe(36000);
  });

  it('sin conexión con el servidor el error es NETWORK_ERROR', async () => {
    fetchMock.mockReturnValue(Promise.reject(new TypeError('Network request failed')));

    await expect(bookingService.myBookings()).rejects.toBeInstanceOf(ApiError);
    await expect(bookingService.myBookings()).rejects.toMatchObject({ code: 'NETWORK_ERROR' });
  });
});
