import { getDb } from './database';
import { AppError } from './errors';
import { getStoreByOwner } from './stores';

const LIST_COLUMNS = `id, name, price, emoji, image_uri, tile_color, rating_avg, rating_count, sold, stock,
  store_name, store_city, category_name, variant_count, is_active, condition`;

const escapeLike = (w) => '%' + String(w).replace(/[\\%_]/g, (m) => '\\' + m) + '%';

const SORTS = {
  relevan: 'sold DESC, id DESC',
  terlaris: 'sold DESC, id DESC',
  terbaru: 'id DESC',
  rating: 'rating_avg DESC, rating_count DESC, id DESC',
  termurah: 'price ASC, id DESC',
  termahal: 'price DESC, id DESC',
};

function buildFilter({ q, categoryId, minPrice, maxPrice, storeId, includeInactive }) {
  const where = [];
  const params = [];
  if (!includeInactive) where.push('is_active = 1');
  if (storeId) {
    where.push('store_id = ?');
    params.push(storeId);
  }
  if (categoryId) {
    where.push('(category_id = ? OR root_category_id = ?)');
    params.push(categoryId, categoryId);
  }
  if (minPrice) {
    where.push('price >= ?');
    params.push(minPrice);
  }
  if (maxPrice) {
    where.push('price <= ?');
    params.push(maxPrice);
  }
  const words = String(q || '').trim().split(/\s+/).filter(Boolean).slice(0, 6);
  for (const w of words) {
    where.push("(name LIKE ? ESCAPE '\\' OR brand LIKE ? ESCAPE '\\' OR category_name LIKE ? ESCAPE '\\')");
    const like = escapeLike(w);
    params.push(like, like, like);
  }
  return { sql: where.length ? 'WHERE ' + where.join(' AND ') : '', params, words };
}

export async function countProducts(filters = {}) {
  const db = await getDb();
  const { sql, params } = buildFilter(filters);
  const row = await db.getFirstAsync(`SELECT COUNT(*) AS n FROM v_products ${sql}`, params);
  return row.n;
}

export async function listProducts(filters = {}, { limit = 20, offset = 0 } = {}) {
  const db = await getDb();
  const { sql, params, words } = buildFilter(filters);
  let orderBy = SORTS[filters.sort] || SORTS.terlaris;
  const orderParams = [];
  if ((!filters.sort || filters.sort === 'relevan') && words.length) {
    // Nama yang diawali kata kunci tampil lebih dulu
    orderBy = "CASE WHEN name LIKE ? ESCAPE '\\' THEN 0 ELSE 1 END, " + SORTS.relevan;
    orderParams.push(escapeLike(words[0]).slice(1)); // "kata%" (tanpa % di depan)
  }
  return db.getAllAsync(
    `SELECT ${LIST_COLUMNS} FROM v_products ${sql} ORDER BY ${orderBy} LIMIT ? OFFSET ?`,
    [...params, ...orderParams, limit, offset]
  );
}

async function getProductVariants(productId) {
  const db = await getDb();
  return db.getAllAsync('SELECT id, name, price_delta, stock FROM product_variants WHERE product_id = ? ORDER BY id', [productId]);
}

export async function getProduct(id) {
  const db = await getDb();
  const product = await db.getFirstAsync('SELECT * FROM v_products WHERE id = ?', [id]);
  if (!product) return null;
  const variants = await getProductVariants(id);
  const storeCount = await db.getFirstAsync('SELECT COUNT(*) AS n FROM products WHERE store_id = ? AND is_active = 1', [product.store_id]);
  const category = await db.getFirstAsync(
    'SELECT c.id, c.name, pc.id AS parent_id, pc.name AS parent_name FROM categories c LEFT JOIN categories pc ON pc.id = c.parent_id WHERE c.id = ?',
    [product.category_id]
  );
  return { ...product, variants, store_product_count: storeCount.n, category };
}

// Semua produk milik satu toko (termasuk yang disembunyikan), untuk layar "Toko Saya"
export async function listStoreProducts(storeId) {
  return listProducts({ storeId, includeInactive: true, sort: 'terbaru' }, { limit: 500, offset: 0 });
}

function validateProduct(data) {
  const name = String(data.name || '').trim();
  if (name.length < 3) throw new AppError('Nama produk minimal 3 huruf');
  if (name.length > 100) throw new AppError('Nama produk maksimal 100 karakter');
  if (!data.categoryId) throw new AppError('Pilih kategori produk');
  const price = Number(data.price);
  if (!Number.isInteger(price) || price < 100) throw new AppError('Harga minimal Rp100');
  const weight = Number(data.weightGram);
  if (!Number.isInteger(weight) || weight < 1) throw new AppError('Berat produk minimal 1 gram');

  const variants = (data.variants || [])
    .map((v) => ({ id: v.id || null, name: String(v.name || '').trim(), priceDelta: Number(v.priceDelta) || 0, stock: Number(v.stock) || 0 }))
    .filter((v) => v.name !== '' || v.id);
  const seen = new Set();
  for (const v of variants) {
    if (!v.name) throw new AppError('Nama varian tidak boleh kosong');
    const key = v.name.toLowerCase();
    if (seen.has(key)) throw new AppError(`Nama varian "${v.name}" dipakai dua kali`);
    seen.add(key);
    if (!Number.isInteger(v.stock) || v.stock < 0) throw new AppError('Stok varian tidak boleh negatif');
    if (price + v.priceDelta < 0) throw new AppError('Tambahan harga varian membuat harga jadi negatif');
  }
  let stock = Number(data.stock) || 0;
  if (!variants.length && (!Number.isInteger(stock) || stock < 0)) throw new AppError('Stok tidak boleh negatif');
  if (variants.length) stock = variants.reduce((a, v) => a + v.stock, 0);

  return {
    name,
    categoryId: data.categoryId,
    price,
    weight,
    stock,
    brand: String(data.brand || '').trim(),
    description: String(data.description || '').trim(),
    condition: data.condition === 'bekas' ? 'bekas' : 'baru',
    emoji: String(data.emoji || '').trim() || '📦',
    imageUri: data.imageUri || null,
    variantLabel: variants.length ? String(data.variantLabel || '').trim() || 'Varian' : null,
    isActive: data.isActive === false || data.isActive === 0 ? 0 : 1,
    variants,
  };
}

async function writeVariants(db, productId, variants) {
  const existing = await db.getAllAsync('SELECT id FROM product_variants WHERE product_id = ?', [productId]);
  const keepIds = new Set(variants.filter((v) => v.id).map((v) => v.id));
  for (const e of existing) {
    if (!keepIds.has(e.id)) await db.runAsync('DELETE FROM product_variants WHERE id = ?', [e.id]); // keranjang ikut terhapus (cascade)
  }
  // Tahap 1: pindahkan nama varian yang berubah ke nama sementara agar tidak bentrok UNIQUE
  for (const v of variants.filter((x) => x.id)) {
    await db.runAsync('UPDATE product_variants SET name = ? WHERE id = ? AND product_id = ?', [`__tmp_${v.id}`, v.id, productId]);
  }
  for (const v of variants) {
    if (v.id) {
      await db.runAsync('UPDATE product_variants SET name = ?, price_delta = ?, stock = ? WHERE id = ? AND product_id = ?', [
        v.name, v.priceDelta, v.stock, v.id, productId,
      ]);
    } else {
      await db.runAsync('INSERT INTO product_variants (product_id, name, price_delta, stock) VALUES (?, ?, ?, ?)', [
        productId, v.name, v.priceDelta, v.stock,
      ]);
    }
  }
}

async function assertOwnProduct(db, userId, productId) {
  const row = await db.getFirstAsync(
    'SELECT p.id FROM products p JOIN stores s ON s.id = p.store_id WHERE p.id = ? AND s.owner_id = ?',
    [productId, userId]
  );
  if (!row) throw new AppError('Produk tidak ditemukan di tokomu');
}

export async function createProduct(userId, data) {
  const input = validateProduct(data);
  const db = await getDb();
  const store = await getStoreByOwner(userId);
  if (!store) throw new AppError('Buka toko dulu sebelum menambah produk');
  let productId;
  await db.withTransactionAsync(async () => {
    const r = await db.runAsync(
      `INSERT INTO products (store_id, category_id, name, description, brand, price, stock, condition, weight_gram, emoji, image_uri, variant_label, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [store.id, input.categoryId, input.name, input.description, input.brand || store.name, input.price, input.stock,
        input.condition, input.weight, input.emoji, input.imageUri, input.variantLabel, input.isActive]
    );
    productId = r.lastInsertRowId;
    await writeVariants(db, productId, input.variants);
  });
  return getProduct(productId);
}

export async function updateProduct(userId, productId, data) {
  const input = validateProduct(data);
  const db = await getDb();
  await assertOwnProduct(db, userId, productId);
  await db.withTransactionAsync(async () => {
    await db.runAsync(
      `UPDATE products SET category_id = ?, name = ?, description = ?, brand = ?, price = ?, stock = ?, condition = ?,
         weight_gram = ?, emoji = ?, image_uri = ?, variant_label = ?, is_active = ?, updated_at = datetime('now')
       WHERE id = ?`,
      [input.categoryId, input.name, input.description, input.brand, input.price, input.stock, input.condition,
        input.weight, input.emoji, input.imageUri, input.variantLabel, input.isActive, productId]
    );
    await writeVariants(db, productId, input.variants);
  });
  return getProduct(productId);
}

export async function deleteProduct(userId, productId) {
  const db = await getDb();
  await assertOwnProduct(db, userId, productId);
  await db.runAsync('DELETE FROM products WHERE id = ?', [productId]);
}

export async function setProductActive(userId, productId, active) {
  const db = await getDb();
  await assertOwnProduct(db, userId, productId);
  await db.runAsync("UPDATE products SET is_active = ?, updated_at = datetime('now') WHERE id = ?", [active ? 1 : 0, productId]);
}

// Dipakai saat stok varian berubah: stok produk = jumlah stok semua varian
async function syncProductStock(db, productId) {
  await db.runAsync(
    `UPDATE products SET stock = (SELECT IFNULL(SUM(stock), 0) FROM product_variants WHERE product_id = ?)
     WHERE id = ? AND EXISTS (SELECT 1 FROM product_variants WHERE product_id = ?)`,
    [productId, productId, productId]
  );
}

export async function adjustStock(db, productId, variantId, delta) {
  if (variantId) {
    await db.runAsync('UPDATE product_variants SET stock = stock + ? WHERE id = ?', [delta, variantId]);
    await syncProductStock(db, productId);
  } else {
    await db.runAsync('UPDATE products SET stock = stock + ? WHERE id = ?', [delta, productId]);
  }
}
