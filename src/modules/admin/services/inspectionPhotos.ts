import * as ImagePicker from 'expo-image-picker';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { FindingPhotoUpload } from '../../../core/services/operations/InspectionService';

// Fotos de los hallazgos de la inspección. Las de un celular pesan varios MB y el backend acepta
// máximo 2 MB por foto, así que se reducen aquí antes de subirlas (como image-compress en la web):
// el lado más largo queda en 1600 px y se guardan en JPEG.
const MAX_SIDE = 1600;
const JPEG_QUALITY = 0.7;

// el admin negó el permiso de la cámara o de la galería
export class PhotoPermissionError extends Error {
  constructor(readonly source: 'camera' | 'gallery') {
    super(`${source} permission denied`);
  }
}

async function shrink(asset: ImagePicker.ImagePickerAsset): Promise<FindingPhotoUpload> {
  const context = ImageManipulator.manipulate(asset.uri);
  const landscape = asset.width >= asset.height;
  if (Math.max(asset.width, asset.height) > MAX_SIDE) {
    context.resize(landscape ? { width: MAX_SIDE } : { height: MAX_SIDE });
  }
  const image = await context.renderAsync();
  const result = await image.saveAsync({ compress: JPEG_QUALITY, format: SaveFormat.JPEG });
  return { uri: result.uri, mimeType: 'image/jpeg' };
}

/** abre la cámara; null si el admin la cerró sin tomar la foto */
export async function takeFindingPhoto(): Promise<FindingPhotoUpload | null> {
  const permission = await ImagePicker.requestCameraPermissionsAsync();
  if (!permission.granted) throw new PhotoPermissionError('camera');

  const result = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 1 });
  if (result.canceled || !result.assets.length) return null;
  return shrink(result.assets[0]);
}

/** abre la galería para elegir hasta `limit` fotos; [] si no eligió ninguna */
export async function pickFindingPhotos(limit: number): Promise<FindingPhotoUpload[]> {
  if (limit <= 0) return [];
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) throw new PhotoPermissionError('gallery');

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsMultipleSelection: limit > 1,
    selectionLimit: limit,
    quality: 1,
  });
  if (result.canceled) return [];
  return Promise.all(result.assets.slice(0, limit).map(shrink));
}
