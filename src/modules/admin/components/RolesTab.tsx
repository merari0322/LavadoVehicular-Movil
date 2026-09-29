import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../../app/theme';
import { ThemeColors } from '../../../app/theme/colors';
import { MANAGEMENT_TEXTS } from '../constants/managementTexts';
import { Role } from '../models/management';
import { ActionIconButton, EmptyState, ManagementCard, Pill, SectionHeader } from './ManagementParts';

interface RolesTabProps {
  roles: Role[];
  userCounts: Record<string, number>; // Usuarios asignados por rol
  onCreate: () => void;
  onEdit: (role: Role) => void;
  onDelete: (role: Role) => void;
}

const texts = MANAGEMENT_TEXTS.roles;

// Pestaña de roles: lista con permisos y cantidad de usuarios
export function RolesTab({ roles, userCounts, onCreate, onEdit, onDelete }: RolesTabProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      <SectionHeader
        title={texts.title}
        subtitle={texts.subtitle}
        actionLabel={texts.create}
        actionIcon="add"
        onAction={onCreate}
      />

      {roles.length === 0 ? (
        <EmptyState title={texts.empty} hint={texts.emptyHint} />
      ) : (
        roles.map((role) => (
          <ManagementCard key={role.id}>
            <Text style={styles.name}>{role.name}</Text>
            <Text style={styles.description}>{role.description || '-'}</Text>

            {/* Permisos del rol */}
            <View style={styles.pills}>
              {role.permissions.map((permission) => (
                <Pill key={permission} label={permission} tone="primary" />
              ))}
            </View>

            <View style={styles.footer}>
              <Text style={styles.users}>{texts.users(userCounts[role.id] ?? 0)}</Text>
              <View style={styles.actions}>
                <ActionIconButton icon="edit" onPress={() => onEdit(role)} />
                <ActionIconButton icon="delete" danger onPress={() => onDelete(role)} />
              </View>
            </View>
          </ManagementCard>
        ))
      )}
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: { gap: 14 },
    name: { fontSize: 17, fontWeight: '800', color: colors.text },
    description: { fontSize: 14, lineHeight: 20, color: colors.textSecondary },
    pills: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
    footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 },
    users: { fontSize: 14, fontWeight: '600', color: colors.text },
    actions: { flexDirection: 'row', gap: 8 },
  });
