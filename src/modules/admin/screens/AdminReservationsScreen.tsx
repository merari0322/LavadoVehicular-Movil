import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../../app/theme';
import { ThemeColors } from '../../../app/theme/colors';
import { AdminLayout } from '../../../shared/layouts/AdminLayout';
import { withAlpha } from '../../../shared/utils/color';
import { ReservationCard } from '../components/ReservationCard';
import { ReservationDetailModal } from '../components/ReservationDetailModal';
import { ReservationFilters } from '../components/ReservationFilters';
import { ReservationFormModal } from '../components/ReservationFormModal';
import { ReservationStats } from '../components/ReservationStats';
import { TEXTS } from '../constants/reservationTexts';
import { Reservation, ReservationFormValues } from '../models/reservation';
import { getOperatorById, getServiceById } from '../services/reservationMock';
import { useReservations } from '../viewmodels/useReservations';

// Escapa un valor para CSV (comillas dobles)
const csvValue = (value: string): string => `"${value.replace(/"/g, '""')}"`;

export const AdminReservationsScreen = () => {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const {
    filteredReservations,
    filters,
    stats,
    updateFilters,
    clearFilters,
    createReservation,
    updateReservation,
  } = useReservations();

  // Modal de crear/editar
  const [formVisible, setFormVisible] = useState(false);
  const [editingReservation, setEditingReservation] = useState<Reservation | null>(null);

  // Modal de detalle (el ojito)
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);

  // Abre el formulario vacío para crear
  const handleNew = () => {
    setEditingReservation(null);
    setFormVisible(true);
  };

  // Cierra el detalle y abre el formulario de edición
  const handleEditFromDetail = (reservation: Reservation) => {
    setSelectedReservation(null);
    // Pequeña espera para que en iOS termine de cerrarse el primer modal
    setTimeout(() => {
      setEditingReservation(reservation);
      setFormVisible(true);
    }, 300);
  };

  // Guarda: si hay una reserva en edición la actualiza, si no crea una nueva
  const handleSubmit = (values: ReservationFormValues) => {
    if (editingReservation) {
      updateReservation(editingReservation.id, values);
    } else {
      createReservation(values);
    }
    setFormVisible(false);
  };

  // Exporta las reservas filtradas en CSV usando el menú de compartir
  const handleExport = async () => {
    const header = ['Código', 'Cliente', 'Teléfono', 'Vehículo', 'Placa', 'Servicio', 'Fecha', 'Hora', 'Operario', 'Estado'];
    const rows = filteredReservations.map((item) =>
      [
        item.code,
        item.customerName,
        item.phone,
        item.vehicle,
        item.plate,
        getServiceById(item.serviceId)?.name ?? '',
        item.date,
        item.time,
        getOperatorById(item.operatorId)?.name ?? '',
        TEXTS.status[item.status],
      ]
        .map(csvValue)
        .join(','),
    );

    await Share.share({ message: [header.map(csvValue).join(','), ...rows].join('\n') });
  };

  return (
    <AdminLayout activeKey="reservations">
      <SafeAreaView edges={['top']} style={styles.container}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {/* Título */}
          <View style={styles.titleRow}>
            <View style={styles.titleIcon}>
              <MaterialIcons name="event-available" size={26} color={colors.primary} />
            </View>
            <View style={styles.flex}>
              <Text style={styles.title}>{TEXTS.title}</Text>
              <Text style={styles.subtitle}>{TEXTS.subtitle}</Text>
            </View>
          </View>

          {/* Acciones principales */}
          <View style={styles.actionsRow}>
            <Pressable style={[styles.actionButton, styles.exportButton]} onPress={handleExport}>
              <MaterialIcons name="file-download" size={20} color={colors.text} />
              <Text style={styles.exportText}>{TEXTS.export}</Text>
            </Pressable>
            <Pressable style={[styles.actionButton, styles.newButton]} onPress={handleNew}>
              <MaterialIcons name="add" size={20} color={colors.onPrimary} />
              <Text style={styles.newText}>{TEXTS.newReservation}</Text>
            </Pressable>
          </View>

          {/* Estadísticas del día */}
          <ReservationStats stats={stats} />

          {/* Buscador y filtros */}
          <ReservationFilters filters={filters} onChange={updateFilters} onClear={clearFilters} />

          {/* Lista de reservas */}
          <Text style={styles.count}>{TEXTS.list.count(filteredReservations.length)}</Text>

          {filteredReservations.length === 0 ? (
            <View style={styles.empty}>
              <MaterialIcons name="search" size={36} color={withAlpha(colors.textMuted, 0.8)} />
              <Text style={styles.emptyTitle}>{TEXTS.list.empty}</Text>
              <Text style={styles.emptyHint}>{TEXTS.list.emptyHint}</Text>
            </View>
          ) : (
            filteredReservations.map((item) => (
              <ReservationCard key={item.id} reservation={item} onView={setSelectedReservation} />
            ))
          )}
        </ScrollView>
      </SafeAreaView>

      {/* Modales */}
      <ReservationFormModal
        visible={formVisible}
        reservation={editingReservation}
        onClose={() => setFormVisible(false)}
        onSubmit={handleSubmit}
      />
      <ReservationDetailModal
        reservation={selectedReservation}
        onClose={() => setSelectedReservation(null)}
        onEdit={handleEditFromDetail}
      />
    </AdminLayout>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    flex: { flex: 1 },
    container: { flex: 1 },
    // El espacio de abajo evita que la barra inferior flotante tape el contenido
    content: { gap: 16, padding: 16, paddingBottom: 130 },
    titleRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    titleIcon: {
      width: 48,
      height: 48,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 14,
      backgroundColor: withAlpha(colors.primary, 0.15),
    },
    title: { fontSize: 22, fontWeight: '800', color: colors.text },
    subtitle: { marginTop: 2, fontSize: 13, color: colors.textSecondary },
    actionsRow: { flexDirection: 'row', gap: 12 },
    actionButton: {
      flex: 1,
      height: 46,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      borderRadius: 12,
    },
    exportButton: { borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card },
    exportText: { fontSize: 14, fontWeight: '700', color: colors.text },
    newButton: { backgroundColor: colors.primary },
    newText: { fontSize: 14, fontWeight: '700', color: colors.onPrimary },
    count: { fontSize: 13, fontWeight: '700', color: colors.textSecondary },
    empty: { alignItems: 'center', gap: 6, paddingVertical: 32 },
    emptyTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
    emptyHint: { fontSize: 13, color: colors.textSecondary },
  });
