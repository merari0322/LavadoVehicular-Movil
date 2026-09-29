import { PaymentMethod, PaymentStatus } from '../models/payment';

// Textos de la pantalla de pagos (centralizados para migrarlos fácil a i18n)
export const PAYMENT_TEXTS = {
  title: 'Gestión y Verificación de Pagos',
  subtitle: 'Audita comprobantes bancarios, valida transferencias y controla recaudos diarios',
  export: 'Exportar conciliación',
  newPayment: 'Registrar pago manual',

  stats: {
    pending: 'Pendientes de revisión',
    pendingBadge: 'Atención prioritaria',
    approved: 'Aprobados hoy',
    rejected: 'Rechazados / inconsistentes',
    rejectedBadge: 'Comprobante inválido',
    collected: 'Recaudo total (día)',
    transactions: (total: number) => (total === 1 ? '1 transacción' : `${total} transacciones`),
  },

  filters: {
    search: 'Buscar por cliente, documento o referencia...',
    allMethods: 'Método: Todos',
    method: (label: string) => `Método: ${label}`,
    allStatuses: 'Todos los estados',
    clear: 'Limpiar filtros',
  },

  list: {
    count: (total: number) => (total === 1 ? '1 pago' : `${total} pagos`),
    empty: 'No se encontraron pagos',
    emptyHint: 'Prueba cambiando los filtros de búsqueda',
    review: 'Revisar',
    receipt: 'Recibo',
    reason: 'Ver motivo',
  },

  status: {
    pending: 'Pendiente',
    approved: 'Aprobado',
    rejected: 'Rechazado',
  } as Record<PaymentStatus, string>,

  // Nombre corto (tarjetas y filtros)
  methods: {
    cash: 'Efectivo',
    nequi: 'Nequi',
    daviplata: 'Daviplata',
    bancolombia: 'Bancolombia',
  } as Record<PaymentMethod, string>,

  // Nombre largo (formulario de pago manual)
  methodsForm: {
    cash: 'Efectivo',
    nequi: 'Nequi',
    daviplata: 'Daviplata',
    bancolombia: 'Transferencia Bancolombia',
  } as Record<PaymentMethod, string>,

  form: {
    title: 'Registrar pago manual',
    subtitle: 'Úsalo cuando un cliente pagó en caja y no quedó registrado por la app',
    customer: 'Cliente',
    customerPlaceholder: 'Nombre del cliente',
    service: 'Servicio',
    servicePlaceholder: 'Ej. Lavado Básico',
    amount: 'Monto (COP)',
    amountPlaceholder: '45.000',
    method: 'Método de pago',
    cancel: 'Cancelar',
    submit: 'Registrar pago',
  },

  review: {
    reviewTitle: (code: string) => `Revisar pago ${code}`,
    detailTitle: (code: string) => `Detalle del pago ${code}`,
    subtitle: 'Coteja el comprobante digital remitido por el cliente contra los datos registrados en la reserva',
    attachment: 'Comprobante adjunto',
    cashTitle: 'Pago recibido en caja',
    to: 'Para',
    taxId: 'NIT / Celular',
    reference: 'Referencia',
    dateTime: 'Fecha y hora',
    linkedAppointment: (code: string) => `Cita vinculada: ${code}`,
    document: 'Documento',
    serviceVehicle: 'Servicio y vehículo',
    scheduleBay: 'Horario y bahía',
    operator: 'Operario',
    reconciliation: 'Datos de conciliación bancaria',
    verified: 'Verificado contra pasarela',
    cashVerified: 'Recibido en caja',
    method: 'Método de pago',
    transactionRef: 'Referencia de transacción',
    comparison: 'Comparativa de montos',
    amountDue: 'Monto a pagar (servicio)',
    amountDeclared: 'Monto declarado en comprobante',
    matchTitle: '¡Los montos coinciden exactamente!',
    matchText: 'El pago cubre el 100% de la tarifa oficial pactada en la reserva.',
    matchChip: 'Conforme (0% diferencia)',
    mismatchTitle: '¡Los montos no coinciden!',
    below: (amount: string) => `El comprobante está ${amount} por debajo de la tarifa pactada.`,
    above: (amount: string) => `El comprobante está ${amount} por encima de la tarifa pactada.`,
    mismatchChip: (percent: string) => `Inconsistente (${percent}% diferencia)`,
    rejectionSection: 'Motivo del rechazo',
    reasonLabel: 'Motivo del rechazo',
    reasonPlaceholder: 'Explica por qué se rechaza este pago',
    reasonError: 'Escribe un motivo de al menos 5 caracteres',
    auditedBy: (name: string) => `Operación auditada por: ${name}`,
    close: 'Cerrar',
    reject: 'Rechazar',
    approve: 'Aprobar pago',
    back: 'Volver',
    confirmReject: 'Confirmar rechazo',
    shareReceipt: 'Compartir recibo',
    receiptTitle: 'Recibo de pago',
    customer: 'Cliente',
    service: 'Servicio',
    amount: 'Monto',
  },
};
