import React, { useMemo } from 'react';
import { KeyboardTypeOptions, Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../../../app/theme';
import { ThemeColors } from '../../../../app/theme/colors';
import { LabeledInput } from '../../../../shared/components/forms/LabeledInput';
import { SETTINGS_TEXTS } from '../../constants/settingsTexts';
import { BusinessData } from '../../models/settings';
import { maskDate } from '../../utils/reservationUtils';
import { BusinessErrors } from '../../viewmodels/useSettings';
import { Pill } from '../../../../shared/components/ui/Pill';
import { SettingsSectionCard } from './SettingsSectionCard';
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

// Opciones extra de cada campo
interface FieldOptions {
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences';
  isDate?: boolean;
  inRow?: boolean; // Comparte fila con otro campo
}

const texts = SETTINGS_TEXTS.business;

// Pestaña de datos del negocio: cuatro tarjetas de formulario con guardar y descartar
export function BusinessTab({ businessName, data, errors, isDirty, onChange, onDiscard, onSave }: BusinessTabProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  // Dibuja un campo del formulario a partir de su nombre
  const renderField = (name: keyof BusinessData, options: FieldOptions = {}) => (
    <LabeledInput
      key={name}
      containerStyle={options.inRow ? styles.flex : undefined}
      label={texts.fields[name]}
      value={data[name]}
      onChangeText={(text) => onChange({ [name]: options.isDate ? maskDate(text) : text })}
      placeholder={options.isDate ? texts.datePlaceholder : texts.pending}
      error={errors[name]}
      keyboardType={options.isDate ? 'number-pad' : options.keyboardType}
      autoCapitalize={options.autoCapitalize}
      maxLength={options.isDate ? 10 : undefined}
    />
  );

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

      {/* Información general */}
      <SettingsSectionCard
        icon="apartment"
        title={texts.sections.general.title}
        subtitle={texts.sections.general.subtitle}
      >
        {renderField('legalName')}
        {renderField('taxId')}
        {renderField('businessType')}
        {renderField('foundedAt', { isDate: true })}
        <View style={styles.row}>
          {renderField('legalRepresentative', { inRow: true })}
          {renderField('legalDocument', { inRow: true })}
        </View>
      </SettingsSectionCard>

      {/* Ubicación y contacto */}
      <SettingsSectionCard
        icon="place"
        title={texts.sections.location.title}
        subtitle={texts.sections.location.subtitle}
      >
        {renderField('address')}
        {renderField('phone', { keyboardType: 'phone-pad' })}
        {renderField('email', { keyboardType: 'email-address', autoCapitalize: 'none' })}
        {renderField('website', { keyboardType: 'url', autoCapitalize: 'none' })}
      </SettingsSectionCard>

      {/* Información fiscal */}
      <SettingsSectionCard
        icon="receipt-long"
        title={texts.sections.fiscal.title}
        subtitle={texts.sections.fiscal.subtitle}
      >
        <View style={styles.note}>
          <MaterialIcons name="info" size={16} color={colors.warning} />
          <Text style={styles.noteText}>{texts.fiscalNote}</Text>
        </View>
        {renderField('taxRegime')}
        {renderField('ciiuActivity')}
        {renderField('dianResolution')}
        <View style={styles.row}>
          {renderField('invoicePrefix', { inRow: true })}
          {renderField('invoiceRange', { inRow: true })}
        </View>
      </SettingsSectionCard>

      {/* Canales oficiales */}
      <SettingsSectionCard
        icon="share"
        title={texts.sections.channels.title}
        subtitle={texts.sections.channels.subtitle}
      >
        <View style={styles.note}>
          <MaterialIcons name="info" size={16} color={colors.warning} />
          <Text style={styles.noteText}>{texts.channelsNote}</Text>
        </View>
        {renderField('instagram', { autoCapitalize: 'none' })}
        {renderField('facebook')}
        {renderField('supportLine', { keyboardType: 'phone-pad' })}
        {renderField('schedule')}
      </SettingsSectionCard>
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
    row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
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
