import { compactCount, formatDate, initials, ratingLabel, rupiah } from '../utils/format';
import { isEmail, normalizePhone, parseIdentifier, parseMoney, parseSignedMoney, passwordStrength, validatePostalCode } from '../utils/validators';
import { calcTotals, etaLabel, evaluatePromo, promoSummary, shippingCost } from '../utils/pricing';
import { paymentInstruction } from '../utils/payment';

describe('format', () => {
  test('rupiah', () => {
    expect(rupiah(0)).toBe('Rp0');
    expect(rupiah(1399000)).toBe('Rp1.399.000');
    expect(rupiah(-20000)).toBe('-Rp20.000');
    expect(rupiah('abc')).toBe('Rp0');
  });
  test('jumlah terjual & rating & tanggal & inisial', () => {
    expect(compactCount(950)).toBe('950');
    expect(compactCount(1200)).toBe('1,2 rb');
    expect(compactCount(3000)).toBe('3 rb');
    expect(compactCount(2500000)).toBe('2,5 jt');
    expect(ratingLabel(4.8)).toBe('4,8');
    expect(ratingLabel(5)).toBe('5,0');
    expect(formatDate('2026-11-14 03:04:05')).toBe('14 Nov 2026');
    expect(formatDate(null)).toBe('-');
    expect(initials('Welby Foriant Bafaqih')).toBe('WF');
    expect(initials('Budi')).toBe('BU');
    expect(initials('')).toBe('?');
  });
});

describe('validators', () => {
  test('nomor HP dinormalkan', () => {
    expect(normalizePhone('+62 812-3456-7890')).toBe('081234567890');
    expect(normalizePhone('6281234567890')).toBe('081234567890');
    expect(normalizePhone('81234567890')).toBe('081234567890');
    expect(normalizePhone('(0812) 3456 7890')).toBe('081234567890');
  });
  test('identifier email / HP / salah', () => {
    expect(parseIdentifier('Budi@Contoh.ID')).toEqual({ type: 'email', value: 'budi@contoh.id' });
    expect(parseIdentifier('0812 3456 7890')).toEqual({ type: 'phone', value: '081234567890' });
    expect(parseIdentifier('').error).toBeTruthy();
    expect(parseIdentifier('budi@').error).toBeTruthy();
    expect(parseIdentifier('12345').error).toBeTruthy();
    expect(isEmail('a@b.co')).toBe(true);
    expect(isEmail('a@b')).toBe(false);
  });
  test('kekuatan sandi, kode pos, uang', () => {
    expect(passwordStrength('').level).toBe(0);
    expect(passwordStrength('abcdef').label).toBe('Lemah');
    expect(passwordStrength('Abcdefghij').label).toBe('Kuat');
    expect(validatePostalCode('60294')).toBe('');
    expect(validatePostalCode('6029')).not.toBe('');
    expect(parseMoney('Rp 1.250.000')).toBe(1250000);
    expect(parseMoney('')).toBe(0);
    expect(parseSignedMoney('-20.000')).toBe(-20000);
    expect(parseSignedMoney('abc')).toBe(0);
  });
});

describe('pricing', () => {
  const jne = { base_cost: 10000, cost_per_kg: 4000, eta_min_days: 2, eta_max_days: 4 };
  test('ongkir dibulatkan ke atas per kg, minimal 1 kg', () => {
    expect(shippingCost(jne, 100)).toBe(10000);
    expect(shippingCost(jne, 1000)).toBe(10000);
    expect(shippingCost(jne, 1001)).toBe(14000);
    expect(shippingCost(jne, 4500 * 2)).toBe(42000);
    expect(shippingCost(null, 5000)).toBe(0);
  });
  test('estimasi tiba', () => {
    expect(etaLabel(jne)).toBe('Sampai 2–4 hari');
    expect(etaLabel({ eta_min_days: 1, eta_max_days: 1 })).toBe('Sampai besok');
    expect(etaLabel({ eta_min_days: 3, eta_max_days: 3 })).toBe('Sampai 3 hari');
  });
  test('promo persen, tetap, ongkir, dan batas minimal belanja', () => {
    const percent = { type: 'percent', value: 50, min_spend: 100000, max_discount: 50000 };
    expect(evaluatePromo(percent, { subtotal: 80000, shipping: 10000 }).ok).toBe(false);
    expect(evaluatePromo(percent, { subtotal: 100000, shipping: 0 }).discount).toBe(50000);
    expect(evaluatePromo({ ...percent, max_discount: 0 }, { subtotal: 120000, shipping: 0 }).discount).toBe(60000);
    expect(evaluatePromo({ type: 'fixed', value: 20000, min_spend: 0, max_discount: 0 }, { subtotal: 15000, shipping: 0 }).discount).toBe(15000);
    expect(evaluatePromo({ type: 'shipping', value: 15000, min_spend: 0, max_discount: 0 }, { subtotal: 1, shipping: 9000 }).discount).toBe(9000);
    expect(evaluatePromo(null, { subtotal: 1, shipping: 1 }).ok).toBe(false);
    expect(promoSummary(percent)).toBe('Diskon 50% (maks Rp50.000)');
  });
  test('total tidak pernah negatif', () => {
    expect(calcTotals({ subtotal: 10000, shipping: 5000, paymentFee: 1000, discount: 99999 }).total).toBe(0);
    expect(calcTotals({ subtotal: 100000, shipping: 10000, paymentFee: 2500, discount: 50000 }).total).toBe(62500);
  });
  test('petunjuk pembayaran simulasi', () => {
    const base = { id: 7, order_no: 'PSR-261114-ABCDE' };
    expect(paymentInstruction({ ...base, payment_type: 'transfer', payment_name: 'Virtual Account BNI' }).value).toMatch(/^8808 /);
    expect(paymentInstruction({ ...base, payment_type: 'transfer', payment_name: 'Transfer Bank BCA' }).label).toBe('Nomor rekening');
    expect(paymentInstruction({ ...base, payment_type: 'ewallet', payment_name: 'QRIS' }).value).toBe('Scan QRIS');
    expect(paymentInstruction({ ...base, payment_type: 'cod', payment_name: 'Bayar di Tempat (COD)' }).note).toContain('kurir');
  });
});
