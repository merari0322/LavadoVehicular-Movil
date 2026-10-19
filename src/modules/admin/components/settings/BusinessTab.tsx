import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../../../app/theme';
import { ThemeColors } from '../../../../app/theme/colors';
import { SETTINGS_TEXTS } from '../../constants/settingsTexts';
import { BusinessData } from '../../models/settings';
import { BusinessErrors } from '../../viewmodels/useSettings';
import { Pill } from '../../../../shared/components/ui/Pill';
import { SettingsSectionCard } from './SettingsSectionCard';
import { BusinessField, BusinessSectionModal } from './BusinessSectionModal';
import { withAlpha } from '../../../../shared/utils/color';

interface BusinessTabProps {
  businessName: string; // Nombre guardado, para el subtítulo
  data: BusinessData;
  errors: BusinessErrors;
  isDirty: boolean; // Hay cambios sin guardar
  onChange: (partial: Partial<BusinessData>) => void;
  onDiscard: () => void;
  onSave: () => void;
}

type SectionId = 'general' | 'location' | 'fiscal' | 'channels';
type IconName = keyof typeof MaterialIcons.glyphMap;

// Las cuatro secciones: cada una se ve en solo lectura y se edita con su lápiz.
// Son constantes del módulo para que el modal no se reinicie en cada render.
const SECTIONS: { id: SectionId; icon: IconName; note?: 'fiscalNote' | 'channelsNote'; fields: BusinessField[] }[] = [
  {
    id: 'general',
    icon: 'apartment',
    fields: [
      { name: 'legalName' },
      { name: 'taxId' },
      { name: 'businessType' },
      { name: 'foundedAt', isDate: true },
      { name: 'legalRepresentative' },
      { name: 'legalDocument' },
    ],
  },
  {
    id: 'location',
    icon: 'place',
    fields: [
      { name: 'address' },
      { name: 'phone', keyboardType: 'phone-pad' },
      { name: 'email', keyboardType: 'email-address', autoCapitalize: 'none' },
      { name: 'website', keyboardType: 'url', autoCapitalize: 'none' },
    ],
  },
  {
    id: 'fiscal',
    icon: 'receipt-long',
    note: 'fiscalNote',
    fields: [
      { name: 'taxRegime' },
      { name: 'ciiuActivity' },
      { name: 'dianResolution' },
      { name: 'invoicePrefix' },
      { name: 'invoiceRange' },
    ],
  },
  {
    id: 'channels',
    icon: 'share',
    note: 'channelsNote',
    fields: [
      { name: 'instagram', autoCapitalize: 'none' },
      { name: 'facebook' },
      { name: 'supportLine', keyboardType: 'phone-pad' },
      { name: 'schedule' },
    ],
  },
];

const texts = SETTINGS_TEXTS.business;
const NO_FIELDS: BusinessField[] = [];

// Pestaña de datos del negocio: cuatro tarjetas de formulario con guardar y descartar
export function BusinessTab({ businessName, data, errors, isDirty, onChange, onDiscard, onSave }: BusinessTabProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  // sección abierta en el modal del lápiz (null = ninguna)
  const [editing, setEditing] = useState<SectionId | null>(null);
  const editingSection = SECTIONS.find((section) => section.id === editing) ?? null;

  // Una fila de solo lectura: etiqueta, valor (o "Por completar") y el error si al guardar quedó mal
  const renderValue = (name: keyof BusinessData) => {
    const value = data[name].trim();
    return (
      <View key={name} style={styles.valueRow}>
        <Text style={styles.valueLabel}>{texts.fields[name]}</Text>
        {value ? (
          <Text style={styles.value}>{value}</Text>
        ) : (
          <Text style={[styles.value, styles.pending]}>{texts.pending}</Text>
        )}
        {errors[name] ? <Text style={styles.valueError}>{errors[name]}</Text> : null}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Encabezado */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{texts.title}</Text>
          {isDirty ? <Pill label={texts.unsaved} tone="warning" /> : null}
        </View>
        <Text style={styles.subtitle}>
          {texts.subtitle(businessName.trim().replace(/\.$/, '') || texts.fallbackName)}
        </Text>

        <View style={styles.buttons}>
          <Pressable
            style={[styles.button, styles.discardButton, !isDirty && styles.disabled]}
            onPress={onDiscard}
            disabled={!isDirty}
          >
            <Text style={styles.discardText}>{texts.discard}</Text>
          </Pressable>
          <Pressable
            style={[styles.button, styles.saveButton, !isDirty && styles.disabled]}
            onPress={onSave}
            disabled={!isDirty}
          >
            <MaterialIcons name="check" size={18} color={colors.onPrimary} />
            <Text style={styles.saveText}>{texts.save}</Text>
          </Pressable>
        </View>
      </View>

      {/* todo lo de esta pestaña se llena con los datos del negocio real cuando se implemente */}
      <View style={styles.notice}>
        <MaterialIcons name="storefront" size={22} color={colors.primary} />
        <View style={styles.flex}>
          <Text style={styles.noticeTitle}>{texts.noticeTitle}</Text>
          <Text style={styles.noticeText}>{texts.noticeMessage}</Text>
        </View>
      </View>

      {SECTIONS.map((section) => (
        <SettingsSectionCard
          key={section.id}
          icon={section.icon}
          title={texts.sections[section.id].title}
          subtitle={texts.sections[section.id].subtitle}
          onEdit={() => setEditing(section.id)}
          editLabel={texts.edit}
        >
          {section.note ? (
            <View style={styles.note}>
              <MaterialIcons name="info" size={16} color={colors.warning} />
              <Text style={styles.noteText}>{texts[section.note]}</Text>
            </View>
          ) : null}
          {section.fields.map((field) => renderValue(field.name))}
        </SettingsSectionCard>
      ))}

      <BusinessSectionModal
        visible={editingSection !== null}
        title={editingSection ? texts.sections[editingSection.id].title : ''}
        subtitle={editingSection ? texts.sections[editingSection.id].subtitle : ''}
        fields={editingSection?.fields ?? NO_FIELDS}
        values={data}
        onClose={() => setEditing(null)}
        onApply={(partial) => {
          onChange(partial);
          setEditing(null);
        }}
      />
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    flex: { flex: 1 },
    container: { gap: 16 },
    header: { gap: 8 },
    titleRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 10 },
    title: { fontSize: 24, fontWeight: '800', color: colors.text },
    subtitle: { fontSize: 14, lineHeight: 20, color: colors.textSecondary },
    buttons: { flexDirection: 'row', gap: 10, marginTop: 6 },
    button: {
      flex: 1,
      height: 46,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      borderRadius: 12,
    },
    discardButton: { borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card },
    discardText: { fontSize: 14, fontWeight: '700', color: colors.text },
    saveButton: { backgroundColor: colors.primary },
    saveText: { fontSize: 14, fontWeight: '700', color: colors.onPrimary },
    disabled: { opacity: 0.45 },
    valueRow: { gap: 2, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: colors.border },
    valueLabel: { fontSize: 12, color: colors.textSecondary },
    value: { fontSize: 15, fontWeight: '600', color: colors.text },
    pending: { fontStyle: 'italic', fontWeight: '400', color: colors.textMuted },
    valueError: { fontSize: 12, color: colors.error },
    notice: {
      flexDirection: 'row',
      gap: 10,
      padding: 14,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.primary,
      backgroundColor: withAlpha(colors.primary, 0.1),
    },
    noticeTitle: { fontSize: 14, fontWeight: '800', color: colors.text },
    noticeText: { marginTop: 2, fontSize: 13, lineHeight: 18, color: colors.textSecondary },
    note: {
      flexDirection: 'row',
      gap: 6,
      padding: 10,
      borderRadius: 10,
      backgroundColor: withAlpha(colors.warning, 0.12),
    },
    noteText: { flex: 1, fontSize: 12, lineHeight: 17, color: colors.text },
  });
