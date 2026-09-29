import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../../../app/theme';
import { ThemeColors } from '../../../../app/theme/colors';
import { OPERATOR_TEXTS } from '../../constants/operatorTexts';
import { ServiceStatus, TodayService } from '../../models/operator';
import { Pill, PillTone } from '../common/Pills';

interface TodayServicesCardProps {
  services: TodayService[];
  bayName: string;
  onOpen: (service: TodayService) => void;
}

const texts = OPERATOR_TEXTS.today;

// Color de la etiqueta de cada estado de servicio
const STATUS_TONE: Record<ServiceStatus, PillTone> = {
  completed: 'neutral',
  in_progress: 'primary',
  scheduled: 'warning',
};

// Tarjeta con los servicios asignados al operario hoy
export function TodayServicesCard({ services, bayName, onOpen }: TodayServicesCardProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.card}>
      <View style={styles.titleRow}>
        <Text style={styles.title}>{texts.title}</Text>
        <Pill label={texts.assigned(services.length)} tone="primary" />
      </View>
      <Text style={styles.subtitle}>{bayName ? texts.subtitle(bayName) : texts.subtitleNoBay}</Text>

      {services.length === 0 ? (
        <Text style={styles.empty}>{texts.empty}</Text>
      ) : (
        services.map((service) => (
          <View key={service.id} style={styles.item}>
            <Text style={styles.code}>
              {service.code} · {service.vehicle}
            </Text>
            <Text style={styles.subtitle}>{service.service}</Text>

            <View style={styles.metaRow}>
              <Text style={styles.meta}>
                {texts.bay}: <Text style={styles.metaStrong}>{service.bayName}</Text>
              </Text>
              <Text style={styles.metaStrong}>
                {service.start} - {service.end}
              </Text>
            </View>

            <View style={styles.footer}>
              <Pill label={texts.status[service.status]} tone={STATUS_TONE[service.status]} />
              <Pressable onPress={() => onOpen(service)} hitSlop={8}>
                <Text style={styles.action}>{texts.action[service.status]}</Text>
              </Pressable>
            </View>
          </View>
        ))
      )}
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    card: {
      gap: 8,
      padding: 16,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
    },
    titleRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8 },
    title: { fontSize: 18, fontWeight: '800', color: colors.text },
    subtitle: { fontSize: 13, lineHeight: 19, color: colors.textSecondary },
    empty: { paddingVertical: 20, textAlign: 'center', fontSize: 14, color: colors.textSecondary },
    item: {
      gap: 4,
      padding: 14,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
    },
    code: { fontSize: 15, fontWeight: '700', color: colors.text },
    metaRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 8, marginTop: 4 },
    meta: { fontSize: 13, color: colors.textSecondary },
    metaStrong: { fontSize: 13, fontWeight: '700', color: colors.text },
    footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 },
    action: { fontSize: 14, fontWeight: '700', color: colors.primary },
  });
