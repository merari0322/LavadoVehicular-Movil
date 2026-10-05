import { BusinessData, NotificationPreferences } from '../models/settings';

// Datos de ejemplo de configuración (TODO: reemplazar por datos de la API)

export const INITIAL_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  push: true,
  emailReminders: true,
  promotions: false,
};

export const INITIAL_BUSINESS: BusinessData = {
  legalName: 'Express Car Wash S.A.S.',
  taxId: '901.482.930-1',
  businessType: 'Lavado y Detailing Automotriz',
  foundedAt: '15/03/2019',
  legalRepresentative: 'Laura Méndez Ríos',
  legalDocument: 'CC 1.032.456.789',
  address: 'Calle 127 #19A-48, Bogotá, Colombia',
  phone: '+57 312 490 8821',
  whatsapp: '+57 312 490 8821',
  email: 'contacto@expresscarwash.co',
  website: 'www.expresscarwash.co',
  taxRegime: 'Responsable de IVA 19% · Régimen Ordinario Común',
  ciiuActivity: '4520 - Mantenimiento y reparación de vehículos',
  dianResolution: 'No. 18764002345678',
  invoicePrefix: 'LV',
  invoiceRange: '4500-5500',
  instagram: '@expresscarwash_oficial',
  facebook: 'Express Car Wash S.A.S.',
  supportLine: '018000-123-456',
  schedule: 'Lunes a sábado 7:00 AM - 6:30 PM',
};

