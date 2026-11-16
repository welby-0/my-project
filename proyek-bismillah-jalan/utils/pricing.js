// Perhitungan harga murni (tanpa database) agar mudah diuji dan dipakai ulang di UI & transaksi.
import { rupiah } from './format';

export function lineUnitPrice(basePrice, priceDelta) {
  return (Number(basePrice) || 0) + (Number(priceDelta) || 0);
}

// Ongkir = tarif dasar + tarif per kg tambahan (pembulatan ke atas, minimal 1 kg)
export function shippingCost(courier, totalWeightGram) {
  if (!courier) return 0;
  const kg = Math.max(1, Math.ceil((Number(totalWeightGram) || 0) / 1000));
  return courier.base_cost + courier.cost_per_kg * (kg - 1);
}

export function etaLabel(courier) {
  if (!courier) return '';
  const { eta_min_days: a, eta_max_days: b } = courier;
  if (a === b) return a <= 1 ? 'Sampai besok' : `Sampai ${a} hari`;
  return `Sampai ${a}–${b} hari`;
}

// Mengembalikan { ok, discount, reason } untuk sebuah promo
export function evaluatePromo(promo, { subtotal, shipping }) {
  if (!promo) return { ok: false, discount: 0, reason: 'Promo tidak ditemukan' };
  if (subtotal < promo.min_spend) {
    return { ok: false, discount: 0, reason: `Minimal belanja ${rupiah(promo.min_spend)} untuk promo ini` };
  }
  let discount = 0;
  if (promo.type === 'percent') {
    discount = Math.floor((subtotal * promo.value) / 100);
    if (promo.max_discount > 0) discount = Math.min(discount, promo.max_discount);
  } else if (promo.type === 'fixed') {
    discount = Math.min(promo.value, subtotal);
  } else if (promo.type === 'shipping') {
    discount = Math.min(promo.value, shipping);
  }
  return { ok: true, discount, reason: '' };
}

export function calcTotals({ subtotal, shipping = 0, paymentFee = 0, discount = 0 }) {
  const gross = subtotal + shipping + paymentFee;
  const safeDiscount = Math.min(Math.max(0, discount), gross);
  return { subtotal, shipping, paymentFee, discount: safeDiscount, total: gross - safeDiscount };
}

export function promoSummary(promo) {
  if (promo.type === 'percent') {
    return `Diskon ${promo.value}%${promo.max_discount ? ` (maks ${rupiah(promo.max_discount)})` : ''}`;
  }
  if (promo.type === 'fixed') return `Potongan ${rupiah(promo.value)}`;
  return `Potongan ongkir hingga ${rupiah(promo.value)}`;
}
