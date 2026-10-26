import { useCallback, useEffect, useState } from 'react';

import { paymentService, PromotionForCustomer } from '../../../core/services/payments/PaymentService';
import { formatCOP } from '../../../shared/utils/format';

// D-01: título del beneficio con su descuento real: un FIXED en pesos y un porcentaje con "%";
// sin descuento (o un backend viejo con 0 %) solo el nombre
export function benefitTitle(p: PromotionForCustomer): string {
  const value = p.discountValue ?? p.discountPercent;
  if (!(value > 0)) return p.name;
  return p.discountType === 'FIXED' ? `${p.name} · ${formatCOP(value)} OFF` : `${p.name} · ${value}% OFF`;
}

export interface ClientBenefit {
  title: string;
  description: string;
  unlocked: boolean;
}

// puntos de fidelización y promociones reales del cliente (payment-service, ADR-015), mismo
// patrón que useClientBookings. Reemplaza clientMock.ts BENEFITS/LOYALTY.
export function useClientLoyalty() {
  const [points, setPoints] = useState(0);
  const [promotions, setPromotions] = useState<PromotionForCustomer[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const [balance, list] = await Promise.all([
        paymentService.loyaltyBalance(),
        paymentService.loyaltyPromotions(),
      ]);
      setPoints(balance.points);
      setPromotions(list);
    } catch {
      // sin payment-service la barra queda en 0, sin romper el dashboard
      setPoints(0);
      setPromotions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const locked = promotions.filter((p) => !p.unlocked).sort((a, b) => a.requiredPoints - b.requiredPoints);
  // sin promociones por desbloquear no hay meta: la barra queda completa (igual que la web)
  const allUnlocked = locked.length === 0;
  const goal = allUnlocked ? points : locked[0].requiredPoints;
  const percentage = allUnlocked ? 100 : Math.min(100, Math.round((points / Math.max(goal, 1)) * 100));

  const benefits: ClientBenefit[] = promotions.map((p) => ({
    title: benefitTitle(p),
    description: p.unlocked ? '' : `${p.requiredPoints - points}`,
    unlocked: p.unlocked,
  }));

  return { points, goal, percentage, allUnlocked, benefits, loading, reload };
}
