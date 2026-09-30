import React, { useCallback, useSyncExternalStore } from 'react';
import { useTranslation } from 'react-i18next';

import { useFeedback } from '../../../shared/hooks/useFeedback';
import { OperatorReservation, ReservationStatus } from '../models/operator';
import { OPERATOR_RESERVATIONS } from '../services/operatorMock';

// servicios asignados guardados en memoria mientras la app está abierta: así, si el operario
// inicia un servicio en "Inicio", también aparece iniciado en la agenda y en servicios asignados.
// TODO: reemplazar por booking-service cuando exista
let reservations: OperatorReservation[] = OPERATOR_RESERVATIONS;
const listeners = new Set<() => void>();

function setStatus(id: number, status: ReservationStatus) {
  reservations = reservations.map((r) => (r.id === id ? { ...r, status } : r));
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

const getSnapshot = () => reservations;

// lista de servicios + acciones con confirmación (iniciar, finalizar, reportar, contactar).
// La pantalla pinta {modals} al final.
export function useOperatorReservations() {
  const { t } = useTranslation();
  const feedback = useFeedback();
  const list = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const start = useCallback(
    (r: OperatorReservation) => {
      if (r.status !== 'pendiente') return;
      feedback.askConfirm({
        title: t('ASSIGNED_SERVICES.DETAIL.START_TITLE'),
        message: t('ASSIGNED_SERVICES.DETAIL.START_MESSAGE', { code: r.code }),
        confirmLabel: t('ASSIGNED_SERVICES.DETAIL.START_CONFIRM'),
        onConfirm: () => {
          setStatus(r.id, 'en_progreso');
          feedback.showStatus({
            title: t('ASSIGNED_SERVICES.DETAIL.STARTED_TITLE'),
            message: t('ASSIGNED_SERVICES.DETAIL.STARTED_MESSAGE', { code: r.code }),
          });
        },
      });
    },
    [feedback, t],
  );

  const finish = useCallback(
    (r: OperatorReservation) => {
      if (r.status !== 'en_progreso') return;
      feedback.askConfirm({
        title: t('SCHEDULE.FINISH_TITLE'),
        message: t('SCHEDULE.FINISH_MESSAGE'),
        confirmLabel: t('SCHEDULE.FINISH_CONFIRM'),
        onConfirm: () => {
          setStatus(r.id, 'finalizado');
          feedback.showStatus({
            title: t('ASSIGNED_SERVICES.DETAIL.FINISHED_TITLE'),
            message: t('ASSIGNED_SERVICES.DETAIL.FINISHED_MESSAGE', { code: r.code }),
          });
        },
      });
    },
    [feedback, t],
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

  // datos de contacto del cliente
  const contactClient = useCallback(
    (r: OperatorReservation) =>
      feedback.showStatus({
        type: 'info',
        icon: 'phone',
        title: t('ASSIGNED_SERVICES.DETAIL.CONTACT'),
        message: t('ASSIGNED_SERVICES.DETAIL.CONTACT_MESSAGE'),
        buttonText: t('COMMON.CLOSE'),
        details: [
          { label: t('BOOKING_DETAIL.CLIENT'), value: r.client },
          { label: t('BOOKING_DETAIL.PHONE'), value: r.phone },
          { label: t('BOOKING_DETAIL.VEHICLE'), value: `${r.vehicleName} · ${r.plate}` },
        ],
      }),
    [feedback, t],
  );

  const modals: React.ReactNode = feedback.modals;

  return { reservations: list, start, finish, reportProgress, contactClient, modals };
}
