import { Modal, Pressable, SectionList, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, shadows, spacing, type } from '../theme';

// Lembar pilihan dari bawah. Pakai `options` untuk daftar biasa atau `sections` untuk daftar berkelompok.
// option: { value, label, subtitle? }
export default function OptionSheet({ visible, title, options, sections, value, onSelect, onClose }) {
  const insets = useSafeAreaInsets();
  const data = sections || [{ title: null, data: options || [] }];
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <Pressable style={{ flex: 1, backgroundColor: colors.overlay }} onPress={onClose} accessibilityLabel="Tutup" accessibilityRole="button" />
      <View
        style={{
          maxHeight: '75%', backgroundColor: colors.surface, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl,
          borderCurve: 'continuous', boxShadow: shadows.overlay, paddingBottom: insets.bottom,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.md }}>
          <Text style={type.heading} accessibilityRole="header">
            {title}
          </Text>
          <Pressable onPress={onClose} hitSlop={12} accessibilityRole="button" accessibilityLabel="Tutup">
            <Ionicons name="close" size={24} color={colors.ink} />
          </Pressable>
        </View>
        <SectionList
          sections={data}
          keyExtractor={(item) => String(item.value)}
          stickySectionHeadersEnabled={false}
          initialNumToRender={40}
          keyboardShouldPersistTaps="handled"
          renderSectionHeader={({ section }) =>
            section.title ? (
              <Text style={[type.smallStrong, { paddingHorizontal: spacing.md, paddingTop: spacing.ms, paddingBottom: spacing.xs, backgroundColor: colors.surface }]}>
                {section.title}
              </Text>
            ) : null
          }
          renderItem={({ item }) => {
            const selected = item.value === value;
            return (
              <Pressable
                onPress={() => onSelect(item.value)}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                style={({ pressed }) => ({
                  flexDirection: 'row', alignItems: 'center', gap: spacing.ms, minHeight: 52, paddingHorizontal: spacing.md,
                  backgroundColor: pressed ? colors.canvas : colors.surface,
                })}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[type.body, selected && { fontWeight: '700' }]}>{item.label}</Text>
                  {item.subtitle ? <Text style={type.small}>{item.subtitle}</Text> : null}
                </View>
                {selected ? <Ionicons name="checkmark-circle" size={22} color={colors.brand} /> : null}
              </Pressable>
            );
          }}
        />
      </View>
    </Modal>
  );
}
