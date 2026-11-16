import { getDb } from './database';
import { AppError } from './errors';
import { lineUnitPrice } from '../utils/pricing';

const CART_SQL = `
SELECT ci.id, ci.product_id, ci.variant_id, ci.qty, ci.selected,
  p.name, p.price, p.emoji, p.image_uri, p.weight_gram, p.is_active, p.stock AS product_stock,
  v.name AS variant_name, IFNULL(v.price_delta, 0) AS price_delta, v.stock AS variant_stock,
  s.name AS store_name, COALESCE(pc.color, c.color) AS tile_color
FROM cart_items ci
JOIN products p ON p.id = ci.product_id
JOIN stores s ON s.id = p.store_id
JOIN categories c ON c.id = p.category_id
LEFT JOIN categories pc ON pc.id = c.parent_id
LEFT JOIN product_variants v ON v.id = ci.variant_id
WHERE ci.user_id = ?`;

function decorate(row) {
  const available = row.variant_id ? row.variant_stock ?? 0 : row.product_stock;
  const unitPrice = lineUnitPrice(row.price, row.price_delta);
  const unavailable = !row.is_active || available <= 0;
  return {
    ...row,
    selected: !!row.selected && !unavailable,
    available,
    unavailable,
    unit_price: unitPrice,
    line_total: unitPrice * row.qty,
  };
}

export async function getCart(userId) {
  const db = await getDb();
  const rows = await db.getAllAsync(`${CART_SQL} ORDER BY ci.id DESC`, [userId]);
  return rows.map(decorate);
}

async function getLine(db, userId, lineId) {
  const row = await db.getFirstAsync(`${CART_SQL} AND ci.id = ?`, [userId, lineId]);
  if (!row) throw new AppError('Barang tidak ada di keranjang');
  return decorate(row);
}

export async function getCartCount(userId) {
  const db = await getDb();
  const row = await db.getFirstAsync('SELECT IFNULL(SUM(qty), 0) AS n FROM cart_items WHERE user_id = ?', [userId]);
  return row.n;
}

export async function addToCart(userId, productId, variantId = null, qty = 1) {
  const db = await getDb();
  const product = await db.getFirstAsync('SELECT id, name, stock, is_active, store_id FROM products WHERE id = ?', [productId]);
  if (!product || !product.is_active) throw new AppError('Produk ini sudah tidak tersedia');
  const variantCount = (await db.getFirstAsync('SELECT COUNT(*) AS n FROM product_variants WHERE product_id = ?', [productId])).n;

  let available = product.stock;
  let variant = null;
  if (variantCount > 0) {
    if (!variantId) throw new AppError('Pilih varian dulu sebelum menambah ke keranjang');
    variant = await db.getFirstAsync('SELECT id, stock FROM product_variants WHERE id = ? AND product_id = ?', [variantId, productId]);
    if (!variant) throw new AppError('Varian tidak ditemukan');
    available = variant.stock;
  } else {
    variantId = null;
  }
  if (available <= 0) throw new AppError('Stok produk ini habis');

  const own = await db.getFirstAsync('SELECT 1 AS x FROM stores WHERE id = ? AND owner_id = ?', [product.store_id, userId]);
  if (own) throw new AppError('Kamu tidak bisa membeli produk dari tokomu sendiri');

  const existing = await db.getFirstAsync(
    'SELECT id, qty FROM cart_items WHERE user_id = ? AND product_id = ? AND IFNULL(variant_id, 0) = ?',
    [userId, productId, variantId || 0]
  );
  const nextQty = (existing ? existing.qty : 0) + qty;
  if (nextQty > available) {
    throw new AppError(existing ? `Stok hanya tersisa ${available}, dan ${existing.qty} sudah ada di keranjang` : `Stok hanya tersisa ${available}`);
  }
  if (existing) {
    await db.runAsync('UPDATE cart_items SET qty = ?, selected = 1 WHERE id = ?', [nextQty, existing.id]);
    return existing.id;
  }
  const r = await db.runAsync('INSERT INTO cart_items (user_id, product_id, variant_id, qty, selected) VALUES (?, ?, ?, ?, 1)', [
    userId, productId, variantId, qty,
  ]);
  return r.lastInsertRowId;
}

export async function setCartQty(userId, lineId, qty) {
  const db = await getDb();
  const line = await getLine(db, userId, lineId);
  if (qty < 1) throw new AppError('Jumlah minimal 1');
  if (qty > line.available) throw new AppError(`Stok hanya tersisa ${line.available}`);
  await db.runAsync('UPDATE cart_items SET qty = ? WHERE id = ?', [qty, lineId]);
}

export async function setCartSelected(userId, lineId, selected) {
  const db = await getDb();
  await db.runAsync('UPDATE cart_items SET selected = ? WHERE id = ? AND user_id = ?', [selected ? 1 : 0, lineId, userId]);
}

export async function setAllCartSelected(userId, selected) {
  const db = await getDb();
  await db.runAsync('UPDATE cart_items SET selected = ? WHERE user_id = ?', [selected ? 1 : 0, userId]);
}

// Dipakai tombol "Beli Sekarang": hanya barang itu yang dicentang
export async function selectOnlyCartLine(userId, lineId) {
  const db = await getDb();
  await db.runAsync('UPDATE cart_items SET selected = CASE WHEN id = ? THEN 1 ELSE 0 END WHERE user_id = ?', [lineId, userId]);
}

export async function removeCartItem(userId, lineId) {
  const db = await getDb();
  await db.runAsync('DELETE FROM cart_items WHERE id = ? AND user_id = ?', [lineId, userId]);
}
