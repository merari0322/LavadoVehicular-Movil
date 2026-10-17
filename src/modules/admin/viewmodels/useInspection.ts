import { useCallback, useEffect, useState } from 'react';
import {
  InspectionPhase,
  InspectionPhaseStatus,
  InspectionService,
  InspectionState,
  NewFindingRequest,
} from '../../../core/services/operations/InspectionService';

// Estado del reporte de inspección de una reserva (pantalla AdminInspection). Igual que en la web:
// cada acción guarda el estado completo que responde operations-service, así la pantalla siempre
// muestra lo que quedó guardado. Las acciones devuelven el error (o null) para que la pantalla
// muestre el mensaje del backend.
export function useInspection(bookingId: string) {
  const [state, setState] = useState<InspectionState | null>(null);
  const [loading, setLoading] = useState(true);
  // evita tocar dos veces un botón mientras responde el backend
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setState(await InspectionService.get(bookingId));
    } catch {
      setState(null);
    } finally {
      setLoading(false);
    }
  }, [bookingId]);

  useEffect(() => {
    void load();
  }, [load]);

  const run = useCallback(async (action: () => Promise<InspectionState>): Promise<unknown> => {
    setBusy(true);
    try {
      setState(await action());
      return null;
    } catch (error) {
      return error;
    } finally {
      setBusy(false);
    }
  }, []);

  const start = () => run(() => InspectionService.start(bookingId));

  const setPhaseStatus = (phase: InspectionPhase, status: InspectionPhaseStatus) =>
    run(() => InspectionService.setPhaseStatus(bookingId, phase, status));

  const addFinding = (phase: InspectionPhase, finding: NewFindingRequest) =>
    run(() => InspectionService.addFinding(bookingId, phase, finding));

  const removeFinding = (findingId: number) => run(() => InspectionService.removeFinding(bookingId, findingId));

  const publish = () => run(() => InspectionService.publish(bookingId));

  /** aviso al cliente por notification-service (bandeja, push y correo); no cambia el reporte */
  const share = async (): Promise<unknown> => {
    setBusy(true);
    try {
      await InspectionService.share(bookingId);
      return null;
    } catch (error) {
      return error;
    } finally {
      setBusy(false);
    }
  };

  return {
    state,
    report: state?.report ?? null,
    editable: state?.editable ?? false,
    available: state?.available ?? false,
    loading,
    busy,
    reload: load,
    start,
    setPhaseStatus,
    addFinding,
    removeFinding,
    publish,
    share,
  };
}
