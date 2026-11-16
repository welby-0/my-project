import { getDb } from './database';
import { AppError } from './errors';

export async function listReviews(productId, limit = 50) {
  const db = await getDb();
  return db.getAllAsync(
    `SELECT r.id, r.user_id, r.rating, r.comment, r.created_at, r.updated_at, u.name AS user_name
     FROM reviews r JOIN users u ON u.id = r.user_id
     WHERE r.product_id = ? ORDER BY r.updated_at DESC, r.id DESC LIMIT ?`,
    [productId, limit]
  );
}

export async function getUserReview(productId, userId) {
  const db = await getDb();
  return (await db.getFirstAsync('SELECT * FROM reviews WHERE product_id = ? AND user_id = ?', [productId, userId])) || null;
}

export async function ratingBreakdown(productId) {
  const db = await getDb();
  const rows = await db.getAllAsync('SELECT rating, COUNT(*) AS n FROM reviews WHERE product_id = ? GROUP BY rating', [productId]);
  const out = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const r of rows) out[r.rating] = r.n;
  return out;
}

// Membuat ulasan baru, atau memperbarui ulasan milik pengguna untuk produk yang sama
export async function saveReview(userId, productId, rating, comment) {
  const r = Number(rating);
  if (!Number.isInteger(r) || r < 1 || r > 5) throw new AppError('Pilih rating 1 sampai 5 bintang');
  const text = String(comment || '').trim();
  if (text.length > 500) throw new AppError('Ulasan maksimal 500 karakter');
  const db = await getDb();
  const owner = await db.getFirstAsync(
    'SELECT 1 AS x FROM products p JOIN stores s ON s.id = p.store_id WHERE p.id = ? AND s.owner_id = ?',
    [productId, userId]
  );
  if (owner) throw new AppError('Kamu tidak bisa mengulas produk tokomu sendiri');
  const existing = await getUserReview(productId, userId);
  if (existing) {
    await db.runAsync("UPDATE reviews SET rating = ?, comment = ?, updated_at = datetime('now') WHERE id = ?", [r, text, existing.id]);
    return existing.id;
  }
  const res = await db.runAsync('INSERT INTO reviews (product_id, user_id, rating, comment) VALUES (?, ?, ?, ?)', [productId, userId, r, text]);
  return res.lastInsertRowId;
}

export async function deleteReview(userId, reviewId) {
  const db = await getDb();
  await db.runAsync('DELETE FROM reviews WHERE id = ? AND user_id = ?', [reviewId, userId]);
}
