import { View } from 'react-native';
import { colors, radius, shadows, spacing } from '../theme';

export default function Card({ children, style, padded = true }) {
  return (
    <View
      style={[
        {
          backgroundColor: colors.surface,
          borderRadius: radius.lg,
          borderCurve: 'continuous',
          boxShadow: shadows.card,
          padding: padded ? spacing.md : 0,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
