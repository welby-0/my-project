import { useState } from 'react';
import { FlatList, Pressable, ScrollView, Text, View } from 'react-native';
import * as DB from '../db';
import Card from '../components/Card';
import Chip from '../components/Chip';
import StatusBadge from '../components/StatusBadge';
import EmptyState from '../components/EmptyState';
import { Screen } from '../components/Screen';
import { Spinner } from '../components/Loading';
import { useApp } from '../state/AppContext';
import { useQuery } from '../state/hooks';
import { ORDER_TABS } from '../utils/constants';
import { formatDate, rupiah } from '../utils/format';
import { colors, radius, spacing, type } from '../theme';

export default function OrdersScreen({ navigation, route }) {
  const { user } = useApp();
  const [tab, setTab] = useState(route.params?.tab || 'semua');
  const data = useQuery(
    async () => ({ orders: await DB.listOrders(user.id, tab), counts: await DB.countOrdersByStatus(user.id) }),
    [user?.id, tab]
  );
  const counts = data.data?.counts || {};

  return (
    <Screen>
      <View style={{ backgroundColor: colors.surface }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ padding: spacing.md, gap: spacing.sm }}>
          {ORDER_TABS.map((t) => (
            <Chip key={t.key} testID={`orders-tab-${t.key}`} label={counts[t.key] ? `${t.label} (${counts[t.key]})` : t.label} selected={tab === t.key} onPress={() => setTab(t.key)} />
          ))}
        </ScrollView>
      </View>
      {data.loading && !data.data ? (
        <Spinner />
      ) : (
        <FlatList
          testID="orders-list"
          data={data.data?.orders || []}
          keyExtractor={(o) => String(o.id)}
          contentContainerStyle={{ padding: spacing.md, gap: spacing.ms, flexGrow: 1 }}
          refreshing={false}
          onRefresh={data.reload}
          ListEmptyComponent={
            <EmptyState
              title={tab === 'semua' ? 'Belum ada pesanan' : 'Tidak ada pesanan di sini'}
              message={tab === 'semua' ? 'Pesanan yang kamu buat akan muncul di sini.' : 'Coba lihat tab lainnya.'}
              actionLabel={tab === 'semua' ? 'Mulai belanja' : 'Lihat semua pesanan'}
              onAction={() => (tab === 'semua' ? navigation.navigate('Main', { screen: 'Beranda' }) : setTab('semua'))}
            />
          }
          renderItem={({ item: o }) => (
            <Pressable testID={`order-${o.id}`} onPress={() => navigation.navigate('OrderDetail', { id: o.id })} accessibilityRole="button" accessibilityLabel={`Pesanan ${o.order_no}, ${o.status}`}>
              <Card style={{ gap: spacing.ms }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing.sm }}>
                  <Text selectable style={type.smallStrong}>{o.order_no}</Text>
                  <StatusBadge status={o.status} />
                </View>
                <View style={{ flexDirection: 'row', gap: spacing.ms, alignItems: 'center' }}>
                  <View style={{ width: 52, height: 52, borderRadius: radius.md, backgroundColor: colors.brandTint, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ fontSize: 26 }}>{o.items[0]?.emoji}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text numberOfLines={1} style={type.bodyStrong}>{o.items[0]?.name}</Text>
                    <Text style={type.small}>{o.items.length > 1 ? `+${o.items.length - 1} produk lainnya · ` : ''}{o.item_count} barang</Text>
                  </View>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={type.caption}>{formatDate(o.created_at)}</Text>
                  <Text style={type.price}>{rupiah(o.total)}</Text>
                </View>
              </Card>
            </Pressable>
          )}
        />
      )}
    </Screen>
  );
}
