import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { apiErrorKey } from '../../../core/api/apiError';
import { VehicleRequest, VehicleResponse, vehicleService } from '../../../core/services/vehicles/VehicleService';
import { VehicleCard, VehicleFormValue, normalizePlate } from '../models/client';

function toCard(vehicle: VehicleResponse): VehicleCard {
  return {
    id: vehicle.id,
    type: vehicle.vehicleType,
    typeId: vehicle.vehicleTypeId,
    brand: vehicle.brand,
    model: vehicle.model,
    plate: vehicle.licensePlateFormatted,
    color: vehicle.color,
  };
}

function toRequest(value: VehicleFormValue): VehicleRequest {
  return {
    licensePlate: normalizePlate(value.plate),
    vehicleType: value.type,
    brand: value.brand.trim(),
    model: value.model.trim(),
    color: value.color.trim(),
  };
}

// vehículos reales del cliente contra el customer-service.
// Las acciones devuelven el mensaje de error ya traducido, o null si salió bien.
export function useClientVehicles() {
  const { t } = useTranslation();
  const [vehicles, setVehicles] = useState<VehicleCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const list = await vehicleService.list();
      setVehicles(list.map(toCard));
    } catch (error) {
      setLoadError(t(apiErrorKey(error)));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const run = useCallback(
    async (action: () => Promise<unknown>): Promise<string | null> => {
      try {
        await action();
        await reload();
        return null;
      } catch (error) {
        return t(apiErrorKey(error));
      }
    },
    [reload, t],
  );

  const register = useCallback((value: VehicleFormValue) => run(() => vehicleService.register(toRequest(value))), [run]);
  const update = useCallback(
    (id: number, value: VehicleFormValue) => run(() => vehicleService.update(id, toRequest(value))),
    [run],
  );
  const remove = useCallback((id: number) => run(() => vehicleService.remove(id)), [run]);

  return { vehicles, loading, loadError, reload, register, update, remove };
}
