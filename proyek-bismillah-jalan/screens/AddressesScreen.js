import { Alert, FlatList, Pressable, Text, View } from 'react-native';
import * as DB from '../db';
import Card from '../components/Card';
import Button from '../components/Button';
import EmptyState from '../components/EmptyState';
import { BottomBar, Screen } from '../components/Screen';
import { Spinner } from '../components/Loading';
import { useApp, useReportError } from '../state/AppContext';
import { useToast } from '../state/Toast';
import { useQuery } from '../state/hooks';
import { colors, radius, spacing, type } from '../theme';

export default function AddressesScreen({ navigation, route }) {
  const select = !!route.params?.select;
  const { user } = useApp();
  const toast = useToast();
  const report = useReportError();
  const data = useQuery(() => DB.listAddresses(user.id), [user?.id]);

  if (data.loading && !data.data) return <Spinner />;
  const list = data.data || [];

  const guard = async (fn, message) => {
    try {
      await fn();
      if (message) toast.show(message);
      await data.reload();
    } catch (e) {
      report(e);
    }
  };

  const remove = (a) =>
    Alert.alert('Hapus alamat?', `${a.label} · ${a.recipient}`, [
      { text: 'Batal', style: 'cancel' },
      { text: 'Hapus', style: 'destructive', onPress: () => guard(() => DB.deleteAddress(user.id, a.id), 'Alamat dihapus') },
    ]);

  const choose = (a) => navigation.popTo ? navigation.popTo('Checkout', { addressId: a.id }) : navigation.navigate({ name: 'Checkout', params: { addressId: a.id }, merge: true });

  return (
    <Screen>
      <FlatList
        testID="address-list"
        data={list}
        keyExtractor={(a) => String(a.id)}
        contentContainerStyle={{ padding: spacing.md, gap: spacing.ms, flexGrow: 1 }}
        ListEmptyComponent={<EmptyState title="Belum ada alamat" message="Tambahkan alamat agar checkout lebih cepat." />}
        renderItem={({ item: a }) => (
          <Pressable disabled={!select} onPress={() => choose(a)} accessibilityRole={select ? 'button' : undefined} accessibilityLabel={select ? `Pilih alamat ${a.label}` : undefined}>
            <Card style={{ gap: spacing.sm, borderWidth: a.is_default ? 1.5 : 0, borderColor: colors.brand }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                <View style={{ backgroundColor: colors.brandTint, borderRadius: radius.full, paddingHorizontal: 10, paddingVertical: 3 }}>
                  <Text style={{ fontSize: 12, fontWeight: '800', color: colors.brandText }}>{a.label}</Text>
                </View>
                {a.is_default ? (
                  <View style={{ backgroundColor: colors.mintTint, borderRadius: radius.full, paddingHorizontal: 10, paddingVertical: 3 }}>
                    <Text style={{ fontSize: 12, fontWeight: '800', color: colors.mintText }}>Utama</Text>
                  </View>
                ) : null}
              </View>
              <Text style={type.bodyStrong}>{a.recipient} · {a.phone}</Text>
              <Text selectable style={[type.body, { color: colors.inkSoft }]}>{a.street}, {a.city}, {a.province} {a.postal_code}</Text>
              {!select ? (
                <View style={{ flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' }}>
                  {!a.is_default ? <Button testID={`address-default-${a.id}`} title="Jadikan utama" size="sm" variant="tint" onPress={() => guard(() => DB.setDefaultAddress(user.id, a.id), 'Alamat utama diganti')} /> : null}
                  <Button testID={`address-edit-${a.id}`} title="Ubah" size="sm" variant="secondary" onPress={() => navigation.navigate('AddressForm', { id: a.id })} />
                  <Button testID={`address-delete-${a.id}`} title="Hapus" size="sm" variant="danger" onPress={() => remove(a)} />
                </View>
              ) : null}
            </Card>
          </Pressable>
        )}
      />
      <BottomBar>
        <Button testID="address-add" title="Tambah alamat baru" size="lg" icon="add" onPress={() => navigation.navigate('AddressForm')} />
      </BottomBar>
    </Screen>
  );
}
