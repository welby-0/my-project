import { useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DB from '../db';
import Card from '../components/Card';
import Button from '../components/Button';
import StatusBadge from '../components/StatusBadge';
import EmptyState from '../components/EmptyState';
import { Screen } from '../components/Screen';
import { Spinner } from '../components/Loading';
import { useApp, useReportError } from '../state/AppContext';
import { useToast } from '../state/Toast';
import { useQuery } from '../state/hooks';
import { paymentInstruction } from '../utils/payment';
import { formatDateTime, rupiah } from '../utils/format';
import { successFeedback } from '../utils/haptics';
import { colors, radius, spacing, type } from '../theme';

const STEPS = [
  { key: 'menunggu_pembayaran', label: 'Dibuat' },
  { key: 'dikemas', label: 'Dikemas' },
  { key: 'dikirim', label: 'Dikirim' },
  { key: 'selesai', label: 'Selesai' },
];

function Timeline({ status }) {
  const current = STEPS.findIndex((s) => s.key === status);
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-start' }} accessible accessibilityLabel={`Tahap pesanan: ${STEPS[current]?.label}`}>
      {STEPS.map((s, i) => {
        const done = i <= current;
        return (
          <View key={s.key} style={{ flex: 1, alignItems: 'center', gap: 6 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', alignSelf: 'stretch' }}>
              <View style={{ flex: 1, height: 3, backgroundColor: i === 0 ? 'transparent' : done ? colors.mint : colors.line }} />
              <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: done ? colors.mint : colors.line, alignItems: 'center', justifyContent: 'center' }}>
                {done ? <Ionicons name="checkmark" size={15} color="#fff" /> : null}
              </View>
              <View style={{ flex: 1, height: 3, backgroundColor: i === STEPS.length - 1 ? 'transparent' : i < current ? colors.mint : colors.line }} />
            </View>
            <Text style={[type.caption, done && { color: colors.ink, fontWeight: '700' }]}>{s.label}</Text>
          </View>
        );
      })}
    </View>
  );
}

export default function OrderDetailScreen({ navigation, route }) {
  const { id } = route.params;
  const { user, refreshCart } = useApp();
  const toast = useToast();
  const report = useReportError();
  const order = useQuery(() => DB.getOrder(user.id, id), [id, user?.id]);
  const [busy, setBusy] = useState('');
  const o = order.data;

  if (order.loading && !o) return <Spinner />;
  if (!o) {
    return (
      <Screen style={{ justifyContent: 'center' }}>
        <EmptyState title="Pesanan tidak ditemukan" actionLabel="Kembali" onAction={() => navigation.goBack()} />
      </Screen>
    );
  }

  const run = async (key, fn, message) => {
    setBusy(key);
    try {
      await fn();
      successFeedback();
      if (message) toast.show(message);
      await order.reload();
    } catch (e) {
      report(e);
      order.reload();
    } finally {
      setBusy('');
    }
  };

  const confirm = (title, text, confirmLabel, onConfirm) =>
    Alert.alert(title, text, [
      { text: 'Tidak', style: 'cancel' },
      { text: confirmLabel, style: 'destructive', onPress: onConfirm },
    ]);

  const instruction = o.status === 'menunggu_pembayaran' ? paymentInstruction(o) : null;
  const finished = o.status === 'selesai' || o.status === 'dibatalkan';

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: spacing.md, gap: spacing.md, paddingBottom: spacing.xxl }} contentInsetAdjustmentBehavior="automatic">
        <Card style={{ gap: spacing.md }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flex: 1 }}>
              <Text style={type.caption}>No. pesanan</Text>
              <Text testID="detail-order-no" selectable style={type.heading}>{o.order_no}</Text>
              <Text style={type.caption}>{formatDateTime(o.created_at)}</Text>
            </View>
            <StatusBadge status={o.status} />
          </View>
          {o.status === 'dibatalkan' ? (
            <Text style={[type.small, { color: colors.roseText }]}>Pesanan ini dibatalkan. Stok barang sudah dikembalikan.</Text>
          ) : (
            <Timeline status={o.status} />
          )}
        </Card>

        {instruction ? (
          <Card style={{ gap: spacing.sm, backgroundColor: colors.amberTint }}>
            <Text style={[type.heading, { color: colors.sunText }]}>Selesaikan pembayaran</Text>
            <Text style={type.small}>{instruction.label}</Text>
            <Text selectable style={[type.title, { letterSpacing: 0.5 }]}>{instruction.value}</Text>
            <Text style={type.body}>Jumlah: <Text style={{ fontWeight: '800' }}>{rupiah(o.total)}</Text></Text>
            <Text style={type.small}>{instruction.note}</Text>
            <Text style={[type.caption, { color: colors.sunText }]}>Ini simulasi. Tidak ada uang sungguhan yang berpindah.</Text>
          </Card>
        ) : null}

        <Card style={{ gap: spacing.sm }}>
          <Text style={type.heading}>Alamat pengiriman</Text>
          <Text style={type.bodyStrong}>{o.ship_recipient} · {o.ship_phone}</Text>
          <Text selectable style={[type.body, { color: colors.inkSoft }]}>{o.ship_address}</Text>
          <Text style={type.small}>Kurir: {o.courier_name}</Text>
          {o.note ? <Text style={type.small}>Catatan: {o.note}</Text> : null}
        </Card>

        <Card style={{ gap: spacing.ms }}>
          <Text style={type.heading}>Barang pesanan</Text>
          {o.items.map((it) => (
            <View key={it.id} style={{ flexDirection: 'row', gap: spacing.ms, alignItems: 'center' }}>
              <View style={{ width: 48, height: 48, borderRadius: radius.md, backgroundColor: colors.brandTint, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 24 }}>{it.emoji}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text numberOfLines={2} style={type.bodyStrong}>{it.name}</Text>
                <Text style={type.small}>{it.variant_name ? `${it.variant_name} · ` : ''}{it.qty} × {rupiah(it.price)}</Text>
                {o.status === 'selesai' && it.product_id ? (
                  <Pressable onPress={() => navigation.navigate('ReviewForm', { productId: it.product_id, productName: it.name })} hitSlop={8} accessibilityRole="button">
                    <Text style={{ fontWeight: '700', color: colors.brandText, marginTop: 2 }}>Beri ulasan</Text>
                  </Pressable>
                ) : null}
              </View>
              <Text style={type.bodyStrong}>{rupiah(it.price * it.qty)}</Text>
            </View>
          ))}
        </Card>

        <Card style={{ gap: 4 }}>
          <Text style={[type.heading, { marginBottom: 4 }]}>Rincian pembayaran</Text>
          {[
            ['Subtotal', rupiah(o.subtotal)],
            ['Ongkos kirim', rupiah(o.shipping_cost)],
            o.payment_fee > 0 ? ['Biaya pembayaran', rupiah(o.payment_fee)] : null,
            o.discount > 0 ? [`Diskon${o.promo_code ? ` (${o.promo_code})` : ''}`, `-${rupiah(o.discount)}`] : null,
          ].filter(Boolean).map(([k, v]) => (
            <View key={k} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={type.body}>{k}</Text>
              <Text style={type.bodyStrong}>{v}</Text>
            </View>
          ))}
          <View style={{ height: 1, backgroundColor: colors.line, marginVertical: 6 }} />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={type.heading}>Total</Text>
            <Text testID="detail-order-total" style={[type.priceLarge, { fontSize: 20 }]}>{rupiah(o.total)}</Text>
          </View>
          <Text style={type.small}>Dibayar dengan {o.payment_name}</Text>
        </Card>

        <View style={{ gap: spacing.sm }}>
          {o.status === 'menunggu_pembayaran' ? (
            <Button testID="order-pay" title="Saya sudah bayar (simulasi)" size="lg" loading={busy === 'bayar'} onPress={() => run('bayar', () => DB.advanceOrder(user.id, o.id, 'bayar'), 'Pembayaran diterima. Pesanan dikemas.')} />
          ) : null}
          {o.status === 'dikemas' ? (
            <Button testID="order-ship" title="Simulasikan paket dikirim (demo)" variant="secondary" icon="car-outline" loading={busy === 'kirim'} onPress={() => run('kirim', () => DB.advanceOrder(user.id, o.id, 'kirim'), 'Paket dalam perjalanan.')} />
          ) : null}
          {o.status === 'dikirim' ? (
            <Button testID="order-receive" title="Pesanan diterima" size="lg" icon="checkmark-circle-outline" loading={busy === 'terima'} onPress={() => run('terima', () => DB.advanceOrder(user.id, o.id, 'terima'), 'Terima kasih! Jangan lupa beri ulasan.')} />
          ) : null}
          {o.status === 'menunggu_pembayaran' || o.status === 'dikemas' ? (
            <Button
              testID="order-cancel"
              title="Batalkan pesanan"
              variant="danger"
              loading={busy === 'batal'}
              onPress={() => confirm('Batalkan pesanan?', 'Stok barang akan dikembalikan dan pesanan tidak bisa diaktifkan lagi.', 'Batalkan pesanan', () => run('batal', () => DB.advanceOrder(user.id, o.id, 'batal'), 'Pesanan dibatalkan.'))}
            />
          ) : null}
          {finished ? (
            <Button
              testID="order-reorder"
              title="Beli lagi"
              icon="refresh-outline"
              loading={busy === 'ulang'}
              onPress={() =>
                run('ulang', async () => {
                  const r = await DB.reorder(user.id, o.id);
                  await refreshCart();
                  toast.show(r.added ? `${r.added} produk masuk keranjang${r.skipped ? `, ${r.skipped} tidak tersedia` : ''}` : 'Produk tidak tersedia lagi', {
                    actionLabel: r.added ? 'Lihat' : undefined,
                    onAction: () => navigation.navigate('Main', { screen: 'Keranjang' }),
                  });
                })
              }
            />
          ) : null}
          {finished ? (
            <Button
              testID="order-delete"
              title="Hapus dari riwayat"
              variant="ghost"
              onPress={() =>
                confirm('Hapus pesanan?', 'Riwayat pesanan ini akan dihapus permanen.', 'Hapus', async () => {
                  try {
                    await DB.deleteOrder(user.id, o.id);
                    toast.show('Riwayat pesanan dihapus');
                    navigation.goBack();
                  } catch (e) {
                    report(e);
                  }
                })
              }
            />
          ) : null}
        </View>
      </ScrollView>
    </Screen>
  );
}
