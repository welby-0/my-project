import { StatusBar } from 'expo-status-bar';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider, useApp } from './state/AppContext';
import { ToastProvider } from './state/Toast';
import RootNavigator from './navigation/RootNavigator';
import { ErrorScreen, LoadingScreen } from './components/Loading';
import { colors } from './theme';

const navTheme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, primary: colors.brand, background: colors.canvas, card: colors.surface, text: colors.ink, border: colors.line, notification: colors.brand },
};

function AppGate() {
  const { status, error, retry, user } = useApp();
  if (status === 'loading') return <LoadingScreen />;
  if (status === 'error') return <ErrorScreen message={String(error?.message || error)} onRetry={retry} />;
  return (
    <NavigationContainer theme={navTheme}>
      <RootNavigator initialRouteName={user ? 'Main' : 'Login'} />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ToastProvider>
        <AppProvider>
          <StatusBar style="dark" />
          <AppGate />
        </AppProvider>
      </ToastProvider>
    </SafeAreaProvider>
  );
}
