import { createContext, use, useCallback, useMemo, useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeOut } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, motion, radius, shadows } from '../theme';

const ToastContext = createContext({ show: () => {} });
export const useToast = () => use(ToastContext);

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);
  const timer = useRef(null);
  const insets = useSafeAreaInsets();

  const hide = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    setToast(null);
  }, []);

  const show = useCallback((message, options = {}) => {
    if (timer.current) clearTimeout(timer.current);
    const id = Date.now() + Math.random();
    setToast({ id, message, actionLabel: options.actionLabel, onAction: options.onAction, tone: options.tone });
    timer.current = setTimeout(() => setToast(null), options.duration || (options.actionLabel ? 5000 : 2800));
  }, []);

  const value = useMemo(() => ({ show, hide }), [show, hide]);

  return (
    <ToastContext value={value}>
      {children}
      <View pointerEvents="box-none" style={{ position: 'absolute', left: 0, right: 0, bottom: insets.bottom + 76, alignItems: 'center', paddingHorizontal: 16 }}>
        {toast ? (
          <Animated.View
            key={toast.id}
            entering={FadeInDown.duration(motion.base)}
            exiting={FadeOut.duration(motion.fast)}
            accessibilityLiveRegion="polite"
            style={{
              flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: toast.tone === 'error' ? colors.roseText : colors.ink,
              borderRadius: radius.md, paddingVertical: 12, paddingHorizontal: 16, boxShadow: shadows.overlay, maxWidth: 480,
            }}
          >
            <Text selectable style={{ color: '#fff', fontSize: 14, fontWeight: '600', flexShrink: 1 }}>
              {toast.message}
            </Text>
            {toast.actionLabel ? (
              <Pressable
                hitSlop={10}
                accessibilityRole="button"
                onPress={() => {
                  const fn = toast.onAction;
                  hide();
                  fn?.();
                }}
              >
                <Text style={{ color: colors.sun, fontSize: 14, fontWeight: '800' }}>{toast.actionLabel}</Text>
              </Pressable>
            ) : null}
          </Animated.View>
        ) : null}
      </View>
    </ToastContext>
  );
}
