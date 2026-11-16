import { getDb } from './database';

export async function listWishlistIds(userId) {
  const db = await getDb();
  const rows = await db.getAllAsync('SELECT product_id FROM wishlist WHERE user_id = ?', [userId]);
  return rows.map((r) => r.product_id);
}

export async function listWishlist(userId) {
  const db = await getDb();
  return db.getAllAsync(
    `SELECT p.id, p.name, p.price, p.emoji, p.image_uri, p.tile_color, p.rating_avg, p.rating_count, p.sold, p.stock,
            p.store_name, p.store_city, p.category_name, p.variant_count, p.is_active, p.condition
     FROM wishlist w JOIN v_products p ON p.id = w.product_id
     WHERE w.user_id = ? ORDER BY w.created_at DESC, w.rowid DESC`,
    [userId]
  );
}

// Mengembalikan true bila produk sekarang ada di favorit
export async function toggleWishlist(userId, productId) {
  const db = await getDb();
  const exists = await db.getFirstAsync('SELECT 1 AS x FROM wishlist WHERE user_id = ? AND product_id = ?', [userId, productId]);
  if (exists) {
    await db.runAsync('DELETE FROM wishlist WHERE user_id = ? AND product_id = ?', [userId, productId]);
    return false;
  }
  await db.runAsync('INSERT INTO wishlist (user_id, product_id) VALUES (?, ?)', [userId, productId]);
  return true;
}
