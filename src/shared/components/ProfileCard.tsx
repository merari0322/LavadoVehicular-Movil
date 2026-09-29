import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../app/theme';
import { ThemeColors } from '../../app/theme/colors';
import { withAlpha } from '../utils/color';
import {
  PHONE_COUNTRIES,
  ProfileFormValues,
  cleanPhoneNumber,
  getCountryByCode,
  hasProfileErrors,
  validateProfile,
} from '../validators/profileValidators';

// ---------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------

export interface ProfileUser {
  name: string;
  email: string;
  phone: string;
  address: string;
  initials: string;
  memberSince: string;
}

interface ProfileCardProps {
  user: ProfileUser;
  onSave?: (values: ProfileFormValues) => void; // Se ejecuta al guardar cambios
  onChangePassword?: () => void;
  onDeleteAccount?: () => void;
}

type TouchedMap = Partial<Record<keyof ProfileFormValues, boolean>>;
type IconName = React.ComponentProps<typeof MaterialIcons>['name'];

// ---------------------------------------------------------------
// Textos por defecto (se usan si la key no existe en tus locales)
// ---------------------------------------------------------------

const DEFAULT_TEXTS: Record<string, string> = {
  'profile.title': 'Mi Perfil',
  'profile.memberSince': 'Cliente desde {{date}}',
  'profile.editMode': 'Modo edición',
  'profile.savedMode': 'Modo visualización',
  'profile.name': 'Nombre',
  'profile.email': 'Correo electrónico',
  'profile.phone': 'Teléfono',
  'profile.address': 'Dirección',
  'profile.edit': 'Editar perfil',
  'profile.save': 'Guardar cambios',
  'profile.password': 'Contraseña',
  'profile.changePassword': 'Cambiar contraseña',
  'profile.passwordDesc': 'Se recomienda una contraseña segura',
  'profile.change': 'Cambiar',
  'profile.account': 'Cuenta',
  'profile.delete': 'Eliminar cuenta',
  'profile.deleteDesc': 'Eliminar permanentemente tu cuenta y todos tus datos',
  'profile.validation.nameRequired': 'El nombre es obligatorio',
  'profile.validation.nameMin': 'El nombre debe tener mínimo 3 caracteres',
  'profile.validation.nameInvalid': 'El nombre solo puede contener letras',
  'profile.validation.emailRequired': 'El correo es obligatorio',
  'profile.validation.emailInvalid': 'El correo no es válido',
  'profile.validation.phoneRequired': 'El teléfono es obligatorio',
  'profile.validation.phoneInvalid': 'El teléfono no es válido para este país',
  'profile.validation.addressRequired': 'La dirección es obligatoria',
  'profile.validation.addressMin': 'La dirección debe tener mínimo 5 caracteres',
};

// ---------------------------------------------------------------
// Colores (salen del ThemeContext, así respeta el tema activo)
// ---------------------------------------------------------------

const buildPalette = (c: ThemeColors) => ({
  background: c.bg,
  primary: c.primary,
  primarySoft: withAlpha(c.primary, 0.12),
  primaryTint: withAlpha(c.primary, 0.1),
  primaryBorder: withAlpha(c.primary, 0.35),
  primaryBorderSoft: withAlpha(c.primary, 0.18),
  card: c.card,
  text: c.text,
  textSecondary: c.textSecondary,
  border: c.border,
  error: c.error,
  errorSoft: c.errorSoft,
});

type Palette = ReturnType<typeof buildPalette>;

// Hook: devuelve la paleta del tema actual
const usePalette = (): Palette => {
  const { colors } = useTheme();
  return useMemo(() => buildPalette(colors), [colors]);
};

// ---------------------------------------------------------------
// Subcomponente: tarjeta de un campo (icono + label + contenido + error)
// ---------------------------------------------------------------

interface FieldCardProps {
  icon: IconName;
  label: string;
  error?: string;
  children: React.ReactNode;
}

const FieldCard = ({ icon, label, error, children }: FieldCardProps) => {
  const COLORS = usePalette();
  const styles = useStyles();

  return (
  <View style={[styles.fieldCard, Boolean(error) && styles.fieldCardError]}>
    <View style={[styles.iconBox, Boolean(error) && styles.iconBoxError]}>
      <MaterialIcons name={icon} size={20} color={error ? COLORS.error : COLORS.primary} />
    </View>

    <View style={styles.fieldBody}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {children}
      {Boolean(error) && <Text style={styles.errorText}>{error}</Text>}
    </View>
  </View>
  );
};

// ---------------------------------------------------------------
// Subcomponente: tarjeta de acción (cambiar contraseña / eliminar cuenta)
// ---------------------------------------------------------------

interface ActionCardProps {
  headerIcon: IconName;
  headerTitle: string;
  rowIcon: IconName;
  rowTitle: string;
  rowDescription: string;
  buttonLabel: string;
  danger?: boolean;
  onPress?: () => void;
}

const ActionCard = ({
  headerIcon,
  headerTitle,
  rowIcon,
  rowTitle,
  rowDescription,
  buttonLabel,
  danger = false,
  onPress,
}: ActionCardProps) => {
  const COLORS = usePalette();
  const styles = useStyles();

  return (
  <View style={styles.card}>
    <View style={styles.actionHeader}>
      <View style={styles.iconBox}>
        <MaterialIcons name={headerIcon} size={20} color={COLORS.primary} />
      </View>
      <Text style={styles.actionHeaderTitle}>{headerTitle}</Text>
    </View>

    <View style={styles.divider} />

    <View style={styles.actionRow}>
      <View style={[styles.iconBox, danger && styles.iconBoxError]}>
        <MaterialIcons name={rowIcon} size={20} color={danger ? COLORS.error : COLORS.primary} />
      </View>
      <View style={styles.actionTexts}>
        <Text style={styles.actionTitle}>{rowTitle}</Text>
        <Text style={styles.actionDescription}>{rowDescription}</Text>
      </View>
    </View>

    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.actionButton,
        danger && styles.actionButtonDanger,
        pressed && styles.pressed,
      ]}
    >
      <Text style={styles.actionButtonText}>{buttonLabel}</Text>
    </Pressable>
  </View>
  );
};

// ---------------------------------------------------------------
// Componente principal
// ---------------------------------------------------------------

// Crea los valores iniciales del formulario a partir del usuario
const buildInitialValues = (user: ProfileUser): ProfileFormValues => ({
  name: user.name,
  email: user.email,
  phoneCountry: PHONE_COUNTRIES[0].code,
  phoneNumber: cleanPhoneNumber(user.phone),
  address: user.address,
});

export const ProfileCard = ({
  user,
  onSave,
  onChangePassword,
  onDeleteAccount,
}: ProfileCardProps) => {
  const { t } = useTranslation();
  const COLORS = usePalette();
  const styles = useStyles();

  // Traduce una key usando el texto en español por defecto
  const tr = (key: string, options?: Record<string, string>) =>
    t(key, { defaultValue: DEFAULT_TEXTS[key], ...options });

  const [values, setValues] = useState<ProfileFormValues>(buildInitialValues(user));
  const [touched, setTouched] = useState<TouchedMap>({});
  const [editing, setEditing] = useState(false);
  const [countryOpen, setCountryOpen] = useState(false);

  // Si llegan datos nuevos del usuario (y no se está editando), se actualiza el formulario
  useEffect(() => {
    if (!editing) {
      setValues(buildInitialValues(user));
    }
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const errors = validateProfile(values);
  const selectedCountry = getCountryByCode(values.phoneCountry);

  // El error solo se muestra cuando el campo ya fue tocado
  const getError = (field: keyof ProfileFormValues): string | undefined => {
    const errorKey = touched[field] ? errors[field] : undefined;
    return errorKey ? tr(errorKey) : undefined;
  };

  const handleChange = (field: keyof ProfileFormValues, value: string) => {
    // En el teléfono solo se permiten números
    const finalValue = field === 'phoneNumber' ? value.replace(/\D/g, '') : value;
    setValues((prev) => ({ ...prev, [field]: finalValue }));
  };

  const handleBlur = (field: keyof ProfileFormValues) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleSelectCountry = (code: string) => {
    setValues((prev) => ({ ...prev, phoneCountry: code }));
    setCountryOpen(false);
  };

  // Alterna entre modo visualización y modo edición
  const handleToggleEdit = () => {
    // Pasar a modo edición
    if (!editing) {
      setEditing(true);
      return;
    }

    // Si hay errores, se marcan todos los campos como tocados y no se guarda
    if (hasProfileErrors(errors)) {
      setTouched({ name: true, email: true, phoneNumber: true, address: true });
      return;
    }

    // Guardar cambios y volver a modo visualización
    onSave?.(values);
    setEditing(false);
    setCountryOpen(false);
    setTouched({});
  };

  // Estilo del input según el modo (edición o solo lectura)
  const inputStyle = [styles.input, editing ? styles.inputEditing : styles.inputReadonly];

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.pageTitle}>{tr('profile.title')}</Text>

      {/* Resumen del usuario */}
      <View style={[styles.card, styles.summaryCard]}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user.initials}</Text>
        </View>

        <View style={styles.summaryInfo}>
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.subtitle}>{tr('profile.memberSince', { date: user.memberSince })}</Text>
        </View>

        <View style={[styles.statusBadge, editing && styles.statusBadgeEditing]}>
          <MaterialIcons
            name={editing ? 'edit' : 'check-circle'}
            size={18}
            color={COLORS.primary}
          />
          <Text style={styles.statusText}>
            {editing ? tr('profile.editMode') : tr('profile.savedMode')}
          </Text>
        </View>
      </View>

      {/* Nombre */}
      <FieldCard icon="person" label={tr('profile.name')} error={getError('name')}>
        <TextInput
          style={inputStyle}
          value={values.name}
          editable={editing}
          onChangeText={(text) => handleChange('name', text)}
          onBlur={() => handleBlur('name')}
          autoCapitalize="words"
        />
      </FieldCard>

      {/* Correo */}
      <FieldCard icon="email" label={tr('profile.email')} error={getError('email')}>
        <TextInput
          style={inputStyle}
          value={values.email}
          editable={editing}
          onChangeText={(text) => handleChange('email', text)}
          onBlur={() => handleBlur('email')}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </FieldCard>

      {/* Teléfono: selector de país + número */}
      <FieldCard icon="phone" label={tr('profile.phone')} error={getError('phoneNumber')}>
        <View style={styles.phoneRow}>
          <Pressable
            disabled={!editing}
            onPress={() => setCountryOpen((open) => !open)}
            style={[styles.countryTrigger, editing ? styles.inputEditing : styles.inputReadonly]}
          >
            <Text style={styles.flag}>{selectedCountry.flag}</Text>
            <Text style={styles.dialCode}>{selectedCountry.dialCode}</Text>
            {editing && (
              <MaterialIcons name="expand-more" size={16} color={COLORS.textSecondary} />
            )}
          </Pressable>

          <TextInput
            style={[...inputStyle, styles.phoneInput]}
            value={values.phoneNumber}
            editable={editing}
            onChangeText={(text) => handleChange('phoneNumber', text)}
            onBlur={() => handleBlur('phoneNumber')}
            keyboardType="number-pad"
            maxLength={selectedCountry.digits}
          />
        </View>

        {/* Lista de países (se despliega debajo del selector) */}
        {editing && countryOpen && (
          <View style={styles.countryList}>
            {PHONE_COUNTRIES.map((country) => (
              <Pressable
                key={country.code}
                onPress={() => handleSelectCountry(country.code)}
                style={[
                  styles.countryOption,
                  country.code === values.phoneCountry && styles.countryOptionActive,
                ]}
              >
                <Text style={styles.flag}>{country.flag}</Text>
                <Text style={styles.dialCode}>{country.dialCode}</Text>
              </Pressable>
            ))}
          </View>
        )}
      </FieldCard>

      {/* Dirección */}
      <FieldCard icon="home" label={tr('profile.address')} error={getError('address')}>
        <TextInput
          style={inputStyle}
          value={values.address}
          editable={editing}
          onChangeText={(text) => handleChange('address', text)}
          onBlur={() => handleBlur('address')}
        />
      </FieldCard>

      {/* Botón editar / guardar */}
      <Pressable
        onPress={handleToggleEdit}
        style={({ pressed }) => [
          styles.editButton,
          !editing && styles.editButtonSaved,
          pressed && styles.pressed,
        ]}
      >
        <MaterialIcons
          name={editing ? 'save' : 'edit'}
          size={18}
          color={editing ? '#FFFFFF' : COLORS.primary}
        />
        <Text style={[styles.editButtonText, !editing && styles.editButtonTextSaved]}>
          {editing ? tr('profile.save') : tr('profile.edit')}
        </Text>
      </Pressable>

      {/* Acciones de cuenta */}
      <ActionCard
        headerIcon="password"
        headerTitle={tr('profile.password')}
        rowIcon="vpn-key"
        rowTitle={tr('profile.changePassword')}
        rowDescription={tr('profile.passwordDesc')}
        buttonLabel={tr('profile.change')}
        onPress={onChangePassword}
      />

      <ActionCard
        headerIcon="person"
        headerTitle={tr('profile.account')}
        rowIcon="delete"
        rowTitle={tr('profile.delete')}
        rowDescription={tr('profile.deleteDesc')}
        buttonLabel={tr('profile.delete')}
        danger
        onPress={onDeleteAccount}
      />
    </ScrollView>
  );
};

// ---------------------------------------------------------------
// Estilos
// ---------------------------------------------------------------

const createStyles = (COLORS: Palette) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16, gap: 14, paddingBottom: 120 },
  pageTitle: { fontSize: 22, fontWeight: '700', color: COLORS.text },
  pressed: { opacity: 0.85 },

  // Tarjeta base
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.primaryBorderSoft,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },

  // Resumen
  summaryCard: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 14 },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primarySoft,
    borderWidth: 3,
    borderColor: COLORS.primaryBorderSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 18, fontWeight: '800', color: COLORS.primary },
  summaryInfo: { flex: 1, minWidth: 140 },
  userName: { fontSize: 19, fontWeight: '700', color: COLORS.text },
  subtitle: { marginTop: 4, fontSize: 13, color: COLORS.textSecondary },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.primaryBorderSoft,
  },
  statusBadgeEditing: {
    backgroundColor: COLORS.primarySoft,
    borderColor: COLORS.primaryBorder,
  },
  statusText: { fontSize: 13, fontWeight: '700', color: COLORS.primary },

  // Tarjeta de campo
  fieldCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    backgroundColor: COLORS.card,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.primaryBorderSoft,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  fieldCardError: { borderColor: COLORS.error },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBoxError: { backgroundColor: COLORS.errorSoft },
  fieldBody: { flex: 1, minWidth: 0 },
  fieldLabel: {
    marginBottom: 6,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    color: COLORS.textSecondary,
  },
  errorText: { marginTop: 6, fontSize: 12, fontWeight: '600', color: COLORS.error },

  // Inputs
  input: {
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  inputEditing: { backgroundColor: COLORS.primaryTint, borderColor: COLORS.primaryBorder },
  inputReadonly: { backgroundColor: 'transparent', borderColor: COLORS.primaryBorderSoft },

  // Teléfono
  phoneRow: { flexDirection: 'row', gap: 8 },
  phoneInput: { flex: 1, minWidth: 0 },
  countryTrigger: {
    height: 42,
    minWidth: 92,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  flag: { fontSize: 16 },
  dialCode: { fontSize: 13, fontWeight: '700', color: COLORS.text },
  countryList: {
    marginTop: 8,
    padding: 6,
    gap: 2,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
  },
  countryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  countryOptionActive: { backgroundColor: COLORS.primarySoft },

  // Botón editar / guardar
  editButton: {
    height: 42,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
  },
  editButtonSaved: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
  },
  editButtonText: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
  editButtonTextSaved: { color: COLORS.primary },

  // Tarjetas de acciones
  actionHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  actionHeaderTitle: { fontSize: 17, fontWeight: '700', color: COLORS.text },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 14 },
  actionRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  actionTexts: { flex: 1 },
  actionTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  actionDescription: { marginTop: 3, fontSize: 12, color: COLORS.textSecondary },
  actionButton: {
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
  },
  actionButtonDanger: { backgroundColor: COLORS.error },
  actionButtonText: { fontSize: 13, fontWeight: '700', color: '#FFFFFF' },
});

// Hook: crea los estilos con los colores del tema activo
const useStyles = () => {
  const palette = usePalette();
  return useMemo(() => createStyles(palette), [palette]);
};
