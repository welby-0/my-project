import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DB from '../db';
import Card from '../components/Card';
import Button from '../components/Button';
import RadioRow from '../components/RadioRow';
import ProductThumb from '../components/ProductThumb';
import TextField from '../components/TextField';
import EmptyState from '../components/EmptyState';
import { FormScroll, Screen } from '../components/Screen';
import { Spinner } from '../components/Loading';
import { useApp, useReportError } from '../state/AppContext';
import { useToast } from '../state/Toast';
import { useQuery } from '../state/hooks';
import { calcTotals, etaLabel, evaluatePromo, shippingCost } from '../utils/pricing';
import { rupiah } from '../utils/format';
import { successFeedback } from '../utils/haptics';
import { colors, radius, spacing, type } from '../theme';

const PAYMENT_GROUPS = [
  { type: 'transfer', title: 'Transfer Bank', icon: 'business-outline' },
  { type: 'ewallet', title: 'E-Wallet & QRIS', icon: 'phone-portrait-outline' },
  { type: 'cod', title: 'Bayar di Tempat (COD)', icon: 'cash-outline' },
];

function SummaryRow({ label, value, strong, tone }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3 }}>
      <Text style={strong ? type.heading : type.body}>{label}</Text>
      <Text style={[strong ? type.priceLarge : type.bodyStrong, strong && { fontSize: 20 }, tone === 'good' && { color: colors.mintText }]}>{value}</Text>
    </View>
  );
}

export default function CheckoutScreen({ navigation, route }) {
  const { user, refreshCart, activePromo, setActivePromo } = useApp();
  const toast = useToast();
  const report = useReportError();
  const [courierId, setCourierId] = useState(null);
  const [paymentId, setPaymentId] = useState(null);
  const [note, setNote] = useState('');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const data = useQuery(
    async () => ({
      lines: (await DB.getCart(user.id)).filter((l) => l.selected),
      addresses: await DB.listAddresses(user.id),
      couriers: await DB.listCouriers(),
      payments: await DB.listPaymentMethods(),
      promo: activePromo ? await DB.findPromo(activePromo) : null,
    }),
    [user?.id, activePromo]
  );

  if (!data.data) return <Spinner />;
  const { lines, addresses, couriers, payments, promo } = data.data;

  if (lines.length === 0) {
    return (
      <Screen style={{ justifyContent: 'center' }}>
        <EmptyState title="Belum ada barang dipilih" message="Pilih barang di keranjang dulu sebelum checkout." actionLabel="Kembali ke keranjang" onAction={() => navigation.goBack()} />
      </Screen>
    );
  }

  const address = addresses.find((a) => a.id === route.params?.addressId) || addresses[0] || null;
  const courier = couriers.find((c) => c.id === courierId) || couriers[0];
  const payment = payments.find((p) => p.id === paymentId) || null;

  const subtotal = lines.reduce((s, l) => s + l.line_total, 0);
  const weight = lines.reduce((s, l) => s + l.weight_gram * l.qty, 0);
  const shipping = shippingCost(courier, weight);
  const promoResult = promo ? evaluatePromo(promo, { subtotal, shipping }) : null;
  const totals = calcTotals({ subtotal, shipping, paymentFee: payment ? payment.fee : 0, discount: promoResult?.ok ? promoResult.discount : 0 });
  const qtyTotal = lines.reduce((s, l) => s + l.qty, 0);

  const pay = async () => {
    const next = {};
    if (!address) next.address = 'Tambahkan alamat pengiriman dulu';
    if (!payment) next.payment = 'Pilih metode pembayaran';
    setErrors(next);
    if (Object.keys(next).length) {
      toast.show(next.address || next.payment, { tone: 'error' });
      return;
    }
    if (promo && promoResult && !promoResult.ok) {
      toast.show(`${promoResult.reason}. Lepas promo atau tambah belanja.`, { tone: 'error' });
      return;
    }
    setSubmitting(true);
    try {
      const order = await DB.placeOrder(user.id, {
        addressId: address.id,
        courierId: courier.id,
        paymentId: payment.id,
        promoCode: promo && promoResult?.ok ? promo.code : null,
        note,
      });
      await refreshCart();
      setActivePromo(null);
      successFeedback();
      navigation.reset({ index: 1, routes: [{ name: 'Main' }, { name: 'OrderSuccess', params: { orderId: order.id } }] });
    } catch (e) {
      report(e);
      setSubmitting(false);
      data.reload();
    }
  };

  return (
    <FormScroll
      footer={
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
          <View style={{ flex: 1 }}>
            <Text style={type.small}>Total pembayaran</Text>
            <Text testID="checkout-total" style={[type.priceLarge, { fontSize: 22 }]}>{rupiah(totals.total)}</Text>
          </View>
          <Button testID="checkout-pay" title="Bayar Sekarang" size="lg" loading={submitting} onPress={pay} style={{ flex: 1.2 }} />
        </View>
      }
    >
      <Card style={{ gap: spacing.sm }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={type.heading}>Alamat pengiriman</Text>
          {address ? (
            <Pressable testID="checkout-change-address" onPress={() => navigation.navigate('Addresses', { select: true })} hitSlop={10} accessibilityRole="button">
              <Text style={{ fontWeight: '700', color: colors.brandText }}>Ubah</Text>
            </Pressable>
          ) : null}
        </View>
        {address ? (
          <View style={{ gap: 2 }}>
            <Text style={type.bodyStrong}>{address.recipient} · {address.phone}</Text>
            <Text selectable style={[type.body, { color: colors.inkSoft }]}>{address.street}, {address.city}, {address.province} {address.postal_code}</Text>
            <Text style={type.caption}>{address.label}{address.is_default ? ' · Utama' : ''}</Text>
          </View>
        ) : (
          <View style={{ gap: spacing.sm }}>
            <Text style={[type.body, { color: errors.address ? colors.roseText : colors.inkSoft }]}>Kamu belum punya alamat tersimpan.</Text>
            <Button testID="checkout-add-address" title="Tambah alamat" variant="tint" icon="add" onPress={() => navigation.navigate('AddressForm')} />
          </View>
        )}
      </Card>

      <Card style={{ gap: spacing.ms }}>
        <Text style={type.heading}>Barang pesanan ({qtyTotal})</Text>
        {lines.map((l) => (
          <View key={l.id} style={{ flexDirection: 'row', gap: spacing.ms, alignItems: 'center' }}>
            <ProductThumb product={l} size={52} rounded={radius.sm} />
            <View style={{ flex: 1 }}>
              <Text numberOfLines={1} style={type.bodyStrong}>{l.name}</Text>
              <Text style={type.small}>{l.variant_name ? `${l.variant_name} · ` : ''}{l.qty} × {rupiah(l.unit_price)}</Text>
            </View>
            <Text style={type.bodyStrong}>{rupiah(l.line_total)}</Text>
          </View>
        ))}
      </Card>

      <Card style={{ gap: spacing.sm }}>
        <Text style={type.heading}>Pilih kurir</Text>
        {couriers.map((c) => (
          <RadioRow
            key={c.id}
            testID={`courier-${c.id}`}
            selected={courier.id === c.id}
            onPress={() => setCourierId(c.id)}
            title={`${c.name} ${c.service}`}
            subtitle={etaLabel(c)}
            right={<Text style={type.bodyStrong}>{rupiah(shippingCost(c, weight))}</Text>}
          />
        ))}
        <Text style={type.caption}>Ongkir dihitung dari berat total {(weight / 1000).toFixed(1).replace('.', ',')} kg.</Text>
      </Card>

      <Card style={{ gap: spacing.md }}>
        <Text style={type.heading}>Metode pembayaran</Text>
        {PAYMENT_GROUPS.map((g) => {
          const group = payments.filter((p) => p.type === g.type);
          if (!group.length) return null;
          return (
            <View key={g.type} style={{ gap: spacing.sm }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Ionicons name={g.icon} size={16} color={colors.inkSoft} />
                <Text style={type.smallStrong}>{g.title}</Text>
              </View>
              {group.map((p) => (
                <RadioRow
                  key={p.id}
                  testID={`payment-${p.id}`}
                  selected={paymentId === p.id}
                  onPress={() => {
                    setPaymentId(p.id);
                    setErrors((e) => ({ ...e, payment: undefined }));
                  }}
                  title={p.name}
                  subtitle={p.note}
                  right={p.fee > 0 ? <Text style={type.small}>+{rupiah(p.fee)}</Text> : null}
                />
              ))}
            </View>
          );
        })}
        {errors.payment ? <Text style={[type.caption, { color: colors.roseText }]}>{errors.payment}</Text> : null}
      </Card>

      <Card padded={false}>
        <Pressable
          testID="checkout-promo"
          onPress={() => navigation.navigate('Promos')}
          accessibilityRole="button"
          style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: spacing.ms, padding: spacing.md, backgroundColor: pressed ? colors.canvas : colors.surface })}
        >
          <Ionicons name="pricetag-outline" size={22} color={colors.brandText} />
          <View style={{ flex: 1 }}>
            <Text style={type.bodyStrong}>{promo ? `Promo ${promo.code}` : 'Pakai promo atau voucher'}</Text>
            {promo && promoResult ? (
              <Text style={[type.small, { color: promoResult.ok ? colors.mintText : colors.roseText }]}>
                {promoResult.ok ? `Hemat ${rupiah(promoResult.discount)}` : promoResult.reason}
              </Text>
            ) : (
              <Text style={type.small}>Lihat promo yang tersedia</Text>
            )}
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.inkMute} />
        </Pressable>
      </Card>

      <TextField testID="checkout-note" label="Catatan untuk penjual (opsional)" value={note} onChangeText={setNote} placeholder="Mis. tolong dibungkus bubble wrap" maxLength={140} />

      <Card style={{ gap: 2 }}>
        <Text style={[type.heading, { marginBottom: spacing.xs }]}>Ringkasan pembayaran</Text>
        <SummaryRow label={`Subtotal (${qtyTotal} barang)`} value={rupiah(totals.subtotal)} />
        <SummaryRow label="Ongkos kirim" value={rupiah(totals.shipping)} />
        {payment && payment.fee > 0 ? <SummaryRow label="Biaya pembayaran" value={rupiah(totals.paymentFee)} /> : null}
        {totals.discount > 0 ? <SummaryRow label="Diskon promo" value={`-${rupiah(totals.discount)}`} tone="good" /> : null}
        <View style={{ height: 1, backgroundColor: colors.line, marginVertical: spacing.sm }} />
        <SummaryRow label="Total" value={rupiah(totals.total)} strong />
      </Card>
    </FormScroll>
  );
}
