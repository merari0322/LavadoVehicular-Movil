import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useRef } from 'react';

import { inboxEvents } from '../../core/services/notifications/inboxEvents';

// datos frescos sin recargar (punto 6 del contrato): vuelve a pedir los datos cada vez que el
// usuario regresa a la pantalla y, mientras está en ella, cuando llega una push (inboxEvents).
// La primera vez no hace nada: esa carga ya la hizo el ViewModel al montarse.
// refresh debe ser silencioso (sin el indicador de carga de pantalla completa).
export function useRefreshOnFocus(refresh: () => unknown): void {
  // siempre la última función, sin volver a suscribirse en cada render
  const latest = useRef(refresh);
  latest.current = refresh;
  const firstFocus = useRef(true);

  useFocusEffect(
    useCallback(() => {
      const run = () => {
        // un refresco en segundo plano que falla deja los datos que ya se ven; el error lo
        // muestra la carga normal de la pantalla (o su botón "Reintentar")
        Promise.resolve()
          .then(() => latest.current())
          .catch(() => undefined);
      };
      if (firstFocus.current) {
        firstFocus.current = false;
      } else {
        run();
      }
      return inboxEvents.subscribe(run);
    }, []),
  );
}
