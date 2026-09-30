import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { fontSize, fontWeight, radius, spacing, useTheme } from '../../../app/theme';
import { EmptyState } from '../../../shared/components/screen/EmptyState';
import { InfoRow } from '../../../shared/components/screen/InfoRow';
import { PageHeader } from '../../../shared/components/screen/PageHeader';
import { ScreenScroll } from '../../../shared/components/screen/ScreenScroll';
import { SectionCard } from '../../../shared/components/screen/SectionCard';
import { StatGrid, StatTile } from '../../../shared/components/screen/StatTile';
import { vehicleIcon } from '../../../shared/constants/business';
import { useFeedback } from '../../../shared/hooks/useFeedback';
import { ClientLayout } from '../../../shared/layouts/ClientLayout';
import { withAlpha } from '../../../shared/utils/color';
import { VehicleFormModal } from '../components/VehicleFormModal';
import { VehicleCard, VehicleFormValue, normalizePlate } from '../models/client';
import { useClientVehicles } from '../viewmodels/useClientVehicles';

// estado del modal: cerrado, registrando (vehicle = null) o editando un vehículo
type FormState = { visible: false } | { visible: true; vehicle: VehicleCard | null };

// Mis vehículos: lista real del customer-service con registrar, editar y eliminar
export function ClientVehiclesScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const vm = useClientVehicles();
  const feedback = useFeedback();
  const [form, setForm] = useState<FormState>({ visible: false });

  const editing = form.visible ? form.vehicle : null;

  // placas de los otros vehículos: la del que se edita se puede guardar sin cambiarla
  const takenPlates = vm.vehicles.filter((v) => v.id !== editing?.id).map((v) => normalizePlate(v.plate));

  const handleSubmit = async (value: VehicleFormValue): Promise<string | null> => {
    const failure = editing ? await vm.update(editing.id, value) : await vm.register(value);
    if (failure) return failure;

    setForm({ visible: false });
    feedback.showStatusAfterClose({
      title: t(editing ? 'VEHICLES.SUCCESS.UPDATED_TITLE' : 'VEHICLES.SUCCESS.CREATED_TITLE'),
      message: t(editing ? 'VEHICLES.SUCCESS.UPDATED_MESSAGE' : 'VEHICLES.SUCCESS.CREATED_MESSAGE'),
    });
    return null;
  };

  const confirmRemove = (vehicle: VehicleCard) =>
    feedback.askConfirm({
      title: t('VEHICLES.DELETE.TITLE'),
      message: t('VEHICLES.DELETE.MESSAGE', { name: `${vehicle.brand} ${vehicle.model}`.trim(), plate: vehicle.plate }),
      confirmLabel: t('COMMON.DELETE'),
      danger: true,
      onConfirm: async () => {
        const failure = await vm.remove(vehicle.id);
        if (failure) feedback.showError(failure);
      },
    });

  const toFormValue = (vehicle: VehicleCard): VehicleFormValue => ({
    type: vehicle.type,
    brand: vehicle.brand,
    model: vehicle.model,
    plate: vehicle.plate,
    color: vehicle.color,
  });

  return (
    <ClientLayout activeKey="vehicles">
      <ScreenScroll onRefresh={vm.reload} refreshing={vm.loading && vm.vehicles.length > 0}>
        <PageHeader
          title={t('VEHICLES.TITLE')}
          subtitle={t('VEHICLES.SUBTITLE')}
          actionLabel={t('VEHICLES.REGISTER_BUTTON')}
          actionIcon="add"
          onAction={() => setForm({ visible: true, vehicle: null })}
        />

        <StatGrid>
          <StatTile icon="directions-car" value={vm.vehicles.length} label={t('VEHICLES.STATS.TOTAL')} />
          {/* total y fecha del último lavado los dará booking-service (todavía no existe) */}
          <StatTile icon="water-drop" value={0} label={t('VEHICLES.STATS.WASHES')} />
        </StatGrid>

        {vm.loading && vm.vehicles.length === 0 ? (
          <EmptyState loading title={t('MOBILE_NAV.LOADING')} />
        ) : vm.loadError ? (
          <EmptyState
            icon="cloud-off"
            title={t('VEHICLES.LOAD_ERROR')}
            subtitle={vm.loadError}
            actionLabel={t('MOBILE_NAV.RETRY')}
            onAction={vm.reload}
          />
        ) : vm.vehicles.length === 0 ? (
          <EmptyState icon="directions-car" title={t('VEHICLES.EMPTY.TITLE')} subtitle={t('VEHICLES.EMPTY.SUBTITLE')} />
        ) : (
          vm.vehicles.map((vehicle) => (
            <SectionCard key={vehicle.id}>
              <View style={styles.header}>
                <View style={[styles.icon, { backgroundColor: withAlpha(colors.primary, 0.15) }]}>
                  <MaterialIcons name={vehicleIcon(vehicle.type)} size={24} color={colors.primary} />
                </View>
                <View style={styles.titles}>
                  <Text style={[styles.name, { color: colors.text }]}>
                    {vehicle.brand} {vehicle.model}
                  </Text>
                  <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                    {t(`VEHICLE.${vehicle.type}`)}
                    {vehicle.color ? ` · ${vehicle.color}` : ''}
                  </Text>
                </View>
                <Pressable
                  onPress={() => setForm({ visible: true, vehicle })}
                  style={[styles.iconButton, { backgroundColor: withAlpha(colors.primary, 0.12) }]}
                  hitSlop={6}
                >
                  <MaterialIcons name="edit" size={18} color={colors.primary} />
                </Pressable>
                <Pressable
                  onPress={() => confirmRemove(vehicle)}
                  style={[styles.iconButton, { backgroundColor: colors.errorSoft }]}
                  hitSlop={6}
                >
                  <MaterialIcons name="delete" size={18} color={colors.error} />
                </Pressable>
              </View>
              <InfoRow label={t('VEHICLES.CARD.PLATE')} value={vehicle.plate} />
            </SectionCard>
          ))
        )}
      </ScreenScroll>

      <VehicleFormModal
        visible={form.visible}
        vehicle={editing ? toFormValue(editing) : null}
        takenPlates={takenPlates}
        onClose={() => setForm({ visible: false })}
        onSubmit={handleSubmit}
      />
      {feedback.modals}
    </ClientLayout>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  icon: { width: 46, height: 46, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  titles: { flex: 1 },
  name: { fontSize: fontSize.body + 1, fontWeight: fontWeight.bold },
  subtitle: { fontSize: fontSize.small, marginTop: 2 },
  iconButton: { width: 36, height: 36, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
});
