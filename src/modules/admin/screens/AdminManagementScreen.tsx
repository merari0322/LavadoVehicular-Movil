import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../../app/theme';
import { ConfirmDialog } from '../../../shared/components/feedback/ConfirmDialog';
import { AdminLayout } from '../../../shared/layouts/AdminLayout';
import { ManagementTabs } from '../components/management/ManagementTabs';
import { PromotionFormModal } from '../components/management/PromotionFormModal';
import { PromotionsTab } from '../components/management/PromotionsTab';
import { RoleFormModal } from '../components/management/RoleFormModal';
import { RolesTab } from '../components/management/RolesTab';
import { ServiceFormModal } from '../components/management/ServiceFormModal';
import { ServicesTab } from '../components/management/ServicesTab';
import { UserFormModal } from '../components/management/UserFormModal';
import { UsersTab } from '../components/management/UsersTab';
import { MANAGEMENT_TEXTS } from '../constants/managementTexts';
import {
  ManagedService,
  ManagedUser,
  ManagementTab,
  Promotion,
  PromotionFormValues,
  Role,
  RoleFormValues,
  ServiceFormValues,
} from '../models/management';
import { useManagement } from '../viewmodels/useManagement';
// la pestaña "Usuarios" usa las cuentas reales del security-service
import { useSystemRoles, useUserAccounts } from '../viewmodels/useUserAccounts';
import { CreateAccountPayload } from '../../../core/services/users/UserAdminService';
import { apiErrorKey } from '../../../core/api/apiError';

// Estado de un modal de formulario: abierto/cerrado y el registro que se edita (null = crear)
interface FormState<T> {
  visible: boolean;
  item: T | null;
}

const CLOSED = { visible: false, item: null };

// Datos del diálogo de confirmación
interface ConfirmState {
  title: string;
  message: string;
  onConfirm: () => void;
  // texto del botón; por defecto "Eliminar"
  confirmLabel?: string;
  danger?: boolean;
}

export const AdminManagementScreen = () => {
  // vuelve a pintar la pantalla cuando cambia el idioma
  const { t } = useTranslation();
  const systemRoles = useSystemRoles();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(), []);
  const management = useManagement();
  const accounts = useUserAccounts();

  const [tab, setTab] = useState<ManagementTab>('users');

  // Modales de formulario (uno por pestaña)
  const [userFormVisible, setUserFormVisible] = useState(false);
  const [roleForm, setRoleForm] = useState<FormState<Role>>(CLOSED);
  const [serviceForm, setServiceForm] = useState<FormState<ManagedService>>(CLOSED);
  const [promotionForm, setPromotionForm] = useState<FormState<Promotion>>(CLOSED);

  // Diálogo de confirmación para eliminar
  const [confirm, setConfirm] = useState<ConfirmState | null>(null);

  // Abre el diálogo de confirmación; al aceptar ejecuta la acción y se cierra
  const askDelete = (title: string, message: string, action: () => void) =>
    setConfirm({
      title,
      message,
      onConfirm: () => {
        action();
        setConfirm(null);
      },
    });

  // ---------------------------------------------------------------
  // Usuarios
  // ---------------------------------------------------------------

  // el modal crea la cuenta en el backend; si falla, el error se muestra dentro del modal
  const handleUserSubmit = async (values: CreateAccountPayload): Promise<string | null> => {
    const failure = await accounts.createAccount(values);
    if (!failure) {
      setUserFormVisible(false);
      Alert.alert(MANAGEMENT_TEXTS.users.form.createdTitle, MANAGEMENT_TEXTS.users.form.createdMessage(`${values.firstName} ${values.lastName}`));
    }
    return failure;
  };

  // desactivar reemplaza a eliminar: la cuenta no se borra, solo deja de poder entrar
  const handleUserToggle = (id: string) => {
    const user = accounts.users.find((item) => item.id === id);
    if (!user) return;
    const texts = MANAGEMENT_TEXTS.users;
    setConfirm({
      title: user.active ? texts.disableTitle : texts.enableTitle,
      message: user.active ? texts.disableMessage(user.name) : texts.enableMessage(user.name),
      confirmLabel: texts.confirm,
      danger: user.active,
      onConfirm: async () => {
        setConfirm(null);
        const failure = await accounts.toggleActive(id);
        if (failure) Alert.alert(texts.statusError, failure);
      },
    });
  };

  // ---------------------------------------------------------------
  // Roles
  // ---------------------------------------------------------------

  const handleRoleSubmit = (values: RoleFormValues) => {
    if (roleForm.item) management.updateRole(roleForm.item.id, values);
    else management.createRole(values);
    setRoleForm(CLOSED);
  };

  const handleRoleDelete = (role: Role) => {
    const assigned = management.roleUserCounts[role.id] ?? 0;

    // Un rol con usuarios asignados no se puede eliminar
    if (assigned > 0) {
      Alert.alert(
        MANAGEMENT_TEXTS.roles.blockedTitle,
        MANAGEMENT_TEXTS.roles.blockedMessage(role.name, assigned),
      );
      return;
    }

    askDelete(
      MANAGEMENT_TEXTS.roles.deleteTitle,
      MANAGEMENT_TEXTS.roles.deleteMessage(role.name),
      () => management.deleteRole(role.id),
    );
  };

  // ---------------------------------------------------------------
  // Servicios
  // ---------------------------------------------------------------

  const handleServiceSubmit = async (values: ServiceFormValues) => {
    try {
      if (serviceForm.item) await management.updateService(serviceForm.item.id, values);
      else await management.createService(values);
      setServiceForm(CLOSED);
    } catch (error) {
      // si el backend rechaza (p. ej. nombre repetido) se avisa sin cerrar el modal
      Alert.alert(MANAGEMENT_TEXTS.common.saveError, t(apiErrorKey(error)));
    }
  };

  const handleServiceDelete = (service: ManagedService) =>
    askDelete(
      MANAGEMENT_TEXTS.services.deleteTitle,
      MANAGEMENT_TEXTS.services.deleteMessage(service.name),
      () =>
        management.deleteService(service.id).catch((error) =>
          Alert.alert(MANAGEMENT_TEXTS.common.saveError, t(apiErrorKey(error))),
        ),
    );

  // ---------------------------------------------------------------
  // Promociones
  // ---------------------------------------------------------------

  const handlePromotionSubmit = (values: PromotionFormValues) => {
    if (promotionForm.item) management.updatePromotion(promotionForm.item.id, values);
    else management.createPromotion(values);
    setPromotionForm(CLOSED);
  };

  const handlePromotionDelete = (promotion: Promotion) =>
    askDelete(
      MANAGEMENT_TEXTS.promotions.deleteTitle,
      MANAGEMENT_TEXTS.promotions.deleteMessage(promotion.name),
      () => management.deletePromotion(promotion.id),
    );

  return (
    <AdminLayout activeKey="management">
      <SafeAreaView edges={['top']} style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          stickyHeaderIndices={[0]}
        >
          {/* Pestañas (quedan fijas arriba al desplazar) */}
          <ManagementTabsSticky active={tab} onChange={setTab} background={colors.bg} />

          {tab === 'users' ? (
            <UsersTab
              users={accounts.users}
              roles={systemRoles}
              counts={accounts.counts}
              loading={accounts.loading}
              loadError={accounts.loadError}
              onRetry={accounts.reload}
              onCreate={() => setUserFormVisible(true)}
              onToggle={handleUserToggle}
            />
          ) : null}

          {tab === 'roles' ? (
            <RolesTab
              roles={management.roles}
              userCounts={management.roleUserCounts}
              onCreate={() => setRoleForm({ visible: true, item: null })}
              onEdit={(role) => setRoleForm({ visible: true, item: role })}
              onDelete={handleRoleDelete}
            />
          ) : null}

          {tab === 'services' ? (
            <ServicesTab
              services={management.services}
              onCreate={() => setServiceForm({ visible: true, item: null })}
              onEdit={(service) => setServiceForm({ visible: true, item: service })}
              onToggle={(id) => {
                void management.toggleServiceActive(id).catch((error) =>
                  Alert.alert(MANAGEMENT_TEXTS.common.saveError, t(apiErrorKey(error))),
                );
              }}
              onDelete={handleServiceDelete}
            />
          ) : null}

          {tab === 'promotions' ? (
            <PromotionsTab
              promotions={management.promotions}
              metrics={management.promotionMetrics}
              onCreate={() => setPromotionForm({ visible: true, item: null })}
              onEdit={(promotion) => setPromotionForm({ visible: true, item: promotion })}
              onChangeStatus={management.changePromotionStatus}
              onDelete={handlePromotionDelete}
            />
          ) : null}
        </ScrollView>
      </SafeAreaView>

      {/* Modales de formulario */}
      <UserFormModal
        visible={userFormVisible}
        roles={systemRoles}
        onClose={() => setUserFormVisible(false)}
        onSubmit={handleUserSubmit}
      />
      <RoleFormModal
        visible={roleForm.visible}
        role={roleForm.item}
        onClose={() => setRoleForm(CLOSED)}
        onSubmit={handleRoleSubmit}
      />
      <ServiceFormModal
        visible={serviceForm.visible}
        service={serviceForm.item}
        onClose={() => setServiceForm(CLOSED)}
        onSubmit={handleServiceSubmit}
      />
      <PromotionFormModal
        visible={promotionForm.visible}
        promotion={promotionForm.item}
        onClose={() => setPromotionForm(CLOSED)}
        onSubmit={handlePromotionSubmit}
      />

      {/* Confirmación al eliminar */}
      <ConfirmDialog
        visible={confirm !== null}
        title={confirm?.title ?? ''}
        message={confirm?.message ?? ''}
        confirmLabel={confirm?.confirmLabel ?? MANAGEMENT_TEXTS.common.delete}
        danger={confirm?.danger ?? true}
        cancelLabel={MANAGEMENT_TEXTS.common.cancel}
        onConfirm={() => confirm?.onConfirm()}
        onCancel={() => setConfirm(null)}
      />
    </AdminLayout>
  );
};

// Contenedor con fondo para que las pestañas fijas no se transparenten al desplazar
function ManagementTabsSticky({
  active,
  onChange,
  background,
}: {
  active: ManagementTab;
  onChange: (tab: ManagementTab) => void;
  background: string;
}) {
  return (
    <SafeAreaView edges={[]} style={{ backgroundColor: background, paddingBottom: 4 }}>
      <ManagementTabs active={active} onChange={onChange} />
    </SafeAreaView>
  );
}

const createStyles = () =>
  StyleSheet.create({
    container: { flex: 1 },
    // El espacio de abajo evita que la barra inferior flotante tape el contenido
    content: { gap: 16, padding: 16, paddingBottom: 130 },
  });
