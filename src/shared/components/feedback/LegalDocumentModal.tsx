import React from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { fontSize, fontWeight, radius, spacing, useTheme } from '../../../app/theme';
import { ActionButton } from '../screen/ActionButton';

export type LegalDocumentType = 'terms' | 'privacy';

interface LegalSection {
  HEADING: string;
  BODY: string;
}

interface LegalDocumentModalProps {
  // null = cerrado
  type: LegalDocumentType | null;
  onClose: () => void;
}

// Términos y Condiciones / Política de Datos solo para consulta (el usuario ya los aceptó
// al registrarse). Los textos salen de LEGAL.* en las traducciones, igual que en la web.
export function LegalDocumentModal({ type, onClose }: LegalDocumentModalProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const group = type === 'privacy' ? 'LEGAL.PRIVACY' : 'LEGAL.TERMS';
  const sections = type ? (t(`${group}.SECTIONS`, { returnObjects: true }) as LegalSection[]) : [];

  return (
    <Modal visible={type !== null} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={[styles.sheet, { backgroundColor: colors.card }]}>
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <View style={styles.flex}>
              <Text style={[styles.title, { color: colors.text }]}>{type ? t(`${group}.TITLE`) : ''}</Text>
              <Text style={[styles.meta, { color: colors.textMuted }]}>
                {t('LEGAL.COMPANY_NAME')} · {t('LEGAL.LAST_UPDATED_LABEL')}: {t('LEGAL.LAST_UPDATED_DATE')}
              </Text>
            </View>
            <Pressable onPress={onClose} hitSlop={10}>
              <MaterialIcons name="close" size={22} color={colors.text} />
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.body}>
            <Text style={[styles.notice, { color: colors.warning, backgroundColor: colors.warningSoft }]}>{t('LEGAL.DEMO_NOTICE')}</Text>
            {Array.isArray(sections)
              ? sections.map((section) => (
                  <View key={section.HEADING} style={styles.section}>
                    <Text style={[styles.heading, { color: colors.text }]}>{section.HEADING}</Text>
                    <Text style={[styles.paragraph, { color: colors.textSecondary }]}>{section.BODY}</Text>
                  </View>
                ))
              : null}
          </ScrollView>

          <View style={[styles.footer, { borderTopColor: colors.border }]}>
            <ActionButton label={t('LEGAL.CLOSE')} onPress={onClose} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  backdrop: { flex: 1, justifyContent: 'center', padding: spacing.lg, backgroundColor: 'rgba(0, 0, 0, 0.5)' },
  sheet: { maxHeight: '90%', borderRadius: radius.xl, overflow: 'hidden' },
  header: { flexDirection: 'row', gap: spacing.md, padding: 20, borderBottomWidth: 1 },
  title: { fontSize: fontSize.cardTitle + 1, fontWeight: fontWeight.extrabold },
  meta: { marginTop: 4, fontSize: fontSize.caption },
  body: { gap: spacing.lg, padding: 20 },
  notice: { padding: spacing.md, borderRadius: radius.md, fontSize: fontSize.caption, lineHeight: 17 },
  section: { gap: 4 },
  heading: { fontSize: fontSize.body + 1, fontWeight: fontWeight.bold },
  paragraph: { fontSize: fontSize.small, lineHeight: 20 },
  footer: { padding: spacing.lg, borderTopWidth: 1 },
});
