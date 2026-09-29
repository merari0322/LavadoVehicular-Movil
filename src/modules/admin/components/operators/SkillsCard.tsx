import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../../../app/theme';
import { ThemeColors } from '../../../../app/theme/colors';
import { withAlpha } from '../../../../shared/utils/color';
import { OPERATOR_TEXTS } from '../../constants/operatorTexts';
import { Operator, Skill } from '../../models/operator';
import { Pill } from '../common/Pills';

interface SkillsCardProps {
  operator: Operator;
  bayName: string;
  skills: Skill[];
  onExport: () => void;
}

const texts = OPERATOR_TEXTS.skills;

// Tarjeta con habilidades, certificaciones y la regla operativa de bahías
export function SkillsCard({ operator, bayName, skills, onExport }: SkillsCardProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{texts.title}</Text>

      {skills.length === 0 ? (
        <Text style={styles.empty}>{texts.empty}</Text>
      ) : (
        skills.map((skill, index) => (
          <View key={skill.id} style={[styles.skillRow, index > 0 && styles.skillBorder]}>
            <Text style={styles.skillName}>{skill.name}</Text>
            <Pill label={texts.levels[skill.level]} tone="primary" />
          </View>
        ))
      )}

      {/* Regla operativa */}
      <View style={styles.ruleBox}>
        <Text style={styles.ruleTitle}>{texts.ruleTitle}</Text>
        <Text style={styles.ruleText}>
          {bayName ? texts.ruleText(operator.name, bayName) : texts.ruleTextNoBay(operator.name)}
        </Text>
        <Pressable onPress={onExport} hitSlop={8}>
          <Text style={styles.exportText}>{texts.export}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    card: {
      gap: 8,
      padding: 16,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
    },
    title: { fontSize: 18, fontWeight: '800', color: colors.text },
    empty: { paddingVertical: 12, fontSize: 14, color: colors.textSecondary },
    skillRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, paddingVertical: 12 },
    skillBorder: { borderTopWidth: 1, borderTopColor: colors.border },
    skillName: { flex: 1, fontSize: 15, color: colors.text },
    ruleBox: {
      gap: 6,
      marginTop: 8,
      padding: 14,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: withAlpha(colors.textMuted, 0.08),
    },
    ruleTitle: { fontSize: 14, fontWeight: '800', color: colors.text },
    ruleText: { fontSize: 13, lineHeight: 19, color: colors.textSecondary },
    exportText: { fontSize: 15, fontWeight: '800', color: colors.primary },
  });
