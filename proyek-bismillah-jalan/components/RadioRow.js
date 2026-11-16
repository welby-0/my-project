import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, type } from '../theme';

export default function RadioRow({ selected, onPress, title, subtitle, right, testID }) {
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected: !!selected }}
      style={({ pressed }) => ({
        flexDirection: 'row', alignItems: 'center', gap: spacing.ms, minHeight: 56, padding: spacing.ms, borderRadius: radius.md, borderCurve: 'continuous',
        borderWidth: 1.5, borderColor: selected ? colors.brand : colors.line, backgroundColor: selected ? colors.brandTint : pressed ? colors.canvas : colors.surface,
      })}
    >
      <Ionicons name={selected ? 'radio-button-on' : 'radio-button-off'} size={22} color={selected ? colors.brandDeep : colors.lineStrong} />
      <View style={{ flex: 1 }}>
        <Text style={type.bodyStrong}>{title}</Text>
        {subtitle ? <Text style={type.small}>{subtitle}</Text> : null}
      </View>
      {right}
    </Pressable>
  );
}
