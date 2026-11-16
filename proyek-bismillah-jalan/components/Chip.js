import { Pressable, Text } from 'react-native';
import { colors, radius, spacing } from '../theme';

export default function Chip({ label, selected, onPress, icon, style, testID }) {
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected }}
      hitSlop={{ top: 4, bottom: 4 }}
      style={({ pressed }) => [
        {
          minHeight: 36,
          paddingHorizontal: spacing.md,
          borderRadius: radius.full,
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
          gap: 6,
          backgroundColor: selected ? colors.brand : colors.surface,
          borderWidth: 1.5,
          borderColor: selected ? colors.brand : colors.line,
          opacity: pressed ? 0.8 : 1,
        },
        style,
      ]}
    >
      {icon ? <Text style={{ fontSize: 15 }}>{icon}</Text> : null}
      <Text style={{ fontSize: 14, fontWeight: selected ? '700' : '600', color: selected ? colors.onBrand : colors.inkSoft }}>{label}</Text>
    </Pressable>
  );
}
