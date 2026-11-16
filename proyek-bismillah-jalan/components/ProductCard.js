import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ProductThumb from './ProductThumb';
import { RatingBadge } from './Rating';
import { colors, radius, shadows, spacing, type } from '../theme';
import { compactCount, rupiah } from '../utils/format';

export default function ProductCard({ product, onPress, onAdd, wished, onToggleWish, style }) {
  const soldOut = product.stock <= 0;
  return (
    <Pressable
      onPress={onPress}
      testID={`product-card-${product.id}`}
      accessibilityRole="button"
      accessibilityLabel={`${product.name}, ${rupiah(product.price)}${soldOut ? ', stok habis' : ''}`}
      style={({ pressed }) => [
        {
          backgroundColor: colors.surface,
          borderRadius: radius.lg,
          borderCurve: 'continuous',
          boxShadow: shadows.card,
          overflow: 'hidden',
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
        style,
      ]}
    >
      <View>
        <ProductThumb product={product} rounded={0} />
        {soldOut ? (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(255,255,255,0.7)', alignItems: 'center', justifyContent: 'center' }]}>
            <Text style={{ fontWeight: '800', color: colors.inkSoft }}>Stok habis</Text>
          </View>
        ) : null}
        {onToggleWish ? (
          <Pressable
            onPress={onToggleWish}
            hitSlop={8}
            testID={`wish-${product.id}`}
            accessibilityRole="button"
            accessibilityLabel={wished ? 'Hapus dari favorit' : 'Simpan ke favorit'}
            style={{ position: 'absolute', top: 8, right: 8, width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(255,255,255,0.92)', alignItems: 'center', justifyContent: 'center' }}
          >
            <Ionicons name={wished ? 'heart' : 'heart-outline'} size={19} color={wished ? colors.rose : colors.inkSoft} />
          </Pressable>
        ) : null}
        {product.condition === 'bekas' ? (
          <View style={{ position: 'absolute', left: 8, top: 8, backgroundColor: colors.ink, borderRadius: radius.sm, paddingHorizontal: 6, paddingVertical: 2 }}>
            <Text style={{ color: '#fff', fontSize: 11, fontWeight: '700' }}>Bekas</Text>
          </View>
        ) : null}
      </View>
      <View style={{ padding: spacing.ms, gap: 4 }}>
        <Text numberOfLines={2} style={[type.bodyStrong, { fontSize: 14, lineHeight: 19, minHeight: 38 }]}>
          {product.name}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={type.price} numberOfLines={1}>
            {product.variant_count > 0 ? 'Mulai ' : ''}
            {rupiah(product.price)}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <RatingBadge value={product.rating_avg} count={product.rating_count} />
          {product.sold > 0 ? <Text style={type.caption}>· Terjual {compactCount(product.sold)}</Text> : null}
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3, flex: 1 }}>
            <Ionicons name="location-outline" size={12} color={colors.inkMute} />
            <Text style={type.caption} numberOfLines={1}>
              {product.store_city}
            </Text>
          </View>
          {onAdd ? (
            <Pressable
              onPress={onAdd}
              disabled={soldOut}
              hitSlop={6}
              testID={`add-${product.id}`}
              accessibilityRole="button"
              accessibilityLabel={`Tambah ${product.name} ke keranjang`}
              style={({ pressed }) => ({
                flexDirection: 'row', alignItems: 'center', gap: 2, backgroundColor: soldOut ? colors.line : colors.brandTint,
                borderRadius: radius.full, paddingHorizontal: 10, height: 30, opacity: pressed ? 0.7 : 1,
              })}
            >
              <Ionicons name="add" size={16} color={soldOut ? colors.inkMute : colors.brandText} />
              <Ionicons name="cart-outline" size={16} color={soldOut ? colors.inkMute : colors.brandText} />
            </Pressable>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}
