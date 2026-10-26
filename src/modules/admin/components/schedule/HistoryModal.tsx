import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../../../app/theme';
import { ThemeColors } from '../../../../app/theme/colors';
import { SCHEDULE_TEXTS } from '../../constants/scheduleTexts';
import { HistoryEntry } from '../../models/schedule';
import { isoToDisplay } from '../../utils/reservationUtils';
import { ModalCloseButton } from '../../../../shared/components/feedback/ModalCloseButton';
import { ModalShell } from '../../../../shared/components/feedback/ModalShell';

interface HistoryModalProps {
  visible: boolean;
  entries: HistoryEntry[];
  onClose: () => void;
}

const texts = SCHEDULE_TEXTS.historyModal;

// Modal de solo lectura con las últimas modificaciones
export function HistoryModal({ visible, entries, onClose }: HistoryModalProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <ModalShell visible={visible} onRequestClose={onClose}>
      <View style={styles.sheet}>
        {/* Encabezado */}
        <View style={styles.header}>
          <View style={styles.flex}>
            <Text style={styles.title}>{texts.title}</Text>
            <Text style={styles.subtitle}>{texts.subtitle}</Text>
          </View>
          <ModalCloseButton onPress={onClose} />
        </View>

        {/* Movimientos, del más reciente al más antiguo */}
        <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
          {entries.length === 0 ? (
            <Text style={styles.subtitle}>{texts.empty}</Text>
          ) : (
            entries.map((entry, index) => (
              <View key={entry.id} style={[styles.entry, index > 0 && styles.entryBorder]}>
                <View style={styles.dot} />
                <View style={styles.flex}>
                  <Text style={styles.entryTitle}>
                    {entry.title}
                    {entry.detail ? <Text style={styles.entryDetail}> · {entry.detail}</Text> : null}
                  </Text>
                  <Text style={styles.entryMeta}>
                    {isoToDisplay(entry.date)} · {entry.author}
                  </Text>
                </View>
              </View>
            ))
          )}
        </ScrollView>

        <View style={styles.footer}>
          <Pressable style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeText}>{SCHEDULE_TEXTS.common.close}</Text>
          </Pressable>
        </View>
      </View>
    </ModalShell>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    flex: { flex: 1 },
    sheet: {
      maxHeight: '85%',
      borderRadius: 24,
      overflow: 'hidden',
      backgroundColor: colors.card,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 10,
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    title: { fontSize: 18, fontWeight: '800', color: colors.text },
    subtitle: { marginTop: 2, fontSize: 13, color: colors.textSecondary },
    body: { flexShrink: 1 },
    bodyContent: { paddingHorizontal: 20, paddingVertical: 8 },
    entry: { flexDirection: 'row', gap: 12, paddingVertical: 14 },
    entryBorder: { borderTopWidth: 1, borderTopColor: colors.border },
    dot: { width: 10, height: 10, marginTop: 6, borderRadius: 5, backgroundColor: colors.primary },
    entryTitle: { fontSize: 15, color: colors.text },
    entryDetail: { color: colors.textSecondary },
    entryMeta: { marginTop: 2, fontSize: 13, color: colors.textSecondary },
    footer: { padding: 16, borderTopWidth: 1, borderTopColor: colors.border },
    closeButton: {
      height: 46,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
    },
    closeText: { fontSize: 14, fontWeight: '700', color: colors.text },
  });
