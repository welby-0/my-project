import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, type } from '../theme';

export default function TextField({
  label, value, onChangeText, error, helper, secure, icon, right, multiline, style, inputRef, testID, ...rest
}) {
  const [focused, setFocused] = useState(false);
  const [reveal, setReveal] = useState(false);
  const borderColor = error ? colors.rose : focused ? colors.brand : colors.line;
  return (
    <View style={[{ gap: 6 }, style]}>
      {label ? <Text style={type.smallStrong}>{label}</Text> : null}
      <View
        style={{
          flexDirection: 'row',
          alignItems: multiline ? 'flex-start' : 'center',
          minHeight: multiline ? 96 : 50,
          backgroundColor: colors.surface,
          borderRadius: radius.md,
          borderCurve: 'continuous',
          borderWidth: focused || error ? 2 : 1.5,
          borderColor,
          paddingHorizontal: spacing.ms,
          gap: spacing.sm,
        }}
      >
        {icon ? <Ionicons name={icon} size={20} color={colors.inkMute} style={multiline ? { marginTop: 13 } : null} /> : null}
        <TextInput
          ref={inputRef}
          testID={testID}
          accessibilityLabel={label}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secure && !reveal}
          multiline={multiline}
          textAlignVertical={multiline ? 'top' : 'center'}
          placeholderTextColor={colors.inkMute}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={[
            type.body,
            { flex: 1, paddingVertical: multiline ? 12 : 0, minHeight: multiline ? 84 : 48 },
          ]}
          {...rest}
        />
        {secure ? (
          <Pressable
            onPress={() => setReveal((r) => !r)}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel={reveal ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
          >
            <Ionicons name={reveal ? 'eye-off-outline' : 'eye-outline'} size={22} color={colors.inkMute} />
          </Pressable>
        ) : null}
        {right}
      </View>
      {error ? (
        <View style={{ flexDirection: 'row', gap: 4, alignItems: 'center' }}>
          <Ionicons name="alert-circle" size={14} color={colors.roseText} />
          <Text selectable style={[type.caption, { color: colors.roseText, flex: 1 }]}>
            {error}
          </Text>
        </View>
      ) : helper ? (
        <Text style={type.caption}>{helper}</Text>
      ) : null}
    </View>
  );
}
