import { FlatList, View, useWindowDimensions } from 'react-native';
import * as DB from '../db';
import ProductCard from '../components/ProductCard';
import EmptyState from '../components/EmptyState';
import { Screen } from '../components/Screen';
import { Spinner } from '../components/Loading';
import { useApp } from '../state/AppContext';
import { useQuery } from '../state/hooks';
import { useProductActions } from '../state/useProductActions';
import { spacing } from '../theme';

export default function WishlistScreen({ navigation }) {
  const { width } = useWindowDimensions();
  const { user, wishlistIds } = useApp();
  const actions = useProductActions();
  // wishlistIds ikut menjadi dependensi supaya daftar langsung diperbarui saat favorit dimatikan
  const data = useQuery(() => DB.listWishlist(user.id), [user?.id, wishlistIds]);
  const cardWidth = (width - spacing.md * 2 - spacing.ms) / 2;

  if (data.loading && !data.data) return <Spinner />;
  return (
    <Screen>
      <FlatList
        testID="wishlist-list"
        data={data.data || []}
        keyExtractor={(p) => String(p.id)}
        numColumns={2}
        columnWrapperStyle={{ gap: spacing.ms }}
        contentContainerStyle={{ padding: spacing.md, gap: spacing.ms, flexGrow: 1 }}
        ListEmptyComponent={
          <EmptyState title="Belum ada favorit" message="Ketuk ikon hati di produk untuk menyimpannya di sini." actionLabel="Cari produk" onAction={() => navigation.navigate('Search')} />
        }
        renderItem={({ item }) => (
          <View style={{ width: cardWidth }}>
            <ProductCard product={item} wished={wishlistIds.has(item.id)} onPress={() => actions.open(item)} onAdd={() => actions.add(item)} onToggleWish={() => actions.toggleWish(item)} />
          </View>
        )}
      />
    </Screen>
  );
}
