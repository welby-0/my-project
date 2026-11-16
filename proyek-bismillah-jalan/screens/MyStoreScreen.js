import { Alert, FlatList, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DB from '../db';
import Card from '../components/Card';
import Button from '../components/Button';
import ProductThumb from '../components/ProductThumb';
import EmptyState from '../components/EmptyState';
import { BottomBar, Screen } from '../components/Screen';
import { Spinner } from '../components/Loading';
import { useApp, useReportError } from '../state/AppContext';
import { useToast } from '../state/Toast';
import { useQuery } from '../state/hooks';
import { deletePhoto } from '../utils/photos';
import { rupiah } from '../utils/format';
import { colors, radius, spacing, type } from '../theme';

function Stat({ label, value }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', gap: 2 }}>
      <Text style={{ fontSize: 22, fontWeight: '800', color: colors.ink }}>{value}</Text>
      <Text style={type.caption}>{label}</Text>
    </View>
  );
}

export default function MyStoreScreen({ navigation }) {
  const { user } = useApp();
  const toast = useToast();
  const report = useReportError();
  const data = useQuery(async () => {
    const store = await DB.getStoreByOwner(user.id);
    if (!store) return { store: null };
    return { store, stats: await DB.getStoreStats(store.id), products: await DB.listStoreProducts(store.id) };
  }, [user?.id]);

  if (data.loading && !data.data) return <Spinner />;
  const { store, stats, products } = data.data || {};

  if (!store) {
    return (
      <Screen style={{ justifyContent: 'center' }}>
        <EmptyState
          animated
          title="Buka toko gratis"
          message="Jual produkmu di PASARIN. Tambah, ubah, dan hapus produk kapan saja dari sini."
          actionLabel="Buka toko sekarang"
          onAction={() => navigation.navigate('StoreForm')}
        />
      </Screen>
    );
  }

  const guard = async (fn, message) => {
    try {
      await fn();
      if (message) toast.show(message);
      await data.reload();
    } catch (e) {
      report(e);
    }
  };

  const remove = (p) =>
    Alert.alert('Hapus produk?', `“${p.name}” akan dihapus permanen dan hilang dari keranjang pembeli.`, [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus',
        style: 'destructive',
        onPress: () =>
          guard(async () => {
            await DB.deleteProduct(user.id, p.id);
            await deletePhoto(p.image_uri);
          }, 'Produk dihapus'),
      },
    ]);

  return (
    <Screen>
      <FlatList
        testID="store-products"
        data={products}
        keyExtractor={(p) => String(p.id)}
        contentContainerStyle={{ padding: spacing.md, gap: spacing.ms, flexGrow: 1 }}
        ListHeaderComponent={
          <View style={{ gap: spacing.md, marginBottom: spacing.sm }}>
            <Card style={{ gap: spacing.sm }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.ms }}>
                <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: colors.brandTint, alignItems: 'center', justifyContent: 'center' }}>
                  <Ionicons name="storefront" size={24} color={colors.brandText} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text testID="store-title" style={type.title}>{store.name}</Text>
                  <Text style={type.small}>{store.city}</Text>
                </View>
                <Button testID="store-edit" title="Ubah" size="sm" variant="tint" onPress={() => navigation.navigate('StoreForm', { edit: true })} />
              </View>
              {store.description ? <Text style={type.body}>{store.description}</Text> : null}
              <View style={{ flexDirection: 'row', paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.line }}>
                <Stat label="Produk" value={stats.products} />
                <Stat label="Terjual" value={stats.sold} />
                <Stat label="Stok habis" value={stats.out_of_stock} />
                <Stat label="Disembunyikan" value={stats.hidden} />
              </View>
            </Card>
            <Text style={type.heading}>Produk saya</Text>
          </View>
        }
        ListEmptyComponent={<EmptyState title="Belum ada produk" message="Tambahkan produk pertamamu supaya bisa dilihat pembeli." />}
        renderItem={({ item: p }) => (
          <Card style={{ gap: spacing.ms, opacity: p.is_active ? 1 : 0.75 }}>
            <Pressable onPress={() => navigation.navigate('ProductDetail', { id: p.id })} accessibilityRole="button" accessibilityLabel={`Lihat ${p.name}`} style={{ flexDirection: 'row', gap: spacing.ms }}>
              <ProductThumb product={p} size={64} rounded={radius.md} />
              <View style={{ flex: 1, gap: 2 }}>
                <Text numberOfLines={2} style={type.bodyStrong}>{p.name}</Text>
                <Text style={type.price}>{p.variant_count ? 'Mulai ' : ''}{rupiah(p.price)}</Text>
                <Text style={type.small}>
                  Stok {p.stock} · Terjual {p.sold}
                  {!p.is_active ? ' · Disembunyikan' : ''}
                </Text>
              </View>
            </Pressable>
            <View style={{ flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' }}>
              <Button testID={`product-edit-${p.id}`} title="Ubah" size="sm" variant="secondary" icon="create-outline" onPress={() => navigation.navigate('ProductForm', { id: p.id })} />
              <Button
                testID={`product-toggle-${p.id}`}
                title={p.is_active ? 'Sembunyikan' : 'Tampilkan'}
                size="sm"
                variant="tint"
                onPress={() => guard(() => DB.setProductActive(user.id, p.id, !p.is_active), p.is_active ? 'Produk disembunyikan' : 'Produk ditampilkan')}
              />
              <Button testID={`product-delete-${p.id}`} title="Hapus" size="sm" variant="danger" onPress={() => remove(p)} />
            </View>
          </Card>
        )}
      />
      <BottomBar>
        <Button testID="store-add-product" title="Tambah produk" size="lg" icon="add" onPress={() => navigation.navigate('ProductForm')} />
      </BottomBar>
    </Screen>
  );
}
