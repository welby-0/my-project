import { Text, View } from 'react-native';
import { MascotMark } from './Mascot';
import { colors } from '../theme';

export default function Logo({ size = 30, textSize = 22 }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }} accessible accessibilityRole="header" accessibilityLabel="PASARIN">
      <MascotMark size={size} />
      <Text style={{ fontSize: textSize, fontWeight: '900', letterSpacing: 1, color: colors.ink }}>
        PASAR<Text style={{ color: colors.brandDeep }}>IN</Text>
      </Text>
    </View>
  );
}
