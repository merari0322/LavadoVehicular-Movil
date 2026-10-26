import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { fontSize, fontWeight, radius, spacing, useTheme } from '../../../../app/theme';
import { ThemeColors } from '../../../../app/theme/colors';
import { withAlpha } from '../../../../shared/utils/color';
import { FormModal } from '../../../../shared/components/feedback/FormModal';
import { LabeledInput } from '../../../../shared/components/forms/LabeledInput';
import {
  FindingPhotoUpload,
  FindingSeverity,
  MAX_FINDING_PHOTOS,
  NewFindingRequest,
} from '../../../../core/services/operations/InspectionService';
import { INSPECTION_TEXTS } from '../../constants/inspectionTexts';
import { PhotoPermissionError, pickFindingPhotos, takeFindingPhoto } from '../../services/inspectionPhotos';
import { InspectionPhotoThumb } from './InspectionPhotoThumb';
import { SEVERITY_TONES } from './inspectionTones';

const SEVERITIES: FindingSeverity[] = ['INFO', 'MINOR', 'MAJOR'];

interface FindingFormModalProps {
  visible: boolean;
  phaseLabel: string;
  saving: boolean;
  onClose: () => void;
  onSubmit: (finding: NewFindingRequest) => void;
}

// Formulario "Nuevo hallazgo" (finding-modal de la web): parte del vehículo, tipo, nota y hasta
// 5 fotos tomadas con la cámara o elegidas de la galería (se reducen antes de subirlas)
export function FindingFormModal({ visible, phaseLabel, saving, onClose, onSubmit }: FindingFormModalProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const texts = INSPECTION_TEXTS.findingForm;

  const [area, setArea] = useState('');
  const [severity, setSeverity] = useState<FindingSeverity>('MINOR');
  const [note, setNote] = useState('');
  const [photos, setPhotos] = useState<FindingPhotoUpload[]>([]);
  const [processing, setProcessing] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);

  // cada vez que se abre empieza vacío
  useEffect(() => {
    if (!visible) return;
    setArea('');
    setSeverity('MINOR');
    setNote('');
    setPhotos([]);
    setPhotoError(null);
  }, [visible]);

  const free = MAX_FINDING_PHOTOS - photos.length;
  const canSave = area.trim().length > 0 && !processing && !saving;

  const addPhotos = async (source: 'camera' | 'gallery') => {
    if (free <= 0) {
      setPhotoError(texts.maxPhotos(MAX_FINDING_PHOTOS));
      return;
    }
    setPhotoError(null);
    setProcessing(true);
    try {
      const added = source === 'camera' ? [await takeFindingPhoto()].filter(Boolean) : await pickFindingPhotos(free);
      setPhotos((list) => [...list, ...(added as FindingPhotoUpload[])].slice(0, MAX_FINDING_PHOTOS));
    } catch (error) {
      if (error instanceof PhotoPermissionError) {
        setPhotoError(error.source === 'camera' ? texts.cameraPermission : texts.galleryPermission);
      } else {
        setPhotoError(texts.photoError);
      }
    } finally {
      setProcessing(false);
    }
  };

  const submit = () => {
    if (!canSave) return;
    onSubmit({ area: area.trim(), severity, note: note.trim(), photos });
  };

  return (
    <FormModal
      visible={visible}
      title={texts.title}
      subtitle={phaseLabel}
      cancelLabel={texts.cancel}
      submitLabel={texts.save}
      submitDisabled={!canSave}
      onClose={onClose}
      onSubmit={submit}
    >
      <LabeledInput
        label={texts.area}
        required
        value={area}
        onChangeText={setArea}
        placeholder={texts.areaPlaceholder}
        maxLength={80}
      />
      {/* sugerencias para escribir rápido desde el celular */}
      <View style={styles.chips}>
        {INSPECTION_TEXTS.areas.map((suggestion: string) => {
          const active = area === suggestion;
          return (
            <Pressable
              key={suggestion}
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => setArea(suggestion)}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{suggestion}</Text>
            </Pressable>
          );
        })}
      </View>

      <View>
        <Text style={styles.label}>{texts.severity}</Text>
        <View style={styles.severities}>
          {SEVERITIES.map((item) => {
            const active = severity === item;
            const tone = SEVERITY_TONES[item](colors);
            return (
              <Pressable
                key={item}
                style={[
                  styles.severity,
                  active && { borderColor: tone.text, backgroundColor: tone.background },
                ]}
                onPress={() => setSeverity(item)}
              >
                <Text style={[styles.severityText, active && { color: tone.text }]}>{INSPECTION_TEXTS.severity[item]}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <LabeledInput
        label={texts.note}
        value={note}
        onChangeText={setNote}
        placeholder={texts.notePlaceholder}
        multiline
        maxLength={500}
      />

      <View style={styles.photosBlock}>
        <Text style={styles.label}>{texts.photos(photos.length, MAX_FINDING_PHOTOS)}</Text>
        {photos.length ? (
          <View style={styles.photos}>
            {photos.map((photo, index) => (
              <InspectionPhotoThumb
                key={photo.uri}
                source={{ uri: photo.uri }}
                size={70}
                onRemove={() => setPhotos((list) => list.filter((_, i) => i !== index))}
              />
            ))}
          </View>
        ) : null}

        <View style={styles.photoButtons}>
          <Pressable
            style={[styles.photoButton, (free <= 0 || processing) && styles.disabled]}
            onPress={() => addPhotos('camera')}
            disabled={free <= 0 || processing}
          >
            <MaterialIcons name="photo-camera" size={18} color={colors.primary} />
            <Text style={styles.photoButtonText}>{texts.takePhoto}</Text>
          </Pressable>
          <Pressable
            style={[styles.photoButton, (free <= 0 || processing) && styles.disabled]}
            onPress={() => addPhotos('gallery')}
            disabled={free <= 0 || processing}
          >
            <MaterialIcons name="photo-library" size={18} color={colors.primary} />
            <Text style={styles.photoButtonText}>{texts.gallery}</Text>
          </Pressable>
        </View>

        {processing || saving ? <ActivityIndicator color={colors.primary} /> : null}
        {photoError ? (
          <Text style={styles.error}>{photoError}</Text>
        ) : (
          <Text style={styles.hint}>{texts.photosHint}</Text>
        )}
      </View>
    </FormModal>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    label: { marginBottom: 6, fontSize: 13, fontWeight: fontWeight.medium, color: colors.textSecondary },
    chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs + 2, marginTop: -spacing.xs },
    chip: {
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: radius.pill,
      borderWidth: 1,
      borderColor: colors.border,
    },
    chipActive: { borderColor: colors.primary, backgroundColor: withAlpha(colors.primary, 0.12) },
    chipText: { fontSize: fontSize.caption, color: colors.textSecondary },
    chipTextActive: { color: colors.primary, fontWeight: fontWeight.semibold },
    severities: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
    severity: {
      flexGrow: 1,
      flexBasis: 90,
      alignItems: 'center',
      paddingVertical: 10,
      paddingHorizontal: spacing.sm,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    severityText: { fontSize: fontSize.small, fontWeight: fontWeight.semibold, color: colors.textSecondary },
    photosBlock: { gap: spacing.sm },
    photos: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, paddingTop: 6 },
    photoButtons: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
    photoButton: {
      flexGrow: 1,
      flexBasis: 130,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      minHeight: 44,
      paddingHorizontal: spacing.md,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.primary,
      borderStyle: 'dashed',
    },
    photoButtonText: { fontSize: fontSize.body, fontWeight: fontWeight.semibold, color: colors.primary },
    disabled: { opacity: 0.5 },
    hint: { fontSize: fontSize.caption, lineHeight: 17, color: colors.textSecondary },
    error: { fontSize: fontSize.caption, fontWeight: fontWeight.semibold, color: colors.error },
  });
