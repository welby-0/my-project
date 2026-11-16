// Satu-satunya sumber nilai visual PASARIN (warna, spasi, tipografi, radius, bayangan, motion).
// Warna brand diambil dari maskot: oranye #FF6B35, tinta #2B2D42, kuning kilau #FFC53D, pink pipi #FF4D6D.

export const colors = {
  brand: '#FF6B35',
  brandDeep: '#E8501A',
  brandSoft: '#FF8A5B',
  brandTint: '#FFEFE5',
  brandText: '#C43D0C', // oranye gelap untuk teks kecil di atas putih (kontras AA)
  ink: '#2B2D42',
  inkSoft: '#4A4D66',
  inkMute: '#6B6E86',
  canvas: '#F5F6FA',
  surface: '#FFFFFF',
  line: '#E4E6EF',
  lineStrong: '#CDD0DE',
  sun: '#FFC53D',
  sunText: '#8A5B00',
  rose: '#FF4D6D',
  roseText: '#C8294A',
  roseTint: '#FFE3E8',
  mint: '#1FB58F',
  mintText: '#0F7F63',
  mintTint: '#DDF5EC',
  sky: '#3D8BFD',
  skyText: '#1F5FC2',
  skyTint: '#E3EEFF',
  violetText: '#5B3DB8',
  violetTint: '#E9E3FF',
  amberTint: '#FFF3D6',
  overlay: 'rgba(43, 45, 66, 0.45)',
  onBrand: '#2B2D42', // label di atas tombol oranye: tinta gelap (kontras 4.7:1)
};

export const spacing = { xs: 4, sm: 8, ms: 12, md: 16, lg: 24, xl: 32, xxl: 48 };
export const radius = { sm: 8, md: 12, lg: 16, xl: 24, full: 999 };

export const shadows = {
  card: '0 1px 3px rgba(43, 45, 66, 0.08)',
  raised: '0 6px 16px rgba(43, 45, 66, 0.12)',
  overlay: '0 12px 32px rgba(43, 45, 66, 0.22)',
};

export const motion = { fast: 150, base: 250, slow: 400 };

// Gaya teks bernama (bukan ukuran font mentah)
export const type = {
  display: { fontSize: 30, lineHeight: 36, fontWeight: '800', letterSpacing: -0.5, color: colors.ink },
  title: { fontSize: 22, lineHeight: 28, fontWeight: '800', letterSpacing: -0.3, color: colors.ink },
  heading: { fontSize: 17, lineHeight: 23, fontWeight: '700', color: colors.ink },
  bodyStrong: { fontSize: 15, lineHeight: 21, fontWeight: '600', color: colors.ink },
  body: { fontSize: 15, lineHeight: 22, fontWeight: '400', color: colors.ink },
  small: { fontSize: 13, lineHeight: 18, fontWeight: '400', color: colors.inkMute },
  smallStrong: { fontSize: 13, lineHeight: 18, fontWeight: '600', color: colors.inkSoft },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: '400', color: colors.inkMute },
  price: { fontSize: 15, lineHeight: 20, fontWeight: '800', color: colors.brandText },
  priceLarge: { fontSize: 26, lineHeight: 32, fontWeight: '800', letterSpacing: -0.4, color: colors.brandText },
  button: { fontSize: 16, lineHeight: 22, fontWeight: '700', color: colors.onBrand },
};

export const statusStyle = {
  menunggu_pembayaran: { label: 'Menunggu pembayaran', bg: colors.amberTint, fg: colors.sunText, icon: 'time-outline' },
  dikemas: { label: 'Dikemas', bg: colors.skyTint, fg: colors.skyText, icon: 'cube-outline' },
  dikirim: { label: 'Dikirim', bg: colors.violetTint, fg: colors.violetText, icon: 'car-outline' },
  selesai: { label: 'Selesai', bg: colors.mintTint, fg: colors.mintText, icon: 'checkmark-circle-outline' },
  dibatalkan: { label: 'Dibatalkan', bg: colors.roseTint, fg: colors.roseText, icon: 'close-circle-outline' },
};

export const theme = { colors, spacing, radius, shadows, motion, type, statusStyle };
export default theme;
