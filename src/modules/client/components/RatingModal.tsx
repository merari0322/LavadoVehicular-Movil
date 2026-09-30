import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { fontSize, fontWeight, useTheme } from '../../../app/theme';
import { FormModal } from '../../../shared/components/feedback/FormModal';
import { LabeledInput } from '../../../shared/components/forms/LabeledInput';

export interface RatingResult {
  rating: number;
  comment: string;
}

interface RatingModalProps {
  visible: boolean;
  // calificación actual si ya se había calificado (modo edición)
  initial: RatingResult | null;
  onClose: () => void;
  onSubmit: (result: RatingResult) => void;
}

// calificar un servicio con 1 a 5 estrellas y un comentario opcional (RatingModal de la web)
export function RatingModal({ visible, initial, onClose, onSubmit }: RatingModalProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const isEdit = Boolean(initial?.rating);

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  useEffect(() => {
    if (!visible) return;
    setRating(initial?.rating ?? 0);
    setComment(initial?.comment ?? '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  return (
    <FormModal
      visible={visible}
      title={t(isEdit ? 'RATINGS.EDIT_TITLE' : 'RATINGS.TITLE')}
      subtitle={t('RATINGS.SUBTITLE')}
      cancelLabel={t('COMMON.CANCEL')}
      submitLabel={t(isEdit ? 'RATINGS.EDIT_SUBMIT' : 'RATINGS.SUBMIT')}
      // deshabilitado hasta elegir al menos una estrella
      submitDisabled={rating === 0}
      onClose={onClose}
      onSubmit={() => onSubmit({ rating, comment: comment.trim() })}
    >
      <Text style={[styles.question, { color: colors.text }]}>{t('RATINGS.QUESTION')}</Text>
      <View style={styles.stars}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Pressable key={star} onPress={() => setRating(star)} hitSlop={4}>
            <MaterialIcons name={star <= rating ? 'star' : 'star-border'} size={40} color={colors.warning} />
          </Pressable>
        ))}
      </View>
      <LabeledInput
        label={t('RATINGS.COMMENT')}
        value={comment}
        onChangeText={setComment}
        placeholder={t('RATINGS.PLACEHOLDER')}
        multiline
        maxLength={300}
      />
    </FormModal>
  );
}

const styles = StyleSheet.create({
  question: { fontSize: fontSize.body + 1, fontWeight: fontWeight.bold, textAlign: 'center' },
  stars: { flexDirection: 'row', justifyContent: 'center', gap: 4 },
});
