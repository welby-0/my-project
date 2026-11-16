import { ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useReducedMotion } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as DB from '../db';
import Mascot from '../components/Mascot';
import Card from '../components/Card';
import Button from '../components/Button';
import { Spinner } from '../components/Loading';
import { useApp } from '../state/AppContext';
import { useQuery } from '../state/hooks';
import { colors, spacing, type } from '../theme';
import { rupiah } from '../utils/format';

const popIn = {
  animationName: { from: { transform: [{ scale: 0.4 }], opacity: 0 }, to: { transform: [{ scale: 1 }], opacity: 1 } },
  animationDuration: '450ms',
  animationDelay: '250ms',
  animationTimingFunction: 'ease-out',
  animationFillMode: 'both',
};

const checkBadge = { position: 'absolute', right: 0, bottom: 14, width: 64, height: 64, borderRadius: 32, backgroundColor: colors.mint, borderWidth: 4, borderColor: colors.surface, alignItems: 'center', justifyContent: 'center' };

export default function OrderSuccessScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const reduced = useReducedMotion();
  const { user } = useApp();
  const order = useQuery(() => DB.getOrder(user.id, route.params.orderId), [route.params.orderId, user?.id]);
  const o = order.data;
  const needsPayment = o?.status === 'menunggu_pembayaran';

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.surface }}
      contentContainerStyle={{ padding: spacing.lg, paddingTop: insets.top + spacing.xl, paddingBottom: insets.bottom + spacing.lg, alignItems: 'center', gap: spacing.md }}
    >
      <View style={{ width: 170, height: 190 }}>
        <Mascot size={170} />
        <Animated.View
          testID="success-check"
          style={{ ...checkBadge, ...(reduced ? null : popIn) }}
          accessible
          accessibilityLabel="Berhasil"
        >
          <Ionicons name="checkmark" size={38} color="#fff" />
        </Animated.View>
      </View>

      <Text testID="success-title" style={[type.display, { textAlign: 'center' }]}>Pesanan berhasil!</Text>
      <Text style={[type.body, { textAlign: 'center', color: colors.inkSoft, maxWidth: 320 }]}>
        {needsPayment ? 'Selesaikan pembayaran agar pesananmu segera diproses penjual.' : 'Pesananmu sedang dikemas oleh penjual.'}
      </Text>

      {!o ? (
        <Spinner />
      ) : (
        <Card style={{ alignSelf: 'stretch', gap: spacing.sm, backgroundColor: colors.canvas }}>
          <View>
            <Text style={type.small}>No. pesanan</Text>
            <Text testID="success-order-no" selectable style={[type.title, { letterSpacing: 0.5 }]}>{o.order_no}</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View>
              <Text style={type.small}>Total</Text>
              <Text style={type.price}>{rupiah(o.total)}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={type.small}>Pembayaran</Text>
              <Text style={type.bodyStrong}>{o.payment_name}</Text>
            </View>
          </View>
        </Card>
      )}

      <View style={{ alignSelf: 'stretch', gap: spacing.sm, marginTop: spacing.sm }}>
        <Button
          testID="success-view-order"
          title={needsPayment ? 'Lihat cara pembayaran' : 'Lihat pesanan'}
          size="lg"
          onPress={() => navigation.reset({ index: 1, routes: [{ name: 'Main' }, { name: 'OrderDetail', params: { id: route.params.orderId } }] })}
        />
        <Button testID="success-back" title="Kembali belanja" variant="secondary" onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Main' }] })} />
      </View>
    </ScrollView>
  );
}
