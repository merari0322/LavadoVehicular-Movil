import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { apiErrorKey } from '../../core/api/apiError';
import { AuthUser, useAuthService, useSession } from '../../core/services/auth';
import { ChangePasswordModal } from '../components/feedback/ChangePasswordModal';
import { PasswordPromptModal } from '../components/feedback/PasswordPromptModal';
import { ProfileCard, ProfileUser } from '../components/ui/ProfileCard';
import { ProfileFormValues, getCountryByCode } from '../validators/profileValidators';
import { AppAlert } from '../components/feedback/AppAlert';
import { addressService } from '../../core/services/users/AddressService';

function roleKey(user: AuthUser): string {
  if (user.roles.includes('ADMIN')) return 'PROFILE.ROLE.ADMIN';
  if (user.roles.includes('OPERATOR')) return 'PROFILE.ROLE.OPERATOR';
  return 'PROFILE.ROLE.CLIENT';
}

function toProfileUser(user: AuthUser, address: string): ProfileUser {
  const initials = `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
  return {
    name: user.fullName,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone ?? '',
    address,
    initials,
    memberSince: '',
  };
}

type PendingAction = 'email' | 'delete' | null;

// perfil real contra el security-service, igual para cliente, operario y administrador:
// editar nombres/teléfono, cambiar correo (con contraseña), cambiar contraseña y eliminar cuenta
export function ProfileView() {
  const { t } = useTranslation();
  const authService = useAuthService();
  const { user, updateUser, endSessionLocally } = useSession();

  const [address, setAddress] = useState('');
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  // datos que se guardan después de confirmar el cambio de correo con la contraseña
  const [pendingValues, setPendingValues] = useState<ProfileFormValues | null>(null);
  // la tarjeta espera esta respuesta: true si se confirmó y guardó, false si se canceló
  const emailChangeResolver = useRef<((saved: boolean) => void) | null>(null);

  const finishEmailChange = (saved: boolean) => {
    emailChangeResolver.current?.(saved);
    emailChangeResolver.current = null;
    setPendingAction(null);
    setPendingValues(null);
  };

  // los datos reales salen del backend: así lo que se ve es lo que está guardado
  useEffect(() => {
    authService.getProfile().then(updateUser).catch(() => undefined);
  }, [authService, updateUser]);

  // la dirección vive en el security-service (ADR-010): la misma en la web y en el celular
  useEffect(() => {
    if (!user) return;
    addressService.get().then(setAddress).catch(() => undefined);
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const buildPhone = (values: ProfileFormValues) =>
    `${getCountryByCode(values.phoneCountry).dialCode}${values.phoneNumber}`;

  const saveProfile = useCallback(async (values: ProfileFormValues) => {
    const saved = await authService.updateProfile({
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      phone: buildPhone(values),
    });
    updateUser(saved);
    setAddress(await addressService.update(values.address.trim()));
  }, [authService, updateUser]);

  // si cambió el correo, primero se pide la contraseña (el modal hace el cambio y el guardado)
  const handleSave = async (values: ProfileFormValues): Promise<boolean> => {
    if (!user) return false;
    setErrorMessage(null);

    if (values.email.trim().toLowerCase() !== user.email.toLowerCase()) {
      setPendingValues(values);
      setPendingAction('email');
      // la tarjeta sigue en edición hasta que confirme (o cancele) en el modal de contraseña
      return new Promise<boolean>((resolve) => {
        emailChangeResolver.current = resolve;
      });
    }

    setSaving(true);
    try {
      await saveProfile(values);
      AppAlert.alert(t('PROFILE.SUCCESS_TITLE'), t('PROFILE.SUCCESS_MESSAGE'), undefined, { type: 'success' });
      return true;
    } catch (error) {
      setErrorMessage(t(apiErrorKey(error)));
      return false;
    } finally {
      setSaving(false);
    }
  };

  const confirmWithPassword = async (password: string): Promise<string | null> => {
    try {
      if (pendingAction === 'email' && pendingValues) {
        const changed = await authService.changeEmail(pendingValues.email.trim(), password);
        updateUser(changed);
        await saveProfile(pendingValues);
        finishEmailChange(true);
        AppAlert.alert(t('PROFILE.SUCCESS_TITLE'), t('PROFILE.EMAIL_CHANGED_MESSAGE'), undefined, { type: 'success' });
        return null;
      }

      if (pendingAction === 'delete') {
        await authService.deactivateAccount(password);
        setPendingAction(null);
        AppAlert.alert(t('PROFILE.DELETE_SUCCESS_TITLE'), t('PROFILE.DELETE_SUCCESS_MESSAGE'), undefined, { type: 'success' });
        // la cuenta quedó desactivada: se limpia el celular y vuelve al login
        await endSessionLocally();
        return null;
      }
      return null;
    } catch (error) {
      return t(apiErrorKey(error));
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<string | null> => {
    try {
      await authService.changePassword(currentPassword, newPassword);
      setPasswordModalVisible(false);
      AppAlert.alert(t('PROFILE.PASSWORD_SUCCESS_TITLE'), t('PROFILE.PASSWORD_SUCCESS_MESSAGE'), undefined, { type: 'success' });
      return null;
    } catch (error) {
      return t(apiErrorKey(error));
    }
  };

  if (!user) return null;

  // al cancelar el cambio de correo, la tarjeta vuelve a mostrar los datos guardados
  const profileUser = toProfileUser(user, address);

  return (
    <>
      <ProfileCard
        user={profileUser}
        subtitle={t(roleKey(user))}
        saving={saving}
        errorMessage={errorMessage}
        onSave={handleSave}
        onChangePassword={() => setPasswordModalVisible(true)}
        onDeleteAccount={() => setPendingAction('delete')}
      />

      <ChangePasswordModal
        visible={passwordModalVisible}
        onSubmit={changePassword}
        onClose={() => setPasswordModalVisible(false)}
      />

      <PasswordPromptModal
        visible={pendingAction !== null}
        title={t(pendingAction === 'delete' ? 'PROFILE.DELETE_CONFIRM_TITLE' : 'PROFILE.CHANGE_EMAIL_TITLE')}
        message={t(pendingAction === 'delete' ? 'PROFILE.DELETE_CONFIRM_MESSAGE' : 'PROFILE.CHANGE_EMAIL_MESSAGE')}
        submitLabel={t(pendingAction === 'delete' ? 'PROFILE.DELETE_CONFIRM_BUTTON' : 'PROFILE.SAVE')}
        onConfirm={confirmWithPassword}
        onClose={() => {
          if (pendingAction === 'email') {
            finishEmailChange(false);
          } else {
            setPendingAction(null);
          }
        }}
      />
    </>
  );
}
