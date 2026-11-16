import { createContext, use, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import * as DB from '../db';
import { messageOf } from '../db/errors';
import { useToast } from './Toast';

const AppContext = createContext(null);
export const useApp = () => use(AppContext);

export function AppProvider({ children }) {
  const [status, setStatus] = useState('loading'); // loading | ready | error
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistIds, setWishlistIds] = useState(() => new Set());
  const [activePromo, setActivePromo] = useState(null);
  const userRef = useRef(null);
  userRef.current = user;

  const loadCounters = useCallback(async (u) => {
    if (!u) {
      setCartCount(0);
      setWishlistIds(new Set());
      return;
    }
    const count = await DB.getCartCount(u.id);
    const ids = await DB.listWishlistIds(u.id);
    setCartCount(count);
    setWishlistIds(new Set(ids));
  }, []);

  const init = useCallback(async () => {
    setStatus('loading');
    setError(null);
    try {
      await DB.getDb();
      const id = await DB.getSessionUserId();
      const u = id ? await DB.getUser(id) : null;
      if (id && !u) await DB.setSessionUserId(null);
      setUser(u);
      await loadCounters(u);
      setStatus('ready');
    } catch (e) {
      setError(e);
      setStatus('error');
    }
  }, [loadCounters]);

  useEffect(() => {
    init();
  }, [init]);

  const signIn = useCallback(async (identifier, password) => {
    const u = await DB.loginUser(identifier, password);
    await DB.setSessionUserId(u.id);
    setUser(u);
    await loadCounters(u);
    return u;
  }, [loadCounters]);

  const signUp = useCallback(async (data) => {
    const u = await DB.registerUser(data);
    await DB.setSessionUserId(u.id);
    setUser(u);
    await loadCounters(u);
    return u;
  }, [loadCounters]);

  const signOut = useCallback(async () => {
    await DB.setSessionUserId(null);
    setUser(null);
    setActivePromo(null);
    await loadCounters(null);
  }, [loadCounters]);

  const refreshUser = useCallback(async () => {
    if (!userRef.current) return;
    setUser(await DB.getUser(userRef.current.id));
  }, []);

  const refreshCart = useCallback(async () => {
    const u = userRef.current;
    if (u) setCartCount(await DB.getCartCount(u.id));
  }, []);

  const toggleWishlist = useCallback(async (productId) => {
    const u = userRef.current;
    if (!u) return null;
    const now = await DB.toggleWishlist(u.id, productId);
    setWishlistIds((prev) => {
      const next = new Set(prev);
      if (now) next.add(productId);
      else next.delete(productId);
      return next;
    });
    return now;
  }, []);

  const addToCart = useCallback(async (productId, variantId = null, qty = 1) => {
    const u = userRef.current;
    if (!u) return null;
    const lineId = await DB.addToCart(u.id, productId, variantId, qty);
    await refreshCart();
    return lineId;
  }, [refreshCart]);

  const resetData = useCallback(async () => {
    await DB.resetDatabase();
    setUser(null);
    setActivePromo(null);
    await loadCounters(null);
  }, [loadCounters]);

  const removeAccount = useCallback(async () => {
    if (!userRef.current) return;
    await DB.deleteUser(userRef.current.id);
    await signOut();
  }, [signOut]);

  const value = useMemo(
    () => ({
      status, error, retry: init, user, cartCount, wishlistIds, activePromo, setActivePromo,
      signIn, signUp, signOut, refreshUser, refreshCart, toggleWishlist, addToCart, resetData, removeAccount,
    }),
    [status, error, init, user, cartCount, wishlistIds, activePromo, signIn, signUp, signOut, refreshUser, refreshCart, toggleWishlist, addToCart, resetData, removeAccount]
  );

  return <AppContext value={value}>{children}</AppContext>;
}

// Memastikan pengguna sudah masuk; bila belum, arahkan ke layar Masuk lalu kembali ke layar ini
export function useRequireLogin() {
  const { user } = useApp();
  const navigation = useNavigation();
  const toast = useToast();
  return useCallback(
    (reason = 'Masuk dulu untuk melanjutkan') => {
      if (user) return true;
      toast.show(reason);
      navigation.navigate('Login', { fromGuest: true });
      return false;
    },
    [user, navigation, toast]
  );
}

// Menampilkan pesan error yang ramah; error tak terduga dicatat ke konsol
export function useReportError() {
  const toast = useToast();
  return useCallback(
    (e) => {
      if (!(e && e.name === 'AppError')) console.warn('[PASARIN]', e);
      toast.show(messageOf(e), { tone: 'error' });
    },
    [toast]
  );
}
