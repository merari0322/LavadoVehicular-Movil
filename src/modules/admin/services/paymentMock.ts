import { Payment } from '../models/payment';
import { addDays, getTodayISO } from '../utils/reservationUtils';

// Datos del negocio que aparecen en el comprobante
export const BUSINESS = { name: 'Express Car Wash S.A.S.', phone: '312 490 8821' };

// TODO: reemplazar por el usuario autenticado
export const CURRENT_AUDITOR = 'Laura Méndez';

// Crea un pago a partir de su número
const pay = (number: number, data: Omit<Payment, 'id' | 'code'>): Payment => ({
  id: `pay-${number}`,
  code: `#PAG-${number}`,
  ...data,
});

// Pagos de ejemplo (TODO: reemplazar por datos de la API)
export const buildMockPayments = (): Payment[] => {
  const today = getTodayISO();

  return [
    pay(4902, { customerName: 'Sofía Castro Gómez', document: '1.020.445.318', phone: '+57 318 720 1984', email: 'sofia.castro@example.com', reference: 'NQ-8841920', method: 'nequi', amount: 85000, declaredAmount: 85000, date: today, time: '14:48', serviceName: 'Premium Especial (SUV)', vehicle: 'Mazda CX-30', plate: 'NQ-4412', reservationCode: '#RES-8921', scheduleStart: '15:00', scheduleEnd: '16:00', bay: 'Bahía 3', operator: 'Carlos Ruiz', status: 'pending', rejectionReason: '', auditedBy: '' }),
    pay(4901, { customerName: 'Juan Felipe Cárdenas', document: '80.123.554', phone: '+57 311 405 8291', email: 'juanfe.cardenas@example.com', reference: 'TR-5541092', method: 'bancolombia', amount: 120000, declaredAmount: 120000, date: today, time: '13:30', serviceName: 'Detallado Cerámico', vehicle: 'Renault Duster', plate: 'KLM-908', reservationCode: '#RES-8919', scheduleStart: '14:00', scheduleEnd: '16:00', bay: 'Bahía 1', operator: 'Mateo Gómez', status: 'approved', rejectionReason: '', auditedBy: 'Laura Méndez' }),
    pay(4900, { customerName: 'Diego Herrera Rivas', document: '1.098.221.104', phone: '+57 320 882 1104', email: 'diego.herrera@example.com', reference: 'DV-9018442', method: 'daviplata', amount: 65000, declaredAmount: 65000, date: today, time: '12:15', serviceName: 'Lavado Básico', vehicle: 'Chevrolet Spark', plate: 'FGH-221', reservationCode: '#RES-8915', scheduleStart: '12:30', scheduleEnd: '13:10', bay: 'Bahía 2', operator: 'Juan Díaz', status: 'pending', rejectionReason: '', auditedBy: '' }),
    pay(4899, { customerName: 'Esneider Sánchez', document: '1.032.649.018', phone: '+57 301 649 0182', email: 'esneider.s@example.com', reference: 'EF-1003491', method: 'cash', amount: 45000, declaredAmount: 45000, date: today, time: '11:20', serviceName: 'Lavado Moto Especial', vehicle: 'Yamaha MT-07', plate: 'ABC-12D', reservationCode: '#RES-8912', scheduleStart: '11:00', scheduleEnd: '11:45', bay: 'Bahía 4', operator: 'Sofía Torres', status: 'approved', rejectionReason: '', auditedBy: 'Laura Méndez' }),
    pay(4898, { customerName: 'Carolina Vega Londoño', document: '52.884.190', phone: '+57 315 229 4431', email: 'carolina.vega@example.com', reference: 'TR-9901421', method: 'bancolombia', amount: 90000, declaredAmount: 60000, date: today, time: '10:05', serviceName: 'Encerado + Aspirado', vehicle: 'Kia Sportage', plate: 'PLM-472', reservationCode: '#RES-8916', scheduleStart: '10:30', scheduleEnd: '11:30', bay: 'Bahía 1', operator: 'Carlos Ruiz', status: 'rejected', rejectionReason: 'El monto del comprobante no coincide con la tarifa del servicio.', auditedBy: 'Laura Méndez' }),
    pay(4897, { customerName: 'Andrés Mejía Rojas', document: '79.552.301', phone: '+57 310 774 2210', email: 'andres.mejia@example.com', reference: 'NQ-8830176', method: 'nequi', amount: 75000, declaredAmount: 75000, date: today, time: '09:40', serviceName: 'Lavado Completo', vehicle: 'Toyota Corolla', plate: 'JKD-540', reservationCode: '#RES-8908', scheduleStart: '10:00', scheduleEnd: '11:00', bay: 'Bahía 2', operator: 'Mateo Gómez', status: 'pending', rejectionReason: '', auditedBy: '' }),
    pay(4896, { customerName: 'Paola Ruiz Ortega', document: '1.015.338.902', phone: '+57 312 660 9087', email: 'paola.ruiz@example.com', reference: 'DV-9001120', method: 'daviplata', amount: 55000, declaredAmount: 55000, date: addDays(-1), time: '16:10', serviceName: 'Lavado Básico', vehicle: 'Renault Sandero', plate: 'TRE-318', reservationCode: '#RES-8899', scheduleStart: '16:30', scheduleEnd: '17:10', bay: 'Bahía 1', operator: 'Juan Díaz', status: 'approved', rejectionReason: '', auditedBy: 'Laura Méndez' }),
  ];
};
