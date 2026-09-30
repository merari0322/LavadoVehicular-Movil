import React, { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ConfirmDialog } from '../components/feedback/ConfirmDialog';
import { StatusModal, StatusModalData } from '../components/feedback/StatusModal';

// lo que pide confirmación (textos ya traducidos)
export interface ConfirmRequest {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  // botón de confirmar en rojo (eliminar, cancelar reserva...)
  danger?: boolean;
  onConfirm: () => void;
}

// modales de confirmación y de estado de una pantalla (ConfirmModal y StatusModal de la web).
// La pantalla solo llama askConfirm / showStatus y pinta {feedback.modals} al final.
export function useFeedback() {
  const { t } = useTranslation();
  const [status, setStatus] = useState<StatusModalData | null>(null);
  const [confirm, setConfirm] = useState<ConfirmRequest | null>(null);
  // qué hacer al cerrar el modal de estado (ej. ir a pagar después de reservar)
  const afterStatus = useRef<(() => void) | null>(null);

  const showStatus = useCallback((data: StatusModalData, onClosed?: () => void) => {
    afterStatus.current = onClosed ?? null;
    setStatus(data);
  }, []);

  // igual que showStatus, pero espera a que termine de cerrarse el formulario que se acaba de
  // cerrar (en iOS no se puede abrir un modal mientras otro se está cerrando)
  const showStatusAfterClose = useCallback(
    (data: StatusModalData, onClosed?: () => void) => setTimeout(() => showStatus(data, onClosed), 300),
    [showStatus],
  );

  // error del backend ya traducido
  const showError = useCallback(
    (message: string) => showStatus({ type: 'error', title: t('COMMON.ERROR'), message }),
    [showStatus, t],
  );

  const askConfirm = useCallback((request: ConfirmRequest) => setConfirm(request), []);

  const closeStatus = () => {
    setStatus(null);
    const next = afterStatus.current;
    afterStatus.current = null;
    next?.();
  };

  const modals = (
    <>
      <ConfirmDialog
        visible={confirm !== null}
        title={confirm?.title ?? ''}
        message={confirm?.message ?? ''}
        confirmLabel={confirm?.confirmLabel ?? t('COMMON.ACCEPT')}
        cancelLabel={confirm?.cancelLabel ?? t('COMMON.CANCEL')}
        danger={confirm?.danger ?? false}
        onConfirm={() => {
          const action = confirm?.onConfirm;
          setConfirm(null);
          // la acción suele abrir el modal de éxito: se espera a que este se cierre
          // (en iOS no se puede abrir un modal mientras otro se está cerrando)
          if (action) setTimeout(action, 300);
        }}
        onCancel={() => setConfirm(null)}
      />
      <StatusModal
        data={status ? { buttonText: t('COMMON.ACCEPT'), ...status } : null}
        onClose={closeStatus}
      />
    </>
  );

  return { showStatus, showStatusAfterClose, showError, askConfirm, modals };
}
