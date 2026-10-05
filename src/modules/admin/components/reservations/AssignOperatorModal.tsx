import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../../../app/theme';
import { ThemeColors } from '../../../../app/theme/colors';
import { FormModal } from '../../../../shared/components/feedback/FormModal';
import { withAlpha } from '../../../../shared/utils/color';
import { TEXTS } from '../../constants/reservationTexts';
import { Operator } from '../../models/operator';
import { Reservation } from '../../models/reservation';
import { getInitials } from '../../utils/reservationUtils';
// disponibilidad real para esa reserva (operations-service)
import { CandidateResponse, operationsService } from '../../../../core/services/operations/OperationsService';
import { apiErrorKey } from '../../../../core/api/apiError';

interface AssignOperatorModalProps {
  // reserva a la que se le asigna operario (null = cerrado)
  reservation: Reservation | null;
  operators: Operator[];
  // cuántos servicios tiene cada operario ese día (para repartir la carga)
  servicesByOperator: Record<string, number>;
  onClose: () => void;
  onAssign: (reservation: Reservation, operatorId: string) => void;
}

// elegir quién atiende una reserva (assign-operator-modal de la web). Quién está disponible lo
// dice operations-service para esa reserva (turno, ausencias, cruces, activo); los demás aparecen
// con el motivo y no se pueden elegir.
export function AssignOperatorModal({ reservation, operators, servicesByOperator, onClose, onAssign }: AssignOperatorModalProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const texts = TEXTS.assign;
  const { t } = useTranslation();
  const [selected, setSelected] = useState('');
  // null mientras carga; error si operations no respondió
  const [candidates, setCandidates] = useState<Map<string, CandidateResponse> | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  // al abrir queda marcado el operario actual (si ya tenía) y se pide la disponibilidad
  useEffect(() => {
    if (!reservation) return;
    setSelected(reservation.operatorId);
    setCandidates(null);
    setLoadError(null);
    operationsService
      .candidates(Number(reservation.id))
      .then((list) => setCandidates(new Map(list.map((c) => [String(c.operatorId), c]))))
      .catch((error) => setLoadError(t(apiErrorKey(error))));
  }, [reservation, t]);

  const candidateOf = (operator: Operator) => candidates?.get(operator.id);

  const statusLabel = (operator: Operator) => {
    const c = candidateOf(operator);
    if (!c) return '…';
    return c.available ? texts.available : t(`ASSIGN_REASONS.${c.unavailableReason}`);
  };

  const statusColor = (operator: Operator) => {
    const c = candidateOf(operator);
    if (!c) return colors.textMuted;
    return c.available ? colors.success : c.unavailableReason === 'OPERATOR_BUSY' ? colors.warning : colors.error;
  };

  return (
    <FormModal
      visible={reservation !== null}
      title={texts.title}
      subtitle={reservation ? texts.subtitle(reservation.code) : ''}
      cancelLabel={texts.cancel}
      submitLabel={texts.confirm}
      submitDisabled={!selected || selected === reservation?.operatorId || !candidates?.get(selected)?.available}
      onClose={onClose}
      onSubmit={() => reservation && selected && onAssign(reservation, selected)}
    >
      {operators.length === 0 ? <Text style={styles.empty}>{texts.empty}</Text> : null}
      {loadError ? <Text style={styles.empty}>{loadError}</Text> : null}

      {operators.map((operator) => {
        const active = operator.id === selected;
        // solo se elige a quien operations dio como disponible para esta reserva
        const disabled = !candidateOf(operator)?.available;
        const color = statusColor(operator);
        return (
          <Pressable
            key={operator.id}
            disabled={disabled}
            onPress={() => setSelected(operator.id)}
            style={[styles.option, active && styles.optionActive, disabled && styles.optionDisabled]}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{getInitials(operator.name)}</Text>
            </View>
            <View style={styles.info}>
              <Text style={styles.name}>{operator.name}</Text>
              <Text style={styles.meta} numberOfLines={1}>
                {operator.specialty} · {texts.servicesToday(servicesByOperator[operator.id] ?? 0)}
              </Text>
              <View style={[styles.status, { backgroundColor: withAlpha(color, 0.15) }]}>
                <Text style={[styles.statusText, { color }]}>{statusLabel(operator)}</Text>
              </View>
            </View>
            <MaterialIcons
              name={active ? 'radio-button-checked' : 'radio-button-unchecked'}
              size={22}
              color={active ? colors.primary : colors.textMuted}
            />
          </Pressable>
        );
      })}
    </FormModal>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    empty: { fontSize: 14, color: colors.textSecondary, textAlign: 'center' },
    option: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      padding: 12,
      borderRadius: 14,
      borderWidth: 1.5,
      borderColor: colors.border,
    },
    optionActive: { borderColor: colors.primary, backgroundColor: withAlpha(colors.primary, 0.08) },
    optionDisabled: { opacity: 0.45 },
    avatar: {
      width: 42,
      height: 42,
      borderRadius: 21,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: withAlpha(colors.primary, 0.15),
    },
    avatarText: { fontSize: 14, fontWeight: '700', color: colors.primary },
    info: { flex: 1, gap: 3 },
    name: { fontSize: 15, fontWeight: '700', color: colors.text },
    meta: { fontSize: 12, color: colors.textSecondary },
    status: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 },
    statusText: { fontSize: 11, fontWeight: '700' },
  });
