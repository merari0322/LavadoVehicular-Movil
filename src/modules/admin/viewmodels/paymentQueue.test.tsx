/// <reference types="jest" />
import { registerAuthHooks } from '../../../core/api/httpClient';
import { paymentService } from '../../../core/services/payments/PaymentService';
import { flush, renderHook } from '../../../shared/testing/renderHook';
import { Payment } from '../models/payment';
import { usePaymentReceipt } from './usePaymentReceipt';

// i18n guarda el idioma en AsyncStorage; en las pruebas va el mock de la librería
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);
const mockT = (key: string) => key;
jest.mock('react-i18next', () => ({ ...jest.requireActual('react-i18next'), useTranslation: () => ({ t: mockT }) }));

const fetchMock = jest.fn();
const ok = (body: unknown) => Promise.resolve({ ok: true, status: 200, text: () => Promise.resolve(JSON.stringify(body)) });

beforeEach(() => {
  fetchMock.mockReset();
  globalThis.fetch = fetchMock as unknown as typeof fetch;
  registerAuthHooks({ getToken: () => 'token', onUnauthorized: jest.fn() });
});

const payment = { id: '9', hasReceiptImage: true, receiptImage: null } as unknown as Payment;

describe('cola de pagos del admin (E-10)', () => {
  it('se pide por páginas y el detalle trae la imagen', async () => {
    fetchMock.mockReturnValueOnce(ok({ items: [], page: 1, size: 100, totalElements: 0, totalPages: 0 }));
    await paymentService.adminPage(1, 100);
    expect(fetchMock.mock.calls[0][0]).toMatch(/\/admin\/payments\?page=1&size=100$/);

    fetchMock.mockReturnValueOnce(ok({ id: 9, receiptImage: 'data:image/png;base64,AAA' }));
    await paymentService.adminPayment(9);
    expect(fetchMock.mock.calls[1][0]).toMatch(/\/admin\/payments\/9$/);
  });

  it('al abrir un pago con comprobante se trae la imagen', async () => {
    fetchMock.mockReturnValue(ok({ id: 9, receiptImage: 'data:image/png;base64,AAA' }));
    const hook = await renderHook(() => usePaymentReceipt(payment));
    await flush();
    await flush();
    expect(hook.result.payment?.receiptImage).toBe('data:image/png;base64,AAA');
    expect(hook.result.receiptError).toBeNull();
    await hook.unmount();
  });

  it('si no se puede traer la imagen se dice por qué', async () => {
    fetchMock.mockReturnValue(Promise.resolve({ ok: false, status: 404, text: () => Promise.resolve('{"code":"PAYMENT_NOT_FOUND"}') }));
    const hook = await renderHook(() => usePaymentReceipt(payment));
    await flush();
    await flush();
    expect(hook.result.receiptError).toMatch(/^API_ERRORS\./);
    await hook.unmount();
  });
});
