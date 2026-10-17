import React, { useMemo } from 'react';
import { ImageSourcePropType, Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { fontSize, fontWeight, radius, spacing, useTheme } from '../../../../app/theme';
import { ThemeColors } from '../../../../app/theme/colors';
import { withAlpha } from '../../../../shared/utils/color';
import { ActionButton } from '../../../../shared/components/screen/ActionButton';
import { Pill } from '../../../../shared/components/ui/Pill';
import {
  InspectionFinding,
  InspectionPhaseEntry,
  InspectionPhaseStatus,
  InspectionService,
} from '../../../../core/services/operations/InspectionService';
import { INSPECTION_TEXTS } from '../../constants/inspectionTexts';
import { InspectionPhotoThumb } from './InspectionPhotoThumb';
import { PHASE_ICONS, PHASE_STATUS_TONES, SEVERITY_PILL_TONES } from './inspectionTones';

interface PhaseCardProps {
  entry: InspectionPhaseEntry;
  isLast: boolean;
  editable: boolean;
  busy: boolean;
  onAddFinding: () => void;
  onSetStatus: (status: InspectionPhaseStatus) => void;
  onRemoveFinding: (finding: InspectionFinding) => void;
  onOpenPhoto: (source: ImageSourcePropType) => void;
}

const hour = (value: string) => new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

// Una fase del reporte en la línea de tiempo (timeline__item de la web): marcador con el ícono,
// estado, horas, hallazgos con fotos y las acciones de la fase si el reporte se puede editar
export function PhaseCard({
  entry,
  isLast,
  editable,
  busy,
  onAddFinding,
  onSetStatus,
  onRemoveFinding,
  onOpenPhoto,
}: PhaseCardProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const texts = INSPECTION_TEXTS;

  const markerColor =
    entry.status === 'DONE' ? colors.success : entry.status === 'IN_PROGRESS' ? colors.primary : colors.textMuted;
  const times = [
    entry.startedAt ? texts.startedAt(hour(entry.startedAt)) : null,
    entry.finishedAt ? texts.finishedAt(hour(entry.finishedAt)) : null,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <View style={styles.item}>
      {/* marcador y línea que une las fases */}
      <View style={styles.rail}>
        <View style={[styles.marker, { borderColor: markerColor, backgroundColor: withAlpha(markerColor, 0.14) }]}>
          <MaterialIcons name={PHASE_ICONS[entry.phase]} size={18} color={markerColor} />
        </View>
        {!isLast ? <View style={styles.line} /> : null}
      </View>

      <View style={[styles.card, entry.status === 'IN_PROGRESS' && styles.cardActive]}>
        <View style={styles.header}>
          <View style={styles.flex}>
            <Text style={styles.title}>{texts.phases[entry.phase]}</Text>
            {times ? <Text style={styles.muted}>{times}</Text> : null}
          </View>
          <Pill label={texts.phaseStatus[entry.status]} tone={PHASE_STATUS_TONES[entry.status]} />
        </View>

        {entry.findings.length ? (
          <View style={styles.findings}>
            {entry.findings.map((finding) => (
              <View key={finding.id} style={styles.finding}>
                <View style={styles.findingHeader}>
                  <Pill label={texts.severity[finding.severity]} tone={SEVERITY_PILL_TONES[finding.severity]} />
                  <Text style={[styles.muted, styles.findingTime]}>{hour(finding.createdAt)}</Text>
                  {editable ? (
                    <Pressable
                      style={styles.deleteButton}
                      onPress={() => onRemoveFinding(finding)}
                      disabled={busy}
                      hitSlop={8}
                      accessibilityLabel={texts.feedback.delete}
                    >
                      <MaterialIcons name="delete-outline" size={20} color={colors.error} />
                    </Pressable>
                  ) : null}
                </View>
                <Text style={styles.findingArea}>{finding.area}</Text>
                {finding.note ? <Text style={styles.note}>{finding.note}</Text> : null}
                {finding.photos.length ? (
                  <View style={styles.photos}>
                    {finding.photos.map((photo) => {
                      const source = InspectionService.photoSource(photo.url);
                      return <InspectionPhotoThumb key={photo.id} source={source} onPress={() => onOpenPhoto(source)} />;
                    })}
                  </View>
                ) : null}
              </View>
            ))}
          </View>
        ) : entry.status === 'DONE' ? (
          <View style={styles.empty}>
            <MaterialIcons name="check" size={16} color={colors.success} />
            <Text style={styles.emptyText}>{texts.noFindings}</Text>
          </View>
        ) : null}

        {editable ? (
          <View style={styles.actions}>
            {entry.status !== 'DONE' ? (
              <ActionButton
                label={texts.addFinding}
                icon="add-a-photo"
                variant="outline"
                small
                onPress={onAddFinding}
                disabled={busy}
                style={styles.action}
              />
            ) : null}
            {entry.status === 'PENDING' ? (
              <ActionButton
                label={texts.startPhase}
                icon="play-arrow"
                small
                onPress={() => onSetStatus('IN_PROGRESS')}
                disabled={busy}
                style={styles.action}
              />
            ) : entry.status === 'IN_PROGRESS' ? (
              <ActionButton
                label={texts.finishPhase}
                icon="check"
                small
                onPress={() => onSetStatus('DONE')}
                disabled={busy}
                style={styles.action}
              />
            ) : (
              <ActionButton
                label={texts.reopenPhase}
                icon="undo"
                variant="outline"
                small
                onPress={() => onSetStatus('IN_PROGRESS')}
                disabled={busy}
                style={styles.action}
              />
            )}
          </View>
        ) : null}
      </View>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    flex: { flex: 1 },
    item: { flexDirection: 'row', gap: spacing.md },
    rail: { alignItems: 'center', width: 38 },
    marker: {
      width: 38,
      height: 38,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 19,
      borderWidth: 2,
    },
    line: { flex: 1, width: 2, marginVertical: 4, backgroundColor: colors.border },
    card: {
      flex: 1,
      gap: spacing.md,
      marginBottom: spacing.lg,
      padding: spacing.lg,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
    },
    cardActive: { borderColor: colors.primary },
    header: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
    title: { fontSize: fontSize.cardTitle, fontWeight: fontWeight.bold, color: colors.text },
    muted: { marginTop: 2, fontSize: fontSize.caption, color: colors.textSecondary },
    findings: { gap: spacing.md },
    finding: {
      gap: spacing.sm,
      padding: spacing.md,
      borderRadius: radius.md,
      backgroundColor: withAlpha(colors.textMuted, 0.08),
    },
    // arriba el tipo, la hora y borrar; la parte del vehículo va debajo con todo el ancho
    findingHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    findingTime: { flex: 1, marginTop: 0, textAlign: 'right' },
    findingArea: { fontSize: fontSize.body, fontWeight: fontWeight.semibold, color: colors.text },
    deleteButton: { padding: 2 },
    note: { fontSize: fontSize.small, lineHeight: 19, color: colors.textSecondary },
    photos: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
    empty: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    emptyText: { fontSize: fontSize.small, color: colors.textSecondary },
    actions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
    // en pantallas angostas los botones bajan a otra fila y ocupan todo el ancho
    action: { flexGrow: 1, flexBasis: 140 },
  });
