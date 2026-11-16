import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing } from '../theme';

export function Screen({ children, style }) {
  return <View style={[{ flex: 1, backgroundColor: colors.canvas }, style]}>{children}</View>;
}

// Layar form yang bisa digulir dan tidak tertutup keyboard.
// iOS memakai automaticallyAdjustKeyboardInsets; Android memakai KeyboardAvoidingView.
export function FormScroll({ children, footer, contentStyle }) {
  const insets = useSafeAreaInsets();
  const body = (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
      automaticallyAdjustKeyboardInsets
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={[{ padding: spacing.md, gap: spacing.md, paddingBottom: spacing.xl + (footer ? 0 : insets.bottom) }, contentStyle]}
      style={{ flex: 1 }}
    >
      {children}
    </ScrollView>
  );
  return (
    <Screen>
      {Platform.OS === 'android' ? (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior="height">
          {body}
        </KeyboardAvoidingView>
      ) : (
        body
      )}
      {footer ? (
        <View style={{ padding: spacing.md, paddingBottom: spacing.md + insets.bottom, backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.line, gap: spacing.sm }}>
          {footer}
        </View>
      ) : null}
    </Screen>
  );
}

// Bilah aksi tetap di bawah layar
export function BottomBar({ children, style }) {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[
        { backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.line, paddingHorizontal: spacing.md, paddingTop: spacing.ms, paddingBottom: spacing.ms + insets.bottom },
        style,
      ]}
    >
      {children}
    </View>
  );
}
