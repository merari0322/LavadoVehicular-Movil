import * as DocumentPicker from 'expo-document-picker';

// Abre el selector de archivos y devuelve el nombre de la imagen elegida (null = cancelado)
// TODO: subir el archivo a la API y guardar la URL en lugar del nombre
export const pickQrImage = async (): Promise<string | null> => {
  const result = await DocumentPicker.getDocumentAsync({
    type: 'image/*',
    copyToCacheDirectory: false,
  });

  if (result.canceled || result.assets.length === 0) return null;
  return result.assets[0].name;
};
