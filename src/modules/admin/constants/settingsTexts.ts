import { localized } from '../../../shared/i18n/localized';
import {
  AppLanguage,
  BusinessData,
  HelpTopic,
  NotificationPreferenceKey,
  PaymentType,
  SettingsTab,
  ThemeId,
} from '../models/settings';

// Textos de la pantalla de configuración en los 4 idiomas de la app
const es = {
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
          description: 'Recordatorios de tus reservas por correo (un día y una hora antes)',
        },
        promotions: {
          title: 'Promociones y Ofertas',
          description: 'Avisos de los cupones que desbloqueas con tus puntos (correo y push)',
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

    // texto fijo, igual que el legal-document-modal de la web: términos y política no
    // tienen backend en ningún lado del proyecto, se traducen a los 4 idiomas y ya
    helpDocs: {
      helpCenter: {
        title: 'Centro de ayuda',
        paragraphs: [
          'Aquí encontrarás respuestas a las dudas más frecuentes sobre reservas, pagos y horarios.',
          'Si no encuentras lo que buscas, escríbenos a nuestro correo corporativo o llama a la línea de atención y te ayudaremos lo antes posible. Las novedades de tus reservas te llegan por notificaciones y correo.',
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

const en: typeof es = {
  title: 'Settings',
  common: { cancel: 'Cancel', delete: 'Delete', close: 'Close' },
  tabs: { general: 'General', business: 'Business data', payments: 'Payment methods' },
  general: {
    notifications: {
      title: 'Notifications',
      items: {
        push: { title: 'Push notifications', description: 'Get booking and promotion alerts' },
        emailReminders: { title: 'Email reminders', description: 'Booking reminders by email (one day and one hour before)' },
        promotions: { title: 'Promotions and offers', description: 'Alerts for the coupons you unlock with your points (email and push)' },
      },
    },
    help: {
      title: 'Help',
      open: 'Open',
      items: { helpCenter: 'Help center', terms: 'View Terms and Conditions', privacy: 'View Data Policy' },
    },
    helpDocs: {
      helpCenter: {
        title: 'Help center',
        paragraphs: [
          'Here you will find answers to the most common questions about bookings, payments and hours.',
          'If you cannot find what you are looking for, write to our corporate email or call our support line and we will help you as soon as possible. Updates about your bookings reach you through notifications and email.',
        ],
      },
      terms: {
        title: 'Terms and Conditions',
        paragraphs: [
          'By using the app you accept the car wash service conditions, including the booking, cancellation and payment policies.',
          'Services are provided according to bay availability and the current business hours.',
        ],
      },
      privacy: {
        title: 'Data Policy',
        paragraphs: [
          'We process your personal data only to manage bookings, payments and service communications.',
          'You can request to consult, update or delete your data at any time.',
        ],
      },
    },
    appearance: {
      title: 'Appearance',
      themeTitle: 'Choose theme',
      themeSubtitle: 'Change interface (customize the app colors)',
      themeNames: { 'teal-light': 'Light teal', 'teal-dark': 'Dark teal', 'pink-light': 'Light pink', 'pink-dark': 'Dark pink' },
      languageTitle: 'Languages',
      languageSubtitle: 'Change language',
      languageHints: { es: 'Interfaz en español', en: 'Interface in english', fr: 'Interface en français', pt: 'Interface em português' },
    },
  },
  business: {
    title: 'Business Data',
    badge: 'ACTIVE COMPANY',
    fallbackName: 'your business',
    subtitle: (name: string) => `Manage the tax, corporate information and official support channels of ${name}.`,
    discard: 'Discard',
    save: 'Save changes',
    savedTitle: 'Data saved',
    savedMessage: 'The business information was updated successfully.',
    invalidTitle: 'Check the data',
    invalidMessage: 'Fix the fields marked in red before saving.',
    datePlaceholder: 'dd/mm/yyyy',
    sections: {
      general: { title: 'General information', subtitle: 'Corporate data and legal representation' },
      location: { title: 'Location and contact', subtitle: 'Headquarters address and official contact data' },
      fiscal: { title: 'Tax information', subtitle: 'Taxation and DIAN resolutions' },
      channels: { title: 'Official channels', subtitle: 'Social networks, support lines and business hours' },
    },
    fields: {
      legalName: 'Company name *',
      taxId: 'NIT / Tax ID *',
      businessType: 'Business type',
      foundedAt: 'Incorporation date',
      legalRepresentative: 'Legal representative',
      legalDocument: 'Document',
      address: 'Headquarters address *',
      phone: 'Contact phone *',
      email: 'Corporate email',
      website: 'Official website',
      taxRegime: 'Tax regime',
      ciiuActivity: 'CIIU activity',
      dianResolution: 'DIAN resolution',
      invoicePrefix: 'Authorized prefix',
      invoiceRange: 'Invoice range',
      instagram: 'Instagram',
      facebook: 'Facebook page',
      supportLine: 'Customer service line (national)',
      schedule: 'Business hours',
    },
    errors: {
      required: 'This field is required',
      phone: 'Enter a valid phone number',
      email: 'Invalid email',
      date: 'Invalid date (dd/mm/yyyy)',
    },
  },
  payments: {
    title: 'Payment methods',
    activeBadge: (total: number) => `${total} active`,
    subtitle: 'Set up the accounts where customers will transfer the service amount and upload receipts.',
    add: 'Add payment method',
    empty: 'No payment methods registered',
    emptyHint: 'Add the first one with the button above',
    holder: (name: string) => `Holder: ${name}`,
    account: 'Mobile / account number',
    types: { wallet: 'Digital wallet', bank: 'Bank account', other: 'Other' },
    qr: {
      replace: 'Replace',
      upload: 'Upload QR',
      verified: 'QR active and verified',
      missing: 'No QR code uploaded',
      errorTitle: 'The file could not be loaded',
      errorMessage: 'There was a problem choosing the image. Please try again.',
    },
    deleteTitle: 'Delete payment method',
    deleteMessage: (name: string) => `Are you sure you want to delete ${name}? This action cannot be undone.`,
    form: {
      createTitle: 'Add payment method',
      editTitle: 'Edit payment method',
      subtitle: 'Register the account where customers will transfer the service amount and upload the receipt.',
      name: 'Method name',
      namePlaceholder: 'E.g. Nequi Colombia',
      type: 'Type',
      holder: 'Account holder',
      holderPlaceholder: 'E.g. Express Car Wash S.A.S.',
      account: 'Mobile / account number',
      accountPlaceholder: 'E.g. 312 490 8821',
      requiresQr: 'Requires a QR code to charge',
      create: 'Add method',
      save: 'Save changes',
      errors: {
        name: 'Enter the name (at least 2 characters)',
        duplicate: 'A method with that name already exists',
        holder: 'Enter the holder (at least 2 characters)',
        account: 'Enter a valid number (at least 4 characters)',
      },
    },
  },
};

const fr: typeof es = {
  title: 'Paramètres',
  common: { cancel: 'Annuler', delete: 'Supprimer', close: 'Fermer' },
  tabs: { general: 'Général', business: "Données de l'entreprise", payments: 'Moyens de paiement' },
  general: {
    notifications: {
      title: 'Notifications',
      items: {
        push: { title: 'Notifications push', description: 'Recevez des alertes de réservations et de promotions' },
        emailReminders: { title: 'Rappels par e-mail', description: 'Rappels de vos réservations par e-mail (un jour et une heure avant)' },
        promotions: { title: 'Promotions et offres', description: 'Alertes des coupons débloqués avec vos points (e-mail et push)' },
      },
    },
    help: {
      title: 'Aide',
      open: 'Ouvrir',
      items: { helpCenter: "Centre d'aide", terms: 'Voir les Conditions générales', privacy: 'Voir la Politique de données' },
    },
    helpDocs: {
      helpCenter: {
        title: "Centre d'aide",
        paragraphs: [
          'Vous trouverez ici les réponses aux questions les plus fréquentes sur les réservations, les paiements et les horaires.',
          "Si vous ne trouvez pas ce que vous cherchez, écrivez à notre e-mail ou appelez notre ligne d'assistance et nous vous aiderons au plus vite. Les nouvelles de vos réservations vous arrivent par notifications et par e-mail.",
        ],
      },
      terms: {
        title: 'Conditions générales',
        paragraphs: [
          "En utilisant l'application, vous acceptez les conditions du service de lavage, y compris les politiques de réservation, d'annulation et de paiement.",
          "Les services sont fournis selon la disponibilité des baies et les horaires d'ouverture en vigueur.",
        ],
      },
      privacy: {
        title: 'Politique de données',
        paragraphs: [
          'Nous traitons vos données personnelles uniquement pour gérer les réservations, les paiements et les communications du service.',
          'Vous pouvez demander à consulter, mettre à jour ou supprimer vos données à tout moment.',
        ],
      },
    },
    appearance: {
      title: 'Apparence',
      themeTitle: 'Choisir un thème',
      themeSubtitle: "Changer l'interface (personnalisez les couleurs de l'application)",
      themeNames: { 'teal-light': 'Turquoise clair', 'teal-dark': 'Turquoise foncé', 'pink-light': 'Rose clair', 'pink-dark': 'Rose foncé' },
      languageTitle: 'Langues',
      languageSubtitle: 'Changer de langue',
      languageHints: { es: 'Interfaz en español', en: 'Interface in english', fr: 'Interface en français', pt: 'Interface em português' },
    },
  },
  business: {
    title: "Données de l'entreprise",
    badge: 'ENTREPRISE ACTIVE',
    fallbackName: 'votre entreprise',
    subtitle: (name: string) => `Gérez les informations fiscales, l'entreprise et les canaux officiels de ${name}.`,
    discard: 'Annuler',
    save: 'Enregistrer',
    savedTitle: 'Données enregistrées',
    savedMessage: "Les informations de l'entreprise ont été mises à jour.",
    invalidTitle: 'Vérifiez les données',
    invalidMessage: "Corrigez les champs marqués en rouge avant d'enregistrer.",
    datePlaceholder: 'jj/mm/aaaa',
    sections: {
      general: { title: 'Informations générales', subtitle: "Données de l'entreprise et représentation légale" },
      location: { title: 'Adresse et contact', subtitle: 'Adresse du siège et coordonnées officielles' },
      fiscal: { title: 'Informations fiscales', subtitle: 'Fiscalité et résolutions DIAN' },
      channels: { title: 'Canaux officiels', subtitle: "Réseaux sociaux, lignes d'assistance et horaires" },
    },
    fields: {
      legalName: 'Raison sociale *',
      taxId: 'NIT / Identifiant fiscal *',
      businessType: "Type d'activité",
      foundedAt: 'Date de constitution',
      legalRepresentative: 'Représentant légal',
      legalDocument: 'Document',
      address: 'Adresse du siège *',
      phone: 'Téléphone de contact *',
      email: "E-mail de l'entreprise",
      website: 'Site web officiel',
      taxRegime: 'Régime fiscal',
      ciiuActivity: 'Activité CIIU',
      dianResolution: 'Résolution DIAN',
      invoicePrefix: 'Préfixe autorisé',
      invoiceRange: 'Plage de facturation',
      instagram: 'Instagram',
      facebook: 'Page Facebook',
      supportLine: 'Service client (national)',
      schedule: "Horaires d'ouverture",
    },
    errors: {
      required: 'Ce champ est obligatoire',
      phone: 'Saisissez un téléphone valide',
      email: 'E-mail invalide',
      date: 'Date invalide (jj/mm/aaaa)',
    },
  },
  payments: {
    title: 'Moyens de paiement',
    activeBadge: (total: number) => (total === 1 ? '1 actif' : `${total} actifs`),
    subtitle: 'Configurez les comptes où les clients virent le montant des services et envoient les justificatifs.',
    add: 'Ajouter un moyen de paiement',
    empty: 'Aucun moyen de paiement enregistré',
    emptyHint: 'Ajoutez le premier avec le bouton ci-dessus',
    holder: (name: string) => `Titulaire : ${name}`,
    account: 'Numéro de mobile / compte',
    types: { wallet: 'Portefeuille numérique', bank: 'Compte bancaire', other: 'Autre' },
    qr: {
      replace: 'Remplacer',
      upload: 'Téléverser le QR',
      verified: 'QR actif et vérifié',
      missing: 'Aucun code QR chargé',
      errorTitle: 'Impossible de charger le fichier',
      errorMessage: "Un problème est survenu lors du choix de l'image. Réessayez.",
    },
    deleteTitle: 'Supprimer le moyen de paiement',
    deleteMessage: (name: string) => `Voulez-vous vraiment supprimer ${name} ? Cette action est irréversible.`,
    form: {
      createTitle: 'Ajouter un moyen de paiement',
      editTitle: 'Modifier le moyen de paiement',
      subtitle: 'Enregistrez le compte où les clients virent le montant du service et envoient le justificatif.',
      name: 'Nom du moyen',
      namePlaceholder: 'Ex. Nequi Colombia',
      type: 'Type',
      holder: 'Titulaire du compte',
      holderPlaceholder: 'Ex. Express Car Wash S.A.S.',
      account: 'Numéro de mobile / compte',
      accountPlaceholder: 'Ex. 312 490 8821',
      requiresQr: 'Nécessite un code QR pour encaisser',
      create: 'Ajouter',
      save: 'Enregistrer',
      errors: {
        name: 'Saisissez le nom (2 caractères minimum)',
        duplicate: 'Un moyen porte déjà ce nom',
        holder: 'Saisissez le titulaire (2 caractères minimum)',
        account: 'Saisissez un numéro valide (4 caractères minimum)',
      },
    },
  },
};

const pt: typeof es = {
  title: 'Configurações',
  common: { cancel: 'Cancelar', delete: 'Excluir', close: 'Fechar' },
  tabs: { general: 'Geral', business: 'Dados do negócio', payments: 'Formas de pagamento' },
  general: {
    notifications: {
      title: 'Notificações',
      items: {
        push: { title: 'Notificações push', description: 'Receba alertas de reservas e promoções' },
        emailReminders: { title: 'Lembretes por e-mail', description: 'Lembretes das suas reservas por e-mail (um dia e uma hora antes)' },
        promotions: { title: 'Promoções e ofertas', description: 'Avisos dos cupons que você desbloqueia com seus pontos (e-mail e push)' },
      },
    },
    help: {
      title: 'Ajuda',
      open: 'Abrir',
      items: { helpCenter: 'Central de ajuda', terms: 'Ver Termos e Condições', privacy: 'Ver Política de Dados' },
    },
    helpDocs: {
      helpCenter: {
        title: 'Central de ajuda',
        paragraphs: [
          'Aqui você encontra respostas para as dúvidas mais frequentes sobre reservas, pagamentos e horários.',
          'Se não encontrar o que procura, escreva para o nosso e-mail ou ligue para a nossa central de atendimento e ajudaremos o quanto antes. As novidades das suas reservas chegam por notificações e e-mail.',
        ],
      },
      terms: {
        title: 'Termos e Condições',
        paragraphs: [
          'Ao usar o aplicativo você aceita as condições do serviço de lavagem, incluindo as políticas de reserva, cancelamento e pagamento.',
          'Os serviços são prestados conforme a disponibilidade das baias e o horário de atendimento vigente.',
        ],
      },
      privacy: {
        title: 'Política de Dados',
        paragraphs: [
          'Tratamos seus dados pessoais apenas para gerenciar reservas, pagamentos e comunicações do serviço.',
          'Você pode solicitar a consulta, atualização ou exclusão dos seus dados a qualquer momento.',
        ],
      },
    },
    appearance: {
      title: 'Aparência',
      themeTitle: 'Escolher tema',
      themeSubtitle: 'Mudar interface (personalize as cores do aplicativo)',
      themeNames: { 'teal-light': 'Turquesa claro', 'teal-dark': 'Turquesa escuro', 'pink-light': 'Rosa claro', 'pink-dark': 'Rosa escuro' },
      languageTitle: 'Idiomas',
      languageSubtitle: 'Mudar idioma',
      languageHints: { es: 'Interfaz en español', en: 'Interface in english', fr: 'Interface en français', pt: 'Interface em português' },
    },
  },
  business: {
    title: 'Dados do Negócio',
    badge: 'EMPRESA ATIVA',
    fallbackName: 'seu negócio',
    subtitle: (name: string) => `Gerencie as informações fiscais, corporativas e os canais oficiais de atendimento de ${name}.`,
    discard: 'Descartar',
    save: 'Salvar alterações',
    savedTitle: 'Dados salvos',
    savedMessage: 'As informações do negócio foram atualizadas.',
    invalidTitle: 'Revise os dados',
    invalidMessage: 'Corrija os campos marcados em vermelho antes de salvar.',
    datePlaceholder: 'dd/mm/aaaa',
    sections: {
      general: { title: 'Informações gerais', subtitle: 'Dados corporativos e representação legal' },
      location: { title: 'Localização e contato', subtitle: 'Endereço da sede e dados oficiais de contato' },
      fiscal: { title: 'Informações fiscais', subtitle: 'Tributação e resoluções DIAN' },
      channels: { title: 'Canais oficiais', subtitle: 'Redes sociais, linhas de suporte e horário comercial' },
    },
    fields: {
      legalName: 'Razão social *',
      taxId: 'NIT / Identificação fiscal *',
      businessType: 'Tipo de negócio',
      foundedAt: 'Data de constituição',
      legalRepresentative: 'Representante legal',
      legalDocument: 'Documento',
      address: 'Endereço da sede *',
      phone: 'Telefone de contato *',
      email: 'E-mail corporativo',
      website: 'Site oficial',
      taxRegime: 'Regime fiscal',
      ciiuActivity: 'Atividade CIIU',
      dianResolution: 'Resolução DIAN',
      invoicePrefix: 'Prefixo autorizado',
      invoiceRange: 'Faixa de faturamento',
      instagram: 'Instagram',
      facebook: 'Página do Facebook',
      supportLine: 'Central de atendimento (nacional)',
      schedule: 'Horário de atendimento',
    },
    errors: {
      required: 'Este campo é obrigatório',
      phone: 'Informe um telefone válido',
      email: 'E-mail inválido',
      date: 'Data inválida (dd/mm/aaaa)',
    },
  },
  payments: {
    title: 'Formas de pagamento',
    activeBadge: (total: number) => (total === 1 ? '1 ativa' : `${total} ativas`),
    subtitle: 'Configure as contas onde os clientes transferirão o valor dos serviços e enviarão comprovantes.',
    add: 'Adicionar forma de pagamento',
    empty: 'Não há formas de pagamento cadastradas',
    emptyHint: 'Adicione a primeira com o botão acima',
    holder: (name: string) => `Titular: ${name}`,
    account: 'Número de celular / conta',
    types: { wallet: 'Carteira digital', bank: 'Conta bancária', other: 'Outro' },
    qr: {
      replace: 'Substituir',
      upload: 'Enviar QR',
      verified: 'QR ativo e verificado',
      missing: 'Sem código QR carregado',
      errorTitle: 'Não foi possível carregar o arquivo',
      errorMessage: 'Ocorreu um problema ao escolher a imagem. Tente novamente.',
    },
    deleteTitle: 'Excluir forma de pagamento',
    deleteMessage: (name: string) => `Tem certeza de que deseja excluir ${name}? Esta ação não pode ser desfeita.`,
    form: {
      createTitle: 'Adicionar forma de pagamento',
      editTitle: 'Editar forma de pagamento',
      subtitle: 'Cadastre a conta onde os clientes transferirão o valor do serviço e enviarão o comprovante.',
      name: 'Nome da forma',
      namePlaceholder: 'Ex. Nequi Colombia',
      type: 'Tipo',
      holder: 'Titular da conta',
      holderPlaceholder: 'Ex. Express Car Wash S.A.S.',
      account: 'Número de celular / conta',
      accountPlaceholder: 'Ex. 312 490 8821',
      requiresQr: 'Requer código QR para cobrar',
      create: 'Adicionar',
      save: 'Salvar alterações',
      errors: {
        name: 'Informe o nome (mínimo 2 caracteres)',
        duplicate: 'Já existe uma forma com esse nome',
        holder: 'Informe o titular (mínimo 2 caracteres)',
        account: 'Informe um número válido (mínimo 4 caracteres)',
      },
    },
  },
};

export const SETTINGS_TEXTS = localized({ es, en, fr, pt });
