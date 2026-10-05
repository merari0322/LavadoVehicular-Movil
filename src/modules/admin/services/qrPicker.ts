import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';

// Abre el selector de imágenes y devuelve el QR elegido como imagen (data URL) para guardarlo
// en payment-service. null = cancelado.
export const pickQrImage = async (): Promise<{ name: string; dataUrl: string } | null> => {
  const result = await DocumentPicker.getDocumentAsync({
    type: 'image/*',
    copyToCacheDirectory: true,
  });

  if (result.canceled || result.assets.length === 0) return null;
  const file = result.assets[0];
  const base64 = await FileSystem.readAsStringAsync(file.uri, { encoding: FileSystem.EncodingType.Base64 });
  return { name: file.name, dataUrl: `data:${file.mimeType ?? 'image/png'};base64,${base64}` };
};
