import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ConfirmDialog } from '../../../shared/components/feedback/ConfirmDialog';
import { AdminLayout } from '../../../shared/layouts/AdminLayout';
import { BusinessTab } from '../components/settings/BusinessTab';
import { GeneralTab } from '../components/settings/GeneralTab';
import { LegalDocumentModal, LegalDocumentType } from '../../../shared/components/feedback/LegalDocumentModal';
import { useEstablishment } from '../../../shared/services/establishmentCatalog';
import { useFeedback } from '../../../shared/hooks/useFeedback';
import { PaymentMethodFormModal } from '../components/settings/PaymentMethodFormModal';
import { PaymentsTab } from '../components/settings/PaymentsTab';
import { SettingsTabs } from '../components/settings/SettingsTabs';
import { SETTINGS_TEXTS } from '../constants/settingsTexts';
import { HelpTopic, PaymentMethod, PaymentMethodFormValues } from '../models/settings';
import { useSettings } from '../viewmodels/useSettings';

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
}

export const AdminSettingsScreen = () => {
  const settings = useSettings();
  const establishment = useEstablishment();

  // Tema de ayuda abierto en el modal de lectura (null = cerrado)
  // Términos / Política abiertos en el documento legal (igual que la web)
  const [legal, setLegal] = useState<LegalDocumentType | null>(null);
  const feedback = useFeedback();
  const { t } = useTranslation();

  // Centro de ayuda: canales de atención; Términos y Política: documento legal completo
  const openHelp = (topic: HelpTopic) => {
    if (topic === 'terms' || topic === 'privacy') {
      setLegal(topic);
      return;
    }
    feedback.showStatus({
      type: 'info',
      icon: 'support-agent',
      title: t('CONFIG.HELP_CENTER'),
      message: t('CONFIG.HELP_MODAL.MESSAGE'),
      buttonText: t('COMMON.CLOSE'),
      details: [
        // el negocio solo tiene un teléfono: es la línea de atención. Las novedades del servicio
        // le llegan al cliente por sus notificaciones y su correo
        { label: t('CONFIG.HELP_MODAL.SUPPORT_LINE'), value: establishment.phone ?? '—' },
        { label: t('CONFIG.HELP_MODAL.EMAIL'), value: establishment.email ?? '—' },
        { label: t('CONFIG.HELP_MODAL.HOURS'), value: t('CONFIG.HELP_MODAL.HOURS_VALUE') },
        { label: t('CONFIG.HELP_MODAL.ADDRESS'), value: establishment.address },
      ],
    });
  };

  // Modal de formulario de métodos de pago
  const [paymentForm, setPaymentForm] = useState<FormState<PaymentMethod>>(CLOSED);

  // Diálogo de confirmación para eliminar
  const [confirm, setConfirm] = useState<ConfirmState | null>(null);

  // ---------------------------------------------------------------
  // Datos del negocio
  // ---------------------------------------------------------------

  // Guarda los datos y avisa si salió bien o si hay errores
  const handleSaveBusiness = () => {
    const texts = SETTINGS_TEXTS.business;
    const saved = settings.saveBusiness();

    if (saved) Alert.alert(texts.savedTitle, texts.savedMessage);
    else Alert.alert(texts.invalidTitle, texts.invalidMessage);
  };

  // ---------------------------------------------------------------
  // Métodos de pago
  // ---------------------------------------------------------------

  const handlePaymentSubmit = (values: PaymentMethodFormValues) => {
    if (paymentForm.item) settings.updatePaymentMethod(paymentForm.item.id, values);
    else settings.createPaymentMethod(values);
    setPaymentForm(CLOSED);
  };

  // Pide confirmación; al aceptar elimina el método y cierra el diálogo
  const handlePaymentDelete = (method: PaymentMethod) =>
    setConfirm({
      title: SETTINGS_TEXTS.payments.deleteTitle,
      message: SETTINGS_TEXTS.payments.deleteMessage(method.name),
      onConfirm: () => {
        settings.deletePaymentMethod(method.id);
        setConfirm(null);
      },
    });

  // Abre el selector de archivos y avisa solo si algo falla
  const handleReplaceQr = async (method: PaymentMethod) => {
    const result = await settings.replaceQr(method.id);
    if (result === 'error') {
      Alert.alert(SETTINGS_TEXTS.payments.qr.errorTitle, SETTINGS_TEXTS.payments.qr.errorMessage);
    }
  };

  return (
    <AdminLayout activeKey="settings">
      <SafeAreaView edges={['top']} style={styles.container}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <SettingsTabs active={settings.tab} onChange={settings.setTab} />

          {/* Pestaña: general */}
          {settings.tab === 'general' ? (
            <GeneralTab
              preferences={settings.preferences}
              theme={settings.theme}
              language={settings.language}
              onTogglePreference={settings.togglePreference}
              onChangeTheme={settings.setTheme}
              onChangeLanguage={settings.setLanguage}
              onOpenHelp={openHelp}
            />
          ) : null}

          {/* Pestaña: datos del negocio */}
          {settings.tab === 'business' ? (
            <BusinessTab
              businessName={settings.businessName}
              data={settings.business}
              errors={settings.businessErrors}
              isDirty={settings.isDirty}
              onChange={settings.updateBusiness}
              onDiscard={settings.discardBusiness}
              onSave={handleSaveBusiness}
            />
          ) : null}

          {/* Pestaña: métodos de pago */}
          {settings.tab === 'payments' ? (
            <PaymentsTab
              methods={settings.payments}
              activeCount={settings.activePayments}
              onAdd={() => setPaymentForm({ visible: true, item: null })}
              onEdit={(method) => setPaymentForm({ visible: true, item: method })}
              onToggleActive={settings.togglePaymentActive}
              onReplaceQr={handleReplaceQr}
              onDelete={handlePaymentDelete}
            />
          ) : null}
        </ScrollView>
      </SafeAreaView>

      {/* Modales */}
      <LegalDocumentModal type={legal} onClose={() => setLegal(null)} />
      {feedback.modals}
      <PaymentMethodFormModal
        visible={paymentForm.visible}
        method={paymentForm.item}
        isNameTaken={settings.isPaymentNameTaken}
        onClose={() => setPaymentForm(CLOSED)}
        onSubmit={handlePaymentSubmit}
      />

      {/* Confirmación al eliminar */}
      <ConfirmDialog
        visible={confirm !== null}
        title={confirm?.title ?? ''}
        message={confirm?.message ?? ''}
        confirmLabel={SETTINGS_TEXTS.common.delete}
        cancelLabel={SETTINGS_TEXTS.common.cancel}
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
