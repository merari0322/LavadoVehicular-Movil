import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../../../app/theme';
import { ThemeColors } from '../../../../app/theme/colors';
import { FormModal } from '../../../../shared/components/feedback/FormModal';
import { LabeledInput } from '../../../../shared/components/forms/LabeledInput';
import { withAlpha } from '../../../../shared/utils/color';
import { OPERATOR_TEXTS } from '../../constants/operatorTexts';
import { Skill, SkillLevel } from '../../models/operator';

interface OperatorProfileModalProps {
  visible: boolean;
  operatorId: string;
  operatorName: string;
  specialty: string;
  skills: Skill[];
  onClose: () => void;
  // devuelve null si se guardó o el mensaje del error
  onSubmit: (specialty: string, skills: Skill[]) => Promise<string | null>;
}

// los mismos límites que valida operations-service (OperatorProfile)
const MAX_SKILLS = 10;
const LEVELS: SkillLevel[] = ['certified', 'expert', 'advanced'];
const texts = OPERATOR_TEXTS.profile;

// edita la especialidad y las habilidades del operario; guardar reemplaza la lista completa
export function OperatorProfileModal({
  visible,
  operatorId,
  operatorName,
  specialty,
  skills,
  onClose,
  onSubmit,
}: OperatorProfileModalProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [draftSpecialty, setDraftSpecialty] = useState('');
  const [draftSkills, setDraftSkills] = useState<Skill[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // cada vez que se abre arranca con lo guardado
  useEffect(() => {
    if (!visible) return;
    setDraftSpecialty(specialty);
    setDraftSkills(skills.map((skill) => ({ ...skill })));
    setSubmitted(false);
    setServerError(null);
  }, [visible]); // eslint-disable-line react-hooks/exhaustive-deps

  const missingName = draftSkills.some((skill) => !skill.name.trim());
  const names = draftSkills.map((skill) => skill.name.trim().toLowerCase()).filter(Boolean);
  const duplicated = new Set(names).size !== names.length;

  const updateSkill = (index: number, changes: Partial<Skill>) =>
    setDraftSkills((current) => current.map((skill, i) => (i === index ? { ...skill, ...changes } : skill)));

  const addSkill = () =>
    setDraftSkills((current) =>
      current.length >= MAX_SKILLS
        ? current
        : [...current, { id: `new-${Date.now()}`, operatorId, name: '', level: 'certified' }],
    );

  const removeSkill = (index: number) => setDraftSkills((current) => current.filter((_, i) => i !== index));

  const handleSubmit = async () => {
    setSubmitted(true);
    if (missingName || duplicated || saving) return;
    setSaving(true);
    setServerError(null);
    const failure = await onSubmit(draftSpecialty, draftSkills);
    setSaving(false);
    if (failure) setServerError(failure);
  };

  return (
    <FormModal
      visible={visible}
      title={texts.title}
      subtitle={texts.subtitle(operatorName)}
      cancelLabel={texts.cancel}
      submitLabel={texts.save}
      submitDisabled={saving}
      onClose={onClose}
      onSubmit={handleSubmit}
    >
      <LabeledInput
        label={texts.specialty}
        value={draftSpecialty}
        onChangeText={setDraftSpecialty}
        placeholder={texts.specialtyPlaceholder}
        maxLength={80}
      />

      <View style={styles.skillsHeader}>
        <Text style={styles.label}>{texts.skills}</Text>
        <Text style={styles.hint}>{texts.max}</Text>
      </View>

      {draftSkills.length === 0 ? <Text style={styles.empty}>{OPERATOR_TEXTS.skills.empty}</Text> : null}

      {draftSkills.map((skill, index) => {
        const invalid = submitted && !skill.name.trim();
        return (
          <View key={skill.id} style={styles.skillCard}>
            <View style={styles.skillTop}>
              <TextInput
                style={[styles.input, invalid && styles.inputInvalid]}
                value={skill.name}
                onChangeText={(name) => updateSkill(index, { name })}
                placeholder={texts.skillPlaceholder}
                placeholderTextColor={colors.textMuted}
                maxLength={60}
              />
              <Pressable
                onPress={() => removeSkill(index)}
                hitSlop={6}
                style={({ pressed }) => [styles.remove, pressed && styles.pressed]}
              >
                <MaterialIcons name="delete-outline" size={20} color={colors.error} />
              </Pressable>
            </View>
            {/* nivel: tres opciones como chips */}
            <View style={styles.levels}>
              {LEVELS.map((level) => {
                const active = skill.level === level;
                return (
                  <Pressable
                    key={level}
                    onPress={() => updateSkill(index, { level })}
                    style={[styles.level, active && styles.levelActive]}
                  >
                    <Text style={[styles.levelText, active && styles.levelTextActive]} numberOfLines={1}>
                      {OPERATOR_TEXTS.skills.levels[level]}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        );
      })}

      {submitted && missingName ? <Text style={styles.error}>{texts.errorName}</Text> : null}
      {submitted && duplicated ? <Text style={styles.error}>{texts.errorDuplicate}</Text> : null}
      {serverError ? <Text style={styles.error}>{serverError}</Text> : null}

      <Pressable
        onPress={addSkill}
        disabled={draftSkills.length >= MAX_SKILLS}
        style={({ pressed }) => [
          styles.add,
          draftSkills.length >= MAX_SKILLS && styles.disabled,
          pressed && styles.pressed,
        ]}
      >
        <MaterialIcons name="add" size={18} color={colors.primary} />
        <Text style={styles.addText}>{texts.add}</Text>
      </Pressable>
    </FormModal>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    skillsHeader: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 },
    label: { fontSize: 13, fontWeight: '700', color: colors.text },
    hint: { fontSize: 12, color: colors.textMuted },
    empty: {
      padding: 14,
      textAlign: 'center',
      fontSize: 13,
      color: colors.textMuted,
      borderWidth: 1,
      borderStyle: 'dashed',
      borderColor: colors.border,
      borderRadius: 14,
    },
    skillCard: {
      gap: 10,
      padding: 12,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: withAlpha(colors.textMuted, 0.06),
    },
    skillTop: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    input: {
      flex: 1,
      height: 44,
      paddingHorizontal: 12,
      fontSize: 14,
      color: colors.text,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      backgroundColor: colors.card,
    },
    inputInvalid: { borderColor: colors.error },
    remove: {
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 12,
      backgroundColor: colors.errorSoft,
    },
    levels: { flexDirection: 'row', gap: 6 },
    level: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: 8,
      paddingHorizontal: 4,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.border,
    },
    levelActive: { borderColor: colors.primary, backgroundColor: withAlpha(colors.primary, 0.14) },
    levelText: { fontSize: 12, fontWeight: '600', color: colors.textSecondary },
    levelTextActive: { color: colors.primary, fontWeight: '800' },
    error: { fontSize: 13, fontWeight: '600', color: colors.error },
    add: {
      alignSelf: 'flex-start',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingVertical: 8,
      paddingHorizontal: 14,
      borderRadius: 999,
      borderWidth: 1,
      borderStyle: 'dashed',
      borderColor: colors.primary,
    },
    addText: { fontSize: 13, fontWeight: '700', color: colors.primary },
    disabled: { opacity: 0.45 },
    pressed: { opacity: 0.7 },
  });
