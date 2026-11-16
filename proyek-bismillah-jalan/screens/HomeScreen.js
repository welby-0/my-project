import { useCallback, useRef, useState } from 'react';
import { FlatList, Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as DB from '../db';
import Logo from '../components/Logo';
import Mascot from '../components/Mascot';
import ProductCard from '../components/ProductCard';
import Chip from '../components/Chip';
import IconButton from '../components/IconButton';
import EmptyState from '../components/EmptyState';
import { Spinner } from '../components/Loading';
import { useApp, useReportError, useRequireLogin } from '../state/AppContext';
import { useQuery } from '../state/hooks';
import { useProductActions } from '../state/useProductActions';
import { colors, radius, spacing, type } from '../theme';
import { promoSummary } from '../utils/pricing';

const PAGE = 20;
const SORTS = [
  { value: 'terlaris', label: 'Terlaris' },
  { value: 'terbaru', label: 'Terbaru' },
  { value: 'termurah', label: 'Termurah' },
];

export default function HomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { cartCount } = useApp();
  const requireLogin = useRequireLogin();
  const report = useReportError();
  const actions = useProductActions();

  const [categoryId, setCategoryId] = useState(null);
  const [sort, setSort] = useState('terlaris');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const seq = useRef(0);

  const categories = useQuery(() => DB.listCategoryTree());
  const promos = useQuery(() => DB.listPromos());

  const fetchFirst = useCallback(async () => {
    const id = ++seq.current;
    try {
      const rows = await DB.listProducts({ categoryId, sort }, { limit: PAGE, offset: 0 });
      if (id !== seq.current) return;
      setItems(rows);
      setHasMore(rows.length === PAGE);
    } catch (e) {
      report(e);
    } finally {
      if (id === seq.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, [categoryId, sort, report]);

  useFocusEffect(
    useCallback(() => {
      fetchFirst();
    }, [fetchFirst])
  );

  const loadMore = async () => {
    if (!hasMore || loadingMore || loading) return;
    setLoadingMore(true);
    const id = seq.current;
    try {
      const rows = await DB.listProducts({ categoryId, sort }, { limit: PAGE, offset: items.length });
      if (id !== seq.current) return;
      setItems((prev) => [...prev, ...rows]);
      setHasMore(rows.length === PAGE);
    } catch (e) {
      report(e);
    } finally {
      setLoadingMore(false);
    }
  };

  const pickCategory = (id) => {
    if (id === categoryId) return;
    setLoading(true);
    setCategoryId(id);
  };
  const pickSort = (value) => {
    if (value === sort) return;
    setLoading(true);
    setSort(value);
  };

  const cardWidth = (width - spacing.md * 2 - spacing.ms) / 2;
  const promo = promos.data?.find((p) => p.code === 'GAJIAN50') || promos.data?.[0];

  const header = (
    <View style={{ gap: spacing.md, paddingTop: insets.top + spacing.sm, paddingBottom: spacing.sm }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Logo />
        <View style={{ flexDirection: 'row' }}>
          <IconButton testID="home-wishlist" icon="heart-outline" label="Favorit" onPress={() => requireLogin() && navigation.navigate('Wishlist')} />
          <IconButton testID="home-orders" icon="receipt-outline" label="Pesanan saya" onPress={() => requireLogin() && navigation.navigate('Orders')} />
          <IconButton testID="home-cart" icon="cart-outline" label="Keranjang" badge={cartCount || undefined} onPress={() => navigation.navigate('Main', { screen: 'Keranjang' })} />
        </View>
      </View>

      <Pressable
        testID="home-search"
        onPress={() => navigation.navigate('Search')}
        accessibilityRole="search"
        accessibilityLabel="Cari produk"
        style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, height: 48, paddingHorizontal: spacing.md, backgroundColor: colors.surface, borderRadius: radius.full, borderWidth: 1.5, borderColor: colors.line }}
      >
        <Ionicons name="search" size={20} color={colors.inkMute} />
        <Text style={[type.body, { color: colors.inkMute }]}>Cari produk, mis. rak sepatu</Text>
      </Pressable>

      {promo ? (
        <Pressable
          testID="home-promo"
          onPress={() => navigation.navigate('Promos')}
          accessibilityRole="button"
          accessibilityLabel={`${promo.title}. ${promoSummary(promo)}. Kode ${promo.code}`}
          style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.ink, borderRadius: radius.lg, borderCurve: 'continuous', paddingLeft: spacing.md, paddingRight: spacing.sm, paddingVertical: spacing.md, overflow: 'hidden' }}
        >
          <View style={{ flex: 1, gap: 6 }}>
            <Text style={{ color: colors.sun, fontSize: 13, fontWeight: '800' }}>{promo.title}</Text>
            <Text style={{ color: '#fff', fontSize: 26, fontWeight: '800', letterSpacing: -0.4 }}>{promoSummary(promo)}</Text>
            <View style={{ alignSelf: 'flex-start', backgroundColor: colors.brand, borderRadius: radius.full, paddingHorizontal: 12, paddingVertical: 5 }}>
              <Text style={{ color: colors.onBrand, fontSize: 13, fontWeight: '800' }}>Kode {promo.code}</Text>
            </View>
          </View>
          <Mascot size={92} animated={false} />
        </Pressable>
      ) : null}

      <View style={{ marginHorizontal: -spacing.md }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: spacing.md, gap: spacing.sm }}>
          <Chip testID="chip-semua" label="Semua" selected={categoryId === null} onPress={() => pickCategory(null)} />
          {(categories.data || []).map((c) => (
            <Chip key={c.id} testID={`chip-${c.slug}`} icon={c.icon} label={c.name} selected={categoryId === c.id} onPress={() => pickCategory(c.id)} />
          ))}
        </ScrollView>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={type.heading} accessibilityRole="header">
          Produk untukmu
        </Text>
        <View style={{ flexDirection: 'row', gap: 6 }}>
          {SORTS.map((s) => (
            <Pressable
              key={s.value}
              testID={`sort-${s.value}`}
              onPress={() => pickSort(s.value)}
              accessibilityRole="button"
              accessibilityState={{ selected: sort === s.value }}
              hitSlop={6}
              style={{ paddingHorizontal: 10, height: 30, borderRadius: radius.full, justifyContent: 'center', backgroundColor: sort === s.value ? colors.ink : 'transparent' }}
            >
              <Text style={{ fontSize: 13, fontWeight: '700', color: sort === s.value ? '#fff' : colors.inkMute }}>{s.label}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );

  return (
    <FlatList
      testID="home-list"
      data={items}
      keyExtractor={(item) => String(item.id)}
      numColumns={2}
      columnWrapperStyle={{ gap: spacing.ms }}
      contentContainerStyle={{ paddingHorizontal: spacing.md, gap: spacing.ms, paddingBottom: spacing.xl }}
      style={{ flex: 1, backgroundColor: colors.canvas }}
      ListHeaderComponent={header}
      renderItem={({ item }) => (
        <View style={{ width: cardWidth }}>
          <ProductCard
            product={item}
            wished={actions.wishlistIds.has(item.id)}
            onPress={() => actions.open(item)}
            onAdd={() => actions.add(item)}
            onToggleWish={() => actions.toggleWish(item)}
          />
        </View>
      )}
      ListEmptyComponent={
        loading ? (
          <Spinner />
        ) : (
          <EmptyState title="Belum ada produk" message="Coba pilih kategori lain." actionLabel="Lihat semua produk" onAction={() => pickCategory(null)} />
        )
      }
      ListFooterComponent={loadingMore ? <Spinner /> : null}
      onEndReached={loadMore}
      onEndReachedThreshold={0.6}
      refreshing={refreshing}
      onRefresh={() => {
        setRefreshing(true);
        fetchFirst();
      }}
      keyboardShouldPersistTaps="handled"
    />
  );
}
