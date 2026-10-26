import React from 'react';
import { OPERATOR_TEXTS } from '../../constants/operatorTexts';
import { OperatorStatus } from '../../models/operator';
import { Pill, PillTone } from '../common/Pills';

// Color de la etiqueta según el estado del operario
const STATUS_TONE: Record<OperatorStatus, PillTone> = {
  available: 'success',
  in_service: 'primary',
  absent: 'error',
};

// Etiqueta de estado (Disponible, En servicio, Permiso médico)
export function OperatorStatusPill({ status }: { status: OperatorStatus }) {
  return <Pill label={OPERATOR_TEXTS.status[status]} tone={STATUS_TONE[status]} />;
}
