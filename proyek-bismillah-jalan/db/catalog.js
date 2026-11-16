import { getDb } from './database';

// Kategori induk beserta anak-anaknya
export async function listCategoryTree() {
  const db = await getDb();
  const rows = await db.getAllAsync('SELECT * FROM categories ORDER BY parent_id IS NOT NULL, sort_order, id');
  const tops = rows.filter((r) => r.parent_id == null).map((r) => ({ ...r, children: [] }));
  const byId = new Map(tops.map((t) => [t.id, t]));
  for (const r of rows) {
    if (r.parent_id != null) byId.get(r.parent_id)?.children.push(r);
  }
  return tops;
}

export async function listCouriers() {
  const db = await getDb();
  return db.getAllAsync('SELECT * FROM couriers WHERE is_active = 1 ORDER BY base_cost, id');
}

export async function listPaymentMethods() {
  const db = await getDb();
  return db.getAllAsync('SELECT * FROM payment_methods WHERE is_active = 1 ORDER BY id');
}

const ACTIVE_PROMO = "is_active = 1 AND date('now') BETWEEN starts_at AND ends_at";

export async function listPromos() {
  const db = await getDb();
  return db.getAllAsync(`SELECT * FROM promos WHERE ${ACTIVE_PROMO} ORDER BY id`);
}

export async function findPromo(code) {
  const db = await getDb();
  const clean = String(code || '').trim();
  if (!clean) return null;
  return (await db.getFirstAsync(`SELECT * FROM promos WHERE code = ? AND ${ACTIVE_PROMO}`, [clean])) || null;
}

// Jumlah produk aktif per kategori induk, untuk layar Kategori
export async function categoryProductCounts() {
  const db = await getDb();
  const rows = await db.getAllAsync('SELECT root_category_id AS id, COUNT(*) AS n FROM v_products WHERE is_active = 1 GROUP BY root_category_id');
  return Object.fromEntries(rows.map((r) => [r.id, r.n]));
}
