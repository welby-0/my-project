import { useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useApp, useReportError, useRequireLogin } from './AppContext';
import { useToast } from './Toast';
import { tapFeedback } from '../utils/haptics';

// Aksi bersama untuk kartu produk: buka detail, tambah ke keranjang, simpan favorit
export function useProductActions() {
  const navigation = useNavigation();
  const { wishlistIds, toggleWishlist, addToCart } = useApp();
  const toast = useToast();
  const requireLogin = useRequireLogin();
  const report = useReportError();

  const open = useCallback((product) => navigation.navigate('ProductDetail', { id: product.id }), [navigation]);

  const add = useCallback(
    async (product) => {
      if (product.variant_count > 0) {
        toast.show('Pilih varian dulu di halaman produk');
        open(product);
        return;
      }
      if (!requireLogin('Masuk dulu untuk menambah ke keranjang')) return;
      try {
        await addToCart(product.id, null, 1);
        tapFeedback();
        toast.show('Ditambahkan ke keranjang', {
          actionLabel: 'Lihat',
          onAction: () => navigation.navigate('Main', { screen: 'Keranjang' }),
        });
      } catch (e) {
        report(e);
      }
    },
    [addToCart, navigation, open, report, requireLogin, toast]
  );

  const toggleWish = useCallback(
    async (product) => {
      if (!requireLogin('Masuk dulu untuk menyimpan favorit')) return;
      try {
        const now = await toggleWishlist(product.id);
        tapFeedback();
        toast.show(now ? 'Disimpan ke favorit' : 'Dihapus dari favorit');
      } catch (e) {
        report(e);
      }
    },
    [report, requireLogin, toast, toggleWishlist]
  );

  return { open, add, toggleWish, wishlistIds };
}
