import { getDb } from './database';
import { AppError } from './errors';
import { adjustStock } from './products';
import { addToCart } from './cart';
import { findPromo } from './catalog';
import { calcTotals, evaluatePromo, lineUnitPrice, shippingCost } from '../utils/pricing';

const ORDER_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function makeOrderNo() {
  const d = new Date();
  const yy = String(d.getFullYear()).slice(2);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const rnd = Array.from({ length: 5 }, () => ORDER_CHARS[Math.floor(Math.random() * ORDER_CHARS.length)]).join('');
  return `PSR-${yy}${mm}${dd}-${rnd}`;
}

// Hitung rincian biaya untuk barang terpilih (dipakai layar checkout dan saat membuat pesanan)
export async function quoteOrder({ lines, courier, payment, promoCode }) {
  const subtotal = lines.reduce((sum, l) => sum + l.line_total, 0);
  const weight = lines.reduce((sum, l) => sum + l.weight_gram * l.qty, 0);
  const shipping = shippingCost(courier, weight);
  const paymentFee = payment ? payment.fee : 0;
  let discount = 0;
  let promo = null;
  let promoError = '';
  if (promoCode) {
    promo = await findPromo(promoCode);
    const result = evaluatePromo(promo, { subtotal, shipping });
    if (result.ok) discount = result.discount;
    else {
      promoError = promo ? result.reason : 'Kode promo tidak ditemukan atau sudah berakhir';
      promo = null;
    }
  }
  return { ...calcTotals({ subtotal, shipping, paymentFee, discount }), weight, promo, promoError };
}

export async function placeOrder(userId, { addressId, courierId, paymentId, promoCode, note }) {
  const db = await getDb();
  let created = null;
  await db.withTransactionAsync(async () => {
    const rows = await db.getAllAsync(
      `SELECT ci.id, ci.product_id, ci.variant_id, ci.qty, p.name, p.price, p.weight_gram, p.stock AS product_stock,
              p.emoji, p.is_active, v.name AS variant_name, IFNULL(v.price_delta, 0) AS price_delta, v.stock AS variant_stock
       FROM cart_items ci
       JOIN products p ON p.id = ci.product_id
       LEFT JOIN product_variants v ON v.id = ci.variant_id
       WHERE ci.user_id = ? AND ci.selected = 1`,
      [userId]
    );
    if (!rows.length) throw new AppError('Pilih minimal satu barang di keranjang');
    const lines = rows.map((r) => {
      const available = r.variant_id ? r.variant_stock ?? 0 : r.product_stock;
      if (!r.is_active || available <= 0) throw new AppError(`"${r.name}" sudah tidak tersedia. Hapus dari keranjang dulu.`);
      if (r.qty > available) throw new AppError(`Stok "${r.name}" tinggal ${available}. Kurangi jumlahnya.`);
      const unit = lineUnitPrice(r.price, r.price_delta);
      return { ...r, unit_price: unit, line_total: unit * r.qty };
    });

    const address = await db.getFirstAsync('SELECT * FROM addresses WHERE id = ? AND user_id = ?', [addressId, userId]);
    if (!address) throw new AppError('Pilih alamat pengiriman');
    const courier = await db.getFirstAsync('SELECT * FROM couriers WHERE id = ? AND is_active = 1', [courierId]);
    if (!courier) throw new AppError('Pilih kurir pengiriman');
    const payment = await db.getFirstAsync('SELECT * FROM payment_methods WHERE id = ? AND is_active = 1', [paymentId]);
    if (!payment) throw new AppError('Pilih metode pembayaran');

    const q = await quoteOrder({ lines, courier, payment, promoCode });
    if (promoCode && q.promoError) throw new AppError(q.promoError);

    const status = payment.type === 'cod' ? 'dikemas' : 'menunggu_pembayaran';
    const shipAddress = `${address.street}, ${address.city}, ${address.province} ${address.postal_code}`;

    let orderId = null;
    let orderNo = '';
    for (let attempt = 0; attempt < 5 && !orderId; attempt++) {
      orderNo = makeOrderNo();
      const clash = await db.getFirstAsync('SELECT id FROM orders WHERE order_no = ?', [orderNo]);
      if (clash) continue;
      const r = await db.runAsync(
        `INSERT INTO orders (order_no, user_id, status, ship_recipient, ship_phone, ship_address, courier_name, shipping_cost,
           payment_type, payment_name, payment_fee, promo_code, subtotal, discount, total, note)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [orderNo, userId, status, address.recipient, address.phone, shipAddress, `${courier.name} ${courier.service}`, q.shipping,
          payment.type, payment.name, q.paymentFee, q.promo ? q.promo.code : null, q.subtotal, q.discount, q.total, String(note || '').trim()]
      );
      orderId = r.lastInsertRowId;
    }
    if (!orderId) throw new AppError('Gagal membuat nomor pesanan. Coba lagi.');

    for (const l of lines) {
      await db.runAsync(
        'INSERT INTO order_items (order_id, product_id, variant_id, name, variant_name, emoji, price, qty) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [orderId, l.product_id, l.variant_id, l.name, l.variant_name, l.emoji, l.unit_price, l.qty]
      );
      await adjustStock(db, l.product_id, l.variant_id, -l.qty);
      await db.runAsync('UPDATE products SET sold = sold + ? WHERE id = ?', [l.qty, l.product_id]);
      await db.runAsync('DELETE FROM cart_items WHERE id = ?', [l.id]);
    }
    created = { id: orderId, order_no: orderNo, status, total: q.total, payment_type: payment.type, payment_name: payment.name };
  });
  return created;
}

const ORDER_COLUMNS = 'id, order_no, status, total, created_at, payment_type, payment_name';

export async function listOrders(userId, status) {
  const db = await getDb();
  const where = status && status !== 'semua' ? 'AND status = ?' : '';
  const params = status && status !== 'semua' ? [userId, status] : [userId];
  const orders = await db.getAllAsync(`SELECT ${ORDER_COLUMNS} FROM orders WHERE user_id = ? ${where} ORDER BY id DESC`, params);
  for (const o of orders) {
    o.items = await db.getAllAsync('SELECT name, variant_name, emoji, qty FROM order_items WHERE order_id = ? ORDER BY id', [o.id]);
    o.item_count = o.items.reduce((a, i) => a + i.qty, 0);
  }
  return orders;
}

export async function getOrder(userId, id) {
  const db = await getDb();
  const order = await db.getFirstAsync('SELECT * FROM orders WHERE id = ? AND user_id = ?', [id, userId]);
  if (!order) return null;
  order.items = await db.getAllAsync('SELECT * FROM order_items WHERE order_id = ? ORDER BY id', [id]);
  return order;
}

export async function countOrdersByStatus(userId) {
  const db = await getDb();
  const rows = await db.getAllAsync('SELECT status, COUNT(*) AS n FROM orders WHERE user_id = ? GROUP BY status', [userId]);
  const out = { semua: 0 };
  for (const r of rows) {
    out[r.status] = r.n;
    out.semua += r.n;
  }
  return out;
}

const TRANSITIONS = {
  bayar: { from: ['menunggu_pembayaran'], to: 'dikemas' },
  kirim: { from: ['dikemas'], to: 'dikirim' },
  terima: { from: ['dikirim'], to: 'selesai' },
  batal: { from: ['menunggu_pembayaran', 'dikemas'], to: 'dibatalkan' },
};

export async function advanceOrder(userId, orderId, action) {
  const rule = TRANSITIONS[action];
  if (!rule) throw new AppError('Aksi pesanan tidak dikenal');
  const db = await getDb();
  await db.withTransactionAsync(async () => {
    const order = await db.getFirstAsync('SELECT id, status FROM orders WHERE id = ? AND user_id = ?', [orderId, userId]);
    if (!order) throw new AppError('Pesanan tidak ditemukan');
    if (!rule.from.includes(order.status)) throw new AppError('Status pesanan sudah berubah. Muat ulang halaman ini.');
    if (action === 'batal') {
      const items = await db.getAllAsync('SELECT product_id, variant_id, qty FROM order_items WHERE order_id = ?', [orderId]);
      for (const it of items) {
        if (it.product_id == null) continue;
        await adjustStock(db, it.product_id, it.variant_id, it.qty);
        await db.runAsync('UPDATE products SET sold = MAX(0, sold - ?) WHERE id = ?', [it.qty, it.product_id]);
      }
    }
    await db.runAsync("UPDATE orders SET status = ?, updated_at = datetime('now') WHERE id = ?", [rule.to, orderId]);
  });
}

// Hanya pesanan yang sudah selesai atau dibatalkan yang boleh dihapus dari riwayat
export async function deleteOrder(userId, orderId) {
  const db = await getDb();
  const order = await db.getFirstAsync('SELECT status FROM orders WHERE id = ? AND user_id = ?', [orderId, userId]);
  if (!order) throw new AppError('Pesanan tidak ditemukan');
  if (!['selesai', 'dibatalkan'].includes(order.status)) throw new AppError('Pesanan yang masih berjalan tidak bisa dihapus');
  await db.runAsync('DELETE FROM orders WHERE id = ? AND user_id = ?', [orderId, userId]);
}

// "Beli lagi": memasukkan kembali barang pesanan ke keranjang (yang masih tersedia saja)
export async function reorder(userId, orderId) {
  const db = await getDb();
  const items = await db.getAllAsync('SELECT product_id, variant_id, qty FROM order_items WHERE order_id = ?', [orderId]);
  let added = 0;
  let skipped = 0;
  for (const it of items) {
    if (it.product_id == null) {
      skipped++;
      continue;
    }
    try {
      let variantId = it.variant_id;
      if (variantId) {
        const exists = await db.getFirstAsync('SELECT id FROM product_variants WHERE id = ?', [variantId]);
        if (!exists) variantId = null;
      }
      await addToCart(userId, it.product_id, variantId, it.qty);
      added++;
    } catch (e) {
      skipped++;
    }
  }
  return { added, skipped };
}
