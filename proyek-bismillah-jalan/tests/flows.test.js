import { Alert } from 'react-native';
import { renderApp, screen, fireEvent, waitFor, WAIT } from './helpers/app';
import * as DB from '../db';

// Setiap konfirmasi Alert langsung dijawab dengan tombol "destructive"/konfirmasi
beforeEach(() => {
  jest.spyOn(Alert, 'alert').mockImplementation((_t, _m, buttons = []) => {
    const confirm = buttons.find((b) => b.style === 'destructive') || buttons.find((b) => b.style !== 'cancel');
    confirm?.onPress?.();
  });
});
afterEach(() => jest.restoreAllMocks());

const press = (id) => fireEvent.press(screen.getByTestId(id));
const type = (id, text) => fireEvent.changeText(screen.getByTestId(id), text);
const findText = (t) => screen.findByText(t, {}, WAIT);

async function openTab(id, expectText) {
  press(id);
  await findText(expectText);
}

describe('alur pengguna baru: daftar -> belanja -> bayar -> selesai', () => {
  test('1. daftar akun lewat UI lalu langsung masuk ke beranda', async () => {
    await renderApp();
    press('login-register');
    await findText('Isi data di bawah. Cukup email atau nomor HP, tidak perlu keduanya.');

    fireEvent.press(screen.getByTestId('register-submit'));
    expect(await findText('Nama minimal 3 huruf')).toBeTruthy();
    expect(screen.getByText('Setujui syarat dan ketentuan untuk melanjutkan')).toBeTruthy();

    type('register-name', 'Welby Foriant');
    type('register-identifier', 'welby@contoh.id');
    type('register-password', 'rahasia123');
    type('register-confirm', 'beda-sandi');
    press('register-agree');
    fireEvent.press(screen.getByTestId('register-submit'));
    expect(await findText('Kata sandi tidak sama')).toBeTruthy();

    type('register-confirm', 'rahasia123');
    fireEvent.press(screen.getByTestId('register-submit'));
    await findText('Produk untukmu');
    const db = await DB.getDb();
    const row = await db.getFirstAsync("SELECT name, email FROM users WHERE email = 'welby@contoh.id'");
    expect(row.name).toBe('Welby Foriant');
  });

  test('2. sesi tersimpan: membuka ulang aplikasi langsung ke beranda', async () => {
    await screen_reopen();
    expect(screen.getByTestId('home-search')).toBeTruthy();
  });

  test('3. chip kategori menyaring produk di beranda', async () => {
    await screen_reopen();
    fireEvent.press(await screen.findByTestId('chip-hp-tablet', {}, WAIT));
    await findText('Nova X5 5G 8GB RAM');
    expect(screen.queryByText('Sepatu Sneakers Pria Casual Putih')).toBeNull();
  });

  test('4. cari "rak sepatu", filter urutan harga termurah', async () => {
    await screen_reopen();
    press('home-search');
    const input = await screen.findByTestId('search-input', {}, WAIT);
    fireEvent.changeText(input, 'rak sepatu');
    await findText('Rak Sepatu Susun Besi Anti Karat');
    expect(screen.getByText(/produk untuk “rak sepatu”/)).toBeTruthy();

    press('search-filter');
    press('filter-sort-termurah');
    type('filter-max', '100000');
    press('filter-apply');
    await waitFor(() => expect(screen.queryByText('Rak Sepatu Susun Besi Anti Karat')).toBeNull(), WAIT);
    expect(await findText('Rak Sepatu Lipat Tanpa Pasang')).toBeTruthy();
    // tanda filter aktif bisa dilepas
    press('remove-price');
    await findText('Rak Sepatu Susun Besi Anti Karat');
  });

  test('5. detail produk -> pilih varian -> keranjang -> alamat -> checkout -> bayar -> selesai', async () => {
    await screen_reopen();
    press('home-search');
    fireEvent.changeText(await screen.findByTestId('search-input', {}, WAIT), 'rak sepatu susun');
    const card = await screen.findByText('Rak Sepatu Susun Besi Anti Karat', {}, WAIT);
    fireEvent.press(card);

    // varian wajib dipilih
    await screen.findByTestId('detail-name', {}, WAIT);
    press('detail-add');
    expect(await findText('Pilih tingkat dulu')).toBeTruthy();
    press('variant-4 Tingkat');
    await waitFor(() => expect(screen.getByTestId('detail-price')).toHaveTextContent('Rp169.000'), WAIT);
    press('detail-add');
    expect(await findText('Ditambahkan ke keranjang')).toBeTruthy();
    fireEvent.press(screen.getByText('Lihat'));

    // keranjang
    await screen.findByTestId('cart-list', {}, WAIT);
    await waitFor(() => expect(screen.getByTestId('cart-total')).toHaveTextContent('Rp169.000'), WAIT);
    const qtyAdd = screen.getAllByLabelText('Tambah jumlah')[0];
    fireEvent.press(qtyAdd);
    await waitFor(() => expect(screen.getByTestId('cart-total')).toHaveTextContent('Rp338.000'), WAIT);
    press('cart-checkout');

    // checkout tanpa alamat: tambah alamat dulu
    await findText('Kamu belum punya alamat tersimpan.');
    press('checkout-add-address');
    await findText('Simpan sebagai');
    fireEvent.press(screen.getByTestId('address-save'));
    expect(await findText('Tulis nama jalan, nomor, dan RT/RW')).toBeTruthy();
    type('address-phone', '0812-3456-7890');
    type('address-street', 'Jl. Rungkut Madya No. 1, Gunung Anyar');
    type('address-city', 'Surabaya');
    type('address-postal', '60294');
    fireEvent.press(screen.getByTestId('address-province'));
    fireEvent.press(await findText('Jawa Timur'));
    fireEvent.press(screen.getByTestId('address-save'));

    // kembali ke checkout dengan alamat baru
    await findText('Jl. Rungkut Madya No. 1, Gunung Anyar, Surabaya, Jawa Timur 60294');
    // belum memilih pembayaran
    fireEvent.press(screen.getByTestId('checkout-pay'));
    expect(await findText('Pilih metode pembayaran')).toBeTruthy();
    press('payment-1'); // Transfer Bank BCA
    // JNE Reguler 2 x 4,5 kg = 9 kg -> 10.000 + 8 x 4.000 = 42.000; kurir termurah dipilih otomatis
    press('courier-1');
    await waitFor(() => expect(screen.getByTestId('checkout-total')).toHaveTextContent('Rp380.000'), WAIT); // 338.000 + 42.000
    fireEvent.press(screen.getByTestId('checkout-pay'));

    await findText('Pesanan berhasil!');
    const orderNo = screen.getByTestId('success-order-no').props.children;
    expect(orderNo).toMatch(/^PSR-\d{6}-[A-Z0-9]{5}$/);
    press('success-view-order');

    // detail pesanan: menunggu pembayaran -> dikemas -> dikirim -> selesai
    await findText('Selesaikan pembayaran');
    expect(screen.getByText(/1234 5678 90/)).toBeTruthy();
    press('order-pay');
    await findText('Pembayaran diterima. Pesanan dikemas.');
    await screen.findByTestId('order-ship', {}, WAIT);
    press('order-ship');
    await screen.findByTestId('order-receive', {}, WAIT);
    press('order-receive');
    await screen.findByTestId('order-reorder', {}, WAIT);
    expect(screen.queryByTestId('order-cancel')).toBeNull();

    const db = await DB.getDb();
    const o = await db.getFirstAsync('SELECT status, total FROM orders ORDER BY id DESC LIMIT 1');
    expect(o).toEqual({ status: 'selesai', total: 380000 });
  });
});

// membuka aplikasi lagi (sesi masih tersimpan di database)
async function screen_reopen() {
  await renderAppLoggedIn();
}
async function renderAppLoggedIn() {
  const { render } = require('@testing-library/react-native');
  const App = require('../App').default;
  render(require('react').createElement(App));
  await screen.findByText('Produk untukmu', {}, WAIT);
}
