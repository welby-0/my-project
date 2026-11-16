import { getDb } from './database';
import { AppError } from './errors';
import { isPhone, normalizePhone, validatePostalCode, validateRequired } from '../utils/validators';

export async function listAddresses(userId) {
  const db = await getDb();
  return db.getAllAsync('SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, id DESC', [userId]);
}

export async function getAddress(userId, id) {
  const db = await getDb();
  return (await db.getFirstAsync('SELECT * FROM addresses WHERE id = ? AND user_id = ?', [id, userId])) || null;
}

function validateAddress(data) {
  const recipientError = validateRequired(data.recipient, 'Nama penerima');
  if (recipientError) throw new AppError(recipientError);
  if (!isPhone(data.phone)) throw new AppError('Nomor HP penerima harus diawali 08 (10–14 digit)');
  const streetError = validateRequired(data.street, 'Alamat lengkap');
  if (streetError) throw new AppError(streetError);
  if (String(data.street).trim().length < 8) throw new AppError('Alamat terlalu singkat, tulis nama jalan dan nomor');
  const cityError = validateRequired(data.city, 'Kota/kabupaten');
  if (cityError) throw new AppError(cityError);
  const provinceError = validateRequired(data.province, 'Provinsi');
  if (provinceError) throw new AppError(provinceError);
  const postalError = validatePostalCode(data.postalCode);
  if (postalError) throw new AppError(postalError);
  return {
    label: String(data.label || 'Rumah').trim() || 'Rumah',
    recipient: String(data.recipient).trim(),
    phone: normalizePhone(data.phone),
    street: String(data.street).trim(),
    city: String(data.city).trim(),
    province: String(data.province).trim(),
    postalCode: String(data.postalCode).trim(),
  };
}

export async function createAddress(userId, data) {
  const a = validateAddress(data);
  const db = await getDb();
  let id;
  await db.withTransactionAsync(async () => {
    const count = (await db.getFirstAsync('SELECT COUNT(*) AS n FROM addresses WHERE user_id = ?', [userId])).n;
    const makeDefault = count === 0 || data.isDefault;
    if (makeDefault) await db.runAsync('UPDATE addresses SET is_default = 0 WHERE user_id = ?', [userId]);
    const r = await db.runAsync(
      `INSERT INTO addresses (user_id, label, recipient, phone, street, city, province, postal_code, is_default)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, a.label, a.recipient, a.phone, a.street, a.city, a.province, a.postalCode, makeDefault ? 1 : 0]
    );
    id = r.lastInsertRowId;
  });
  return getAddress(userId, id);
}

export async function updateAddress(userId, id, data) {
  const a = validateAddress(data);
  const db = await getDb();
  if (!(await getAddress(userId, id))) throw new AppError('Alamat tidak ditemukan');
  await db.withTransactionAsync(async () => {
    if (data.isDefault) await db.runAsync('UPDATE addresses SET is_default = 0 WHERE user_id = ?', [userId]);
    await db.runAsync(
      `UPDATE addresses SET label = ?, recipient = ?, phone = ?, street = ?, city = ?, province = ?, postal_code = ?,
         is_default = CASE WHEN ? THEN 1 ELSE is_default END
       WHERE id = ? AND user_id = ?`,
      [a.label, a.recipient, a.phone, a.street, a.city, a.province, a.postalCode, data.isDefault ? 1 : 0, id, userId]
    );
  });
  return getAddress(userId, id);
}

export async function setDefaultAddress(userId, id) {
  const db = await getDb();
  if (!(await getAddress(userId, id))) throw new AppError('Alamat tidak ditemukan');
  await db.withTransactionAsync(async () => {
    await db.runAsync('UPDATE addresses SET is_default = 0 WHERE user_id = ?', [userId]);
    await db.runAsync('UPDATE addresses SET is_default = 1 WHERE id = ? AND user_id = ?', [id, userId]);
  });
}

export async function deleteAddress(userId, id) {
  const db = await getDb();
  await db.withTransactionAsync(async () => {
    const target = await getAddress(userId, id);
    if (!target) return;
    await db.runAsync('DELETE FROM addresses WHERE id = ? AND user_id = ?', [id, userId]);
    if (target.is_default) {
      await db.runAsync(
        'UPDATE addresses SET is_default = 1 WHERE id = (SELECT id FROM addresses WHERE user_id = ? ORDER BY id DESC LIMIT 1)',
        [userId]
      );
    }
  });
}
