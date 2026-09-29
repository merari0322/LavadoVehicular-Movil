import React, { useMemo } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../../../app/theme';
import { ThemeColors } from '../../../../app/theme/colors';
import { SETTINGS_TEXTS } from '../../constants/settingsTexts';
import { HelpTopic } from '../../models/settings';

interface HelpDocumentModalProps {
  topic: HelpTopic | null; // null = modal cerrado
  onClose: () => void;
}

// Modal de solo lectura con el contenido de ayuda, términos o política de datos
export function HelpDocumentModal({ topic, onClose }: HelpDocumentModalProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const document = topic ? SETTINGS_TEXTS.general.helpDocs[topic] : null;

  return (
    <Modal visible={topic !== null} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        {document ? (
          <View style={styles.sheet}>
            {/* Encabezado */}
            <View style={styles.header}>
              <Text style={styles.title}>{document.title}</Text>
              <Pressable onPress={onClose} hitSlop={10}>
                <MaterialIcons name="close" size={22} color={colors.text} />
              </Pressable>
            </View>

            {/* Contenido */}
            <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
              {document.paragraphs.map((paragraph) => (
                <Text key={paragraph} style={styles.paragraph}>
                  {paragraph}
                </Text>
              ))}
            </ScrollView>

            <View style={styles.footer}>
              <Pressable style={styles.closeButton} onPress={onClose}>
                <Text style={styles.closeText}>{SETTINGS_TEXTS.common.close}</Text>
              </Pressable>
            </View>
          </View>
        ) : null}
      </View>
    </Modal>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      justifyContent: 'center',
      padding: 16,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    sheet: {
      maxHeight: '85%',
      borderRadius: 24,
      overflow: 'hidden',
      backgroundColor: colors.card,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 10,
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    title: { flex: 1, fontSize: 18, fontWeight: '800', color: colors.text },
    body: { flexShrink: 1 },
    bodyContent: { gap: 12, padding: 20 },
    paragraph: { fontSize: 15, lineHeight: 22, color: colors.textSecondary },
    footer: { padding: 16, borderTopWidth: 1, borderTopColor: colors.border },
    closeButton: {
      height: 46,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 12,
      backgroundColor: colors.primary,
    },
    closeText: { fontSize: 14, fontWeight: '700', color: colors.onPrimary },
  });
