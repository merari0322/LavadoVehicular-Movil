import { OPERATIONS_API_URL, WEB_URL } from '../../api/config';
import { authorizationHeader, request } from '../../api/httpClient';

// Reporte de inspección del vehículo para servicios largos (RF-027), en operations-service.
// Mismos endpoints que la web (inspection-api.ts). Las reglas (qué reservas lo admiten, cuándo se
// edita, el resumen y la placa enmascarada del enlace) las aplica el backend; aquí solo se llaman
// los endpoints. Cada acción del admin devuelve el estado completo, así la pantalla siempre
// muestra lo que quedó guardado.

export type InspectionPhase = 'RECEPTION' | 'EXTERIOR' | 'INTERIOR' | 'ENGINE' | 'DELIVERY';
export type InspectionPhaseStatus = 'PENDING' | 'IN_PROGRESS' | 'DONE';
export type FindingSeverity = 'INFO' | 'MINOR' | 'MAJOR';

// solo para decidir si el detalle de la reserva muestra el botón "Inspección";
// la regla la vuelve a aplicar operations-service al abrir o editar el reporte
export const LONG_SERVICE_MIN_MINUTES = 180;

// límites del backend: hasta 5 fotos por hallazgo, JPG o PNG de máximo 2 MB cada una
export const MAX_FINDING_PHOTOS = 5;

/** url relativa a /api/v1 desde la que se pide la foto */
export interface InspectionPhoto {
  id: number;
  url: string;
}

export interface InspectionFinding {
  id: number;
  phase: InspectionPhase;
  /** parte del vehículo, ej. "puerta trasera derecha" */
  area: string;
  severity: FindingSeverity;
  note: string;
  createdAt: string;
  photos: InspectionPhoto[];
}

export interface InspectionPhaseEntry {
  phase: InspectionPhase;
  status: InspectionPhaseStatus;
  startedAt: string | null;
  finishedAt: string | null;
  findings: InspectionFinding[];
}

export interface InspectionSummary {
  phasesDone: number;
  phasesTotal: number;
  findings: number;
  majorFindings: number;
  progressPercent: number;
}

/** datos de la reserva copiados al crear el reporte */
export interface InspectionBookingInfo {
  code: string;
  vehicle: string;
  plate: string;
  services: string;
  date: string;
  time: string;
  durationMinutes: number;
}

export interface VehicleInspectionReport {
  bookingId: number;
  booking: InspectionBookingInfo;
  /** token aleatorio del enlace público; nunca el id ni el código de la reserva */
  publicToken: string;
  phases: InspectionPhaseEntry[];
  summary: InspectionSummary;
  published: boolean;
  publishedAt: string | null;
  updatedAt: string;
}

/** lo que ve el admin: si la reserva admite reporte, si se puede editar y el reporte (o null) */
export interface InspectionState {
  available: boolean;
  editable: boolean;
  report: VehicleInspectionReport | null;
}

/** foto ya reducida en el celular, lista para subir */
export interface FindingPhotoUpload {
  uri: string;
  mimeType: 'image/jpeg';
}

export interface NewFindingRequest {
  area: string;
  severity: FindingSeverity;
  note: string;
  photos: FindingPhotoUpload[];
}

// subir fotos con una red lenta tarda más que una petición normal
const UPLOAD_TIMEOUT_MS = 60000;

const admin = '/admin/inspections';
const options = { baseUrl: OPERATIONS_API_URL };

export const InspectionService = {
  /** si la reserva admite reporte, si se puede editar y el reporte (null si no se ha iniciado) */
  get: (bookingId: string) => request<InspectionState>('GET', `${admin}/${bookingId}`, options),

  start: (bookingId: string) => request<InspectionState>('POST', `${admin}/${bookingId}`, { ...options, body: {} }),

  setPhaseStatus: (bookingId: string, phase: InspectionPhase, status: InspectionPhaseStatus) =>
    request<InspectionState>('PATCH', `${admin}/${bookingId}/phases/${phase}`, { ...options, body: { status } }),

  /** las fotos ya van reducidas (inspectionPhotos); viajan como multipart, igual que en la web */
  addFinding: (bookingId: string, phase: InspectionPhase, finding: NewFindingRequest) => {
    const form = new FormData();
    form.append('phase', phase);
    form.append('area', finding.area);
    form.append('severity', finding.severity);
    form.append('note', finding.note);
    finding.photos.forEach((photo, i) => {
      // en React Native un archivo del FormData se describe con su uri, nombre y tipo
      form.append('photos', { uri: photo.uri, name: `foto-${i + 1}.jpg`, type: photo.mimeType } as unknown as Blob);
    });
    return request<InspectionState>('POST', `${admin}/${bookingId}/findings`, {
      ...options,
      form,
      timeoutMs: UPLOAD_TIMEOUT_MS,
    });
  },

  removeFinding: (bookingId: string, findingId: number) =>
    request<InspectionState>('DELETE', `${admin}/${bookingId}/findings/${findingId}`, options),

  publish: (bookingId: string) => request<InspectionState>('POST', `${admin}/${bookingId}/publish`, { ...options, body: {} }),

  /** el aviso al cliente (bandeja, push y correo) lo arma notification-service con el resumen y el enlace */
  share: (bookingId: string) => request<void>('POST', `${admin}/${bookingId}/share`, { ...options, body: {} }),

  /** fuente de una foto del admin para <Image>: la url completa y el token (la foto exige sesión) */
  photoSource: (path: string) => ({ uri: `${OPERATIONS_API_URL}${path}`, headers: authorizationHeader() }),

  /** enlace público de solo lectura que ve el cliente en la web */
  publicLink: (token: string) => `${WEB_URL}/report/${token}`,
};
