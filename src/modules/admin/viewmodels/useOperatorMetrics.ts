import { useEffect, useState } from 'react';
import { operationsService, OperatorMetricsResponse } from '../../../core/services/operations/OperationsService';

// Métricas reales de la semana de un operario (operations-service). null mientras cargan o si
// el servicio no responde: la tarjeta muestra "—" en vez de inventar números.
export function useOperatorMetrics(operatorId: string | null) {
  const [metrics, setMetrics] = useState<OperatorMetricsResponse | null>(null);

  useEffect(() => {
    let active = true;
    setMetrics(null);
    if (!operatorId) return undefined;
    operationsService
      .operatorMetrics(Number(operatorId))
      .then((result) => {
        if (active) setMetrics(result);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [operatorId]);

  return metrics;
}
