import { getDb } from './database';
import { AppError } from './errors';
import { hashPassword, randomSalt } from '../utils/security';
import { isEmail, isPhone, normalizePhone, parseIdentifier, validateName, validatePassword } from '../utils/validators';

const PUBLIC_COLUMNS = 'id, name, email, phone, created_at';

export async function getUser(id) {
  const db = await getDb();
  return (await db.getFirstAsync(`SELECT ${PUBLIC_COLUMNS} FROM users WHERE id = ?`, [id])) || null;
}

export async function registerUser({ name, identifier, password }) {
  const nameError = validateName(name);
  if (nameError) throw new AppError(nameError);
  const ident = parseIdentifier(identifier);
  if (ident.error) throw new AppError(ident.error);
  const passwordError = validatePassword(password);
  if (passwordError) throw new AppError(passwordError);

  const db = await getDb();
  // ident.type hanya 'email' atau 'phone' (hasil parseIdentifier), aman dipakai sebagai nama kolom
  const exists = await db.getFirstAsync(`SELECT id FROM users WHERE ${ident.type} = ?`, [ident.value]);
  if (exists) {
    throw new AppError(ident.type === 'email' ? 'Email ini sudah terdaftar. Silakan masuk.' : 'Nomor HP ini sudah terdaftar. Silakan masuk.');
  }
  const salt = await randomSalt();
  const hash = await hashPassword(password, salt);
  const result = await db.runAsync(
    `INSERT INTO users (name, ${ident.type}, password_salt, password_hash) VALUES (?, ?, ?, ?)`,
    [name.trim(), ident.value, salt, hash]
  );
  return getUser(result.lastInsertRowId);
}

export async function loginUser(identifier, password) {
  const ident = parseIdentifier(identifier);
  if (ident.error) throw new AppError(ident.error);
  if (!password) throw new AppError('Isi kata sandi');
  const db = await getDb();
  const row = await db.getFirstAsync(`SELECT * FROM users WHERE ${ident.type} = ?`, [ident.value]);
  const genericError = new AppError('Email/No. HP atau kata sandi salah.');
  if (!row) throw genericError;
  const hash = await hashPassword(password, row.password_salt);
  if (hash !== row.password_hash) throw genericError;
  return getUser(row.id);
}

// Mengubah nama, email, dan nomor HP. Minimal salah satu dari email/HP harus terisi.
export async function updateUser(id, { name, email, phone }) {
  const nameError = validateName(name);
  if (nameError) throw new AppError(nameError);
  const emailValue = String(email || '').trim().toLowerCase();
  const phoneValue = String(phone || '').trim();
  if (!emailValue && !phoneValue) throw new AppError('Isi minimal email atau nomor HP');
  if (emailValue && !isEmail(emailValue)) throw new AppError('Format email belum benar');
  if (phoneValue && !isPhone(phoneValue)) throw new AppError('Nomor HP harus diawali 08 (10–14 digit)');
  const phoneNorm = phoneValue ? normalizePhone(phoneValue) : null;

  const db = await getDb();
  if (emailValue) {
    const clash = await db.getFirstAsync('SELECT id FROM users WHERE email = ? AND id <> ?', [emailValue, id]);
    if (clash) throw new AppError('Email ini sudah dipakai akun lain');
  }
  if (phoneNorm) {
    const clash = await db.getFirstAsync('SELECT id FROM users WHERE phone = ? AND id <> ?', [phoneNorm, id]);
    if (clash) throw new AppError('Nomor HP ini sudah dipakai akun lain');
  }
  await db.runAsync('UPDATE users SET name = ?, email = ?, phone = ? WHERE id = ?', [name.trim(), emailValue || null, phoneNorm, id]);
  return getUser(id);
}

export async function changePassword(id, oldPassword, newPassword) {
  const db = await getDb();
  const row = await db.getFirstAsync('SELECT password_salt, password_hash FROM users WHERE id = ?', [id]);
  if (!row) throw new AppError('Akun tidak ditemukan');
  if ((await hashPassword(oldPassword, row.password_salt)) !== row.password_hash) throw new AppError('Kata sandi lama salah');
  const error = validatePassword(newPassword);
  if (error) throw new AppError(error);
  const salt = await randomSalt();
  const hash = await hashPassword(newPassword, salt);
  await db.runAsync('UPDATE users SET password_salt = ?, password_hash = ? WHERE id = ?', [salt, hash, id]);
}

// Menghapus akun beserta alamat, keranjang, pesanan, ulasan, dan toko miliknya (ON DELETE CASCADE)
export async function deleteUser(id) {
  const db = await getDb();
  await db.runAsync('DELETE FROM users WHERE id = ?', [id]);
}

export async function getSessionUserId() {
  const db = await getDb();
  const row = await db.getFirstAsync("SELECT value FROM meta WHERE key = 'session_user_id'");
  return row ? Number(row.value) : null;
}

export async function setSessionUserId(id) {
  const db = await getDb();
  if (id == null) {
    await db.runAsync("DELETE FROM meta WHERE key = 'session_user_id'");
  } else {
    await db.runAsync("INSERT OR REPLACE INTO meta (key, value) VALUES ('session_user_id', ?)", [String(id)]);
  }
}
