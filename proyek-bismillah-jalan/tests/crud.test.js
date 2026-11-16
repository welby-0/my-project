import { Alert } from 'react-native';
import { render } from '@testing-library/react-native';
import React from 'react';
import App from '../App';
import { renderApp, loginDemo, screen, fireEvent, waitFor, WAIT } from './helpers/app';
import * as DB from '../db';

beforeEach(() => {
  jest.spyOn(Alert, 'alert').mockImplementation((_t, _m, buttons = []) => {
    const confirm = buttons.find((b) => b.style === 'destructive') || buttons.find((b) => b.style !== 'cancel');
    confirm?.onPress?.();
  });
});
afterEach(() => jest.restoreAllMocks());

const press = (id) => fireEvent.press(screen.getByTestId(id));
const pressText = (t) => fireEvent.press(screen.getByText(t));
const type = (id, text) => fireEvent.changeText(screen.getByTestId(id), text);
const findText = (t) => screen.findByText(t, {}, WAIT);
const findId = (id) => screen.findByTestId(id, {}, WAIT);

async function reopen() {
  render(React.createElement(App));
  await screen.findByText('Produk untukmu', {}, WAIT);
}
async function goAccount() {
  press('tab-akun');
  await findId('account-name');
}
async function productByName(name) {
  const db = await DB.getDb();
  return db.getFirstAsync('SELECT * FROM products WHERE name = ?', [name]);
}

describe('CRUD lewat UI (akun demo)', () => {
  test('masuk akun demo lewat tombol demo', async () => {
    await renderApp();
    await loginDemo();
  });

  test('Toko Saya: tambah produk bervarian, ubah, sembunyikan, hapus', async () => {
    await reopen();
    await goAccount();
    press('menu-store');
    expect(await findId('store-title')).toHaveTextContent('Toko Demo Pasarin');
    expect(await findText('Kaos Sablon Custom Polos')).toBeTruthy(); // 4 produk contoh

    // CREATE
    press('store-add-product');
    await findId('product-name');
    fireEvent.press(screen.getByTestId('product-save'));
    expect(await findText('Nama produk minimal 3 huruf')).toBeTruthy();
    expect(screen.getByText('Pilih kategori produk')).toBeTruthy();

    type('product-name', 'Rak Sepatu Bambu Uji');
    press('product-category');
    fireEvent.press(await findText('Rak & Penyimpanan'));
    type('product-price', '85000');
    type('product-weight', '1500');
    fireEvent(screen.getByTestId('product-has-variants'), 'valueChange', true);
    type('variant-name-0', '3 Tingkat');
    type('variant-stock-0', '4');
    press('variant-add');
    type('variant-name-1', '4 Tingkat');
    type('variant-delta-1', '25000');
    type('variant-stock-1', '6');
    press('product-save');
    await findText('Produk ditambahkan');
    expect(await findText('Rak Sepatu Bambu Uji')).toBeTruthy();

    const created = await productByName('Rak Sepatu Bambu Uji');
    expect(created.stock).toBe(10);
    expect(created.variant_label).toBe('Ukuran');
    const db = await DB.getDb();
    const variants = await db.getAllAsync('SELECT name, price_delta, stock FROM product_variants WHERE product_id = ? ORDER BY id', [created.id]);
    expect(variants).toEqual([{ name: '3 Tingkat', price_delta: 0, stock: 4 }, { name: '4 Tingkat', price_delta: 25000, stock: 6 }]);

    // UPDATE
    press(`product-edit-${created.id}`);
    await findId('product-price');
    await waitFor(() => expect(screen.getByTestId('product-name').props.value).toBe('Rak Sepatu Bambu Uji'), WAIT);
    type('product-price', '90000');
    type('variant-stock-0', '9');
    press('product-save');
    await findText('Produk diperbarui');
    expect((await productByName('Rak Sepatu Bambu Uji')).price).toBe(90000);
    expect((await productByName('Rak Sepatu Bambu Uji')).stock).toBe(15);

    // hide / show
    press(`product-toggle-${created.id}`);
    await findText('Produk disembunyikan');
    expect((await productByName('Rak Sepatu Bambu Uji')).is_active).toBe(0);
    press(`product-toggle-${created.id}`);
    await findText('Produk ditampilkan');

    // DELETE
    press(`product-delete-${created.id}`);
    await findText('Produk dihapus');
    expect(await productByName('Rak Sepatu Bambu Uji')).toBeNull();
  });

  test('Toko Saya: ubah nama toko', async () => {
    await reopen();
    await goAccount();
    press('menu-store');
    await findId('store-edit');
    press('store-edit');
    await findId('store-name');
    await waitFor(() => expect(screen.getByTestId('store-name').props.value).toBe('Toko Demo Pasarin'), WAIT);
    type('store-name', 'Toko Demo Baru');
    press('store-save');
    await findText('Toko diperbarui');
    expect(await findId('store-title')).toHaveTextContent('Toko Demo Baru');
  });

  test('Alamat saya: tambah, jadikan utama, ubah, hapus', async () => {
    await reopen();
    await goAccount();
    press('menu-addresses');
    await findText('Kos');
    press('address-add');
    await findId('address-recipient');
    type('address-phone', '081355577799');
    type('address-street', 'Jl. Ketintang Baru No. 12');
    type('address-city', 'Surabaya');
    type('address-postal', '60231');
    press('address-province');
    fireEvent.press(await findText('Jawa Timur'));
    pressText('Kantor');
    press('address-save');
    await findText('Alamat disimpan');
    await findText('Jl. Ketintang Baru No. 12, Surabaya, Jawa Timur 60231');

    const db = await DB.getDb();
    let rows = await db.getAllAsync('SELECT id, label, is_default FROM addresses WHERE user_id = 1 ORDER BY id');
    expect(rows).toHaveLength(2);
    const added = rows[1];
    press(`address-default-${added.id}`);
    await findText('Alamat utama diganti');
    rows = await db.getAllAsync('SELECT id, is_default FROM addresses WHERE user_id = 1 ORDER BY id');
    expect(rows.find((r) => r.id === added.id).is_default).toBe(1);

    press(`address-edit-${added.id}`);
    await waitFor(() => expect(screen.getByTestId('address-street').props.value).toBe('Jl. Ketintang Baru No. 12'), WAIT);
    type('address-street', 'Jl. Ketintang Madya No. 99');
    press('address-save');
    await findText('Alamat diperbarui');
    await findText('Jl. Ketintang Madya No. 99, Surabaya, Jawa Timur 60231');

    press(`address-delete-${added.id}`);
    await findText('Alamat dihapus');
    rows = await db.getAllAsync('SELECT id, is_default FROM addresses WHERE user_id = 1');
    expect(rows).toHaveLength(1);
    expect(rows[0].is_default).toBe(1); // alamat utama dipindahkan otomatis
  });

  test('Ulasan: tulis, ubah, hapus dari halaman produk', async () => {
    const p = await productByName('Kaos Polos Cotton Combed 30s');
    await reopen();
    press('home-search');
    fireEvent.changeText(await findId('search-input'), 'kaos polos cotton');
    fireEvent.press(await findText('Kaos Polos Cotton Combed 30s'));
    await findId('detail-name');
    const before = (await DB.getProduct(p.id)).rating_count;

    press('detail-review');
    await findText('Bagaimana kualitas produk ini?');
    fireEvent.press(screen.getByTestId('review-save'));
    expect(await findText('Pilih rating bintang dulu')).toBeTruthy();
    fireEvent.press(screen.getByLabelText('4 bintang'));
    type('review-comment', 'Bahannya adem dan jahitannya rapi');
    press('review-save');
    await findText('Terima kasih atas ulasanmu!');
    expect((await DB.getProduct(p.id)).rating_count).toBe(before + 1);
    expect(await findText('Bahannya adem dan jahitannya rapi')).toBeTruthy();
    expect(screen.getByText('Demo Pasarin (kamu)')).toBeTruthy();

    press('detail-review');
    await waitFor(() => expect(screen.getByTestId('review-comment').props.value).toBe('Bahannya adem dan jahitannya rapi'), WAIT);
    fireEvent.press(screen.getByLabelText('5 bintang'));
    press('review-save');
    await findText('Ulasan diperbarui');
    expect((await DB.getUserReview(p.id, 1)).rating).toBe(5);

    press('review-delete');
    await findText('Ulasan dihapus');
    await waitFor(async () => expect((await DB.getProduct(p.id)).rating_count).toBe(before), WAIT);
  });

  test('Favorit: simpan dari kartu produk lalu muncul di halaman Favorit', async () => {
    const p = await productByName('Tempered Glass Anti Gores Full Cover');
    await reopen();
    press('home-search');
    fireEvent.changeText(await findId('search-input'), 'tempered glass');
    await findText('Tempered Glass Anti Gores Full Cover');
    fireEvent.press(await findId(`wish-${p.id}`));
    await findText('Disimpan ke favorit');
    expect(await DB.listWishlistIds(1)).toContain(p.id);
    fireEvent.press(screen.getByTestId('search-back'));
    await findText('Produk untukmu');
    await goAccount();
    press('menu-wishlist');
    expect(await findText('Tempered Glass Anti Gores Full Cover')).toBeTruthy();
    fireEvent.press(screen.getByTestId(`wish-${p.id}`));
    await waitFor(() => expect(screen.queryByText('Tempered Glass Anti Gores Full Cover')).toBeNull(), WAIT);
    await findText('Belum ada favorit');
  });

  test('Promo GAJIAN50 dipakai di checkout (diskon 50% maks Rp50.000)', async () => {
    const monitor = await productByName('Monitor LED 24" IPS 75Hz'); // Rp1.399.000
    await DB.addToCart(1, monitor.id, null, 1);
    await reopen();
    press('home-promo');
    await findId('promo-use-GAJIAN50');
    press('promo-use-GAJIAN50');
    await findText('Promo GAJIAN50 dipakai');
    fireEvent.press(screen.getByText('Ke keranjang'));
    await findId('cart-checkout');
    press('cart-checkout');
    await findId('checkout-pay');
    await findText('Hemat Rp50.000');
    press('payment-5'); // GoPay (tanpa biaya)
    // kurir termurah: AnterAja 8.500 (<= 4,2 kg -> 5 kg: 8.500 + 4 x 3.500 = 22.500)
    await waitFor(() => expect(screen.getByTestId('checkout-total')).toHaveTextContent('Rp1.371.500'), WAIT); // 1.399.000 + 22.500 - 50.000
    press('checkout-pay');
    await findText('Pesanan berhasil!');
    const db = await DB.getDb();
    const o = await db.getFirstAsync('SELECT * FROM orders ORDER BY id DESC LIMIT 1');
    expect(o.promo_code).toBe('GAJIAN50');
    expect(o.discount).toBe(50000);
    expect(o.status).toBe('menunggu_pembayaran');
  });

  test('Pesanan: batalkan (stok kembali), beli lagi, hapus riwayat', async () => {
    const monitor = await productByName('Monitor LED 24" IPS 75Hz');
    const stockNow = (await DB.getProduct(monitor.id)).stock;
    await reopen();
    await goAccount();
    press('menu-orders');
    const db = await DB.getDb();
    const order = await db.getFirstAsync('SELECT id FROM orders ORDER BY id DESC LIMIT 1');
    fireEvent.press(await findId(`order-${order.id}`));
    await findId('order-cancel');
    press('order-cancel');
    await findText('Pesanan dibatalkan.');
    expect((await DB.getProduct(monitor.id)).stock).toBe(stockNow + 1);
    press('order-reorder');
    await findText('1 produk masuk keranjang');
    expect(await DB.getCartCount(1)).toBe(1);
    press('order-delete');
    await findText('Riwayat pesanan dihapus');
    expect(await DB.getOrder(1, order.id)).toBeNull();
    await findText('Belum ada pesanan');
  });

  test('Profil: ubah nama dan kata sandi', async () => {
    await reopen();
    await goAccount();
    pressText('Ubah');
    await findId('profile-name');
    type('profile-name', 'Demo Pasarin Baru');
    press('profile-save');
    await findText('Profil diperbarui');
    expect((await DB.getUser(1)).name).toBe('Demo Pasarin Baru');

    press('pass-save');
    expect(await findText('Isi kata sandi lama')).toBeTruthy();
    type('pass-old', 'pasarin123');
    type('pass-new', 'sandibaru1');
    type('pass-confirm', 'sandibaru1');
    press('pass-save');
    await findText('Kata sandi diganti');
    expect((await DB.loginUser('demo@pasarin.id', 'sandibaru1')).id).toBe(1);
  });

  test('Keluar membuka layar Masuk; reset data demo mengembalikan data awal', async () => {
    await reopen();
    await goAccount();
    press('menu-logout');
    await findText('Selamat datang di PASARIN');
    expect(await DB.getSessionUserId()).toBeNull();

    // masuk lagi dengan sandi baru, lalu reset
    fireEvent.changeText(screen.getByTestId('login-identifier'), 'demo@pasarin.id');
    fireEvent.changeText(screen.getByTestId('login-password'), 'sandibaru1');
    press('login-submit');
    await findText('Produk untukmu');
    await goAccount();
    press('menu-reset');
    await findText('Selamat datang di PASARIN');
    const again = await DB.loginUser('demo@pasarin.id', 'pasarin123');
    expect(again.name).toBe('Demo Pasarin');
  });
});
