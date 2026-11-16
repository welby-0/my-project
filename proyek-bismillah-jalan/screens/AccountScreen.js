import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import * as DB from '../db';
import Card from '../components/Card';
import Button from '../components/Button';
import ListRow from '../components/ListRow';
import EmptyState from '../components/EmptyState';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../components/Screen';
import { useApp, useReportError } from '../state/AppContext';
import { useToast } from '../state/Toast';
import { useQuery } from '../state/hooks';
import { initials } from '../utils/format';
import { colors, spacing, type } from '../theme';

const SHORTCUTS = [
  { key: 'menunggu_pembayaran', label: 'Belum bayar', icon: 'wallet-outline' },
  { key: 'dikemas', label: 'Dikemas', icon: 'cube-outline' },
  { key: 'dikirim', label: 'Dikirim', icon: 'car-outline' },
  { key: 'selesai', label: 'Selesai', icon: 'checkmark-done-outline' },
];

export default function AccountScreen({ navigation }) {
  const { user, signOut, resetData } = useApp();
  const toast = useToast();
  const report = useReportError();
  const info = useQuery(
    async () =>
      user
        ? { orders: await DB.countOrdersByStatus(user.id), wishlist: (await DB.listWishlistIds(user.id)).length, store: await DB.getStoreByOwner(user.id) }
        : null,
    [user?.id]
  );

  if (!user) {
    return (
      <Screen style={{ justifyContent: 'center' }}>
        <EmptyState animated title="Masuk ke akunmu" message="Lihat pesanan, simpan favorit, dan kelola tokomu setelah masuk." actionLabel="Masuk" onAction={() => navigation.navigate('Login', { fromGuest: true })}>
          <Button title="Daftar akun baru" variant="secondary" style={{ alignSelf: 'stretch' }} onPress={() => navigation.navigate('Register', { fromGuest: true })} />
        </EmptyState>
      </Screen>
    );
  }

  const logout = () =>
    Alert.alert('Keluar dari akun?', 'Kamu bisa masuk lagi kapan saja.', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Keluar',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
        },
      },
    ]);

  const reset = () =>
    Alert.alert('Reset data demo?', 'Semua akun baru, pesanan, alamat, dan produk yang kamu buat akan dihapus. Data contoh dikembalikan seperti awal.', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Reset',
        style: 'destructive',
        onPress: async () => {
          try {
            await resetData();
            toast.show('Data dikembalikan ke kondisi awal');
            navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
          } catch (e) {
            report(e);
          }
        },
      },
    ]);

  const counts = info.data?.orders || {};

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: spacing.md, gap: spacing.md, paddingBottom: spacing.xxl }} contentInsetAdjustmentBehavior="automatic">
        <Card style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
          <View style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: colors.brand, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 22, fontWeight: '800', color: colors.onBrand }}>{initials(user.name)}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text testID="account-name" selectable style={type.title}>{user.name}</Text>
            <Text selectable style={type.small}>{user.email || user.phone}</Text>
          </View>
          <Button title="Ubah" size="sm" variant="tint" onPress={() => navigation.navigate('EditProfile')} />
        </Card>

        <Card padded={false}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.md, paddingBottom: spacing.sm }}>
            <Text style={type.heading}>Pesanan saya</Text>
            <Pressable onPress={() => navigation.navigate('Orders')} hitSlop={10} accessibilityRole="button">
              <Text style={{ fontWeight: '700', color: colors.brandText }}>Lihat semua</Text>
            </Pressable>
          </View>
          <View style={{ flexDirection: 'row', paddingBottom: spacing.md }}>
            {SHORTCUTS.map((s) => (
              <Pressable
                key={s.key}
                testID={`shortcut-${s.key}`}
                onPress={() => navigation.navigate('Orders', { tab: s.key })}
                accessibilityRole="button"
                accessibilityLabel={`${s.label}${counts[s.key] ? `, ${counts[s.key]} pesanan` : ''}`}
                style={{ flex: 1, alignItems: 'center', gap: 6, paddingVertical: spacing.sm }}
              >
                <View>
                  <Ionicons name={s.icon} size={28} color={colors.ink} />
                  {counts[s.key] ? (
                    <View style={{ position: 'absolute', top: -6, right: -10, minWidth: 18, height: 18, borderRadius: 9, backgroundColor: colors.brand, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 }}>
                      <Text style={{ fontSize: 11, fontWeight: '800', color: colors.onBrand }}>{counts[s.key]}</Text>
                    </View>
                  ) : null}
                </View>
                <Text style={type.caption}>{s.label}</Text>
              </Pressable>
            ))}
          </View>
        </Card>

        <Card padded={false}>
          <ListRow testID="menu-orders" icon="receipt-outline" title="Riwayat pesanan" subtitle={`${counts.semua || 0} pesanan`} onPress={() => navigation.navigate('Orders')} />
          <ListRow testID="menu-wishlist" icon="heart-outline" title="Favorit" subtitle="Produk yang kamu simpan" badge={info.data?.wishlist || undefined} onPress={() => navigation.navigate('Wishlist')} />
          <ListRow testID="menu-addresses" icon="location-outline" title="Alamat saya" subtitle="Tambah, ubah, hapus alamat" onPress={() => navigation.navigate('Addresses')} />
          <ListRow testID="menu-store" icon="storefront-outline" title="Toko saya" subtitle={info.data?.store ? info.data.store.name : 'Buka toko dan jual produkmu'} onPress={() => navigation.navigate('MyStore')} />
          <ListRow testID="menu-promos" icon="pricetag-outline" title="Promo & voucher" onPress={() => navigation.navigate('Promos')} last />
        </Card>

        <Card padded={false}>
          <ListRow testID="menu-reset" icon="refresh-outline" title="Reset data demo" subtitle="Kembalikan semua data ke kondisi awal" onPress={reset} />
          <ListRow testID="menu-logout" icon="log-out-outline" title="Keluar" danger onPress={logout} last />
        </Card>
      </ScrollView>
    </Screen>
  );
}
