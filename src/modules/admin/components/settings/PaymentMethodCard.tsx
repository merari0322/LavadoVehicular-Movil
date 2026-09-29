import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../../../app/theme';
import { ThemeColors } from '../../../../app/theme/colors';
import { withAlpha } from '../../../../shared/utils/color';
import { SETTINGS_TEXTS } from '../../constants/settingsTexts';
import { PaymentMethod } from '../../models/settings';
import { IconButton } from '../../../../shared/components/ui/IconButton';
import { Pill } from '../../../../shared/components/ui/Pill';

interface PaymentMethodCardProps {
  method: PaymentMethod;
  onToggleActive: () => void;
  onReplaceQr: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const texts = SETTINGS_TEXTS.payments;

// Tarjeta de un método de pago: estado, cuenta, código QR y acciones
export function PaymentMethodCard({ method, onToggleActive, onReplaceQr, onEdit, onDelete }: PaymentMethodCardProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const hasQr = method.qrFileName !== '';

  return (
    <View style={styles.card}>
      {/* Nombre, tipo, titular e interruptor de activo */}
      <View style={styles.topRow}>
        <View style={styles.iconBox}>
          <MaterialIcons name="qr-code-2" size={26} color={colors.primary} />
        </View>
        <View style={styles.flex}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{method.name}</Text>
            <Pill label={texts.types[method.type]} tone="neutral" />
          </View>
          <Text style={styles.holder}>{texts.holder(method.holder)}</Text>
        </View>
        <Switch
          value={method.active}
          onValueChange={onToggleActive}
          trackColor={{ false: withAlpha(colors.textMuted, 0.35), true: colors.primaryHover }}
          thumbColor={colors.onPrimary}
        />
      </View>

      <View style={styles.divider} />

      {/* Cuenta */}
      <View>
        <Text style={styles.accountLabel}>{texts.account}</Text>
        <Text style={styles.account}>{method.account}</Text>
      </View>

      {/* Código QR (solo si el método lo requiere) */}
      {method.requiresQr ? (
        <View style={styles.qrBox}>
          <MaterialIcons name="qr-code-2" size={26} color={colors.textSecondary} />
          <View style={styles.flex}>
            <Text style={styles.qrName} numberOfLines={1}>
              {hasQr ? method.qrFileName : texts.qr.missing}
            </Text>
            {hasQr ? <Text style={styles.qrStatus}>{texts.qr.verified}</Text> : null}
          </View>
          <Pressable style={styles.qrButton} onPress={onReplaceQr}>
            <Text style={styles.qrButtonText}>{hasQr ? texts.qr.replace : texts.qr.upload}</Text>
          </Pressable>
        </View>
      ) : null}

      <View style={styles.actions}>
        <IconButton icon="edit" onPress={onEdit} />
        <IconButton icon="delete" danger onPress={onDelete} />
      </View>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    flex: { flex: 1 },
    card: {
      gap: 12,
      padding: 16,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
    },
    topRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    iconBox: {
      width: 48,
      height: 48,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 14,
      backgroundColor: withAlpha(colors.primary, 0.15),
    },
    nameRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8 },
    name: { fontSize: 17, fontWeight: '800', color: colors.text },
    holder: { marginTop: 2, fontSize: 13, color: colors.textSecondary },
    divider: { height: 1, backgroundColor: colors.border },
    accountLabel: { fontSize: 13, color: colors.textSecondary },
    account: { marginTop: 2, fontSize: 17, fontWeight: '800', color: colors.text },
    qrBox: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      padding: 12,
      borderRadius: 14,
      borderWidth: 1,
      borderStyle: 'dashed',
      borderColor: colors.border,
      backgroundColor: withAlpha(colors.textMuted, 0.08),
    },
    qrName: { fontSize: 14, fontWeight: '600', color: colors.text },
    qrStatus: { fontSize: 13, color: colors.textSecondary },
    qrButton: {
      height: 38,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 14,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
    },
    qrButtonText: { fontSize: 13, fontWeight: '700', color: colors.text },
    actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8 },
  });
