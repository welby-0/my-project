import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

// Getar halus hanya di iOS dan tidak pernah menjadi satu-satunya umpan balik
export function tapFeedback() {
  if (Platform.OS === 'ios') Haptics.selectionAsync().catch(() => {});
}
export function successFeedback() {
  if (Platform.OS === 'ios') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
}
