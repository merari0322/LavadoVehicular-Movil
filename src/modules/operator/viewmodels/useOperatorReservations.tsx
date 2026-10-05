import React, { useCallback, useEffect, useSyncExternalStore } from 'react';
import { useTranslation } from 'react-i18next';

import { apiErrorKey } from '../../../core/api/apiError';
import { operationsService, OperatorServiceResponse } from '../../../core/services/operations/OperationsService';
import { useFeedback } from '../../../shared/hooks/useFeedback';
import { toISODate } from '../../../shared/utils/format';
import { OperatorReservation, ReservationStatus } from '../models/operator';

// servicios asignados al operario (operations-service).
// Se guardan en memoria compartida: si el operario inicia un servicio en "Inicio", también
// aparece iniciado en la agenda, en servicios asignados y en el historial.
let reservations: OperatorReservation[] = [];
let loading = false;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

const getSnapshot = () => reservations;

// historial de un mes atrás y agenda de dos semanas adelante
function rangeFromToday(): { from: string; to: string } {
  const from = new Date();
  from.setDate(from.getDate() - 30);
  const to = new Date();
  to.setDate(to.getDate() + 14);
  return { from: toISODate(from), to: toISODate(to) };
}

function statusOf(status: OperatorServiceResponse['status']): ReservationStatus {
  if (status === 'IN_PROGRESS') return 'en_progreso';
  if (status === 'COMPLETED') return 'finalizado';
  return 'pendiente';
}

function minutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

function toReservation(s: OperatorServiceResponse): OperatorReservation {
  return {
    id: s.bookingId,
    code: s.code,
    date: s.date,
    time: s.startTime.slice(0, 5),
    service: s.services,
    // el nombre y el teléfono del cliente los da security-service solo al admin
    client: s.plate || '—',
    phone: '—',
    vehicle: '',
    vehicleName: s.vehicle,
    plate: s.plate,
    durationMin: Math.max(0, minutes(s.endTime) - minutes(s.startTime)),
    paymentMethod: '',
    total: s.total,
    status: statusOf(s.status),
    rating: s.rating,
    comment: s.comment,
  };
}

async function reload(): Promise<void> {
  if (loading) return;
  loading = true;
  try {
    const { from, to } = rangeFromToday();
    reservations = (await operationsService.myServices(from, to)).map(toReservation);
    emit();
  } finally {
    loading = false;
  }
}

// lista de servicios + acciones con confirmación (iniciar, finalizar, reportar, contactar).
// La pantalla pinta {modals} al final.
export function useOperatorReservations() {
  const { t } = useTranslation();
  const feedback = useFeedback();
  const list = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  useEffect(() => {
    reload().catch((error) => feedback.showError(t(apiErrorKey(error))));
    // solo al abrir la pantalla
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // inicia o termina en operations-service (que también mueve la reserva) y recarga la lista
  const advance = useCallback(
    async (r: OperatorReservation, status: 'IN_PROGRESS' | 'COMPLETED', title: string, message: string) => {
      try {
        await (status === 'IN_PROGRESS' ? operationsService.start(r.id) : operationsService.finish(r.id));
        await reload();
        feedback.showStatus({ title: t(title), message: t(message, { code: r.code }) });
      } catch (error) {
        feedback.showError(t(apiErrorKey(error)));
      }
    },
    [feedback, t],
  );

  const start = useCallback(
    (r: OperatorReservation) => {
      if (r.status !== 'pendiente') return;
      feedback.askConfirm({
        title: t('ASSIGNED_SERVICES.DETAIL.START_TITLE'),
        message: t('ASSIGNED_SERVICES.DETAIL.START_MESSAGE', { code: r.code }),
        confirmLabel: t('ASSIGNED_SERVICES.DETAIL.START_CONFIRM'),
        onConfirm: () =>
          advance(r, 'IN_PROGRESS', 'ASSIGNED_SERVICES.DETAIL.STARTED_TITLE', 'ASSIGNED_SERVICES.DETAIL.STARTED_MESSAGE'),
      });
    },
    [advance, feedback, t],
  );

  const finish = useCallback(
    (r: OperatorReservation) => {
      if (r.status !== 'en_progreso') return;
      feedback.askConfirm({
        title: t('SCHEDULE.FINISH_TITLE'),
        message: t('SCHEDULE.FINISH_MESSAGE'),
        confirmLabel: t('SCHEDULE.FINISH_CONFIRM'),
        onConfirm: () =>
          advance(r, 'COMPLETED', 'ASSIGNED_SERVICES.DETAIL.FINISHED_TITLE', 'ASSIGNED_SERVICES.DETAIL.FINISHED_MESSAGE'),
      });
    },
    [advance, feedback, t],
  );

  const reportProgress = useCallback(
    (r: OperatorReservation) =>
      feedback.askConfirm({
        title: t('ASSIGNED_SERVICES.DETAIL.REPORT_TITLE'),
        message: t('ASSIGNED_SERVICES.DETAIL.REPORT_MESSAGE', { code: r.code }),
        confirmLabel: t('ASSIGNED_SERVICES.DETAIL.REPORT_CONFIRM'),
        onConfirm: () =>
          feedback.showStatus({
            title: t('ASSIGNED_SERVICES.DETAIL.REPORTED_TITLE'),
            message: t('ASSIGNED_SERVICES.DETAIL.REPORTED_MESSAGE', { code: r.code }),
          }),
      }),
    [feedback, t],
  );

  // datos del vehículo para reconocerlo al llegar
  const contactClient = useCallback(
    (r: OperatorReservation) =>
      feedback.showStatus({
        type: 'info',
        icon: 'directions-car',
        title: t('ASSIGNED_SERVICES.DETAIL.CONTACT'),
        message: t('ASSIGNED_SERVICES.DETAIL.CONTACT_MESSAGE'),
        buttonText: t('COMMON.CLOSE'),
        details: [{ label: t('BOOKING_DETAIL.VEHICLE'), value: `${r.vehicleName} · ${r.plate}` }],
      }),
    [feedback, t],
  );

  const modals: React.ReactNode = feedback.modals;

  return { reservations: list, start, finish, reportProgress, contactClient, reload, modals };
}
