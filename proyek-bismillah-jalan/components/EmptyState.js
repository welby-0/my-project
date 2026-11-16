import { Text, View } from 'react-native';
import Mascot from './Mascot';
import Button from './Button';
import { colors, spacing, type } from '../theme';

export default function EmptyState({ title, message, actionLabel, onAction, mascotSize = 120, animated = false, children }) {
  return (
    <View style={{ alignItems: 'center', padding: spacing.xl, gap: spacing.md }}>
      <Mascot size={mascotSize} animated={animated} />
      <Text style={[type.title, { textAlign: 'center' }]}>{title}</Text>
      {message ? <Text style={[type.body, { textAlign: 'center', color: colors.inkSoft, maxWidth: 320 }]}>{message}</Text> : null}
      {actionLabel ? <Button title={actionLabel} onPress={onAction} style={{ marginTop: spacing.sm, alignSelf: 'stretch' }} /> : null}
      {children}
    </View>
  );
}
