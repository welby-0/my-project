import { useLayoutEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DB from '../db';
import ProductThumb from '../components/ProductThumb';
import Button from '../components/Button';
import Card from '../components/Card';
import Chip from '../components/Chip';
import Stepper from '../components/Stepper';
import IconButton from '../components/IconButton';
import EmptyState from '../components/EmptyState';
import { Stars } from '../components/Rating';
import { BottomBar, Screen } from '../components/Screen';
import { Spinner } from '../components/Loading';
import { useApp, useReportError, useRequireLogin } from '../state/AppContext';
import { useToast } from '../state/Toast';
import { useQuery } from '../state/hooks';
import { colors, radius, spacing, type } from '../theme';
import { compactCount, formatDate, initials, ratingLabel, rupiah } from '../utils/format';
import { tapFeedback } from '../utils/haptics';

function Spec({ label, value }) {
  return (
    <View style={{ flexDirection: 'row', paddingVertical: 6 }}>
      <Text style={[type.small, { width: 96 }]}>{label}</Text>
      <Text selectable style={[type.body, { flex: 1 }]}>{value}</Text>
    </View>
  );
}

export default function ProductDetailScreen({ navigation, route }) {
  const { id } = route.params;
  const { user, wishlistIds, toggleWishlist, addToCart, cartCount } = useApp();
  const toast = useToast();
  const requireLogin = useRequireLogin();
  const report = useReportError();

  const product = useQuery(() => DB.getProduct(id), [id]);
  const reviews = useQuery(
    async () => ({
      list: await DB.listReviews(id, 30),
      breakdown: await DB.ratingBreakdown(id),
      mine: user ? await DB.getUserReview(id, user.id) : null,
    }),
    [id, user?.id]
  );
  const [variantId, setVariantId] = useState(null);
  const [qty, setQty] = useState(1);
  const [showAll, setShowAll] = useState(false);
  const [busy, setBusy] = useState(false);

  const p = product.data;
  const wished = wishlistIds.has(id);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={{ flexDirection: 'row' }}>
          <IconButton
            testID="detail-wish"
            icon={wished ? 'heart' : 'heart-outline'}
            label={wished ? 'Hapus dari favorit' : 'Simpan ke favorit'}
            onPress={async () => {
              if (!requireLogin('Masuk dulu untuk menyimpan favorit')) return;
              try {
                const now = await toggleWishlist(id);
                tapFeedback();
                toast.show(now ? 'Disimpan ke favorit' : 'Dihapus dari favorit');
              } catch (e) {
                report(e);
              }
            }}
          />
          <IconButton icon="cart-outline" label="Keranjang" badge={cartCount || undefined} onPress={() => navigation.navigate('Main', { screen: 'Keranjang' })} />
        </View>
      ),
    });
  }, [navigation, wished, cartCount, id, requireLogin, toggleWishlist, toast, report]);

  if (product.loading && !p) return <Spinner />;
  if (!p) {
    return (
      <Screen style={{ justifyContent: 'center' }}>
        <EmptyState title="Produk tidak ditemukan" message="Produk ini mungkin sudah dihapus oleh penjual." actionLabel="Kembali" onAction={() => navigation.goBack()} />
      </Screen>
    );
  }

  const variants = p.variants;
  const selected = variants.find((v) => v.id === variantId) || null;
  const minDelta = variants.length ? Math.min(...variants.map((v) => v.price_delta)) : 0;
  const unitPrice = p.price + (selected ? selected.price_delta : minDelta);
  const maxQty = Math.max(1, selected ? selected.stock : variants.length ? 1 : p.stock);
  const isOwner = !!user && p.store_owner_id === user.id;
  const soldOut = p.stock <= 0;
  const variantName = (p.variant_label || 'varian').toLowerCase();

  const pickVariant = (v) => {
    setVariantId(v.id);
    setQty((q) => Math.min(q, Math.max(1, v.stock)));
  };

  const submit = async (buyNow) => {
    if (!requireLogin('Masuk dulu untuk berbelanja')) return;
    if (variants.length && !selected) {
      toast.show(`Pilih ${variantName} dulu`);
      return;
    }
    setBusy(true);
    try {
      const lineId = await addToCart(p.id, selected ? selected.id : null, qty);
      if (buyNow) {
        await DB.selectOnlyCartLine(user.id, lineId);
        navigation.navigate('Checkout');
      } else {
        tapFeedback();
        toast.show('Ditambahkan ke keranjang', { actionLabel: 'Lihat', onAction: () => navigation.navigate('Main', { screen: 'Keranjang' }) });
        product.reload();
      }
    } catch (e) {
      report(e);
    } finally {
      setBusy(false);
    }
  };

  const openReview = () => {
    if (!requireLogin('Masuk dulu untuk menulis ulasan')) return;
    navigation.navigate('ReviewForm', { productId: p.id, productName: p.name });
  };
  const removeReview = (review) =>
    Alert.alert('Hapus ulasan?', 'Ulasanmu akan dihapus dan rating produk dihitung ulang.', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus',
        style: 'destructive',
        onPress: async () => {
          try {
            await DB.deleteReview(user.id, review.id);
            toast.show('Ulasan dihapus');
            reviews.reload();
            product.reload();
          } catch (e) {
            report(e);
          }
        },
      },
    ]);

  const list = reviews.data?.list || [];
  const shown = showAll ? list : list.slice(0, 3);
  const breakdown = reviews.data?.breakdown;
  const mine = reviews.data?.mine;

  return (
    <Screen>
      <ScrollView testID="detail-scroll" contentContainerStyle={{ paddingBottom: spacing.xl }} contentInsetAdjustmentBehavior="automatic">
        <ProductThumb product={p} rounded={0} />
        <View style={{ padding: spacing.md, gap: spacing.ms, backgroundColor: colors.surface }}>
          <Text testID="detail-price" style={type.priceLarge}>
            {!selected && variants.length > 0 && variants.some((v) => v.price_delta !== minDelta) ? 'Mulai ' : ''}
            {rupiah(unitPrice)}
          </Text>
          <Text testID="detail-name" selectable style={type.title}>{p.name}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexWrap: 'wrap' }}>
            <Ionicons name="star" size={16} color="#F5A700" />
            <Text style={type.bodyStrong}>{p.rating_count ? ratingLabel(p.rating_avg) : 'Baru'}</Text>
            {p.rating_count ? <Text style={type.small}>({p.rating_count} ulasan)</Text> : null}
            <Text style={type.small}>· Terjual {compactCount(p.sold)}</Text>
            {p.condition === 'bekas' ? (
              <View style={{ backgroundColor: colors.ink, borderRadius: radius.sm, paddingHorizontal: 6, paddingVertical: 2 }}>
                <Text style={{ color: '#fff', fontSize: 11, fontWeight: '700' }}>Bekas</Text>
              </View>
            ) : null}
          </View>
          {!p.is_active ? (
            <View style={{ backgroundColor: colors.amberTint, borderRadius: radius.md, padding: spacing.ms }}>
              <Text style={[type.small, { color: colors.sunText }]}>Produk ini disembunyikan dan tidak tampil bagi pembeli.</Text>
            </View>
          ) : null}
        </View>

        <View style={{ padding: spacing.md, gap: spacing.md }}>
          <Card style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.ms }}>
            <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: colors.brandTint, alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="storefront-outline" size={22} color={colors.brandText} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={type.bodyStrong}>{p.store_name}</Text>
              <Text style={type.small}>{p.store_city} · {p.store_product_count} produk</Text>
            </View>
          </Card>

          {isOwner ? (
            <Card style={{ gap: spacing.sm, backgroundColor: colors.brandTint }}>
              <Text style={type.bodyStrong}>Ini produk tokomu</Text>
              <Text style={type.small}>Ubah harga, stok, atau hapus produk dari halaman Toko Saya.</Text>
              <Button title="Ubah produk" variant="secondary" icon="create-outline" onPress={() => navigation.navigate('ProductForm', { id: p.id })} />
            </Card>
          ) : null}

          {variants.length > 0 ? (
            <Card style={{ gap: spacing.ms }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={type.heading}>Pilih {p.variant_label || 'varian'}</Text>
                {selected ? <Text style={type.small}>Stok {selected.stock}</Text> : null}
              </View>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
                {variants.map((v) => (
                  <Chip
                    key={v.id}
                    testID={`variant-${v.name}`}
                    label={v.stock <= 0 ? `${v.name} (habis)` : v.price_delta > 0 ? `${v.name} · +${rupiah(v.price_delta)}` : v.name}
                    selected={variantId === v.id}
                    onPress={() => (v.stock > 0 ? pickVariant(v) : toast.show(`${v.name} sedang habis`))}
                    style={v.stock <= 0 ? { opacity: 0.5 } : null}
                  />
                ))}
              </View>
            </Card>
          ) : null}

          {!isOwner && !soldOut ? (
            <Card style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View>
                <Text style={type.heading}>Jumlah</Text>
                <Text style={type.small}>{selected ? `Tersedia ${selected.stock}` : variants.length ? 'Pilih varian dulu' : `Tersedia ${p.stock}`}</Text>
              </View>
              <Stepper testID="detail-qty" value={qty} onChange={setQty} min={1} max={maxQty} />
            </Card>
          ) : null}

          <Card style={{ gap: spacing.xs }}>
            <Text style={type.heading}>Detail produk</Text>
            <Spec label="Kondisi" value={p.condition === 'bekas' ? 'Bekas' : 'Baru'} />
            <Spec label="Merek" value={p.brand || '-'} />
            <Spec label="Kategori" value={p.category ? `${p.category.parent_name ? p.category.parent_name + ' › ' : ''}${p.category.name}` : '-'} />
            <Spec label="Berat" value={`${p.weight_gram} gram`} />
            <Spec label="Stok" value={soldOut ? 'Habis' : String(p.stock)} />
          </Card>

          <Card style={{ gap: spacing.sm }}>
            <Text style={type.heading}>Deskripsi</Text>
            <Text selectable style={type.body}>{p.description || 'Penjual belum menulis deskripsi.'}</Text>
          </Card>

          <Card style={{ gap: spacing.md }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={type.heading}>Ulasan pembeli</Text>
              {!isOwner ? <Button testID="detail-review" title={mine ? 'Ubah ulasanmu' : 'Tulis ulasan'} size="sm" variant="tint" icon="create-outline" onPress={openReview} /> : null}
            </View>
            {p.rating_count > 0 && breakdown ? (
              <View style={{ flexDirection: 'row', gap: spacing.md, alignItems: 'center' }}>
                <View style={{ alignItems: 'center', gap: 4 }}>
                  <Text style={{ fontSize: 40, fontWeight: '800', color: colors.ink }}>{ratingLabel(p.rating_avg)}</Text>
                  <Stars value={p.rating_avg} size={15} />
                  <Text style={type.caption}>{p.rating_count} ulasan</Text>
                </View>
                <View style={{ flex: 1, gap: 4 }}>
                  {[5, 4, 3, 2, 1].map((n) => (
                    <View key={n} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={[type.caption, { width: 12 }]}>{n}</Text>
                      <View style={{ flex: 1, height: 6, borderRadius: 3, backgroundColor: colors.line, overflow: 'hidden' }}>
                        <View style={{ width: `${(breakdown[n] / p.rating_count) * 100}%`, height: 6, backgroundColor: '#F5A700' }} />
                      </View>
                      <Text style={[type.caption, { width: 22, textAlign: 'right' }]}>{breakdown[n]}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ) : (
              <Text style={type.small}>Belum ada ulasan. Jadilah yang pertama menulis ulasan.</Text>
            )}
            {shown.map((r) => (
              <View key={r.id} style={{ gap: 6, borderTopWidth: 1, borderTopColor: colors.line, paddingTop: spacing.ms }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                  <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: colors.brandTint, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ fontSize: 12, fontWeight: '800', color: colors.brandText }}>{initials(r.user_name)}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={type.bodyStrong}>{r.user_name}{user && r.user_id === user.id ? ' (kamu)' : ''}</Text>
                    <Text style={type.caption}>{formatDate(r.updated_at)}</Text>
                  </View>
                  <Stars value={r.rating} size={13} />
                </View>
                {r.comment ? <Text selectable style={type.body}>{r.comment}</Text> : null}
                {user && r.user_id === user.id ? (
                  <View style={{ flexDirection: 'row', gap: spacing.md }}>
                    <Pressable onPress={openReview} hitSlop={8} accessibilityRole="button"><Text style={{ fontWeight: '700', color: colors.brandText }}>Ubah</Text></Pressable>
                    <Pressable testID="review-delete" onPress={() => removeReview(r)} hitSlop={8} accessibilityRole="button"><Text style={{ fontWeight: '700', color: colors.roseText }}>Hapus</Text></Pressable>
                  </View>
                ) : null}
              </View>
            ))}
            {list.length > 3 ? (
              <Button title={showAll ? 'Tampilkan lebih sedikit' : `Lihat semua ${list.length} ulasan`} variant="ghost" onPress={() => setShowAll((s) => !s)} />
            ) : null}
          </Card>
        </View>
      </ScrollView>

      {!isOwner ? (
        <BottomBar style={{ flexDirection: 'row', gap: spacing.ms }}>
          <Button testID="detail-add" title="Keranjang" icon="cart-outline" variant="secondary" style={{ flex: 1 }} disabled={soldOut || !p.is_active} loading={busy} onPress={() => submit(false)} />
          <Button testID="detail-buy" title={soldOut ? 'Stok habis' : 'Beli Sekarang'} style={{ flex: 1.3 }} disabled={soldOut || !p.is_active} loading={busy} onPress={() => submit(true)} />
        </BottomBar>
      ) : null}
    </Screen>
  );
}
