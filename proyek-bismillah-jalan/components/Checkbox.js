import { Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';

export default function Checkbox({ checked, onChange, disabled, label, testID }) {
  return (
    <Pressable
      testID={testID}
      onPress={() => onChange(!checked)}
      disabled={disabled}
      hitSlop={10}
      accessibilityRole="checkbox"
      accessibilityLabel={label}
      accessibilityState={{ checked: !!checked, disabled: !!disabled }}
      style={{ opacity: disabled ? 0.4 : 1 }}
    >
      <View
        style={{
          width: 24, height: 24, borderRadius: 7, borderWidth: 2,
          borderColor: checked ? colors.brand : colors.lineStrong,
          backgroundColor: checked ? colors.brand : colors.surface,
          alignItems: 'center', justifyContent: 'center',
        }}
      >
        {checked ? <Ionicons name="checkmark" size={16} color={colors.onBrand} /> : null}
      </View>
    </Pressable>
  );
}
