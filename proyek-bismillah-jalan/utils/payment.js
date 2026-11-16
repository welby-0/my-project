// Petunjuk pembayaran SIMULASI untuk layar pesanan (tidak ada transaksi uang sungguhan)
export function paymentInstruction(order) {
  const digits = String(order.order_no).replace(/\D/g, '').padStart(6, '0');
  const name = order.payment_name;
  if (/virtual account/i.test(name)) {
    return { label: 'Nomor Virtual Account', value: `8808 ${digits} ${String(order.id).padStart(4, '0')}`, note: `Bayar lewat ATM, mBanking, atau internet banking ${name.replace('Virtual Account ', '')}.` };
  }
  if (order.payment_type === 'transfer') {
    return { label: 'Nomor rekening', value: '1234 5678 90 a.n. PT Pasarin Demo', note: `Transfer sesuai total pembayaran lewat ${name}.` };
  }
  if (/qris/i.test(name)) {
    return { label: 'Metode', value: 'Scan QRIS', note: 'Scan kode QRIS dari aplikasi bank atau e-wallet apa pun.' };
  }
  if (order.payment_type === 'ewallet') {
    return { label: 'Metode', value: name, note: `Buka aplikasi ${name} dan selesaikan pembayaran.` };
  }
  return { label: 'Metode', value: name, note: 'Bayar tunai ke kurir saat paket sampai.' };
}
