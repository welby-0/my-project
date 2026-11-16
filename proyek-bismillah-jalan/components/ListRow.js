import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, type } from '../theme';

export default function ListRow({ icon, title, subtitle, onPress, badge, danger, right, last, testID }) {
  const tint = danger ? colors.roseText : colors.ink;
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.ms,
        paddingVertical: spacing.ms,
        paddingHorizontal: spacing.md,
        minHeight: 56,
        backgroundColor: pressed ? colors.canvas : colors.surface,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: colors.line,
      })}
    >
      {icon ? (
        <View style={{ width: 36, height: 36, borderRadius: radius.md, borderCurve: 'continuous', backgroundColor: danger ? colors.roseTint : colors.brandTint, alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name={icon} size={19} color={danger ? colors.roseText : colors.brandText} />
        </View>
      ) : null}
      <View style={{ flex: 1 }}>
        <Text style={[type.bodyStrong, { color: tint }]}>{title}</Text>
        {subtitle ? <Text style={type.small}>{subtitle}</Text> : null}
      </View>
      {badge ? (
        <View style={{ minWidth: 22, height: 22, borderRadius: 11, paddingHorizontal: 6, backgroundColor: colors.brand, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: 12, fontWeight: '800', color: colors.onBrand }}>{badge}</Text>
        </View>
      ) : null}
      {right}
      {onPress ? <Ionicons name="chevron-forward" size={18} color={colors.inkMute} /> : null}
    </Pressable>
  );
}
