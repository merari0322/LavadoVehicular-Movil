import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ConfirmDialog } from '../../../shared/components/feedback/ConfirmDialog';
import { AdminLayout } from '../../../shared/layouts/AdminLayout';
import { BayFormModal } from '../components/schedule/BayFormModal';
import { BaysTab } from '../components/schedule/BaysTab';
import { ExceptionFormModal } from '../components/schedule/ExceptionFormModal';
import { ExceptionsCard } from '../components/schedule/ExceptionsCard';
import { HistoryModal } from '../components/schedule/HistoryModal';
import { ScheduleHeader } from '../components/schedule/ScheduleHeader';
import { ScheduleTabs } from '../components/schedule/ScheduleTabs';
import { WeeklyScheduleCard } from '../components/schedule/WeeklyScheduleCard';
import { SCHEDULE_TEXTS } from '../constants/scheduleTexts';
import {
  Bay,
  BayFormValues,
  ExceptionFormValues,
  ScheduleException,
  ScheduleTab,
} from '../models/schedule';
import { isoToDisplay } from '../utils/reservationUtils';
import { useSchedule } from '../viewmodels/useSchedule';
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
}

export const AdminScheduleScreen = () => {
  // vuelve a pintar la pantalla cuando cambia el idioma
  const { t } = useTranslation();
  const schedule = useSchedule();

  const [tab, setTab] = useState<ScheduleTab>('hours');
  const [historyVisible, setHistoryVisible] = useState(false);

  // Modales de formulario (uno por pestaña)
  const [exceptionForm, setExceptionForm] = useState<FormState<ScheduleException>>(CLOSED);
  const [bayForm, setBayForm] = useState<FormState<Bay>>(CLOSED);

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
  // Horario semanal
  // ---------------------------------------------------------------

  // Guarda el horario y avisa si salió bien o si hay errores de validación o del backend
  const handleSaveWeek = async () => {
    const texts = SCHEDULE_TEXTS.week;
    try {
      const saved = await schedule.saveWeek();
      if (saved) Alert.alert(texts.savedTitle, texts.savedMessage);
      else Alert.alert(texts.invalidTitle, texts.invalidMessage);
    } catch (error) {
      Alert.alert(SCHEDULE_TEXTS.common.saveError, t(apiErrorKey(error)));
    }
  };

  // ---------------------------------------------------------------
  // Excepciones
  // ---------------------------------------------------------------

  const handleExceptionSubmit = async (values: ExceptionFormValues) => {
    try {
      if (exceptionForm.item) await schedule.updateException(exceptionForm.item.id, values);
      else await schedule.createException(values);
      setExceptionForm(CLOSED);
    } catch (error) {
      Alert.alert(SCHEDULE_TEXTS.common.saveError, t(apiErrorKey(error)));
    }
  };

  const handleExceptionDelete = (exception: ScheduleException) =>
    askDelete(
      SCHEDULE_TEXTS.exceptions.deleteTitle,
      SCHEDULE_TEXTS.exceptions.deleteMessage(isoToDisplay(exception.date)),
      () =>
        schedule.deleteException(exception.id).catch((error) =>
          Alert.alert(SCHEDULE_TEXTS.common.saveError, t(apiErrorKey(error))),
        ),
    );

  // ---------------------------------------------------------------
  // Bahías
  // ---------------------------------------------------------------

  const handleBaySubmit = async (values: BayFormValues) => {
    try {
      if (bayForm.item) await schedule.updateBay(bayForm.item.id, values);
      else await schedule.createBay(values);
      setBayForm(CLOSED);
    } catch (error) {
      Alert.alert(SCHEDULE_TEXTS.common.saveError, t(apiErrorKey(error)));
    }
  };

  const handleBayDelete = (bay: Bay) =>
    askDelete(
      SCHEDULE_TEXTS.bays.deleteTitle,
      SCHEDULE_TEXTS.bays.deleteMessage(bay.name),
      () =>
        schedule.deleteBay(bay.id).catch((error) =>
          Alert.alert(SCHEDULE_TEXTS.common.saveError, t(apiErrorKey(error))),
        ),
    );

  return (
    <AdminLayout activeKey="schedule">
      <SafeAreaView edges={['top']} style={styles.container}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <ScheduleHeader
            todayRange={schedule.todayRange}
            onOpenHistory={() => setHistoryVisible(true)}
          />

          <ScheduleTabs active={tab} activeBays={schedule.activeBays} onChange={setTab} />

          {/* Pestaña: horario del negocio */}
          {tab === 'hours' ? (
            <View style={styles.section}>
              <WeeklyScheduleCard
                week={schedule.draftWeek}
                errors={schedule.weekErrors}
                isDirty={schedule.isDirty}
                onChangeDay={schedule.updateDay}
                onReset={schedule.resetWeek}
                onSave={handleSaveWeek}
              />
              <ExceptionsCard
                exceptions={schedule.exceptions}
                onAdd={() => setExceptionForm({ visible: true, item: null })}
                onEdit={(exception) => setExceptionForm({ visible: true, item: exception })}
                onDelete={handleExceptionDelete}
              />
            </View>
          ) : null}

          {/* Pestaña: bahías de lavado */}
          {tab === 'bays' ? (
            <BaysTab
              bays={schedule.bays}
              onAdd={() => setBayForm({ visible: true, item: null })}
              onEdit={(bay) => setBayForm({ visible: true, item: bay })}
              onChangeStatus={(id, status) => {
                void schedule.changeBayStatus(id, status).catch((error) =>
                  Alert.alert(SCHEDULE_TEXTS.common.saveError, t(apiErrorKey(error))),
                );
              }}
              onDelete={handleBayDelete}
            />
          ) : null}
        </ScrollView>
      </SafeAreaView>

      {/* Modales */}
      <ExceptionFormModal
        visible={exceptionForm.visible}
        exception={exceptionForm.item}
        isDateTaken={schedule.isDateTaken}
        onClose={() => setExceptionForm(CLOSED)}
        onSubmit={handleExceptionSubmit}
      />
      <BayFormModal
        visible={bayForm.visible}
        bay={bayForm.item}
        isNameTaken={schedule.isBayNameTaken}
        onClose={() => setBayForm(CLOSED)}
        onSubmit={handleBaySubmit}
      />
      <HistoryModal
        visible={historyVisible}
        entries={schedule.history}
        onClose={() => setHistoryVisible(false)}
      />

      {/* Confirmación al eliminar */}
      <ConfirmDialog
        visible={confirm !== null}
        title={confirm?.title ?? ''}
        message={confirm?.message ?? ''}
        confirmLabel={SCHEDULE_TEXTS.common.delete}
        cancelLabel={SCHEDULE_TEXTS.common.cancel}
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
  section: { gap: 16 },
});
