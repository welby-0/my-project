// Validasi form. Semua fungsi mengembalikan pesan error (string) atau '' bila valid.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function isEmail(value) {
  return EMAIL_RE.test(String(value || '').trim());
}

// 0812-3456-7890 / +62 812... / 62812... / 812... -> 08123456 7890
export function normalizePhone(input) {
  let s = String(input || '').replace(/[\s\-().]/g, '');
  if (s.startsWith('+62')) s = '0' + s.slice(3);
  else if (s.startsWith('62')) s = '0' + s.slice(2);
  else if (s.startsWith('8')) s = '0' + s;
  return s;
}

export function isPhone(value) {
  return /^08\d{8,12}$/.test(normalizePhone(value));
}

// Menentukan apakah isian "Email / No. HP" berupa email atau nomor telepon
export function parseIdentifier(input) {
  const raw = String(input || '').trim();
  if (!raw) return { error: 'Isi email atau nomor HP' };
  if (raw.includes('@')) {
    return isEmail(raw) ? { type: 'email', value: raw.toLowerCase() } : { error: 'Format email belum benar' };
  }
  return isPhone(raw)
    ? { type: 'phone', value: normalizePhone(raw) }
    : { error: 'Nomor HP harus diawali 08 (10–14 digit)' };
}

export function validateName(value) {
  const v = String(value || '').trim();
  if (v.length < 3) return 'Nama minimal 3 huruf';
  if (v.length > 60) return 'Nama maksimal 60 karakter';
  return '';
}

export function validatePassword(value) {
  const v = String(value || '');
  if (v.length < 6) return 'Kata sandi minimal 6 karakter';
  return '';
}

export function passwordStrength(value) {
  const v = String(value || '');
  let score = 0;
  if (v.length >= 6) score++;
  if (v.length >= 10) score++;
  if (/[A-Z]/.test(v) && /[a-z]/.test(v)) score++;
  if (/\d/.test(v) && /[^A-Za-z0-9]/.test(v)) score++;
  if (v.length === 0) return { level: 0, label: '' };
  if (score <= 1) return { level: 1, label: 'Lemah' };
  if (score === 2) return { level: 2, label: 'Cukup' };
  return { level: 3, label: 'Kuat' };
}

export function validateRequired(value, label) {
  return String(value || '').trim() ? '' : `${label} wajib diisi`;
}

export function validatePostalCode(value) {
  return /^\d{5}$/.test(String(value || '').trim()) ? '' : 'Kode pos terdiri dari 5 angka';
}

export function parseMoney(value) {
  const digits = String(value ?? '').replace(/[^\d]/g, '');
  return digits ? parseInt(digits, 10) : 0;
}

// Seperti parseMoney tetapi boleh negatif (mis. potongan harga varian)
export function parseSignedMoney(value) {
  const n = parseInt(String(value ?? '').replace(/[^\d-]/g, ''), 10);
  return Number.isNaN(n) ? 0 : n;
}
