// Piezas pequeñas que comparten las pantallas del administrador. Son las mismas de shared (antes
// había copias aquí): se reexportan para no cambiar las importaciones de quien las usa.

// Etiqueta de color (estado, tipo, contador...)
export { Pill } from '../../../../shared/components/ui/Pill';
export type { PillTone } from '../../../../shared/components/ui/Pill';

// Botón cuadrado con icono (editar, eliminar): ya trae su nombre para el lector de pantalla (MOV-15)
export { IconButton } from '../../../../shared/components/ui/IconButton';
