import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';

// Comprobante de pago. Una captura o foto de celular pesa varios MB y payment-service acepta
// máximo 2 MB, así que se reduce aquí antes de enviarlo (como inspectionPhotos e image-compress de
// la web). El texto del comprobante se sigue leyendo bien con 1600 px de lado mayor en JPEG; si aún
// pasa de 2 MB se prueba más pequeño y con menos calidad.
export const MAX_RECEIPT_BYTES = 2 * 1024 * 1024;
const ATTEMPTS = [
  { maxSide: 1600, quality: 0.75 },
  { maxSide: 1280, quality: 0.6 },
  { maxSide: 1024, quality: 0.5 },
];

export interface CompressedReceipt {
  uri: string;
  dataUrl: string;
  size: number;
}

// bytes reales del base64 (sin el relleno '=')
function base64Bytes(base64: string): number {
  const padding = base64.endsWith('==') ? 2 : base64.endsWith('=') ? 1 : 0;
  return Math.floor(base64.length / 4) * 3 - padding;
}

/** Comprime el comprobante a JPEG; null si ni con el intento más pequeño baja de 2 MB. */
export async function compressReceipt(uri: string): Promise<CompressedReceipt | null> {
  const original = await ImageManipulator.manipulate(uri).renderAsync();
  const landscape = original.width >= original.height;

  for (const { maxSide, quality } of ATTEMPTS) {
    const context = ImageManipulator.manipulate(original);
    if (Math.max(original.width, original.height) > maxSide) {
      context.resize(landscape ? { width: maxSide } : { height: maxSide });
    }
    const image = await context.renderAsync();
    const result = await image.saveAsync({ compress: quality, format: SaveFormat.JPEG, base64: true });
    const size = base64Bytes(result.base64 ?? '');
    if (result.base64 && size <= MAX_RECEIPT_BYTES) {
      return { uri: result.uri, dataUrl: `data:image/jpeg;base64,${result.base64}`, size };
    }
  }
  return null;
}
