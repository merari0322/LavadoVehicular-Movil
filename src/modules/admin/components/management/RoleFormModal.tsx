import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { CheckboxField } from '../../../../shared/components/forms/CheckboxField';
import { FormModal } from '../../../../shared/components/feedback/FormModal';
import { LabeledInput } from '../../../../shared/components/forms/LabeledInput';
import { useTheme } from '../../../../app/theme';
import { MANAGEMENT_TEXTS } from '../../constants/managementTexts';
import { PERMISSIONS, Permission, Role, RoleFormValues } from '../../models/management';

interface RoleFormModalProps {
  visible: boolean;
  role: Role | null; // null = crear, con valor = editar
  onClose: () => void;
  onSubmit: (values: RoleFormValues) => void;
}

const texts = MANAGEMENT_TEXTS.roles.form;

// Modal para crear o editar un rol con sus permisos
export function RoleFormModal({ visible, role, onClose, onSubmit }: RoleFormModalProps) {
  const { colors } = useTheme();
  const isEditing = role !== null;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [nameError, setNameError] = useState<string | undefined>();

  // Cada vez que se abre el modal se cargan los datos del rol (o valores por defecto)
  useEffect(() => {
    if (!visible) return;
    setName(role?.name ?? '');
    setDescription(role?.description ?? '');
    setPermissions(role?.permissions ?? ['view_panels']);
    setNameError(undefined);
  }, [visible, role]);

  // Marca o desmarca un permiso
  const togglePermission = (permission: Permission) =>
    setPermissions((prev) =>
      prev.includes(permission) ? prev.filter((item) => item !== permission) : [...prev, permission],
    );

  const handleSubmit = () => {
    if (name.trim().length < 3) {
      setNameError(texts.errors.name);
      return;
    }

    // Se conserva el orden original de los permisos
    onSubmit({
      name: name.trim(),
      description: description.trim(),
      permissions: PERMISSIONS.filter((item) => permissions.includes(item)),
    });
  };

  return (
    <FormModal
      visible={visible}
      title={isEditing ? texts.editTitle : texts.createTitle}
      subtitle={isEditing ? texts.editSubtitle : texts.createSubtitle}
      cancelLabel={MANAGEMENT_TEXTS.common.cancel}
      submitLabel={isEditing ? texts.save : texts.create}
      onClose={onClose}
      onSubmit={handleSubmit}
    >
      <LabeledInput
        label={texts.name}
        value={name}
        onChangeText={(text) => {
          setName(text);
          setNameError(undefined);
        }}
        placeholder={texts.namePlaceholder}
        error={nameError}
        autoCapitalize="words"
      />

      <LabeledInput
        label={texts.description}
        value={description}
        onChangeText={setDescription}
        placeholder={texts.descriptionPlaceholder}
        multiline
      />

      <View>
        <Text style={[styles.label, { color: colors.textSecondary }]}>{texts.permissions}</Text>
        <View style={styles.permissions}>
          {PERMISSIONS.map((permission) => (
            <View key={permission} style={styles.permissionItem}>
              <CheckboxField
                checked={permissions.includes(permission)}
                label={MANAGEMENT_TEXTS.roles.permissions[permission]}
                onChange={() => togglePermission(permission)}
              />
            </View>
          ))}
        </View>
      </View>
    </FormModal>
  );
}

const styles = StyleSheet.create({
  label: { marginBottom: 10, fontSize: 13, fontWeight: '500' },
  permissions: { flexDirection: 'row', flexWrap: 'wrap', rowGap: 14 },
  permissionItem: { width: '50%' },
});
