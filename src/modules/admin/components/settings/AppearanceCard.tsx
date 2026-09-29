import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../../../app/theme';
import { ThemeColors } from '../../../../app/theme/colors';
import { SETTINGS_TEXTS } from '../../constants/settingsTexts';
import {
  AppLanguage,
  LANGUAGE_OPTIONS,
  THEME_OPTIONS,
  ThemeId,
} from '../../models/settings';
import { SettingsSectionCard } from './SettingsSectionCard';

interface AppearanceCardProps {
  theme: ThemeId;
  language: AppLanguage;
  onChangeTheme: (theme: ThemeId) => void;
  onChangeLanguage: (language: AppLanguage) => void;
}

const texts = SETTINGS_TEXTS.general.appearance;

// Tarjeta de apariencia: selector de tema (con vista previa) y de idioma
export function AppearanceCard({ theme, language, onChangeTheme, onChangeLanguage }: AppearanceCardProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <SettingsSectionCard icon="public" title={texts.title}>
      {/* Temas */}
      <View>
        <Text style={styles.groupTitle}>{texts.themeTitle}</Text>
        <Text style={styles.groupSubtitle}>{texts.themeSubtitle}</Text>
      </View>

      <View style={styles.grid}>
        {THEME_OPTIONS.map((option) => {
          const selected = option.id === theme;

          return (
            <Pressable
              key={option.id}
              style={[styles.themeOption, selected && styles.themeSelected]}
              onPress={() => onChangeTheme(option.id)}
              accessibilityLabel={texts.themeNames[option.id]}
            >
              <View style={[styles.themeTop, { backgroundColor: option.accent }]}>
                {selected ? <MaterialIcons name="check-circle" size={22} color={colors.onPrimary} /> : null}
              </View>
              <View style={[styles.themeBottom, { backgroundColor: option.surface }]}>
                <View style={[styles.themeLine, { backgroundColor: option.line }]} />
                <View style={[styles.themeLine, { backgroundColor: option.accent }]} />
              </View>
            </Pressable>
          );
        })}
      </View>

      {/* Idiomas */}
      <View style={styles.divider} />
      <View>
        <Text style={styles.groupTitle}>{texts.languageTitle}</Text>
        <Text style={styles.groupSubtitle}>{texts.languageSubtitle}</Text>
      </View>

      <View style={styles.grid}>
        {LANGUAGE_OPTIONS.map((option) => {
          const selected = option.code === language;

          return (
            <Pressable
              key={option.code}
              style={[styles.languageOption, selected && styles.languageSelected]}
              onPress={() => onChangeLanguage(option.code)}
            >
              <View style={styles.languageTop}>
                <Text style={styles.flag}>{option.flag}</Text>
                <Text style={[styles.languageName, styles.flex]}>{option.name}</Text>
                <MaterialIcons
                  name={selected ? 'check-circle' : 'check-circle-outline'}
                  size={22}
                  color={selected ? colors.primary : colors.textMuted}
                />
              </View>
              <Text style={styles.languageHint}>{texts.languageHints[option.code]}</Text>
            </Pressable>
          );
        })}
      </View>
    </SettingsSectionCard>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    flex: { flex: 1 },
    groupTitle: { fontSize: 16, fontWeight: '800', color: colors.text },
    groupSubtitle: { marginTop: 2, fontSize: 13, color: colors.textSecondary },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    divider: { height: 1, backgroundColor: colors.border },
    // Temas
    themeOption: {
      flexGrow: 1,
      flexBasis: '45%',
      overflow: 'hidden',
      borderRadius: 14,
      borderWidth: 2,
      borderColor: 'transparent',
    },
    themeSelected: { borderColor: colors.primary },
    themeTop: { height: 56, alignItems: 'flex-end', padding: 8 },
    themeBottom: { gap: 6, padding: 10 },
    themeLine: { height: 4, borderRadius: 2 },
    // Idiomas
    languageOption: {
      flexGrow: 1,
      flexBasis: '45%',
      gap: 6,
      padding: 12,
      borderRadius: 14,
      borderWidth: 2,
      borderColor: 'transparent',
    },
    languageSelected: { borderColor: colors.primary, backgroundColor: colors.card },
    languageTop: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    flag: { fontSize: 24 },
    languageName: { fontSize: 15, fontWeight: '800', color: colors.text },
    languageHint: { fontSize: 13, color: colors.textSecondary },
  });
