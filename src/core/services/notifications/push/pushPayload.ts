// lo que viaja oculto en cada push (campo data que arma ExpoPushSender en notification-service).
// Los datos de afuera no se creen a ciegas: se validan aquí antes de que la app los use.
export interface PushPayload {
  notificationId: number | null;
  type: string | null; // NotificationTypeCode del backend (BOOKING_CONFIRMED, PAYMENT_REJECTED...)
  category: string | null;
  referenceEntity: string | null; // booking, payment...
  referenceId: number | null;
  title: string | null;
  body: string | null;
}

const positiveInt = (value: unknown): number | null => {
  const n = typeof value === 'string' ? Number(value) : value;
  return typeof n === 'number' && Number.isInteger(n) && n > 0 ? n : null;
};

const text = (value: unknown): string | null => (typeof value === 'string' && value.trim() ? value.trim() : null);

export const PushPayload = {
  from(data: Record<string, unknown> | null | undefined, title?: string | null, body?: string | null): PushPayload {
    const d = data ?? {};
    return {
      notificationId: positiveInt(d.notificationId),
      type: text(d.type),
      category: text(d.category),
      referenceEntity: text(d.referenceEntity),
      referenceId: positiveInt(d.referenceId),
      title: text(title),
      body: text(body),
    };
  },
};
