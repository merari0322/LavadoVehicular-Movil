import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ImageSourcePropType, Linking, Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fontSize, fontWeight, radius, spacing, useTheme } from '../../../app/theme';
import { ThemeColors } from '../../../app/theme/colors';
import { RootStackParamList } from '../../../core/navigation/types';
import { apiErrorKey } from '../../../core/api/apiError';
import {
  InspectionFinding,
  InspectionPhaseEntry,
  InspectionService,
  LONG_SERVICE_MIN_MINUTES,
  NewFindingRequest,
} from '../../../core/services/operations/InspectionService';
import { AdminLayout } from '../../../shared/layouts/AdminLayout';
import { AppAlert } from '../../../shared/components/feedback/AppAlert';
import { ConfirmDialog } from '../../../shared/components/feedback/ConfirmDialog';
import { ActionButton } from '../../../shared/components/screen/ActionButton';
import { EmptyState } from '../../../shared/components/screen/EmptyState';
import { StatGrid, StatTile } from '../../../shared/components/screen/StatTile';
import { withAlpha } from '../../../shared/utils/color';
import { StatusBadge } from '../components/common/StatusBadge';
import { FindingFormModal } from '../components/inspection/FindingFormModal';
import { PhaseCard } from '../components/inspection/PhaseCard';
import { PhotoPreviewModal } from '../components/inspection/PhotoPreviewModal';
import { INSPECTION_TEXTS } from '../constants/inspectionTexts';
import { TEXTS as RESERVATION_TEXTS } from '../constants/reservationTexts';
import { useInspection } from '../viewmodels/useInspection';

type Props = NativeStackScreenProps<RootStackParamList, 'AdminInspection'>;

// Reporte de inspección del vehículo (RF-027), igual que la pantalla de la web
// (admin/reservations/:id/inspection): el admin lo llena por fases con hallazgos y fotos, lo
// publica y el cliente lo ve en un enlace público de solo lectura.
export function AdminInspectionScreen({ route, navigation }: Props) {
  // vuelve a pintar la pantalla cuando cambia el idioma
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const texts = INSPECTION_TEXTS;

  const { bookingId, summary } = route.params;
  const inspection = useInspection(bookingId);
  const { report, editable, available, loading, busy } = inspection;

  // fase a la que se agrega un hallazgo (null = formulario cerrado)
  const [findingPhase, setFindingPhase] = useState<InspectionPhaseEntry | null>(null);
  const [deleting, setDeleting] = useState<InspectionFinding | null>(null);
  const [preview, setPreview] = useState<ImageSourcePropType | null>(null);

  const publicLink = report ? InspectionService.publicLink(report.publicToken) : '';
  const bookingCode = report?.booking.code ?? summary.code;

  // muestra el mensaje del backend (ya traducido) si la acción falló
  const succeeded = (error: unknown): boolean => {
    if (!error) return true;
    AppAlert.alert(t('COMMON.ERROR'), t(apiErrorKey(error)), undefined, { type: 'error' });
    return false;
  };

  const shareLink = async () => {
    await Share.share({ message: texts.shareMessage(bookingCode, publicLink) });
  };

  const publishAndShare = async () => {
    if (!report) return;
    if (report.published) {
      await shareLink();
      return;
    }
    if (succeeded(await inspection.publish())) {
      AppAlert.alert(texts.feedback.publishedTitle, texts.feedback.publishedMessage, undefined, { type: 'success' });
    }
  };

  const notifyClient = async () => {
    if (!report?.published || busy) return;
    if (succeeded(await inspection.share())) {
      AppAlert.alert(texts.feedback.notifiedTitle, texts.feedback.notifiedMessage, undefined, { type: 'success' });
    }
  };

  const saveFinding = async (finding: NewFindingRequest) => {
    if (!findingPhase) return;
    if (succeeded(await inspection.addFinding(findingPhase.phase, finding))) setFindingPhase(null);
  };

  const confirmDelete = async () => {
    const finding = deleting;
    setDeleting(null);
    if (finding) succeeded(await inspection.removeFinding(finding.id));
  };

  return (
    <AdminLayout activeKey="reservations">
      <SafeAreaView edges={['top']} style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          {/* encabezado */}
          <View style={styles.titleRow}>
            <Pressable
              style={styles.back}
              onPress={() => navigation.goBack()}
              hitSlop={8}
              accessibilityLabel={texts.back}
            >
              <MaterialIcons name="arrow-back" size={22} color={colors.text} />
            </Pressable>
            <View style={styles.titleIcon}>
              <MaterialIcons name="fact-check" size={24} color={colors.primary} />
            </View>
            <View style={styles.flex}>
              <Text style={styles.title}>{texts.title}</Text>
              <Text style={styles.subtitle}>{texts.subtitle}</Text>
            </View>
          </View>

          {/* datos de la reserva */}
          <View style={styles.card}>
            <View style={styles.bookingMain}>
              <View style={styles.plate}>
                <Text style={styles.plateText}>{report?.booking.plate ?? summary.plate}</Text>
              </View>
              <View style={styles.flex}>
                <Text style={styles.vehicle} numberOfLines={2}>
                  {report?.booking.vehicle ?? summary.vehicle}
                </Text>
                <Text style={styles.muted}>{bookingCode}</Text>
              </View>
              <StatusBadge status={summary.status} />
            </View>
            <View style={styles.bookingGrid}>
              <BookingField label={RESERVATION_TEXTS.detail.name} value={summary.customerName} styles={styles} />
              <BookingField label={RESERVATION_TEXTS.detail.service} value={summary.service} styles={styles} />
              <BookingField label={RESERVATION_TEXTS.detail.date} value={summary.dateLabel} styles={styles} />
              <BookingField label={RESERVATION_TEXTS.detail.duration} value={`${summary.duration} min`} styles={styles} />
            </View>
          </View>

          {loading ? (
            <EmptyState loading title={texts.title} />
          ) : !inspection.state ? (
            <EmptyState
              icon="search-off"
              title={texts.notFoundTitle}
              subtitle={texts.notFoundMessage}
              actionLabel={texts.back}
              onAction={() => navigation.goBack()}
            />
          ) : !report ? (
            /* todavía no hay reporte */
            <View style={[styles.card, styles.startCard]}>
              <View style={styles.startIcon}>
                <MaterialIcons name="add-a-photo" size={30} color={colors.primary} />
              </View>
              {editable ? (
                <>
                  <Text style={styles.startTitle}>{texts.startTitle}</Text>
                  <Text style={styles.startMessage}>{texts.startMessage}</Text>
                  <ActionButton
                    label={texts.start}
                    icon="play-arrow"
                    onPress={async () => succeeded(await inspection.start())}
                    loading={busy}
                    style={styles.fullButton}
                  />
                </>
              ) : (
                <>
                  <Text style={styles.startTitle}>{texts.unavailableTitle}</Text>
                  <Text style={styles.startMessage}>
                    {available ? texts.unavailableClosed : texts.unavailableShort(LONG_SERVICE_MIN_MINUTES)}
                  </Text>
                </>
              )}
            </View>
          ) : (
            <>
              {/* acciones del reporte */}
              <View style={styles.actions}>
                <ActionButton
                  label={report.published ? texts.shareLink : texts.publish}
                  icon={report.published ? 'share' : 'publish'}
                  onPress={publishAndShare}
                  disabled={busy}
                  style={styles.action}
                />
                {report.published ? (
                  <>
                    <ActionButton
                      label={texts.notifyClient}
                      icon="notifications-active"
                      variant="outline"
                      onPress={notifyClient}
                      disabled={busy}
                      style={styles.action}
                    />
                    <ActionButton
                      label={texts.viewAsClient}
                      icon="visibility"
                      variant="outline"
                      onPress={() => Linking.openURL(publicLink)}
                      style={styles.action}
                    />
                  </>
                ) : null}
              </View>

              {/* resumen (de a dos tarjetas por fila, como el resto de la app) */}
              <StatGrid>
                <StatTile
                  value={`${report.summary.phasesDone}/${report.summary.phasesTotal}`}
                  label={texts.stats.phases}
                  icon="timeline"
                />
                <StatTile value={report.summary.findings} label={texts.stats.findings} icon="photo-library" tone="neutral" />
                <StatTile value={report.summary.majorFindings} label={texts.stats.major} icon="report" tone="error" />
              </StatGrid>

              {report.published ? (
                <View style={[styles.card, styles.linkCard]}>
                  <MaterialIcons name="link" size={20} color={colors.primary} />
                  <View style={styles.flex}>
                    <Text style={styles.muted}>{texts.link}</Text>
                    <Text style={styles.linkText} selectable numberOfLines={2}>
                      {publicLink}
                    </Text>
                  </View>
                </View>
              ) : (
                <Hint icon="info" text={texts.notPublishedHint} styles={styles} color={colors.textSecondary} />
              )}

              {!editable ? (
                // operations-service solo deja editar mientras el vehículo está en el lavadero
                <Hint icon="lock" text={texts.readOnlyHint} styles={styles} color={colors.textSecondary} />
              ) : null}

              {/* fases */}
              <View>
                {report.phases.map((entry, index) => (
                  <PhaseCard
                    key={entry.phase}
                    entry={entry}
                    isLast={index === report.phases.length - 1}
                    editable={editable}
                    busy={busy}
                    onAddFinding={() => setFindingPhase(entry)}
                    onSetStatus={async (status) => succeeded(await inspection.setPhaseStatus(entry.phase, status))}
                    onRemoveFinding={setDeleting}
                    onOpenPhoto={setPreview}
                  />
                ))}
              </View>
            </>
          )}
        </ScrollView>
      </SafeAreaView>

      <FindingFormModal
        visible={findingPhase !== null}
        phaseLabel={findingPhase ? texts.phases[findingPhase.phase] : ''}
        saving={busy}
        onClose={() => setFindingPhase(null)}
        onSubmit={saveFinding}
      />

      <ConfirmDialog
        visible={deleting !== null}
        title={texts.feedback.deleteTitle}
        message={deleting ? texts.feedback.deleteConfirm(deleting.area) : ''}
        confirmLabel={texts.feedback.delete}
        cancelLabel={texts.feedback.cancel}
        danger
        icon="delete-outline"
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(null)}
      />

      <PhotoPreviewModal source={preview} onClose={() => setPreview(null)} />
    </AdminLayout>
  );
}

type Styles = ReturnType<typeof createStyles>;

function BookingField({ label, value, styles }: { label: string; value: string; styles: Styles }) {
  return (
    <View style={styles.field}>
      <Text style={styles.muted}>{label}</Text>
      <Text style={styles.fieldValue}>{value || '-'}</Text>
    </View>
  );
}

function Hint({ icon, text, styles, color }: { icon: 'info' | 'lock'; text: string; styles: Styles; color: string }) {
  return (
    <View style={styles.hint}>
      <MaterialIcons name={icon} size={18} color={color} />
      <Text style={styles.hintText}>{text}</Text>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bg },
    content: { gap: spacing.lg, padding: spacing.lg, paddingBottom: 120 },
    flex: { flex: 1 },
    titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
    back: {
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
    },
    titleIcon: {
      width: 44,
      height: 44,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius.md,
      backgroundColor: withAlpha(colors.primary, 0.14),
    },
    title: { fontSize: fontSize.pageTitle, fontWeight: fontWeight.extrabold, color: colors.text },
    subtitle: { marginTop: 2, fontSize: fontSize.small, lineHeight: 18, color: colors.textSecondary },
    card: {
      gap: spacing.md,
      padding: spacing.lg,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
    },
    bookingMain: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.md },
    plate: {
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: radius.sm,
      borderWidth: 1.5,
      borderColor: colors.text,
      backgroundColor: colors.warningSoft,
    },
    plateText: { fontSize: fontSize.body, fontWeight: fontWeight.extrabold, letterSpacing: 1, color: colors.text },
    vehicle: { fontSize: fontSize.body, fontWeight: fontWeight.bold, color: colors.text },
    muted: { fontSize: fontSize.caption, color: colors.textSecondary },
    // dos columnas en pantallas normales; en las muy angostas cada dato ocupa toda la fila
    bookingGrid: { flexDirection: 'row', flexWrap: 'wrap', rowGap: spacing.md, columnGap: spacing.lg },
    field: { flexGrow: 1, flexBasis: 140, gap: 2 },
    fieldValue: { fontSize: fontSize.body, fontWeight: fontWeight.semibold, color: colors.text },
    startCard: { alignItems: 'center', paddingVertical: spacing.xl },
    startIcon: {
      width: 64,
      height: 64,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 32,
      backgroundColor: withAlpha(colors.primary, 0.14),
    },
    startTitle: { textAlign: 'center', fontSize: fontSize.cardTitle, fontWeight: fontWeight.bold, color: colors.text },
    startMessage: { textAlign: 'center', fontSize: fontSize.small, lineHeight: 20, color: colors.textSecondary },
    fullButton: { alignSelf: 'stretch' },
    actions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
    action: { flexGrow: 1, flexBasis: 160 },
    linkCard: { flexDirection: 'row', alignItems: 'center' },
    linkText: { marginTop: 2, fontSize: fontSize.small, fontWeight: fontWeight.semibold, color: colors.primary },
    hint: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: spacing.sm,
      padding: spacing.md,
      borderRadius: radius.md,
      backgroundColor: withAlpha(colors.textMuted, 0.1),
    },
    hintText: { flex: 1, fontSize: fontSize.small, lineHeight: 19, color: colors.textSecondary },
  });
