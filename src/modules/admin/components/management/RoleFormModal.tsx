import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
import { CheckboxField } from '../../../../shared/components/forms/CheckboxField';
import { FormModal } from '../../../../shared/components/feedback/FormModal';
import { LabeledSelect } from '../../../../shared/components/forms/LabeledSelect';
import { useTheme } from '../../../../app/theme';
import { MANAGEMENT_TEXTS } from '../../constants/managementTexts';
import { PermissionView, RoleCode } from '../../../../core/services/users/CustomRoleService';
import { Role, RoleFormValues } from '../../models/management';
import { permissionLabel } from '../../viewmodels/useManagement';

interface RoleFormModalProps {
  visible: boolean;
  role: Role; // los 3 roles son fijos (ADR-015): siempre se edita uno, nunca se crea
  roles: Role[]; // para cargar los permisos ya asignados al cambiar de rol en el desplegable
  permissionsCatalog: PermissionView[];
  onClose: () => void;
  onSubmit: (values: RoleFormValues) => void;
}

const texts = MANAGEMENT_TEXTS.roles.form;

const ROLE_CODES: RoleCode[] = ['ADMIN', 'OPERATOR', 'CLIENT'];

// Modal de permisos de uno de los 3 roles fijos. Antes se escribía un nombre libre de rol; ahora
// se elige con un desplegable, y los permisos vienen del catálogo real (security.permission).
export function RoleFormModal({ visible, role, roles, permissionsCatalog, onClose, onSubmit }: RoleFormModalProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  // nombres de los 3 roles en el idioma actual (PROFILE.ROLE.*)
  const roleOptions = ROLE_CODES.map((code) => ({ value: code, label: t(`PROFILE.ROLE.${code}`) }));

  const [selectedRole, setSelectedRole] = useState<RoleCode>('ADMIN');
  const [permissionIds, setPermissionIds] = useState<number[]>([]);

  useEffect(() => {
    if (!visible) return;
    setSelectedRole(role.id as RoleCode);
    setPermissionIds(role.permissionIds);
  }, [visible, role]);

  const onRoleChange = (value: string) => {
    const next = value as RoleCode;
    setSelectedRole(next);
    const found = roles.find((r) => r.id === next);
    setPermissionIds(found?.permissionIds ?? []);
  };

  const togglePermission = (id: number) =>
    setPermissionIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));

  const handleSubmit = () => {
    onSubmit({ role: selectedRole, permissionIds });
  };

  const permissionsStyles = useMemo(
    () => StyleSheet.create({ label: { marginBottom: 10, fontSize: 13, fontWeight: '500', color: colors.textSecondary } }),
    [colors],
  );

  return (
    <FormModal
      visible={visible}
      title={texts.editTitle}
      subtitle={texts.editSubtitle}
      cancelLabel={MANAGEMENT_TEXTS.common.cancel}
      submitLabel={texts.save}
      onClose={onClose}
      onSubmit={handleSubmit}
    >
      <LabeledSelect label={texts.roleSelectLabel} value={selectedRole} options={roleOptions} onChange={onRoleChange} />

      <View>
        <Text style={permissionsStyles.label}>{texts.permissions}</Text>
        <View style={styles.permissions}>
          {permissionsCatalog.map((permission) => (
            <View key={permission.id} style={styles.permissionItem}>
              <CheckboxField
                checked={permissionIds.includes(permission.id)}
                label={permissionLabel(permission)}
                onChange={() => togglePermission(permission.id)}
              />
            </View>
          ))}
        </View>
      </View>
    </FormModal>
  );
}

const styles = StyleSheet.create({
  permissions: { flexDirection: 'row', flexWrap: 'wrap', rowGap: 14 },
  permissionItem: { width: '50%' },
});
