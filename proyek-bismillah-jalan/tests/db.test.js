import * as DB from '../db';
import { DEMO_ACCOUNT } from '../utils/constants';

let demo;
let buyer;

beforeAll(async () => {
  demo = await DB.loginUser(DEMO_ACCOUNT.email, DEMO_ACCOUNT.password);
  buyer = await DB.registerUser({ name: 'Welby Tester', identifier: '0812-9999-0001', password: 'rahasia1' });
});

describe('seed & skema', () => {
  test('data awal lengkap', async () => {
    const db = await DB.getDb();
    const n = async (t) => (await db.getFirstAsync(`SELECT COUNT(*) AS n FROM ${t}`)).n;
    expect(await n('products')).toBe(178);
    expect(await n('categories')).toBe(17 + 62);
    expect(await n('stores')).toBe(19);
    expect(await n('couriers')).toBe(6);
    expect(await n('payment_methods')).toBe(9);
    expect(await n('promos')).toBe(4);
    expect(await n('reviews')).toBeGreaterThan(400);
    expect((await db.getFirstAsync('SELECT COUNT(*) AS n FROM product_variants')).n).toBeGreaterThan(200);
    const fk = await db.getAllAsync('PRAGMA foreign_key_check');
    expect(fk).toEqual([]);
  });

  test('rating produk dihitung trigger dan stok varian = jumlah stok produk', async () => {
    const db = await DB.getDb();
    const bad = await db.getAllAsync(
      `SELECT p.id FROM products p WHERE p.rating_count <> (SELECT COUNT(*) FROM reviews r WHERE r.product_id = p.id)`
    );
    expect(bad).toEqual([]);
    const mismatch = await db.getAllAsync(
      `SELECT p.id FROM products p WHERE EXISTS (SELECT 1 FROM product_variants v WHERE v.product_id = p.id)
       AND p.stock <> (SELECT SUM(stock) FROM product_variants v WHERE v.product_id = p.id)`
    );
    expect(mismatch).toEqual([]);
  });

  test('pohon kategori', async () => {
    const tree = await DB.listCategoryTree();
    expect(tree).toHaveLength(17);
    expect(tree[0].children.length).toBeGreaterThan(0);
  });
});

describe('akun', () => {
  test('masuk dengan akun demo & ditolak bila sandi salah', async () => {
    expect(demo.email).toBe('demo@pasarin.id');
    await expect(DB.loginUser('demo@pasarin.id', 'salah')).rejects.toThrow('kata sandi salah');
    await expect(DB.loginUser('tidak-ada@x.id', 'abcdef')).rejects.toThrow('kata sandi salah');
  });
  test('masuk dengan nomor HP berbagai format', async () => {
    const u = await DB.loginUser('+62 812 9999 0001', 'rahasia1');
    expect(u.id).toBe(buyer.id);
    expect(u.phone).toBe('081299990001');
  });
  test('daftar duplikat & validasi', async () => {
    await expect(DB.registerUser({ name: 'X', identifier: 'a@b.co', password: '123456' })).rejects.toThrow('Nama minimal');
    await expect(DB.registerUser({ name: 'Budi Baru', identifier: 'demo@pasarin.id', password: '123456' })).rejects.toThrow('sudah terdaftar');
    await expect(DB.registerUser({ name: 'Budi Baru', identifier: 'abc', password: '123456' })).rejects.toThrow('Nomor HP');
    await expect(DB.registerUser({ name: 'Budi Baru', identifier: 'budi@x.id', password: '123' })).rejects.toThrow('minimal 6');
  });
  test('ubah profil, ubah sandi, sesi', async () => {
    const u = await DB.registerUser({ name: 'Ubah Profil', identifier: 'ubah@x.id', password: 'abcdef' });
    const up = await DB.updateUser(u.id, { name: 'Nama Baru', email: 'ubah@x.id', phone: '0877-1111-2222' });
    expect(up.name).toBe('Nama Baru');
    expect(up.phone).toBe('087711112222');
    await expect(DB.updateUser(u.id, { name: 'Nama Baru', email: 'demo@pasarin.id', phone: '' })).rejects.toThrow('dipakai akun lain');
    await expect(DB.changePassword(u.id, 'salah', 'abcdef1')).rejects.toThrow('lama salah');
    await DB.changePassword(u.id, 'abcdef', 'abcdef1');
    await expect(DB.loginUser('ubah@x.id', 'abcdef')).rejects.toThrow();
    expect((await DB.loginUser('ubah@x.id', 'abcdef1')).id).toBe(u.id);
    await DB.setSessionUserId(u.id);
    expect(await DB.getSessionUserId()).toBe(u.id);
    await DB.setSessionUserId(null);
    expect(await DB.getSessionUserId()).toBeNull();
    await DB.deleteUser(u.id);
    expect(await DB.getUser(u.id)).toBeNull();
  });
});

describe('pencarian & daftar produk', () => {
  test('cari "rak sepatu" menemukan rak sepatu', async () => {
    const items = await DB.listProducts({ q: 'rak sepatu', sort: 'relevan' });
    expect(items.length).toBeGreaterThanOrEqual(2);
    expect(items[0].name.toLowerCase()).toContain('rak sepatu');
    expect(await DB.countProducts({ q: 'rak sepatu' })).toBe(items.length);
  });
  test('cari "sepatu" juga memuat rak dan kategori sepatu', async () => {
    expect(await DB.countProducts({ q: 'sepatu' })).toBeGreaterThan(10);
  });
  test('cari HP', async () => {
    const items = await DB.listProducts({ q: 'smartphone' });
    expect(items.length).toBeGreaterThanOrEqual(3);
  });
  test('filter kategori induk, harga, dan urutan', async () => {
    const tree = await DB.listCategoryTree();
    const hp = tree.find((c) => c.slug === 'hp-tablet');
    const all = await DB.listProducts({ categoryId: hp.id }, { limit: 100 });
    expect(all.length).toBe(12);
    const sub = await DB.listProducts({ categoryId: hp.children[0].id }, { limit: 100 });
    expect(sub.length).toBe(4);
    const cheap = await DB.listProducts({ categoryId: hp.id, sort: 'termurah' }, { limit: 100 });
    expect(cheap[0].price).toBeLessThanOrEqual(cheap[1].price);
    const ranged = await DB.listProducts({ categoryId: hp.id, minPrice: 100000, maxPrice: 200000 }, { limit: 100 });
    expect(ranged.every((p) => p.price >= 100000 && p.price <= 200000)).toBe(true);
  });
  test('paginasi tidak tumpang tindih', async () => {
    const a = await DB.listProducts({ sort: 'terlaris' }, { limit: 10, offset: 0 });
    const b = await DB.listProducts({ sort: 'terlaris' }, { limit: 10, offset: 10 });
    expect(a).toHaveLength(10);
    expect(new Set([...a, ...b].map((p) => p.id)).size).toBe(20);
  });
  test('karakter % dan _ pada pencarian tidak jadi wildcard', async () => {
    // '%' dicari sebagai karakter biasa: hanya produk dengan tanda % di namanya (Niacinamide 10%), bukan semua produk
    expect(await DB.countProducts({ q: '%' })).toBe(1);
    expect(await DB.countProducts({ q: '_' })).toBe(0);
    expect(await DB.countProducts({ q: "'; DROP TABLE products;--" })).toBe(0);
  });
  test('detail produk lengkap', async () => {
    const [first] = await DB.listProducts({ q: 'rak sepatu susun' });
    const p = await DB.getProduct(first.id);
    expect(p.variants.length).toBe(3);
    expect(p.category.parent_name).toBe('Rumah Tangga');
    expect(p.store_name).toBeTruthy();
  });
});

async function findCourier(name, service) {
  return (await DB.listCouriers()).find((c) => c.name === name && c.service === service);
}

describe('keranjang & checkout', () => {
  let shoe;
  let simple;
  beforeAll(async () => {
    shoe = await DB.getProduct((await DB.listProducts({ q: 'Sneakers Pria Casual' }))[0].id);
    simple = await DB.getProduct((await DB.listProducts({ q: 'Tempered Glass' }))[0].id);
  });

  test('produk bervarian wajib memilih varian', async () => {
    await expect(DB.addToCart(buyer.id, shoe.id, null, 1)).rejects.toThrow('Pilih varian');
  });
  test('tambah, gabung baris yang sama, batasi stok, ubah jumlah, hapus', async () => {
    const v = shoe.variants[0];
    const id1 = await DB.addToCart(buyer.id, shoe.id, v.id, 1);
    const id2 = await DB.addToCart(buyer.id, shoe.id, v.id, 1);
    expect(id2).toBe(id1);
    const cart = await DB.getCart(buyer.id);
    expect(cart).toHaveLength(1);
    expect(cart[0].qty).toBe(2);
    await expect(DB.addToCart(buyer.id, shoe.id, v.id, 9999)).rejects.toThrow('Stok hanya tersisa');
    await DB.setCartQty(buyer.id, id1, 3);
    expect((await DB.getCart(buyer.id))[0].qty).toBe(3);
    await expect(DB.setCartQty(buyer.id, id1, 99999)).rejects.toThrow('Stok hanya tersisa');
    expect(await DB.getCartCount(buyer.id)).toBe(3);
    await DB.removeCartItem(buyer.id, id1);
    expect(await DB.getCart(buyer.id)).toHaveLength(0);
    expect(await DB.getCartCount(buyer.id)).toBe(0);
  });
  test('pemilik toko tidak bisa membeli produk sendiri', async () => {
    const own = (await DB.listProducts({ storeId: (await DB.getStoreByOwner(demo.id)).id }))[0];
    await expect(DB.addToCart(demo.id, own.id, null, 1)).rejects.toThrow('tokomu sendiri');
  });

  test('alur lengkap: alamat -> checkout transfer + promo -> bayar -> kirim -> terima', async () => {
    const addr = await DB.createAddress(buyer.id, {
      label: 'Rumah', recipient: 'Welby', phone: '0812-9999-0001', street: 'Jl. Rungkut Madya No. 1',
      city: 'Surabaya', province: 'Jawa Timur', postalCode: '60294',
    });
    expect(addr.is_default).toBe(1);

    const v = shoe.variants[1];
    const stockBefore = (await DB.getProduct(shoe.id)).stock;
    const soldBefore = (await DB.getProduct(shoe.id)).sold;
    const l1 = await DB.addToCart(buyer.id, shoe.id, v.id, 2);
    const l2 = await DB.addToCart(buyer.id, simple.id, null, 1);
    await DB.setCartSelected(buyer.id, l2, false);

    const couriers = [await findCourier('JNE', 'Reguler')];
    const payments = await DB.listPaymentMethods();
    const transfer = payments.find((p) => p.type === 'transfer' && p.fee > 0);

    const lines = (await DB.getCart(buyer.id)).filter((l) => l.selected);
    expect(lines).toHaveLength(1);
    const q = await DB.quoteOrder({ lines, courier: couriers[0], payment: transfer, promoCode: 'GAJIAN50' });
    expect(q.subtotal).toBe(189000 * 2);
    expect(q.discount).toBe(50000); // 50% dibatasi maksimal 50.000
    expect(q.shipping).toBe(10000 + 4000); // 2 x 900 g = 1,8 kg -> 2 kg
    expect(q.total).toBe(q.subtotal + q.shipping + 1000 - 50000);

    await expect(
      DB.placeOrder(buyer.id, { addressId: addr.id, courierId: couriers[0].id, paymentId: transfer.id, promoCode: 'NGASAL' })
    ).rejects.toThrow('Kode promo');

    const order = await DB.placeOrder(buyer.id, {
      addressId: addr.id, courierId: couriers[0].id, paymentId: transfer.id, promoCode: 'gajian50', note: 'Tolong dibungkus rapi',
    });
    expect(order.status).toBe('menunggu_pembayaran');
    expect(order.total).toBe(q.total);
    expect(order.order_no).toMatch(/^PSR-\d{6}-[A-Z0-9]{5}$/);

    // stok & cart
    const after = await DB.getProduct(shoe.id);
    expect(after.stock).toBe(stockBefore - 2);
    expect(after.sold).toBe(soldBefore + 2);
    const cartAfter = await DB.getCart(buyer.id);
    expect(cartAfter.map((l) => l.id)).toEqual([l2]); // barang tidak dicentang tetap di keranjang
    void l1;

    const detail = await DB.getOrder(buyer.id, order.id);
    expect(detail.items).toHaveLength(1);
    expect(detail.promo_code).toBe('GAJIAN50');
    expect(detail.note).toBe('Tolong dibungkus rapi');

    await expect(DB.advanceOrder(buyer.id, order.id, 'kirim')).rejects.toThrow('Status pesanan sudah berubah');
    await DB.advanceOrder(buyer.id, order.id, 'bayar');
    await DB.advanceOrder(buyer.id, order.id, 'kirim');
    await expect(DB.advanceOrder(buyer.id, order.id, 'batal')).rejects.toThrow();
    await DB.advanceOrder(buyer.id, order.id, 'terima');
    expect((await DB.getOrder(buyer.id, order.id)).status).toBe('selesai');
    expect((await DB.countOrdersByStatus(buyer.id)).selesai).toBe(1);

    const { added } = await DB.reorder(buyer.id, order.id);
    expect(added).toBe(1);
    await DB.deleteOrder(buyer.id, order.id);
    expect(await DB.getOrder(buyer.id, order.id)).toBeNull();
  });

  test('COD langsung dikemas; batal mengembalikan stok & jumlah terjual', async () => {
    const [addr] = await DB.listAddresses(buyer.id);
    const cod = (await DB.listPaymentMethods()).find((p) => p.type === 'cod');
    const courier = (await DB.listCouriers())[2];
    for (const l of await DB.getCart(buyer.id)) await DB.removeCartItem(buyer.id, l.id);
    const before = await DB.getProduct(simple.id);
    await DB.addToCart(buyer.id, simple.id, null, 3);
    const order = await DB.placeOrder(buyer.id, { addressId: addr.id, courierId: courier.id, paymentId: cod.id });
    expect(order.status).toBe('dikemas');
    expect((await DB.getProduct(simple.id)).stock).toBe(before.stock - 3);
    await DB.advanceOrder(buyer.id, order.id, 'batal');
    const restored = await DB.getProduct(simple.id);
    expect(restored.stock).toBe(before.stock);
    expect(restored.sold).toBe(before.sold);
    await expect(DB.deleteOrder(buyer.id, 99999)).rejects.toThrow('tidak ditemukan');
    await DB.deleteOrder(buyer.id, order.id);
  });

  test('checkout gagal bila tidak ada barang terpilih / stok kurang / alamat kosong', async () => {
    const [addr] = await DB.listAddresses(buyer.id);
    const courier = (await DB.listCouriers())[0];
    const pay = (await DB.listPaymentMethods())[0];
    await DB.addToCart(buyer.id, simple.id, null, 1);
    await DB.setAllCartSelected(buyer.id, false);
    await expect(DB.placeOrder(buyer.id, { addressId: addr.id, courierId: courier.id, paymentId: pay.id })).rejects.toThrow('Pilih minimal satu barang');
    await DB.setAllCartSelected(buyer.id, true);
    await expect(DB.placeOrder(buyer.id, { addressId: 99999, courierId: courier.id, paymentId: pay.id })).rejects.toThrow('alamat');
    // transaksi di-rollback: keranjang tetap utuh
    expect((await DB.getCart(buyer.id)).length).toBeGreaterThan(0);
  });

  test('promo: minimal belanja dan potongan ongkir', async () => {
    const lines = [{ line_total: 30000, weight_gram: 300, qty: 1 }];
    const courier = await findCourier('JNE', 'Reguler');
    const low = await DB.quoteOrder({ lines, courier, payment: null, promoCode: 'GAJIAN50' });
    expect(low.discount).toBe(0);
    expect(low.promoError).toContain('Minimal belanja Rp100.000');
    const ship = await DB.quoteOrder({ lines, courier, payment: null, promoCode: 'ONGKIRHEMAT' });
    expect(ship.discount).toBe(10000); // ongkir 10.000 < batas 15.000
    expect(ship.total).toBe(30000);
  });
});

describe('CRUD produk milik toko', () => {
  test('buka toko -> tambah -> ubah (varian) -> sembunyikan -> hapus', async () => {
    const seller = await DB.registerUser({ name: 'Penjual Baru', identifier: 'penjual@x.id', password: 'abcdef' });
    await expect(DB.createProduct(seller.id, { name: 'Tes', categoryId: 1, price: 1000, weightGram: 100, stock: 1 })).rejects.toThrow('Buka toko dulu');
    const store = await DB.createStore(seller.id, { name: 'Toko Penjual', city: 'Malang', description: 'Halo' });
    expect(store.owner_id).toBe(seller.id);
    await expect(DB.createStore(seller.id, { name: 'Toko Lain', city: 'Malang' })).rejects.toThrow('sudah memiliki toko');

    const cat = (await DB.listCategoryTree()).find((c) => c.slug === 'rumah-tangga').children[0];
    const created = await DB.createProduct(seller.id, {
      name: 'Rak Sepatu Bambu', categoryId: cat.id, price: 150000, stock: 5, weightGram: 3000, emoji: '🗄️',
      variantLabel: 'Tingkat', variants: [{ name: '3 Tingkat', priceDelta: 0, stock: 4 }, { name: '4 Tingkat', priceDelta: 30000, stock: 6 }],
    });
    expect(created.stock).toBe(10); // stok = jumlah stok varian
    expect(created.variants).toHaveLength(2);
    expect(created.brand).toBe('Toko Penjual');

    // pembeli menaruh varian 4 tingkat di keranjang
    const v4 = created.variants.find((v) => v.name === '4 Tingkat');
    await DB.addToCart(buyer.id, created.id, v4.id, 1);

    const v3 = created.variants.find((v) => v.name === '3 Tingkat');
    const updated = await DB.updateProduct(seller.id, created.id, {
      name: 'Rak Sepatu Bambu Premium', categoryId: cat.id, price: 160000, stock: 0, weightGram: 3000, emoji: '🗄️',
      variantLabel: 'Tingkat', variants: [{ id: v3.id, name: '3 Susun', priceDelta: 0, stock: 7 }, { name: '5 Susun', priceDelta: 50000, stock: 2 }],
    });
    expect(updated.name).toBe('Rak Sepatu Bambu Premium');
    expect(updated.variants.map((v) => v.name).sort()).toEqual(['3 Susun', '5 Susun']);
    expect(updated.stock).toBe(9);
    // varian 4 tingkat dihapus -> baris keranjang ikut hilang
    expect((await DB.getCart(buyer.id)).some((l) => l.product_id === created.id)).toBe(false);

    await expect(DB.updateProduct(demo.id, created.id, { name: 'Curi', categoryId: cat.id, price: 1000, weightGram: 1, stock: 1 })).rejects.toThrow('tokomu');
    await expect(DB.updateProduct(seller.id, created.id, { name: 'ab', categoryId: cat.id, price: 1000, weightGram: 1, stock: 1 })).rejects.toThrow('minimal 3');
    await expect(DB.updateProduct(seller.id, created.id, { name: 'Valid Nama', categoryId: cat.id, price: 50, weightGram: 1, stock: 1 })).rejects.toThrow('Harga minimal');
    await expect(DB.updateProduct(seller.id, created.id, {
      name: 'Valid Nama', categoryId: cat.id, price: 1000, weightGram: 1, variants: [{ name: 'A', stock: 1 }, { name: 'a', stock: 1 }],
    })).rejects.toThrow('dipakai dua kali');

    await DB.setProductActive(seller.id, created.id, false);
    expect(await DB.countProducts({ q: 'Bambu Premium' })).toBe(0);
    expect((await DB.listStoreProducts(store.id)).find((p) => p.id === created.id).is_active).toBe(0);
    await expect(DB.addToCart(buyer.id, created.id, v3.id, 1)).rejects.toThrow('tidak tersedia');
    await DB.setProductActive(seller.id, created.id, true);
    expect(await DB.countProducts({ q: 'Bambu Premium' })).toBe(1);

    const stats = await DB.getStoreStats(store.id);
    expect(stats.products).toBe(1);

    await DB.deleteProduct(seller.id, created.id);
    expect(await DB.getProduct(created.id)).toBeNull();
    await DB.updateStore(seller.id, { name: 'Toko Penjual Baru', city: 'Batu', description: '' });
    expect((await DB.getStoreByOwner(seller.id)).city).toBe('Batu');
    await DB.deleteStore(seller.id);
    expect(await DB.getStoreByOwner(seller.id)).toBeNull();
  });

  test('toko demo punya 4 produk contoh', async () => {
    const store = await DB.getStoreByOwner(demo.id);
    expect((await DB.getStoreStats(store.id)).products).toBe(4);
  });
});

describe('alamat', () => {
  test('alamat utama dijaga saat tambah, ubah, hapus', async () => {
    const user = await DB.registerUser({ name: 'Alamat Tester', identifier: 'alamat@x.id', password: 'abcdef' });
    const base = { label: 'Rumah', recipient: 'A', phone: '081200000001', street: 'Jl. Mawar 12 RT 1', city: 'Surabaya', province: 'Jawa Timur', postalCode: '60111' };
    const a1 = await DB.createAddress(user.id, base);
    const a2 = await DB.createAddress(user.id, { ...base, label: 'Kantor', isDefault: true });
    const a3 = await DB.createAddress(user.id, { ...base, label: 'Kos' });
    let list = await DB.listAddresses(user.id);
    expect(list.filter((a) => a.is_default)).toHaveLength(1);
    expect(list[0].id).toBe(a2.id);
    await DB.setDefaultAddress(user.id, a3.id);
    expect((await DB.listAddresses(user.id))[0].id).toBe(a3.id);
    const edited = await DB.updateAddress(user.id, a1.id, { ...base, street: 'Jl. Melati 99 No. 3' });
    expect(edited.street).toContain('Melati');
    await DB.deleteAddress(user.id, a3.id);
    list = await DB.listAddresses(user.id);
    expect(list).toHaveLength(2);
    expect(list.filter((a) => a.is_default)).toHaveLength(1);
    await expect(DB.createAddress(user.id, { ...base, postalCode: '12' })).rejects.toThrow('Kode pos');
    await expect(DB.createAddress(user.id, { ...base, phone: '123' })).rejects.toThrow('Nomor HP');
    await expect(DB.updateAddress(user.id, 99999, base)).rejects.toThrow('tidak ditemukan');
  });
});

describe('ulasan, favorit, riwayat cari', () => {
  test('ulasan: buat, ubah, hapus memperbarui rating lewat trigger', async () => {
    const p = (await DB.listProducts({ q: 'Kaos Polos Cotton' }))[0];
    const before = await DB.getProduct(p.id);
    await DB.saveReview(buyer.id, p.id, 1, 'Jelek');
    let now = await DB.getProduct(p.id);
    expect(now.rating_count).toBe(before.rating_count + 1);
    expect(now.rating_avg).toBeLessThanOrEqual(before.rating_avg);
    await DB.saveReview(buyer.id, p.id, 5, 'Ternyata bagus');
    now = await DB.getProduct(p.id);
    expect(now.rating_count).toBe(before.rating_count + 1);
    expect((await DB.getUserReview(p.id, buyer.id)).comment).toBe('Ternyata bagus');
    expect((await DB.listReviews(p.id))[0].user_name).toBe('Welby Tester');
    expect((await DB.ratingBreakdown(p.id))[5]).toBeGreaterThan(0);
    await expect(DB.saveReview(buyer.id, p.id, 7, '')).rejects.toThrow('rating');
    const rev = await DB.getUserReview(p.id, buyer.id);
    await DB.deleteReview(buyer.id, rev.id);
    now = await DB.getProduct(p.id);
    expect(now.rating_count).toBe(before.rating_count);
    expect(now.rating_avg).toBe(before.rating_avg);
  });
  test('tidak bisa mengulas produk sendiri', async () => {
    const own = (await DB.listProducts({ storeId: (await DB.getStoreByOwner(demo.id)).id }))[0];
    await expect(DB.saveReview(demo.id, own.id, 5, 'Bagus')).rejects.toThrow('tokomu sendiri');
  });
  test('favorit bisa dinyalakan dan dimatikan', async () => {
    const p = (await DB.listProducts({ q: 'Tempered Glass' }))[0];
    expect(await DB.toggleWishlist(buyer.id, p.id)).toBe(true);
    expect(await DB.listWishlistIds(buyer.id)).toContain(p.id);
    expect((await DB.listWishlist(buyer.id))[0].name).toContain('Tempered');
    expect(await DB.toggleWishlist(buyer.id, p.id)).toBe(false);
    expect(await DB.listWishlist(buyer.id)).toHaveLength(0);
  });
  test('riwayat pencarian unik per kata, terbaru dulu, bisa dihapus', async () => {
    await DB.addSearchTerm(buyer.id, 'rak sepatu');
    await DB.addSearchTerm(buyer.id, 'hp murah');
    await DB.addSearchTerm(buyer.id, 'rak sepatu');
    await DB.addSearchTerm(buyer.id, 'a'); // terlalu pendek
    const terms = await DB.listSearchTerms(buyer.id);
    expect(terms.map((t) => t.term).sort()).toEqual(['hp murah', 'rak sepatu']);
    await DB.removeSearchTerm(terms[0].id);
    expect(await DB.listSearchTerms(buyer.id)).toHaveLength(1);
    await DB.clearSearchTerms(buyer.id);
    expect(await DB.listSearchTerms(buyer.id)).toHaveLength(0);
  });
});

describe('reset database', () => {
  test('mengembalikan data awal', async () => {
    const db = await DB.getDb();
    await DB.resetDatabase();
    expect((await db.getFirstAsync('SELECT COUNT(*) AS n FROM products')).n).toBe(178);
    expect((await db.getFirstAsync('SELECT COUNT(*) AS n FROM users')).n).toBe(9);
    expect(await DB.getSessionUserId()).toBeNull();
    const again = await DB.loginUser(DEMO_ACCOUNT.email, DEMO_ACCOUNT.password);
    expect(again.name).toBe('Demo Pasarin');
  });
});
