import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius } from '../theme';

export default function Stepper({ value, onChange, min = 1, max = 99, size = 'md', testID }) {
  const h = size === 'sm' ? 34 : 40;
  const btn = (name, disabled, onPress, label) => (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      hitSlop={size === 'sm' ? 6 : 2}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      style={({ pressed }) => ({ width: h, height: h, alignItems: 'center', justifyContent: 'center', opacity: disabled ? 0.35 : pressed ? 0.6 : 1 })}
    >
      <Ionicons name={name} size={18} color={colors.ink} />
    </Pressable>
  );
  return (
    <View
      testID={testID}
      accessibilityRole="adjustable"
      accessibilityLabel="Jumlah"
      accessibilityValue={{ min, max, now: value }}
      style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: colors.line, borderRadius: radius.md, borderCurve: 'continuous', backgroundColor: colors.surface }}
    >
      {btn('remove', value <= min, () => onChange(value - 1), 'Kurangi jumlah')}
      <Text style={{ minWidth: 30, textAlign: 'center', fontSize: 15, fontWeight: '700', color: colors.ink, fontVariant: ['tabular-nums'] }}>{value}</Text>
      {btn('add', value >= max, () => onChange(value + 1), 'Tambah jumlah')}
    </View>
  );
}
