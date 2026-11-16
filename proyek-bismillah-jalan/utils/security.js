// Hash kata sandi untuk akun LOKAL di perangkat. Untuk produksi, autentikasi harus
// dilakukan di server dengan algoritma lambat (bcrypt/argon2) dan HTTPS.
import * as Crypto from 'expo-crypto';

function toHex(bytes) {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

export async function randomSalt() {
  const bytes = await Crypto.getRandomBytesAsync(16);
  return toHex(bytes);
}

export async function hashPassword(password, salt) {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, `${salt}:${password}`);
}
