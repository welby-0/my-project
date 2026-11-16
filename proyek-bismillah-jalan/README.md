# PASARIN — Marketplace Mobile (Expo SDK 54)

Aplikasi marketplace dengan maskot tas belanja oranye. Dibuat dari wireframe 8 layar
(Masuk, Daftar, Beranda, Hasil Cari, Detail Produk, Keranjang, Checkout, Pesanan Berhasil)
lalu diperluas menjadi aplikasi lengkap dengan database SQLite lokal.

## Menjalankan

```bash
npm install
npx expo start          # lalu buka dengan Expo Go (SDK 54) di HP, atau tekan a / i untuk emulator
```

**Akun demo**: `demo@pasarin.id` / `pasarin123` (tombol "Masuk dengan akun demo" ada di layar Masuk).
Akun demo memiliki toko "Toko Demo Pasarin" dengan 4 produk contoh untuk mencoba tambah/ubah/hapus.

> **Penting:** database memakai `expo-sqlite`, jadi jalankan di **HP (Expo Go) atau emulator**.
> Pratinjau *web* di Snack belum mendukung SQLite; aplikasi akan menampilkan layar penjelasan
> dengan tombol "Coba lagi", bukan layar putih.

## Pengujian

```bash
npm test
```

58 uji otomatis (Jest): lapisan database dengan SQLite sungguhan, perhitungan harga/validasi, dan
alur layar yang ditekan seperti pengguna (daftar → cari → pilih varian → keranjang → alamat →
checkout → bayar → pesanan selesai; CRUD produk/toko/alamat/ulasan; favorit; promo; reset data).
Folder `tests/` hanya untuk pengembangan dan tidak dipakai aplikasi saat berjalan.

## Perbaikan terhadap wireframe

| Layar | Kelemahan di wireframe | Perbaikan |
|---|---|---|
| Masuk | Tiga tombol (Email / No. HP / Facebook) tanpa kolom kata sandi | Satu kolom "Email atau No. HP" + kata sandi (tampil/sembunyi), validasi per kolom, pesan error jelas, mode tamu, akun demo |
| Daftar | Tidak ada validasi/indikator | Deteksi otomatis email vs HP, indikator kekuatan sandi, cek kecocokan sandi, persetujuan syarat |
| Beranda | Hanya 3 tab kategori, banner statis | 17 kategori dari database, banner promo nyata, urutkan, muat bertahap, tarik-untuk-muat-ulang, favorit, tombol tambah cepat |
| Hasil cari | Hanya daftar hasil | Pencarian langsung, filter kategori/harga/urutan, riwayat pencarian, tampilan kosong yang membantu |
| Detail produk | Tanpa pilihan ukuran/varian, stok, jumlah | Varian (ukuran/warna/kapasitas) dengan selisih harga dan stok, stepper jumlah, info toko, ulasan, Beli Sekarang |
| Keranjang | Tanpa centang, harga satuan, atau penanganan stok | Centang per barang, subtotal, batas stok, barang tak tersedia, urungkan hapus |
| Checkout | Satu kolom alamat, tanpa rincian biaya | Alamat tersimpan (CRUD), kurir dengan ongkir dan estimasi, pembayaran Transfer / E-Wallet / COD + biaya, promo, catatan, ringkasan biaya |
| Pesanan berhasil | Hanya nomor pesanan | Ringkasan, petunjuk pembayaran, tautan ke detail pesanan |
| (baru) | — | Riwayat & status pesanan, favorit, Toko Saya (CRUD produk), ulasan (CRUD), alamat (CRUD), profil, promo |

## Database (SQLite, 16 tabel)

`users`, `categories` (2 tingkat), `stores`, `products`, `product_variants`, `cart_items`, `addresses`,
`couriers`, `payment_methods`, `promos`, `orders`, `order_items`, `reviews`, `wishlist`,
`search_history`, `meta` — plus view `v_products` dan 3 trigger yang menghitung rating otomatis.

Data awal: **17 kategori + 62 subkategori** (termasuk *Rak & Penyimpanan* → rak sepatu, *HP & Tablet*, dll),
**178 produk**, 225 varian, 19 toko, 597 ulasan, 6 kurir, 9 metode pembayaran, 4 promo.
Nama merek elektronik (Nova, Arka, Lumio, Vexa) fiktif; semua data hanya contoh.

CRUD yang tersedia di aplikasi: **Produk** dan **Toko** (Akun → Toko Saya), **Alamat**, **Ulasan**,
**Keranjang**, **Pesanan** (buat, batalkan, hapus riwayat), **Favorit**, **Profil/Akun**.

## Struktur

```
App.js, index.js          pintu masuk aplikasi
navigation/               tab + stack navigator
screens/                  21 layar
components/               komponen UI bersama (Mascot, Button, TextField, ProductCard, ...)
state/                    AppContext (sesi, keranjang, favorit), Toast, hooks
db/                       skema, seed, koneksi, dan repository per tabel
utils/                    format, validasi, harga, keamanan, foto
theme/                    token desain (warna, spasi, tipografi, bayangan)
assets/                   ikon, splash, maskot (PNG + SVG asli)
tests/                    uji otomatis (tidak dipakai saat aplikasi berjalan)
```

## Batasan (yang sengaja tidak ada)

- **Tidak ada server**: semua data tersimpan di HP. Pembayaran dan pengiriman adalah **simulasi**
  (tombol "Saya sudah bayar" dan "Simulasikan paket dikirim").
- **Login Facebook** pada wireframe tidak dibuat: butuh OAuth dan backend. Gantinya: email/HP + sandi.
- Kata sandi di-hash SHA-256 + salt di perangkat. Untuk produksi, autentikasi harus dilakukan
  di server (bcrypt/argon2 + HTTPS).
- Foto produk contoh berupa ikon emoji di atas warna kategori; foto asli bisa dipilih dari galeri
  saat menambah/mengubah produk.
