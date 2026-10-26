import { useSharedState } from '../../../shared/hooks/useSharedState';
import { Operator } from '../models/operator';

// operarios reales ya cargados por useOperators (operations-service), solo para leer nombres en
// listas y selectores sin volver a pedirlos
export function useOperatorDirectory(): Operator[] {
  const [operators] = useSharedState<Operator[]>('admin.operators', []);
  return operators;
}
