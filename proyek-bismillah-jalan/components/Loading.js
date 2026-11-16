import { ActivityIndicator, Text, View } from 'react-native';
import Mascot from './Mascot';
import Button from './Button';
import { colors, spacing, type } from '../theme';

export function LoadingScreen({ message = 'Menyiapkan data PASARIN…' }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface, gap: spacing.md }} accessibilityLiveRegion="polite">
      <Mascot size={150} />
      <Text style={type.heading}>{message}</Text>
      <Text style={[type.small, { textAlign: 'center', maxWidth: 260 }]}>Pertama kali dibuka, katalog produk dibuat di perangkatmu. Hanya sebentar.</Text>
    </View>
  );
}

export function Spinner({ style }) {
  return (
    <View style={[{ padding: spacing.xl, alignItems: 'center' }, style]}>
      <ActivityIndicator color={colors.brand} size="large" />
    </View>
  );
}

export function ErrorScreen({ message, onRetry }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl, gap: spacing.md, backgroundColor: colors.surface }}>
      <Mascot size={110} animated={false} />
      <Text style={[type.title, { textAlign: 'center' }]}>Database belum bisa dibuka</Text>
      <Text selectable style={[type.body, { textAlign: 'center', color: colors.inkSoft }]}>
        {message}
      </Text>
      <Text style={[type.small, { textAlign: 'center' }]}>
        PASARIN memakai SQLite. Jalankan di Expo Go (HP) atau emulator Android/iOS; pratinjau web Snack belum mendukungnya.
      </Text>
      {onRetry ? <Button title="Coba lagi" onPress={onRetry} /> : null}
    </View>
  );
}
