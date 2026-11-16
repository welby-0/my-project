import { FlatList, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DB from '../db';
import ProductThumb from '../components/ProductThumb';
import Checkbox from '../components/Checkbox';
import Stepper from '../components/Stepper';
import Button from '../components/Button';
import EmptyState from '../components/EmptyState';
import { Spinner } from '../components/Loading';
import { Screen } from '../components/Screen';
import { useApp, useReportError } from '../state/AppContext';
import { useToast } from '../state/Toast';
import { useQuery } from '../state/hooks';
import { colors, radius, shadows, spacing, type } from '../theme';
import { rupiah } from '../utils/format';

export default function CartScreen({ navigation }) {
  const { user, refreshCart } = useApp();
  const toast = useToast();
  const report = useReportError();
  const cart = useQuery(async () => (user ? DB.getCart(user.id) : []), [user?.id]);

  if (!user) {
    return (
      <Screen style={{ justifyContent: 'center' }}>
        <EmptyState
          title="Masuk untuk melihat keranjang"
          message="Keranjang tersimpan di akunmu, jadi tidak hilang saat kamu pindah perangkat."
          actionLabel="Masuk atau daftar"
          onAction={() => navigation.navigate('Login', { fromGuest: true })}
        />
      </Screen>
    );
  }
  if (cart.loading && !cart.data) return <Spinner />;

  const lines = cart.data || [];
  const selectable = lines.filter((l) => !l.unavailable);
  const selected = lines.filter((l) => l.selected);
  const total = selected.reduce((s, l) => s + l.line_total, 0);
  const selectedQty = selected.reduce((s, l) => s + l.qty, 0);
  const allSelected = selectable.length > 0 && selectable.every((l) => l.selected);

  const guard = async (fn) => {
    try {
      await fn();
      await cart.reload();
      await refreshCart();
    } catch (e) {
      report(e);
      cart.reload();
    }
  };

  const remove = (line) =>
    guard(async () => {
      await DB.removeCartItem(user.id, line.id);
      toast.show(`“${line.name}” dihapus`, {
        actionLabel: 'Urungkan',
        onAction: () => guard(() => DB.addToCart(user.id, line.product_id, line.variant_id, line.qty)),
      });
    });

  if (lines.length === 0) {
    return (
      <Screen style={{ justifyContent: 'center' }}>
        <EmptyState
          animated
          title="Keranjangmu masih kosong"
          message="Yuk, cari produk yang kamu butuhkan dan masukkan ke keranjang."
          actionLabel="Mulai belanja"
          onAction={() => navigation.navigate('Beranda')}
        />
      </Screen>
    );
  }

  return (
    <Screen>
      <FlatList
        testID="cart-list"
        data={lines}
        keyExtractor={(l) => String(l.id)}
        contentContainerStyle={{ padding: spacing.md, gap: spacing.ms }}
        renderItem={({ item: l }) => (
          <View
            testID={`cart-line-${l.id}`}
            style={{ flexDirection: 'row', gap: spacing.ms, backgroundColor: colors.surface, borderRadius: radius.lg, borderCurve: 'continuous', boxShadow: shadows.card, padding: spacing.ms, opacity: l.unavailable ? 0.6 : 1 }}
          >
            <View style={{ justifyContent: 'center' }}>
              <Checkbox testID={`cart-check-${l.id}`} checked={l.selected} disabled={l.unavailable} label={`Pilih ${l.name}`} onChange={(v) => guard(() => DB.setCartSelected(user.id, l.id, v))} />
            </View>
            <Pressable onPress={() => navigation.navigate('ProductDetail', { id: l.product_id })} accessibilityRole="button" accessibilityLabel={`Buka ${l.name}`}>
              <ProductThumb product={l} size={72} rounded={radius.md} />
            </Pressable>
            <View style={{ flex: 1, gap: 4 }}>
              <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                <Text numberOfLines={2} style={[type.bodyStrong, { flex: 1 }]}>{l.name}</Text>
                <Pressable testID={`cart-remove-${l.id}`} onPress={() => remove(l)} hitSlop={10} accessibilityRole="button" accessibilityLabel={`Hapus ${l.name} dari keranjang`}>
                  <Ionicons name="close" size={20} color={colors.inkMute} />
                </Pressable>
              </View>
              {l.variant_name ? <Text style={type.small}>{l.variant_name}</Text> : null}
              <Text style={type.caption} numberOfLines={1}>{l.store_name}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 }}>
                <Text style={type.price}>{rupiah(l.unit_price)}</Text>
                {l.unavailable ? (
                  <Text style={[type.smallStrong, { color: colors.roseText }]}>{l.is_active ? 'Stok habis' : 'Tidak tersedia'}</Text>
                ) : (
                  <Stepper testID={`cart-qty-${l.id}`} size="sm" value={l.qty} min={1} max={l.available} onChange={(q) => guard(() => DB.setCartQty(user.id, l.id, q))} />
                )}
              </View>
              {!l.unavailable && l.available <= 5 ? <Text style={[type.caption, { color: colors.roseText }]}>Sisa {l.available}</Text> : null}
            </View>
          </View>
        )}
      />
      <View style={{ backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.line, padding: spacing.md, gap: spacing.ms }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
            <Checkbox testID="cart-check-all" checked={allSelected} disabled={selectable.length === 0} label="Pilih semua" onChange={(v) => guard(() => DB.setAllCartSelected(user.id, v))} />
            <Text style={type.bodyStrong}>Semua</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={type.small}>Total harga</Text>
            <Text testID="cart-total" style={[type.priceLarge, { fontSize: 22 }]}>{rupiah(total)}</Text>
          </View>
        </View>
        <Button testID="cart-checkout" title={selected.length ? `Checkout (${selectedQty})` : 'Pilih barang dulu'} size="lg" disabled={selected.length === 0} onPress={() => navigation.navigate('Checkout')} />
      </View>
    </Screen>
  );
}
