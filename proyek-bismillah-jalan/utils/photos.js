import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';

// Foto dari galeri dipilih lewat picker, lalu disalin ke folder dokumen aplikasi
// supaya tidak hilang ketika cache dibersihkan sistem.
const DIR = () => `${FileSystem.documentDirectory}product-photos/`;

export async function pickPhoto() {
  const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.6 });
  if (result.canceled || !result.assets?.length) return null;
  return result.assets[0].uri;
}

export async function savePhoto(uri) {
  await FileSystem.makeDirectoryAsync(DIR(), { intermediates: true });
  const ext = (uri.split('?')[0].split('.').pop() || 'jpg').slice(0, 4);
  const dest = `${DIR()}${Date.now()}.${ext}`;
  await FileSystem.copyAsync({ from: uri, to: dest });
  return dest;
}

export async function deletePhoto(uri) {
  if (uri && uri.startsWith(DIR())) {
    await FileSystem.deleteAsync(uri, { idempotent: true }).catch(() => {});
  }
}

export function isSavedPhoto(uri) {
  return !!uri && uri.startsWith(DIR());
}
