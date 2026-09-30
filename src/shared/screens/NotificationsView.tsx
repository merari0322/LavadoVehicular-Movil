import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { fontSize, fontWeight, radius, spacing, useTheme } from '../../app/theme';
import { Pill, PillTone } from '../components/ui/Pill';
import { ActionButton } from '../components/screen/ActionButton';
import { ChipTabs, ChipOption } from '../components/screen/ChipTabs';
import { EmptyState } from '../components/screen/EmptyState';
import { DateInput } from '../components/screen/FilterInputs';
import { PageHeader } from '../components/screen/PageHeader';
import { ScreenScroll } from '../components/screen/ScreenScroll';
import { SectionCard } from '../components/screen/SectionCard';
import { useFeedback } from '../hooks/useFeedback';
import { NotificationTab, NotificationType, RoleNotification, tabForType } from '../models/notification';
import { withAlpha } from '../utils/color';
import { displayToISO, isoToDisplay } from '../utils/format';

type ReadFilter = 'all' | 'read' | 'unread';

interface NotificationsViewProps {
  role: 'CLIENT' | 'OPERATOR';
  initial: RoleNotification[];
}

const TABS: { key: NotificationTab; icon: ChipOption<NotificationTab>['icon']; label: string }[] = [
  { key: 'all', icon: 'mail', label: 'NOTIFICATIONS.TABS.ALL' },
  { key: 'recordatorio', icon: 'schedule', label: 'NOTIFICATIONS.TABS.REMINDERS' },
  { key: 'promocion', icon: 'sell', label: 'NOTIFICATIONS.TABS.PROMOS' },
  { key: 'confirmacion', icon: 'check-circle', label: 'NOTIFICATIONS.TABS.CONFIRMATIONS' },
  { key: 'others', icon: 'notifications', label: 'NOTIFICATIONS.TABS.OTHERS' },
];

function typeTone(type: NotificationType): PillTone {
  if (type === 'cancelacion') return 'error';
  if (type === 'mensaje' || type === 'sistema') return 'neutral';
  return 'primary';
}

// centro de notificaciones de cliente y operario (componente <app-notifications> de la web):
// pestañas por categoría, filtros, marcar leído/no leído, ver detalle y eliminar
export function NotificationsView({ role, initial }: NotificationsViewProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const feedback = useFeedback();

  // TODO: traerlas de notification-service cuando exista
  const [items, setItems] = useState<RoleNotification[]>(initial);
  const [tab, setTab] = useState<NotificationTab>('all');
  const [readFilter, setReadFilter] = useState<ReadFilter>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const unreadIn = (key: NotificationTab) =>
    items.filter((n) => !n.read && (key === 'all' || tabForType(n.type) === key)).length;

  const visible = useMemo(() => {
    const from = displayToISO(dateFrom);
    const to = displayToISO(dateTo);
    return items
      .filter((n) => {
        if (tab !== 'all' && tabForType(n.type) !== tab) return false;
        if (readFilter === 'read' && !n.read) return false;
        if (readFilter === 'unread' && n.read) return false;
        if (from && n.date < from) return false;
        if (to && n.date > to) return false;
        return true;
      })
      .sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time));
  }, [items, tab, readFilter, dateFrom, dateTo]);

  const setRead = (id: number, read: boolean) =>
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read } : n)));

  const markAllRead = () => setItems((prev) => prev.map((n) => ({ ...n, read: true })));

  const hasFilters = readFilter !== 'all' || dateFrom !== '' || dateTo !== '';
  const resetFilters = () => {
    setReadFilter('all');
    setDateFrom('');
    setDateTo('');
  };

  // al ver el detalle queda leída
  const viewDetail = (n: RoleNotification) => {
    setRead(n.id, true);
    feedback.showStatus({
      type: 'info',
      icon: n.icon,
      title: t(n.title),
      message: t(n.desc),
      buttonText: t('COMMON.CLOSE'),
      details: [
        { label: t('HISTORY.DATE'), value: `${isoToDisplay(n.date)} - ${n.time}` },
        { label: t('HISTORY_CARD.STATUS'), value: t(`NOTIFICATIONS.TYPE_LABEL.${n.type.toUpperCase()}`) },
      ],
    });
  };

  const requestDelete = (n: RoleNotification) =>
    feedback.askConfirm({
      title: t('NOTIFICATIONS.DELETE_TITLE'),
      message: t('NOTIFICATIONS.DELETE_MESSAGE'),
      confirmLabel: t('COMMON.DELETE'),
      danger: true,
      onConfirm: () => {
        setItems((prev) => prev.filter((x) => x.id !== n.id));
        feedback.showStatus({ title: t('NOTIFICATIONS.DELETED_TITLE'), message: t('NOTIFICATIONS.DELETED_MESSAGE') });
      },
    });

  const totalUnread = unreadIn('all');

  return (
    <>
      <ScreenScroll>
        <PageHeader
          title={t('NOTIFICATIONS.CENTER_TITLE')}
          subtitle={t(role === 'CLIENT' ? 'NOTIFICATIONS.CLIENT_SUBTITLE' : 'NOTIFICATIONS.OPERATOR_SUBTITLE')}
        />
        <View style={styles.headerRow}>
          {totalUnread > 0 ? <Pill label={`${totalUnread} ${t('NOTIFICATIONS.UNREAD_PLURAL')}`} tone="primary" /> : <View />}
          <ActionButton small variant="soft" icon="done-all" label={t('NOTIFICATIONS.MARK_ALL_READ')} onPress={markAllRead} />
        </View>

        <ChipTabs<NotificationTab>
          value={tab}
          onChange={setTab}
          options={TABS.map((item) => ({ value: item.key, label: t(item.label), icon: item.icon, count: unreadIn(item.key) }))}
        />

        {/* Filtros */}
        <SectionCard
          title={t('ASSIGNED_SERVICES.FILTERS.TITLE')}
          icon="filter-list"
          right={
            hasFilters ? (
              <Pressable onPress={resetFilters} hitSlop={8}>
                <MaterialIcons name="refresh" size={22} color={colors.primary} />
              </Pressable>
            ) : null
          }
        >
          <Text style={[styles.label, { color: colors.textSecondary }]}>{t('NOTIFICATIONS.FILTERS.READ_STATE')}</Text>
          <ChipTabs<ReadFilter>
            value={readFilter}
            onChange={setReadFilter}
            options={[
              { value: 'all', label: t('ASSIGNED_SERVICES.FILTERS.ALL') },
              { value: 'unread', label: t('NOTIFICATIONS.UNREAD') },
              { value: 'read', label: t('NOTIFICATIONS.READ') },
            ]}
          />
          <Text style={[styles.label, { color: colors.textSecondary }]}>{t('ASSIGNED_SERVICES.FILTERS.BY_DATE')}</Text>
          <View style={styles.dates}>
            <DateInput value={dateFrom} onChange={setDateFrom} />
            <MaterialIcons name="arrow-forward" size={18} color={colors.textMuted} />
            <DateInput value={dateTo} onChange={setDateTo} />
          </View>
        </SectionCard>

        {visible.length === 0 ? (
          <EmptyState icon="notifications-none" title={t('NOTIFICATIONS.EMPTY')} />
        ) : (
          visible.map((n) => {
            const tone = typeTone(n.type);
            const iconColor = tone === 'error' ? colors.error : tone === 'neutral' ? colors.textSecondary : colors.primary;
            return (
              <SectionCard
                key={n.id}
                style={!n.read ? { borderColor: withAlpha(colors.primary, 0.5), backgroundColor: withAlpha(colors.primary, 0.04) } : undefined}
              >
                <View style={styles.itemTop}>
                  <View style={[styles.bubble, { backgroundColor: withAlpha(iconColor, 0.15) }]}>
                    <MaterialIcons name={n.icon} size={22} color={iconColor} />
                  </View>
                  <View style={styles.flex}>
                    <View style={styles.titleRow}>
                      {!n.read ? <View style={[styles.dot, { backgroundColor: colors.primary }]} /> : null}
                      <Text style={[styles.title, { color: colors.text }]}>{t(n.title)}</Text>
                    </View>
                    <Pill label={t(`NOTIFICATIONS.TYPE_LABEL.${n.type.toUpperCase()}`)} tone={tone} />
                  </View>
                </View>
                <Text style={[styles.desc, { color: colors.textSecondary }]}>{t(n.desc)}</Text>
                <Text style={[styles.date, { color: colors.textMuted }]}>
                  {isoToDisplay(n.date)} - {n.time}
                </Text>
                <View style={styles.actions}>
                  <ActionButton
                    small
                    variant={n.read ? 'outline' : 'soft'}
                    icon={n.read ? 'mail' : 'done-all'}
                    label={t(n.read ? 'NOTIFICATIONS.MARK_UNREAD' : 'NOTIFICATIONS.MARK_READ')}
                    onPress={() => setRead(n.id, !n.read)}
                  />
                  <ActionButton small variant="outline" icon="visibility" label={t('NOTIFICATIONS.BTN_DETAIL')} onPress={() => viewDetail(n)} />
                  <Pressable onPress={() => requestDelete(n)} style={[styles.delete, { backgroundColor: colors.errorSoft }]} hitSlop={6}>
                    <MaterialIcons name="delete" size={18} color={colors.error} />
                  </Pressable>
                </View>
              </SectionCard>
            );
          })
        )}
      </ScreenScroll>
      {feedback.modals}
    </>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, gap: 6 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  label: { fontSize: fontSize.small, fontWeight: fontWeight.medium },
  dates: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  itemTop: { flexDirection: 'row', gap: spacing.md },
  bubble: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  title: { flexShrink: 1, fontSize: fontSize.body + 1, fontWeight: fontWeight.bold },
  desc: { fontSize: fontSize.small, lineHeight: 19 },
  date: { fontSize: fontSize.caption },
  actions: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.sm },
  delete: { width: 36, height: 36, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
});
