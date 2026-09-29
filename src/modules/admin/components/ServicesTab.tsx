import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../../app/theme';
import { ThemeColors } from '../../../app/theme/colors';
import { MANAGEMENT_TEXTS } from '../constants/managementTexts';
import { ManagedService } from '../models/management';
import { formatCurrency } from '../utils/paymentUtils';
import { ActionIconButton, EmptyState, ManagementCard, Pill, SectionHeader } from './ManagementParts';

interface ServicesTabProps {
  services: ManagedService[];
  onCreate: () => void;
  onEdit: (service: ManagedService) => void;
  onToggle: (id: string) => void;
  onDelete: (service: ManagedService) => void;
}

const texts = MANAGEMENT_TEXTS.services;

// Pestaña de servicios: catálogo con precio, duración y estado
export function ServicesTab({ services, onCreate, onEdit, onToggle, onDelete }: ServicesTabProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      <SectionHeader
        title={texts.title}
        subtitle={texts.subtitle}
        actionLabel={texts.create}
        actionIcon="add"
        onAction={onCreate}
      />

      {services.length === 0 ? (
        <EmptyState title={texts.empty} hint={texts.emptyHint} />
      ) : (
        services.map((service) => (
          <ManagementCard key={service.id}>
            <View style={styles.topRow}>
              <Text style={[styles.name, styles.flex]}>{service.name}</Text>
              <Pill
                label={service.active ? texts.active : texts.inactive}
                tone={service.active ? 'success' : 'neutral'}
              />
            </View>

            {service.description ? <Text style={styles.description}>{service.description}</Text> : null}

            <View style={styles.infoRow}>
              <Text style={styles.price}>{formatCurrency(service.price)}</Text>
              <Text style={styles.duration}>{texts.duration(service.duration)}</Text>
              <Pill label={texts.categories[service.category].toLowerCase()} />
            </View>

            <View style={styles.actions}>
              <ActionIconButton icon="edit" onPress={() => onEdit(service)} />
              <ActionIconButton
                icon={service.active ? 'pause-circle-filled' : 'play-circle-filled'}
                onPress={() => onToggle(service.id)}
              />
              <ActionIconButton icon="delete" danger onPress={() => onDelete(service)} />
            </View>
          </ManagementCard>
        ))
      )}
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    flex: { flex: 1 },
    container: { gap: 14 },
    topRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    name: { fontSize: 17, fontWeight: '800', color: colors.text },
    description: { marginTop: 2, fontSize: 13, lineHeight: 19, color: colors.textSecondary },
    infoRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 10 },
    price: { fontSize: 16, fontWeight: '700', color: colors.text },
    duration: { fontSize: 14, color: colors.textSecondary },
    actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 10 },
  });
