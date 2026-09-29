import {
  AppLanguage,
  BusinessData,
  HelpTopic,
  NotificationPreferenceKey,
  PaymentType,
  SettingsTab,
  ThemeId,
} from '../models/settings';

// Textos de la pantalla de configuración (centralizados para migrarlos fácil a i18n)
export const SETTINGS_TEXTS = {
  title: 'Configuración',

  common: {
    cancel: 'Cancelar',
    delete: 'Eliminar',
    close: 'Cerrar',
  },

  tabs: {
    general: 'General',
    business: 'Datos del negocio',
    payments: 'Métodos de pago',
  } as Record<SettingsTab, string>,

  // ---------------- Pestaña General ----------------
  general: {
    notifications: {
      title: 'Notificaciones',
      items: {
        push: {
          title: 'Notificaciones Push',
          description: 'Recibe alertas de reservas y promociones',
        },
        emailReminders: {
          title: 'Recordatorios por Email',
          description: 'Un día antes de tu lavado programado',
        },
        promotions: {
          title: 'Promociones y Ofertas',
          description: 'Recibe descuentos exclusivos',
        },
      } as Record<NotificationPreferenceKey, { title: string; description: string }>,
    },

    help: {
      title: 'Ayuda',
      open: 'Abrir',
      items: {
        helpCenter: 'Centro de ayuda',
        terms: 'Ver Términos y Condiciones',
        privacy: 'Ver Política de Datos',
      } as Record<HelpTopic, string>,
    },

    // TODO: reemplazar por el contenido real (o abrir la URL oficial)
    helpDocs: {
      helpCenter: {
        title: 'Centro de ayuda',
        paragraphs: [
          'Aquí encontrarás respuestas a las dudas más frecuentes sobre reservas, pagos y horarios.',
          'Si no encuentras lo que buscas, escríbenos por WhatsApp o a nuestro correo corporativo y te ayudaremos lo antes posible.',
        ],
      },
      terms: {
        title: 'Términos y Condiciones',
        paragraphs: [
          'Al usar la aplicación aceptas las condiciones del servicio de lavado vehicular, incluyendo las políticas de reserva, cancelación y pago.',
          'Los servicios se prestan según la disponibilidad de las bahías y el horario de atención vigente.',
        ],
      },
      privacy: {
        title: 'Política de Datos',
        paragraphs: [
          'Tratamos tus datos personales únicamente para gestionar reservas, pagos y comunicaciones del servicio.',
          'Puedes solicitar la consulta, actualización o eliminación de tus datos en cualquier momento.',
        ],
      },
    } as Record<HelpTopic, { title: string; paragraphs: string[] }>,

    appearance: {
      title: 'Apariencia',
      themeTitle: 'Elegir tema',
      themeSubtitle: 'Cambiar interfaz (Personaliza los colores de la aplicación)',
      themeNames: {
        'teal-light': 'Turquesa claro',
        'teal-dark': 'Turquesa oscuro',
        'pink-light': 'Rosa claro',
        'pink-dark': 'Rosa oscuro',
      } as Record<ThemeId, string>,
      languageTitle: 'Idiomas',
      languageSubtitle: 'Cambiar idioma',
      languageHints: {
        es: 'Interfaz en español',
        en: 'Interface in english',
        fr: 'Interface en français',
        pt: 'Interface em português',
      } as Record<AppLanguage, string>,
    },
  },

  // ---------------- Pestaña Datos del negocio ----------------
  business: {
    title: 'Datos del Negocio',
    badge: 'EMPRESA ACTIVA',
    fallbackName: 'tu negocio',
    subtitle: (name: string) =>
      `Administra la información fiscal, corporativa y canales oficiales de atención de ${name}.`,
    discard: 'Descartar',
    save: 'Guardar cambios',
    savedTitle: 'Datos guardados',
    savedMessage: 'La información del negocio se actualizó correctamente.',
    invalidTitle: 'Revisa los datos',
    invalidMessage: 'Corrige los campos marcados en rojo antes de guardar.',
    datePlaceholder: 'dd/mm/aaaa',

    sections: {
      general: {
        title: 'Información general',
        subtitle: 'Datos corporativos y representación legal',
      },
      location: {
        title: 'Ubicación y contacto',
        subtitle: 'Dirección de sede principal y datos oficiales de contacto',
      },
      fiscal: {
        title: 'Información fiscal',
        subtitle: 'Tributación y resoluciones DIAN',
      },
      channels: {
        title: 'Canales oficiales',
        subtitle: 'Redes sociales, líneas de soporte y horarios comerciales',
      },
    },

    fields: {
      legalName: 'Razón social *',
      taxId: 'NIT / Identificación tributaria *',
      businessType: 'Tipo de negocio',
      foundedAt: 'Fecha de constitución',
      legalRepresentative: 'Representante legal',
      legalDocument: 'Documento',
      address: 'Dirección sede principal *',
      phone: 'Teléfono de contacto *',
      whatsapp: 'WhatsApp oficial',
      email: 'Correo electrónico corporativo',
      website: 'Sitio web oficial',
      taxRegime: 'Régimen fiscal',
      ciiuActivity: 'Actividad CIIU',
      dianResolution: 'Resolución DIAN',
      invoicePrefix: 'Prefijo autorizado',
      invoiceRange: 'Rango de facturación',
      instagram: 'Instagram',
      facebook: 'Facebook page',
      supportLine: 'Línea de atención al cliente (nacional)',
      schedule: 'Horario de atención',
    } as Record<keyof BusinessData, string>,

    errors: {
      required: 'Este campo es obligatorio',
      phone: 'Ingresa un teléfono válido',
      email: 'Correo electrónico inválido',
      date: 'Fecha inválida (dd/mm/aaaa)',
    },
  },

  // ---------------- Pestaña Métodos de pago ----------------
  payments: {
    title: 'Métodos de pago',
    activeBadge: (total: number) => (total === 1 ? '1 activo' : `${total} activos`),
    subtitle:
      'Configura las cuentas donde los clientes transferirán el valor de los servicios y subirán comprobantes.',
    add: 'Agregar método de pago',
    empty: 'No hay métodos de pago registrados',
    emptyHint: 'Agrega el primero con el botón de arriba',
    holder: (name: string) => `Titular: ${name}`,
    account: 'Número de celular / cuenta',

    types: {
      wallet: 'Billetera digital',
      bank: 'Cuenta bancaria',
      other: 'Otro',
    } as Record<PaymentType, string>,

    qr: {
      replace: 'Reemplazar',
      upload: 'Subir QR',
      verified: 'QR activo y verificado',
      missing: 'Sin código QR cargado',
      errorTitle: 'No se pudo cargar el archivo',
      errorMessage: 'Ocurrió un problema al elegir la imagen. Inténtalo de nuevo.',
    },

    deleteTitle: 'Eliminar método de pago',
    deleteMessage: (name: string) =>
      `¿Seguro que quieres eliminar ${name}? Esta acción no se puede deshacer.`,

    form: {
      createTitle: 'Agregar método de pago',
      editTitle: 'Editar método de pago',
      subtitle:
        'Registra la cuenta donde los clientes transferirán el valor del servicio y subirán el comprobante.',
      name: 'Nombre del método',
      namePlaceholder: 'Ej. Nequi Colombia',
      type: 'Tipo',
      holder: 'Titular de la cuenta',
      holderPlaceholder: 'Ej. Express Car Wash S.A.S.',
      account: 'Número de celular / cuenta',
      accountPlaceholder: 'Ej. 312 490 8821',
      requiresQr: 'Requiere código QR para cobrar',
      create: 'Agregar método',
      save: 'Guardar cambios',
      errors: {
        name: 'Ingresa el nombre (mínimo 2 caracteres)',
        duplicate: 'Ya existe un método con ese nombre',
        holder: 'Ingresa el titular (mínimo 2 caracteres)',
        account: 'Ingresa un número válido (mínimo 4 caracteres)',
      },
    },
  },
};
