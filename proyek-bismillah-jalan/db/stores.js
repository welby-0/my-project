import { getDb } from './database';
import { AppError } from './errors';

export async function getStoreByOwner(userId) {
  const db = await getDb();
  return (await db.getFirstAsync('SELECT * FROM stores WHERE owner_id = ?', [userId])) || null;
}

function validateStore({ name, city }) {
  const n = String(name || '').trim();
  const c = String(city || '').trim();
  if (n.length < 3) throw new AppError('Nama toko minimal 3 huruf');
  if (n.length > 40) throw new AppError('Nama toko maksimal 40 karakter');
  if (!c) throw new AppError('Kota asal pengiriman wajib diisi');
  return { name: n, city: c };
}

export async function createStore(userId, data) {
  const { name, city } = validateStore(data);
  const db = await getDb();
  if (await getStoreByOwner(userId)) throw new AppError('Kamu sudah memiliki toko');
  await db.runAsync('INSERT INTO stores (owner_id, name, city, description) VALUES (?, ?, ?, ?)', [
    userId, name, city, String(data.description || '').trim(),
  ]);
  return getStoreByOwner(userId);
}

export async function updateStore(userId, data) {
  const { name, city } = validateStore(data);
  const db = await getDb();
  const store = await getStoreByOwner(userId);
  if (!store) throw new AppError('Toko tidak ditemukan');
  await db.runAsync('UPDATE stores SET name = ?, city = ?, description = ? WHERE id = ?', [
    name, city, String(data.description || '').trim(), store.id,
  ]);
  return getStoreByOwner(userId);
}

// Menghapus toko beserta semua produknya
export async function deleteStore(userId) {
  const db = await getDb();
  await db.runAsync('DELETE FROM stores WHERE owner_id = ?', [userId]);
}

export async function getStoreStats(storeId) {
  const db = await getDb();
  const row = await db.getFirstAsync(
    `SELECT COUNT(*) AS products, IFNULL(SUM(sold), 0) AS sold,
            IFNULL(SUM(CASE WHEN stock = 0 THEN 1 ELSE 0 END), 0) AS out_of_stock,
            IFNULL(SUM(CASE WHEN is_active = 0 THEN 1 ELSE 0 END), 0) AS hidden
     FROM products WHERE store_id = ?`,
    [storeId]
  );
  return row;
}
