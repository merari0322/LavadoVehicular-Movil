import { useCallback, useEffect, useState } from 'react';

import { paymentService, PromotionForCustomer } from '../../../core/services/payments/PaymentService';

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
  const goal = locked[0]?.requiredPoints ?? (points || 1);
  const percentage = Math.min(100, Math.round((points / goal) * 100));

  const benefits: ClientBenefit[] = promotions.map((p) => ({
    title: `${p.name} · ${p.discountPercent}% OFF`,
    description: p.unlocked ? '' : `${p.requiredPoints - points}`,
    unlocked: p.unlocked,
  }));

  return { points, goal, percentage, benefits, loading, reload };
}
