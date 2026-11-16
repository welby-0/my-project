import {
  CATEGORIES, STORES, STORE_BY_CATEGORY, WEIGHT_BY_CATEGORY, VARIANT_PRESETS, PRODUCTS,
  COURIERS, PAYMENT_METHODS, PROMOS, SEED_REVIEWERS, REVIEW_TEXT, DEMO_STORE,
} from './seed-data';
import { DEMO_ACCOUNT } from '../utils/constants';
import { randomSalt, hashPassword } from '../utils/security';

// Pengacak deterministik (mulberry32) agar data awal selalu sama di setiap perangkat
function makeRng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function descriptionFor(p, storeName, city) {
  return [
    `${p.name}.`,
    '',
    'Keunggulan:',
    `• ${p.extra}`,
    '• Barang dicek sebelum dikirim',
    `• Dikirim dari ${city} oleh ${storeName}`,
    '',
    `Kondisi: ${p.c === 'bekas' ? 'Bekas' : 'Baru'}. Garansi toko 7 hari bila barang rusak atau tidak sesuai.`,
  ].join('\n');
}

export async function seedDatabase(db) {
  const rand = makeRng(20261113);
  const int = (a, b) => a + Math.floor(rand() * (b - a + 1));

  const demoSalt = await randomSalt();
  const demoHash = await hashPassword(DEMO_ACCOUNT.password, demoSalt);

  await db.withTransactionAsync(async () => {
    // Kategori (2 tingkat)
    const categoryId = {};
    let order = 0;
    for (const top of CATEGORIES) {
      const r = await db.runAsync(
        'INSERT INTO categories (parent_id, slug, name, icon, color, sort_order) VALUES (NULL, ?, ?, ?, ?, ?)',
        [top.slug, top.name, top.icon, top.color, order++]
      );
      categoryId[top.slug] = r.lastInsertRowId;
      for (let i = 0; i < top.children.length; i++) {
        const [slug, name, icon] = top.children[i];
        const rr = await db.runAsync(
          'INSERT INTO categories (parent_id, slug, name, icon, color, sort_order) VALUES (?, ?, ?, ?, ?, ?)',
          [categoryId[top.slug], slug, name, icon, top.color, i]
        );
        categoryId[slug] = rr.lastInsertRowId;
      }
    }

    // Pengguna: akun demo (id 1) dan pembeli contoh yang menulis ulasan
    const demo = await db.runAsync(
      'INSERT INTO users (name, email, phone, password_salt, password_hash) VALUES (?, ?, ?, ?, ?)',
      ['Demo Pasarin', DEMO_ACCOUNT.email, '081234567890', demoSalt, demoHash]
    );
    const reviewerIds = [];
    for (let i = 0; i < SEED_REVIEWERS.length; i++) {
      const r = await db.runAsync(
        'INSERT INTO users (name, email, password_salt, password_hash) VALUES (?, ?, ?, ?)',
        [SEED_REVIEWERS[i], `pembeli${i + 1}@contoh.id`, 'tidak-bisa-login', 'tidak-bisa-login']
      );
      reviewerIds.push(r.lastInsertRowId);
    }

    // Toko
    const storeId = {};
    const storeInfo = {};
    for (const [key, [name, city, desc]] of Object.entries(STORES)) {
      const r = await db.runAsync('INSERT INTO stores (owner_id, name, city, description) VALUES (NULL, ?, ?, ?)', [name, city, desc]);
      storeId[key] = r.lastInsertRowId;
      storeInfo[key] = { name, city };
    }
    const dr = await db.runAsync('INSERT INTO stores (owner_id, name, city, description) VALUES (?, ?, ?, ?)', [demo.lastInsertRowId, ...DEMO_STORE]);
    storeId.demo = dr.lastInsertRowId;
    storeInfo.demo = { name: DEMO_STORE[0], city: DEMO_STORE[1] };

    // Kurir, metode pembayaran, promo
    for (const c of COURIERS) {
      await db.runAsync('INSERT INTO couriers (name, service, base_cost, cost_per_kg, eta_min_days, eta_max_days) VALUES (?, ?, ?, ?, ?, ?)', c);
    }
    for (const m of PAYMENT_METHODS) {
      await db.runAsync('INSERT INTO payment_methods (type, name, fee, note) VALUES (?, ?, ?, ?)', m);
    }
    for (const [code, title, desc, type, value, minSpend, maxDiscount] of PROMOS) {
      await db.runAsync(
        'INSERT INTO promos (code, title, description, type, value, min_spend, max_discount, starts_at, ends_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [code, title, desc, type, value, minSpend, maxDiscount, '2026-01-01', '2030-12-31']
      );
    }

    // Produk + varian + ulasan
    for (const p of PRODUCTS) {
      const storeKey = p.st || STORE_BY_CATEGORY[p.cat];
      const { name: storeName, city } = storeInfo[storeKey];
      const preset = typeof p.v === 'string' ? VARIANT_PRESETS[p.v] : p.v;
      const variantList = preset ? preset[1] : [];
      const perVariant = variantList.map(() => int(3, 28));
      const stock = preset ? perVariant.reduce((a, b) => a + b, 0) : int(8, 150);
      const sold = Math.floor(Math.pow(rand(), 2.2) * 4800) + int(5, 60);
      const weight = p.w || WEIGHT_BY_CATEGORY[p.cat] || 400;
      const brand = p.b || storeName;

      const r = await db.runAsync(
        `INSERT INTO products (store_id, category_id, name, description, brand, price, stock, sold, condition, weight_gram, emoji, variant_label, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now', ?), datetime('now'))`,
        [
          storeId[storeKey], categoryId[p.cat], p.name, descriptionFor(p, storeName, city), brand, p.price,
          stock, sold, p.c === 'bekas' ? 'bekas' : 'baru', weight, p.emoji, preset ? preset[0] : null, `-${int(1, 300)} days`,
        ]
      );
      const productId = r.lastInsertRowId;
      for (let i = 0; i < variantList.length; i++) {
        await db.runAsync('INSERT INTO product_variants (product_id, name, price_delta, stock) VALUES (?, ?, ?, ?)', [
          productId, variantList[i][0], variantList[i][1], perVariant[i],
        ]);
      }

      // 2–5 ulasan dari pembeli berbeda (rating dihitung otomatis oleh trigger)
      const reviewCount = int(2, 5);
      const pool = [...reviewerIds];
      for (let i = 0; i < reviewCount; i++) {
        const uid = pool.splice(Math.floor(rand() * pool.length), 1)[0];
        const roll = rand();
        const rating = roll < 0.55 ? 5 : roll < 0.82 ? 4 : roll < 0.93 ? 3 : 2;
        const texts = REVIEW_TEXT[rating];
        await db.runAsync(
          `INSERT INTO reviews (product_id, user_id, rating, comment, created_at, updated_at)
           VALUES (?, ?, ?, ?, datetime('now', ?), datetime('now', ?))`,
          [productId, uid, rating, texts[Math.floor(rand() * texts.length)], `-${int(1, 200)} days`, `-${int(0, 1)} days`]
        );
      }
    }

    // Alamat contoh untuk akun demo
    await db.runAsync(
      `INSERT INTO addresses (user_id, label, recipient, phone, street, city, province, postal_code, is_default)
       VALUES (?, 'Kos', 'Demo Pasarin', '081234567890', 'Jl. Rungkut Madya No. 1, Gunung Anyar', 'Surabaya', 'Jawa Timur', '60294', 1)`,
      [demo.lastInsertRowId]
    );
  });
}
