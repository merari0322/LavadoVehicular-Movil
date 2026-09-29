import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../../../app/theme';
import { ThemeColors } from '../../../../app/theme/colors';
import { CheckboxField } from '../../../../shared/components/forms/CheckboxField';
import { FormModal } from '../../../../shared/components/feedback/FormModal';
import { LabeledInput } from '../../../../shared/components/forms/LabeledInput';
import { SelectField, SelectOption } from '../../../../shared/components/forms/SelectField';
import { withAlpha } from '../../../../shared/utils/color';
import { MANAGEMENT_TEXTS } from '../../constants/managementTexts';
import {
  PROMOTION_ICONS,
  PROMOTION_STATUSES,
  Promotion,
  PromotionFormValues,
  PromotionIcon,
  PromotionStatus,
} from '../../models/management';
import { maskAmount, parseAmount } from '../../utils/paymentUtils';
import { displayToISO, getTodayISO, isoToDisplay, maskDate } from '../../utils/reservationUtils';
import { ReservationField } from '../reservations/ReservationField';

interface PromotionFormModalProps {
  visible: boolean;
  promotion: Promotion | null; // null = crear, con valor = editar
  onClose: () => void;
  onSubmit: (values: PromotionFormValues) => void;
}

type Errors = {
  name?: string;
  coupon?: string;
  description?: string;
  price?: string;
  duration?: string;
  startDate?: string;
};

const texts = MANAGEMENT_TEXTS.promotions.form;

const ICON_OPTIONS: SelectOption[] = PROMOTION_ICONS.map((icon) => ({
  value: icon,
  label: MANAGEMENT_TEXTS.promotions.icons[icon],
}));

const STATUS_OPTIONS: SelectOption[] = PROMOTION_STATUSES.map((status) => ({
  value: status,
  label: MANAGEMENT_TEXTS.promotions.status[status],
}));

// Modal para crear o editar una promoción
export function PromotionFormModal({ visible, promotion, onClose, onSubmit }: PromotionFormModalProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const isEditing = promotion !== null;

  const [name, setName] = useState('');
  const [coupon, setCoupon] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [duration, setDuration] = useState('');
  const [icon, setIcon] = useState<PromotionIcon>('directions-car');
  const [status, setStatus] = useState<PromotionStatus>('active');
  const [startDate, setStartDate] = useState('');
  const [featured, setFeatured] = useState(false);
  const [benefits, setBenefits] = useState<string[]>([]);
  const [errors, setErrors] = useState<Errors>({});

  // Cada vez que se abre el modal se cargan los datos de la promoción (o valores por defecto)
  useEffect(() => {
    if (!visible) return;
    setName(promotion?.name ?? '');
    setCoupon(promotion?.coupon ?? '');
    setDescription(promotion?.description ?? '');
    setPrice(promotion ? maskAmount(String(promotion.price)) : '');
    setDuration(promotion ? String(promotion.duration) : '');
    setIcon(promotion?.icon ?? 'directions-car');
    setStatus(promotion?.status ?? 'active');
    setStartDate(isoToDisplay(promotion?.startDate ?? getTodayISO()));
    setFeatured(promotion?.featured ?? false);
    setBenefits(promotion?.benefits ?? []);
    setErrors({});
  }, [visible, promotion]);

  // Limpia el error de un campo al escribir en él
  const clearError = (field: keyof Errors) => setErrors((prev) => ({ ...prev, [field]: undefined }));

  // Edición de la lista de beneficios
  const addBenefit = () => setBenefits((prev) => [...prev, '']);
  const updateBenefit = (index: number, text: string) =>
    setBenefits((prev) => prev.map((item, i) => (i === index ? text : item)));
  const removeBenefit = (index: number) => setBenefits((prev) => prev.filter((_, i) => i !== index));

  const handleSubmit = () => {
    const found: Errors = {};
    const errorTexts = texts.errors;

    if (name.trim().length < 2) found.name = errorTexts.name;
    if (coupon.trim().length < 4) found.coupon = errorTexts.coupon;
    if (!description.trim()) found.description = errorTexts.description;
    if (parseAmount(price) <= 0) found.price = errorTexts.price;
    if (!(Number(duration) > 0)) found.duration = errorTexts.duration;
    if (!displayToISO(startDate)) found.startDate = errorTexts.startDate;

    if (Object.keys(found).length > 0) {
      setErrors(found);
      return;
    }

    onSubmit({
      name: name.trim(),
      coupon: coupon.trim(),
      description: description.trim(),
      price: parseAmount(price),
      duration: Number(duration),
      icon,
      status,
      startDate: displayToISO(startDate) as string,
      featured,
      benefits: benefits.map((item) => item.trim()).filter(Boolean),
    });
  };

  return (
    <FormModal
      visible={visible}
      title={isEditing ? texts.editTitle : texts.createTitle}
      subtitle={isEditing ? texts.editSubtitle : texts.createSubtitle}
      cancelLabel={MANAGEMENT_TEXTS.common.cancel}
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
        autoCapitalize="sentences"
      />

      {/* El cupón se guarda en mayúsculas y sin símbolos */}
      <LabeledInput
        label={texts.coupon}
        required
        value={coupon}
        onChangeText={(text) => {
          setCoupon(text.toUpperCase().replace(/[^A-Z0-9]/g, ''));
          clearError('coupon');
        }}
        placeholder={texts.couponPlaceholder}
        error={errors.coupon}
        autoCapitalize="characters"
        autoCorrect={false}
        maxLength={16}
      />

      <LabeledInput
        label={texts.description}
        required
        value={description}
        onChangeText={(text) => {
          setDescription(text);
          clearError('description');
        }}
        placeholder={texts.descriptionPlaceholder}
        error={errors.description}
        multiline
      />

      <View style={styles.row}>
        <LabeledInput
          containerStyle={styles.flex}
          label={texts.price}
          required
          value={price}
          onChangeText={(text) => {
            setPrice(maskAmount(text));
            clearError('price');
          }}
          error={errors.price}
          keyboardType="number-pad"
          maxLength={11}
          prefix="$"
        />
        <LabeledInput
          containerStyle={styles.flex}
          label={texts.duration}
          required
          value={duration}
          onChangeText={(text) => {
            setDuration(text.replace(/\D/g, ''));
            clearError('duration');
          }}
          error={errors.duration}
          keyboardType="number-pad"
          maxLength={3}
        />
      </View>

      <View style={styles.row}>
        <ReservationField label={texts.icon} style={styles.flex}>
          <SelectField
            value={icon}
            options={ICON_OPTIONS}
            onChange={(value) => setIcon(value as PromotionIcon)}
          />
        </ReservationField>
        <ReservationField label={texts.status} style={styles.flex}>
          <SelectField
            value={status}
            options={STATUS_OPTIONS}
            onChange={(value) => setStatus(value as PromotionStatus)}
          />
        </ReservationField>
      </View>

      <LabeledInput
        label={texts.startDate}
        value={startDate}
        onChangeText={(text) => {
          setStartDate(maskDate(text));
          clearError('startDate');
        }}
        placeholder="dd/mm/aaaa"
        error={errors.startDate}
        keyboardType="number-pad"
        maxLength={10}
      />

      <CheckboxField checked={featured} label={texts.featured} onChange={setFeatured} />

      {/* Lista de beneficios */}
      <View style={styles.benefitsHeader}>
        <Text style={styles.benefitsTitle}>{texts.benefits}</Text>
        <Pressable style={styles.addButton} onPress={addBenefit}>
          <MaterialIcons name="add" size={16} color={colors.primary} />
          <Text style={styles.addButtonText}>{texts.addBenefit}</Text>
        </Pressable>
      </View>

      {benefits.length === 0 ? (
        <Text style={styles.noBenefits}>{texts.noBenefits}</Text>
      ) : (
        benefits.map((benefit, index) => (
          <View key={index} style={styles.benefitRow}>
            <TextInput
              style={styles.benefitInput}
              value={benefit}
              onChangeText={(text) => updateBenefit(index, text)}
              placeholder={texts.benefitPlaceholder}
              placeholderTextColor={colors.textMuted}
            />
            <Pressable style={styles.removeButton} onPress={() => removeBenefit(index)} hitSlop={6}>
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
    flex: { flex: 1 },
    row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
    benefitsHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    benefitsTitle: { fontSize: 14, fontWeight: '600', color: colors.textSecondary },
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
    noBenefits: { fontSize: 13, color: colors.textSecondary },
    benefitRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    benefitInput: {
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
