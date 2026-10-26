import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../../../app/theme';
import { ThemeColors } from '../../../../app/theme/colors';
import { SETTINGS_TEXTS } from '../../constants/settingsTexts';
import { PaymentMethod } from '../../models/settings';
import { Pill } from '../../../../shared/components/ui/Pill';
import { PaymentMethodCard } from './PaymentMethodCard';

interface PaymentsTabProps {
  methods: PaymentMethod[];
  activeCount: number;
  onAdd: () => void;
  onEdit: (method: PaymentMethod) => void;
  onToggleActive: (id: string) => void;
  onReplaceQr: (method: PaymentMethod) => void;
  onDelete: (method: PaymentMethod) => void;
}

const texts = SETTINGS_TEXTS.payments;

// Pestaña de métodos de pago: encabezado con botón de agregar y lista de tarjetas
export function PaymentsTab({
  methods,
  activeCount,
  onAdd,
  onEdit,
  onToggleActive,
  onReplaceQr,
  onDelete,
}: PaymentsTabProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{texts.title}</Text>
          <Pill label={texts.activeBadge(activeCount)} tone="primary" />
        </View>
        <Text style={styles.subtitle}>{texts.subtitle}</Text>

        <Pressable style={styles.addButton} onPress={onAdd}>
          <MaterialIcons name="add" size={20} color={colors.onPrimary} />
          <Text style={styles.addText}>{texts.add}</Text>
        </Pressable>
      </View>

      {methods.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>{texts.empty}</Text>
          <Text style={styles.subtitle}>{texts.emptyHint}</Text>
        </View>
      ) : (
        methods.map((method) => (
          <PaymentMethodCard
            key={method.id}
            method={method}
            onToggleActive={() => onToggleActive(method.id)}
            onReplaceQr={() => onReplaceQr(method)}
            onEdit={() => onEdit(method)}
            onDelete={() => onDelete(method)}
          />
        ))
      )}
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: { gap: 14 },
    header: { gap: 8 },
    titleRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 10 },
    title: { fontSize: 24, fontWeight: '800', color: colors.text },
    subtitle: { fontSize: 14, lineHeight: 20, color: colors.textSecondary },
    addButton: {
      height: 46,
      marginTop: 6,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      borderRadius: 12,
      backgroundColor: colors.primary,
    },
    addText: { fontSize: 14, fontWeight: '700', color: colors.onPrimary },
    empty: { alignItems: 'center', gap: 4, paddingVertical: 28 },
    emptyTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  });
