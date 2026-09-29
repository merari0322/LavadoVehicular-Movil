import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../../../app/theme';
import { ThemeColors } from '../../../../app/theme/colors';
import { FormModal } from '../../../../shared/components/feedback/FormModal';
import { LabeledInput } from '../../../../shared/components/forms/LabeledInput';
import { LabeledSelect } from '../../../../shared/components/forms/LabeledSelect';
import { SelectOption } from '../../../../shared/components/forms/SelectField';
import { withAlpha } from '../../../../shared/utils/color';
import { OPERATOR_TEXTS } from '../../constants/operatorTexts';
import {
  OPERATOR_STATUSES,
  Operator,
  OperatorFormValues,
  OperatorStatus,
  WorkBay,
} from '../../models/operator';
import { isValidEmail } from '../../utils/managementUtils';

interface OperatorFormModalProps {
  visible: boolean;
  operator: Operator | null; // null = crear, con valor = editar
  bays: WorkBay[]; // Bahías libres (más la del operario que se edita)
  onClose: () => void;
  onSubmit: (values: OperatorFormValues) => void;
}

type Errors = { name?: string; specialty?: string; phone?: string; email?: string };

const texts = OPERATOR_TEXTS.form;

const STATUS_OPTIONS: SelectOption[] = OPERATOR_STATUSES.map((status) => ({
  value: status,
  label: OPERATOR_TEXTS.status[status],
}));

// Modal para crear o editar un operario
export function OperatorFormModal({ visible, operator, bays, onClose, onSubmit }: OperatorFormModalProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const isEditing = operator !== null;

  const [name, setName] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<OperatorStatus>('available');
  const [bayId, setBayId] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [errors, setErrors] = useState<Errors>({});

  // Cada vez que se abre el modal se cargan los datos del operario (o valores por defecto)
  useEffect(() => {
    if (!visible) return;
    setName(operator?.name ?? '');
    setSpecialty(operator?.specialty ?? '');
    setPhone(operator?.phone ?? '');
    setEmail(operator?.email ?? '');
    setStatus(operator?.status ?? 'available');
    setBayId(operator?.bayId ?? '');
    setTags(operator?.tags ?? []);
    setErrors({});
  }, [visible, operator]);

  const bayOptions = useMemo<SelectOption[]>(
    () => [{ value: '', label: texts.noBay }, ...bays.map((bay) => ({ value: bay.id, label: bay.name }))],
    [bays],
  );

  // Limpia el error de un campo al escribir en él
  const clearError = (field: keyof Errors) => setErrors((prev) => ({ ...prev, [field]: undefined }));

  // Edición de la lista de etiquetas
  const addTag = () => setTags((prev) => [...prev, '']);
  const updateTag = (index: number, text: string) =>
    setTags((prev) => prev.map((item, i) => (i === index ? text : item)));
  const removeTag = (index: number) => setTags((prev) => prev.filter((_, i) => i !== index));

  const handleSubmit = () => {
    const found: Errors = {};

    if (name.trim().length < 3) found.name = texts.errors.name;
    if (specialty.trim().length < 3) found.specialty = texts.errors.specialty;
    if (phone.replace(/\D/g, '').length < 7) found.phone = texts.errors.phone;
    if (email.trim() && !isValidEmail(email.trim())) found.email = texts.errors.email;

    if (Object.keys(found).length > 0) {
      setErrors(found);
      return;
    }

    onSubmit({
      name: name.trim(),
      specialty: specialty.trim(),
      phone: phone.trim(),
      email: email.trim(),
      status,
      bayId: status === 'absent' ? '' : bayId,
      tags: tags.map((item) => item.trim()).filter(Boolean),
    });
  };

  return (
    <FormModal
      visible={visible}
      title={isEditing ? texts.editTitle : texts.createTitle}
      subtitle={texts.subtitle}
      cancelLabel={OPERATOR_TEXTS.common.cancel}
      submitLabel={texts.save}
      onClose={onClose}
      onSubmit={handleSubmit}
    >
      <LabeledInput
        label={texts.name}
        required
        value={name}
        onChangeText={(text) => {
          setName(text);
          clearError('name');
        }}
        placeholder={texts.namePlaceholder}
        error={errors.name}
        autoCapitalize="words"
      />

      <LabeledInput
        label={texts.specialty}
        required
        value={specialty}
        onChangeText={(text) => {
          setSpecialty(text);
          clearError('specialty');
        }}
        placeholder={texts.specialtyPlaceholder}
        error={errors.specialty}
        autoCapitalize="sentences"
      />

      <LabeledInput
        label={texts.phone}
        required
        value={phone}
        onChangeText={(text) => {
          setPhone(text);
          clearError('phone');
        }}
        placeholder={texts.phonePlaceholder}
        error={errors.phone}
        keyboardType="phone-pad"
      />

      <LabeledInput
        label={texts.email}
        value={email}
        onChangeText={(text) => {
          setEmail(text);
          clearError('email');
        }}
        placeholder={texts.emailPlaceholder}
        error={errors.email}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />

      <LabeledSelect
        label={texts.status}
        value={status}
        options={STATUS_OPTIONS}
        onChange={(value) => setStatus(value as OperatorStatus)}
      />

      {/* En permiso médico no se puede asignar bahía */}
      {status === 'absent' ? (
        <View>
          <Text style={styles.label}>{texts.bay}</Text>
          <Text style={styles.hint}>{texts.bayNotApplicable}</Text>
        </View>
      ) : (
        <LabeledSelect label={texts.bay} value={bayId} options={bayOptions} onChange={setBayId} />
      )}

      {/* Lista de etiquetas */}
      <View style={styles.tagsHeader}>
        <Text style={styles.tagsTitle}>{texts.tags}</Text>
        <Pressable style={styles.addButton} onPress={addTag}>
          <MaterialIcons name="add" size={16} color={colors.primary} />
          <Text style={styles.addButtonText}>{texts.addTag}</Text>
        </Pressable>
      </View>

      {tags.length === 0 ? (
        <Text style={styles.hint}>{texts.noTags}</Text>
      ) : (
        tags.map((tag, index) => (
          <View key={index} style={styles.tagRow}>
            <TextInput
              style={styles.tagInput}
              value={tag}
              onChangeText={(text) => updateTag(index, text)}
              placeholder={texts.tagPlaceholder}
              placeholderTextColor={colors.textMuted}
            />
            <Pressable style={styles.removeButton} onPress={() => removeTag(index)} hitSlop={6}>
              <MaterialIcons name="close" size={18} color={colors.error} />
            </Pressable>
          </View>
        ))
      )}
    </FormModal>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    label: { marginBottom: 6, fontSize: 13, fontWeight: '500', color: colors.textSecondary },
    hint: { fontSize: 13, color: colors.textSecondary },
    tagsHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    tagsTitle: { fontSize: 14, fontWeight: '600', color: colors.textSecondary },
    addButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingVertical: 6,
      paddingHorizontal: 10,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
    },
    addButtonText: { fontSize: 12, fontWeight: '700', color: colors.primary },
    tagRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    tagInput: {
      flex: 1,
      height: 44,
      paddingHorizontal: 14,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: withAlpha(colors.textMuted, 0.1),
      fontSize: 14,
      color: colors.text,
    },
    removeButton: {
      width: 36,
      height: 36,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 10,
      backgroundColor: colors.errorSoft,
    },
  });
