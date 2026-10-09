import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../../../app/theme';
import { ThemeColors } from '../../../../app/theme/colors';
import { CheckboxField } from '../../../../shared/components/forms/CheckboxField';
import { FormModal } from '../../../../shared/components/feedback/FormModal';
import { LabeledInput } from '../../../../shared/components/forms/LabeledInput';
import { withAlpha } from '../../../../shared/utils/color';
import { MANAGEMENT_TEXTS } from '../../constants/managementTexts';
import { TEXTS as RESERVATION_TEXTS } from '../../constants/reservationTexts';
import { PROMOTION_ICONS, Promotion, PromotionFormValues, PromotionIcon } from '../../models/management';
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
  startDate?: string;
  discountPercent?: string;
};

const texts = MANAGEMENT_TEXTS.promotions.form;

// Modal para crear o editar una promoción. No pide precio, duración ni estado: el cupón es un
// descuento sobre la reserva y el estado lo calcula payment-service (se pausa desde la tarjeta)
export function PromotionFormModal({ visible, promotion, onClose, onSubmit }: PromotionFormModalProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const isEditing = promotion !== null;

  const [name, setName] = useState('');
  const [coupon, setCoupon] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState<PromotionIcon>('directions-car');
  const [startDate, setStartDate] = useState('');
  const [featured, setFeatured] = useState(false);
  const [benefits, setBenefits] = useState<string[]>([]);
  const [discountPercent, setDiscountPercent] = useState('');
  const [requiredPoints, setRequiredPoints] = useState('');
  const [errors, setErrors] = useState<Errors>({});

  // Cada vez que se abre el modal se cargan los datos de la promoción (o valores por defecto)
  useEffect(() => {
    if (!visible) return;
    setName(promotion?.name ?? '');
    setCoupon(promotion?.coupon ?? '');
    setDescription(promotion?.description ?? '');
    setIcon(promotion?.icon ?? 'directions-car');
    setStartDate(isoToDisplay(promotion?.startDate ?? getTodayISO()));
    setFeatured(promotion?.featured ?? false);
    setBenefits(promotion?.benefits ?? []);
    setDiscountPercent(promotion ? String(promotion.discountPercent) : '100');
    setRequiredPoints(promotion ? String(promotion.requiredPoints) : '0');
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
    if (!displayToISO(startDate)) found.startDate = errorTexts.startDate;
    const discountValue = Number(discountPercent);
    if (!(discountValue >= 1 && discountValue <= 100)) found.discountPercent = errorTexts.discountPercent;

    if (Object.keys(found).length > 0) {
      setErrors(found);
      return;
    }

    onSubmit({
      name: name.trim(),
      coupon: coupon.trim(),
      description: description.trim(),
      icon,
      startDate: displayToISO(startDate) as string,
      featured,
      benefits: benefits.map((item) => item.trim()).filter(Boolean),
      discountPercent: discountValue,
      requiredPoints: Number(requiredPoints) || 0,
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

      {/* selector de ícono visual: antes era un desplegable que solo mostraba el nombre del
          ícono como texto; ahora se ve cada opción como el ícono real */}
      <ReservationField label={texts.icon}>
        <View style={styles.iconPicker}>
          {PROMOTION_ICONS.map((option) => {
            const selected = option === icon;
            return (
              <Pressable
                key={option}
                style={[styles.iconOption, selected && styles.iconOptionSelected]}
                onPress={() => setIcon(option)}
              >
                <MaterialIcons name={option} size={22} color={selected ? colors.primary : colors.textSecondary} />
              </Pressable>
            );
          })}
        </View>
      </ReservationField>

      <View style={styles.row}>
        <LabeledInput
          containerStyle={styles.flex}
          label={texts.discountPercent}
          required
          value={discountPercent}
          onChangeText={(text) => {
            setDiscountPercent(text.replace(/\D/g, ''));
            clearError('discountPercent');
          }}
          error={errors.discountPercent}
          keyboardType="number-pad"
          maxLength={3}
        />
        <LabeledInput
          containerStyle={styles.flex}
          label={texts.requiredPoints}
          value={requiredPoints}
          onChangeText={(text) => setRequiredPoints(text.replace(/\D/g, ''))}
          hint={texts.requiredPointsHint}
          keyboardType="number-pad"
          maxLength={6}
        />
      </View>

      <LabeledInput
        label={texts.startDate}
        value={startDate}
        onChangeText={(text) => {
          setStartDate(maskDate(text));
          clearError('startDate');
        }}
        placeholder={RESERVATION_TEXTS.filters.datePlaceholder}
        error={errors.startDate}
        hint={texts.startDateHint}
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
    iconPicker: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    iconOption: {
      width: 44,
      height: 44,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: withAlpha(colors.textMuted, 0.1),
    },
    iconOptionSelected: { borderColor: colors.primary, backgroundColor: withAlpha(colors.primary, 0.12) },
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
