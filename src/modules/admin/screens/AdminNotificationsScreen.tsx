import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ConfirmDialog } from '../../../shared/components/feedback/ConfirmDialog';
import { AdminLayout } from '../../../shared/layouts/AdminLayout';
import { NotificationDetailModal } from '../components/notifications/NotificationDetailModal';
import { NotificationFiltersCard } from '../components/notifications/NotificationFiltersCard';
import { NotificationTabs } from '../components/notifications/NotificationTabs';
import { NotificationsHeader } from '../components/notifications/NotificationsHeader';
import { NotificationsList } from '../components/notifications/NotificationsList';
import { NOTIFICATION_TEXTS } from '../constants/notificationTexts';
import { AppNotification } from '../models/notifications';
import { useNotifications } from '../viewmodels/useNotifications';

// Datos del diálogo de confirmación
interface ConfirmState {
  title: string;
  message: string;
  onConfirm: () => void;
}

export const AdminNotificationsScreen = () => {
  // vuelve a pintar la pantalla cuando cambia el idioma
  useTranslation();
  const inbox = useNotifications();

  // Notificación que se muestra en el modal de detalle (null = cerrado)
  const [detail, setDetail] = useState<AppNotification | null>(null);

  // Diálogo de confirmación para eliminar
  const [confirm, setConfirm] = useState<ConfirmState | null>(null);

  // Pide confirmación; al aceptar elimina la notificación y cierra el diálogo
  const handleDelete = (notification: AppNotification) =>
    setConfirm({
      title: NOTIFICATION_TEXTS.deleteTitle,
      message: NOTIFICATION_TEXTS.deleteMessage(notification.title),
      onConfirm: () => {
        inbox.deleteNotification(notification.id);
        setConfirm(null);
      },
    });

  return (
    <AdminLayout activeKey="notifications">
      <SafeAreaView edges={['top']} style={styles.container}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <NotificationsHeader
            unreadCount={inbox.unreadByTab.all}
            onMarkAllRead={inbox.markAllRead}
          />

          <NotificationTabs
            active={inbox.tab}
            unreadByTab={inbox.unreadByTab}
            onChange={inbox.setTab}
          />

          <NotificationFiltersCard
            filters={inbox.filters}
            errors={inbox.filterErrors}
            hasActiveFilters={inbox.hasActiveFilters}
            onChange={inbox.updateFilters}
            onReset={inbox.resetFilters}
          />

          <NotificationsList
            notifications={inbox.notifications}
            hasFilters={inbox.hasActiveFilters}
            onToggleRead={inbox.toggleRead}
            onView={setDetail}
            onDelete={handleDelete}
          />
        </ScrollView>
      </SafeAreaView>

      {/* Modal de detalle */}
      <NotificationDetailModal notification={detail} onClose={() => setDetail(null)} />

      {/* Confirmación al eliminar */}
      <ConfirmDialog
        visible={confirm !== null}
        title={confirm?.title ?? ''}
        message={confirm?.message ?? ''}
        confirmLabel={NOTIFICATION_TEXTS.common.delete}
        cancelLabel={NOTIFICATION_TEXTS.common.cancel}
        onConfirm={() => confirm?.onConfirm()}
        onCancel={() => setConfirm(null)}
      />
    </AdminLayout>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  // El espacio de abajo evita que la barra inferior flotante tape el contenido
  content: { gap: 16, padding: 16, paddingBottom: 130 },
});
