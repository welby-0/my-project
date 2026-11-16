jest.mock('expo-sqlite', () => ({
  openDatabaseAsync: async () => require('./sqlite-adapter').createAdapter(),
}));

jest.mock('expo-crypto', () => {
  const c = require('crypto');
  return {
    CryptoDigestAlgorithm: { SHA256: 'SHA-256' },
    getRandomBytesAsync: async (n) => new Uint8Array(c.randomBytes(n)),
    digestStringAsync: async (_alg, s) => c.createHash('sha256').update(s).digest('hex'),
  };
});

// Reanimated dimock (diganti View biasa): animasi CSS tidak relevan untuk uji logika layar
jest.mock('react-native-reanimated', () => {
  const React = require('react');
  const { View } = require('react-native');
  const chain = () => ({ duration: () => ({}), delay: () => ({}) });
  return {
    __esModule: true,
    default: { View: React.forwardRef((props, ref) => React.createElement(View, { ...props, ref })) },
    useReducedMotion: () => false,
    FadeInDown: chain(),
    FadeOut: chain(),
  };
});

jest.mock('expo-haptics', () => ({
  selectionAsync: jest.fn(() => Promise.resolve()),
  notificationAsync: jest.fn(() => Promise.resolve()),
  NotificationFeedbackType: { Success: 'success' },
}));

jest.mock('expo-image-picker', () => ({
  launchImageLibraryAsync: jest.fn(async () => ({ canceled: false, assets: [{ uri: 'file:///cache/foto-produk.jpg' }] })),
}));

jest.mock('expo-file-system/legacy', () => ({
  documentDirectory: 'file:///docs/',
  makeDirectoryAsync: jest.fn(async () => {}),
  copyAsync: jest.fn(async () => {}),
  deleteAsync: jest.fn(async () => {}),
}));

jest.mock('react-native-safe-area-context', () => require('react-native-safe-area-context/jest/mock').default);
