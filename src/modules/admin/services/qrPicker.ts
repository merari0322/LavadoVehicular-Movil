import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { ApiError } from '../../../core/api/apiError';
import { ALLOWED_IMAGE_TYPES } from '../../../core/services/payments/PaymentService';

// Abre el selector de imágenes y devuelve el QR elegido como imagen (data URL) para guardarlo
// en payment-service. null = cancelado. Lanza INVALID_QR_IMAGE si el formato no es PNG o JPG
// (payment-service rechaza los demás, SVG incluido).
export const pickQrImage = async (): Promise<{ name: string; dataUrl: string } | null> => {
  const result = await DocumentPicker.getDocumentAsync({
    type: ALLOWED_IMAGE_TYPES,
    copyToCacheDirectory: true,
  });

  if (result.canceled || result.assets.length === 0) return null;
  const file = result.assets[0];
  if (file.mimeType && !ALLOWED_IMAGE_TYPES.includes(file.mimeType)) {
    throw new ApiError('INVALID_QR_IMAGE', 400);
  }
  const base64 = await FileSystem.readAsStringAsync(file.uri, { encoding: FileSystem.EncodingType.Base64 });
  return { name: file.name, dataUrl: `data:${file.mimeType ?? 'image/png'};base64,${base64}` };
};
