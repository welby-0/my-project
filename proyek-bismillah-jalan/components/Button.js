import { ActivityIndicator, Pressable, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, type } from '../theme';

const VARIANTS = {
  primary: { bg: colors.brand, fg: colors.onBrand, border: null },
  secondary: { bg: colors.surface, fg: colors.ink, border: colors.lineStrong },
  tint: { bg: colors.brandTint, fg: colors.brandText, border: null },
  danger: { bg: colors.roseTint, fg: colors.roseText, border: null },
  ghost: { bg: 'transparent', fg: colors.brandText, border: null },
};
const SIZES = {
  sm: { height: 40, px: spacing.md, font: 14, icon: 16 },
  md: { height: 48, px: spacing.lg, font: 16, icon: 20 },
  lg: { height: 54, px: spacing.lg, font: 17, icon: 22 },
};

export default function Button({ title, onPress, variant = 'primary', size = 'md', icon, loading, disabled, style, testID, accessibilityLabel }) {
  const v = VARIANTS[variant];
  const s = SIZES[size];
  const inactive = disabled && variant !== 'ghost';
  const fg = disabled ? colors.inkMute : v.fg;
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityState={{ disabled: !!(disabled || loading), busy: !!loading }}
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        {
          minHeight: s.height,
          paddingHorizontal: s.px,
          borderRadius: radius.md,
          borderCurve: 'continuous',
          backgroundColor: inactive ? colors.line : v.bg,
          borderWidth: v.border && !inactive ? 1.5 : 0,
          borderColor: v.border || 'transparent',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: spacing.sm,
          opacity: pressed ? 0.85 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <>
          {icon ? <Ionicons name={icon} size={s.icon} color={fg} /> : null}
          <Text style={[type.button, { color: fg, fontSize: s.font }]} numberOfLines={1}>
            {title}
          </Text>
        </>
      )}
    </Pressable>
  );
}
