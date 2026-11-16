import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { radius, statusStyle } from '../theme';

export default function StatusBadge({ status }) {
  const s = statusStyle[status] || statusStyle.dikemas;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: s.bg, borderRadius: radius.full, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start' }}>
      <Ionicons name={s.icon} size={14} color={s.fg} />
      <Text style={{ fontSize: 12, fontWeight: '700', color: s.fg }}>{s.label}</Text>
    </View>
  );
}
