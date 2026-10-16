// aviso dentro de la app de que la bandeja cambió (llegó una push o se marcó una como leída
// desde la push). Las pantallas de notificaciones y los contadores se suscriben y recargan.
type Listener = () => void;

const listeners = new Set<Listener>();

export const inboxEvents = {
  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },

  emitChanged(): void {
    listeners.forEach((listener) => {
      try {
        listener();
      } catch {
        // una pantalla que falla al recargar no debe impedir que las demás se enteren
      }
    });
  },
};
