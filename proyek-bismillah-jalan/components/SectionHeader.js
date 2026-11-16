import { Pressable, Text, View } from 'react-native';
import { colors, spacing, type } from '../theme';

export default function SectionHeader({ title, actionLabel, onAction, style }) {
  return (
    <View style={[{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.sm }, style]}>
      <Text style={type.heading} accessibilityRole="header">
        {title}
      </Text>
      {actionLabel ? (
        <Pressable onPress={onAction} hitSlop={10} accessibilityRole="button">
          <Text style={{ fontSize: 14, fontWeight: '700', color: colors.brandText }}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
