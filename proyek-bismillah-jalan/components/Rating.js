import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';
import { ratingLabel } from '../utils/format';

export function Stars({ value = 0, size = 14 }) {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    const name = value >= i - 0.25 ? 'star' : value >= i - 0.75 ? 'star-half' : 'star-outline';
    stars.push(<Ionicons key={i} name={name} size={size} color="#F5A700" />);
  }
  return (
    <View style={{ flexDirection: 'row' }} accessible accessibilityLabel={`Rating ${ratingLabel(value)} dari 5`}>
      {stars}
    </View>
  );
}

// Rating ringkas di kartu produk: ★ 4,8
export function RatingBadge({ value, count }) {
  if (!count) return <Text style={{ fontSize: 12, color: colors.inkMute }}>Belum ada ulasan</Text>;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
      <Ionicons name="star" size={12} color="#F5A700" />
      <Text style={{ fontSize: 12, fontWeight: '700', color: colors.inkSoft }}>{ratingLabel(value)}</Text>
    </View>
  );
}

export function RatingInput({ value, onChange }) {
  return (
    <View style={{ flexDirection: 'row', gap: 6 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Pressable
          key={n}
          onPress={() => onChange(n)}
          hitSlop={4}
          accessibilityRole="button"
          accessibilityLabel={`${n} bintang`}
          accessibilityState={{ selected: value === n }}
          style={{ padding: 2 }}
        >
          <Ionicons name={n <= value ? 'star' : 'star-outline'} size={38} color={n <= value ? '#F5A700' : colors.lineStrong} />
        </Pressable>
      ))}
    </View>
  );
}
