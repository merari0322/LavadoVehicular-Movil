import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  BackHandler,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../../app/theme';
import { ConfirmDialog } from '../../../shared/components/feedback/ConfirmDialog';
import { AdminLayout } from '../../../shared/layouts/AdminLayout';
import { AbsenceModal } from '../components/operators/AbsenceModal';
import { AssignShiftModal } from '../components/operators/AssignShiftModal';
import { AvailabilityModal } from '../components/operators/AvailabilityModal';
import { OperatorCard } from '../components/operators/OperatorCard';
import { OperatorFilters } from '../components/operators/OperatorFilters';
import { OperatorFormModal } from '../components/operators/OperatorFormModal';
import { OperatorMetrics } from '../components/operators/OperatorMetrics';
import { OperatorProfileCard } from '../components/operators/OperatorProfileCard';
import { OperatorsHeader } from '../components/operators/OperatorsHeader';
import { OperatorsSummaryCards } from '../components/operators/OperatorsSummaryCards';
import { SkillsCard } from '../components/operators/SkillsCard';
import { TodayServicesCard } from '../components/operators/TodayServicesCard';
import { OPERATOR_TEXTS } from '../constants/operatorTexts';
import {
  AbsenceFormValues,
  AssignShiftValues,
  AvailabilityDay,
  Operator,
  OperatorFormValues,
  TodayService,
} from '../models/operator';
import { formatCurrency } from '../utils/paymentUtils';
import { useOperators } from '../viewmodels/useOperators';

// Estado de un modal de formulario: abierto/cerrado y el registro que se edita (null = crear)
interface FormState<T> {
  visible: boolean;
  item: T | null;
}

const CLOSED = { visible: false, item: null };

export const AdminOperatorsScreen = () => {
  const { colors } = useTheme();
  const operators = useOperators();
  const scrollRef = useRef<ScrollView>(null);

  // Operario abierto en el detalle (null = se ve la lista)
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = operators.operators.find((item) => item.id === selectedId) ?? null;

  // Modales
  const [operatorForm, setOperatorForm] = useState<FormState<Operator>>(CLOSED);
  const [assign, setAssign] = useState<{ visible: boolean; operatorId: string | null }>({
    visible: false,
    operatorId: null,
  });
  const [availabilityVisible, setAvailabilityVisible] = useState(false);
  const [absenceVisible, setAbsenceVisible] = useState(false);
  const [returnTarget, setReturnTarget] = useState<Operator | null>(null);

  // Con el botón atrás del celular el detalle vuelve a la lista
  useEffect(() => {
    if (!selectedId) return undefined;

    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      setSelectedId(null);
      return true;
    });
    return () => subscription.remove();
  }, [selectedId]);

  // Abre el detalle y sube al inicio de la pantalla
  const openDetail = (id: string) => {
    setSelectedId(id);
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  };

  const closeDetail = () => {
    setSelectedId(null);
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  };

  // ---------------------------------------------------------------
  // Acciones de los modales
  // ---------------------------------------------------------------

  const handleOperatorSubmit = (values: OperatorFormValues) => {
    if (operatorForm.item) operators.updateOperator(operatorForm.item.id, values);
    else operators.createOperator(values);
    setOperatorForm(CLOSED);
  };

  const handleAssignSubmit = (values: AssignShiftValues) => {
    operators.assignShift(values);
    setAssign({ visible: false, operatorId: null });
  };

  const handleAvailabilitySubmit = (availability: AvailabilityDay[]) => {
    if (selected) operators.saveAvailability(selected.id, availability);
    setAvailabilityVisible(false);
  };

  const handleAbsenceSubmit = (values: AbsenceFormValues) => {
    if (selected) operators.registerAbsence(selected.id, values);
    setAbsenceVisible(false);
  };

  const handleReturnConfirm = () => {
    if (returnTarget) operators.registerReturn(returnTarget.id);
    setReturnTarget(null);
  };

  // Muestra el resumen de un servicio del día
  const handleServiceOpen = (service: TodayService) =>
    Alert.alert(
      `${service.code} · ${service.vehicle}`,
      [
        service.service,
        `${OPERATOR_TEXTS.today.bay}: ${service.bayName}`,
        `${service.start} - ${service.end}`,
        OPERATOR_TEXTS.today.status[service.status],
      ].join('\n'),
    );

  // Comparte la ficha técnica del operario como texto usando el menú de compartir
  const handleExportSheet = async () => {
    if (!selected) return;

    const skills = operators.getSkills(selected.id).map((item) => `- ${item.name} (${OPERATOR_TEXTS.skills.levels[item.level]})`);

    const message = [
      `${selected.name} · ${selected.code}`,
      selected.specialty,
      `${OPERATOR_TEXTS.status[selected.status]}`,
      `${selected.phone} · ${selected.email}`,
      `${OPERATOR_TEXTS.metrics.revenue}: ${formatCurrency(selected.stats.revenue)} COP`,
      '',
      OPERATOR_TEXTS.skills.title,
      ...skills,
    ].join('\n');

    await Share.share({ message });
  };

  // ---------------------------------------------------------------
  // Vistas: lista y detalle
  // ---------------------------------------------------------------

  const renderList = () => (
    <>
      <OperatorsHeader
        onAssignShifts={() => setAssign({ visible: true, operatorId: null })}
        onCreate={() => setOperatorForm({ visible: true, item: null })}
      />
      <OperatorsSummaryCards summary={operators.summary} />
      <OperatorFilters
        search={operators.search}
        onSearch={operators.setSearch}
        filter={operators.filter}
        onFilter={operators.setFilter}
        counts={operators.counts}
      />

      {operators.visibleOperators.length === 0 ? (
        <View style={styles.empty}>
          <MaterialIcons name="search" size={36} color={colors.textMuted} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>{OPERATOR_TEXTS.empty}</Text>
          <Text style={{ fontSize: 13, color: colors.textSecondary }}>{OPERATOR_TEXTS.emptyHint}</Text>
        </View>
      ) : (
        operators.visibleOperators.map((item) => (
          <OperatorCard
            key={item.id}
            operator={item}
            bayName={operators.getBayName(item.bayId)}
            onEdit={() => setOperatorForm({ visible: true, item })}
            onOpen={() => openDetail(item.id)}
            onRegisterReturn={() => setReturnTarget(item)}
          />
        ))
      )}
    </>
  );

  const renderDetail = (operator: Operator) => {
    const bayName = operators.getBayName(operator.bayId);

    return (
      <>
        {/* Volver a la lista */}
        <Pressable style={styles.backRow} onPress={closeDetail} hitSlop={8}>
          <MaterialIcons name="arrow-back" size={20} color={colors.textSecondary} />
          <Text style={{ fontSize: 14, color: colors.textSecondary }}>{OPERATOR_TEXTS.detail.back}</Text>
        </Pressable>
        <Text style={[styles.detailTitle, { color: colors.text }]}>
          {OPERATOR_TEXTS.detail.title(operator.name)}
        </Text>

        <OperatorProfileCard
          operator={operator}
          bayName={bayName}
          onRegisterAbsence={() => setAbsenceVisible(true)}
          onRegisterReturn={() => setReturnTarget(operator)}
          onEditAvailability={() => setAvailabilityVisible(true)}
          onAssign={() => setAssign({ visible: true, operatorId: operator.id })}
        />
        <OperatorMetrics operator={operator} />
        <TodayServicesCard
          services={operators.getTodayServices(operator.id)}
          bayName={bayName}
          onOpen={handleServiceOpen}
        />
        <SkillsCard
          operator={operator}
          bayName={bayName}
          skills={operators.getSkills(operator.id)}
          onExport={handleExportSheet}
        />
      </>
    );
  };

  return (
    <AdminLayout activeKey="operators">
      <SafeAreaView edges={['top']} style={styles.container}>
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          {selected ? renderDetail(selected) : renderList()}
        </ScrollView>
      </SafeAreaView>

      {/* Modales */}
      <OperatorFormModal
        visible={operatorForm.visible}
        operator={operatorForm.item}
        bays={operators.getAvailableBays(operatorForm.item?.id)}
        onClose={() => setOperatorForm(CLOSED)}
        onSubmit={handleOperatorSubmit}
      />
      <AssignShiftModal
        visible={assign.visible}
        operators={operators.operators}
        initialOperatorId={assign.operatorId}
        getAvailableBays={operators.getAvailableBays}
        onClose={() => setAssign({ visible: false, operatorId: null })}
        onSubmit={handleAssignSubmit}
      />
      <AvailabilityModal
        visible={availabilityVisible}
        operator={selected}
        onClose={() => setAvailabilityVisible(false)}
        onSubmit={handleAvailabilitySubmit}
      />
      <AbsenceModal
        visible={absenceVisible}
        onClose={() => setAbsenceVisible(false)}
        onSubmit={handleAbsenceSubmit}
      />

      {/* Confirmación de reingreso */}
      <ConfirmDialog
        visible={returnTarget !== null}
        title={OPERATOR_TEXTS.returnDialog.title}
        message={returnTarget ? OPERATOR_TEXTS.returnDialog.message(returnTarget.name) : ''}
        confirmLabel={OPERATOR_TEXTS.returnDialog.confirm}
        cancelLabel={OPERATOR_TEXTS.common.cancel}
        danger={false}
        onConfirm={handleReturnConfirm}
        onCancel={() => setReturnTarget(null)}
      />
    </AdminLayout>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  // El espacio de abajo evita que la barra inferior flotante tape el contenido
  content: { gap: 16, padding: 16, paddingBottom: 130 },
  backRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  detailTitle: { fontSize: 20, fontWeight: '800' },
  empty: { alignItems: 'center', gap: 6, paddingVertical: 32 },
  emptyTitle: { fontSize: 16, fontWeight: '700' },
});
