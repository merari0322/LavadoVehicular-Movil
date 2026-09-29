import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../../app/theme';
import { ThemeColors } from '../../../app/theme/colors';
import { withAlpha } from '../../../shared/utils/color';
import { MANAGEMENT_TEXTS } from '../constants/managementTexts';
import { ManagedUser, Role, USER_FILTERS, UserFilter } from '../models/management';
import { normalizeText } from '../utils/managementUtils';
import { ActionIconButton, EmptyState, ManagementCard, Pill, SectionHeader } from './ManagementParts';

interface UsersTabProps {
  users: ManagedUser[];
  roles: Role[];
  counts: Record<UserFilter, number>;
  onCreate: () => void;
  onEdit: (user: ManagedUser) => void;
  onToggle: (id: string) => void;
  onDelete: (user: ManagedUser) => void;
}

const texts = MANAGEMENT_TEXTS.users;

// Pestaña de usuarios: filtros, buscador y lista
export function UsersTab({ users, roles, counts, onCreate, onEdit, onToggle, onDelete }: UsersTabProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [filter, setFilter] = useState<UserFilter>('enabled');
  const [search, setSearch] = useState('');

  const getRoleName = (roleId: string) => roles.find((role) => role.id === roleId)?.name ?? texts.noRole;

  // Usuarios que cumplen el filtro y la búsqueda
  const visibleUsers = useMemo(() => {
    const query = normalizeText(search);

    return users.filter((user) => {
      if (filter === 'enabled' && !user.active) return false;
      if (filter === 'registered' && !user.invited) return false;
      if (filter === 'disabled' && user.active) return false;
      if (!query) return true;

      const roleName = roles.find((role) => role.id === user.roleId)?.name ?? '';
      return normalizeText(`${user.name} ${user.email} ${roleName}`).includes(query);
    });
  }, [users, roles, filter, search]);

  return (
    <View style={styles.container}>
      <SectionHeader
        title={texts.title}
        subtitle={texts.subtitle}
        actionLabel={texts.create}
        actionIcon="person-add"
        onAction={onCreate}
      />

      {/* Filtros con contador */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
        {USER_FILTERS.map((item) => {
          const active = item === filter;
          return (
            <Pressable
              key={item}
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => setFilter(item)}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{texts.filters[item]}</Text>
              <View style={[styles.chipCount, active && styles.chipCountActive]}>
                <Text style={[styles.chipCountText, active && styles.chipTextActive]}>{counts[item]}</Text>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Buscador */}
      <View style={styles.searchBox}>
        <MaterialIcons name="search" size={20} color={colors.textSecondary} />
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder={texts.search}
          placeholderTextColor={colors.textMuted}
          autoCorrect={false}
        />
      </View>

      {/* Lista */}
      {visibleUsers.length === 0 ? (
        <EmptyState title={texts.empty} hint={texts.emptyHint} />
      ) : (
        visibleUsers.map((user) => (
          <ManagementCard key={user.id}>
            <View style={styles.topRow}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{user.name.charAt(0).toUpperCase()}</Text>
              </View>
              <View style={styles.flex}>
                <Text style={styles.name}>{user.name}</Text>
                <Text style={styles.secondary}>{user.email}</Text>
              </View>
            </View>

            <View style={styles.pills}>
              <Pill label={getRoleName(user.roleId)} />
              <Pill
                label={user.active ? texts.active : texts.inactive}
                tone={user.active ? 'success' : 'neutral'}
              />
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.secondary}>
                {texts.createdAt}: <Text style={styles.strong}>{user.createdAt}</Text>
              </Text>
              <Text style={styles.secondary}>
                {texts.invited}:{' '}
                <Text style={styles.strong}>{user.invited ? MANAGEMENT_TEXTS.common.yes : MANAGEMENT_TEXTS.common.no}</Text>
              </Text>
            </View>

            <View style={styles.actions}>
              <ActionIconButton icon="edit" onPress={() => onEdit(user)} />
              <ActionIconButton
                icon={user.active ? 'block' : 'check-circle'}
                onPress={() => onToggle(user.id)}
              />
              <ActionIconButton icon="delete" danger onPress={() => onDelete(user)} />
            </View>
          </ManagementCard>
        ))
      )}
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    flex: { flex: 1 },
    container: { gap: 14 },
    filters: { gap: 8 },
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingVertical: 8,
      paddingHorizontal: 14,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
    },
    chipActive: { borderColor: colors.primary, backgroundColor: withAlpha(colors.primary, 0.14) },
    chipText: { fontSize: 13, fontWeight: '700', color: colors.textSecondary },
    chipTextActive: { color: colors.primaryHover },
    chipCount: {
      minWidth: 22,
      alignItems: 'center',
      paddingVertical: 1,
      paddingHorizontal: 6,
      borderRadius: 999,
      backgroundColor: withAlpha(colors.textMuted, 0.18),
    },
    chipCountActive: { backgroundColor: withAlpha(colors.primary, 0.2) },
    chipCountText: { fontSize: 11, fontWeight: '700', color: colors.textSecondary },
    searchBox: {
      height: 46,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingHorizontal: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
    },
    searchInput: { flex: 1, fontSize: 14, color: colors.text },
    topRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    avatar: {
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 20,
      backgroundColor: withAlpha(colors.primary, 0.15),
    },
    avatarText: { fontSize: 15, fontWeight: '800', color: colors.primaryHover },
    name: { fontSize: 16, fontWeight: '700', color: colors.text },
    secondary: { fontSize: 13, color: colors.textSecondary },
    strong: { fontWeight: '700', color: colors.text },
    pills: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
    infoRow: { gap: 2, marginTop: 8 },
    actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 10 },
  });
