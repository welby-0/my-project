import { useRef, useState } from 'react';
import { Text, View } from 'react-native';
import Mascot from '../components/Mascot';
import Button from '../components/Button';
import TextField from '../components/TextField';
import { FormScroll } from '../components/Screen';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../state/AppContext';
import { messageOf } from '../db/errors';
import { parseIdentifier } from '../utils/validators';
import { DEMO_ACCOUNT } from '../utils/constants';
import { successFeedback } from '../utils/haptics';
import { colors, spacing, type } from '../theme';

export default function LoginScreen({ navigation, route }) {
  const { signIn } = useApp();
  const insets = useSafeAreaInsets();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);
  const passwordRef = useRef(null);

  const finish = () => {
    if (route.params?.fromGuest && navigation.canGoBack()) navigation.goBack();
    else navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
  };

  const submit = async (id = identifier, pw = password) => {
    const next = {};
    const parsed = parseIdentifier(id);
    if (parsed.error) next.identifier = parsed.error;
    if (!pw) next.password = 'Isi kata sandi';
    setErrors(next);
    setFormError('');
    if (Object.keys(next).length) return;
    setLoading(true);
    try {
      await signIn(id, pw);
      successFeedback();
      finish();
    } catch (e) {
      setFormError(messageOf(e));
      setLoading(false);
    }
  };

  return (
    <FormScroll contentStyle={{ paddingTop: insets.top + spacing.xl }}>
      <View style={{ alignItems: 'center', gap: spacing.sm }}>
        <Mascot size={150} />
        <Text style={[type.display, { textAlign: 'center' }]}>Selamat datang di PASARIN</Text>
        <Text style={[type.body, { color: colors.inkSoft, textAlign: 'center' }]}>Masuk untuk belanja, simpan favorit, dan pantau pesananmu.</Text>
      </View>

      <TextField
        testID="login-identifier"
        label="Email atau No. HP"
        icon="person-outline"
        value={identifier}
        onChangeText={setIdentifier}
        error={errors.identifier}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        returnKeyType="next"
        onSubmitEditing={() => passwordRef.current?.focus()}
        placeholder="nama@email.com atau 0812…"
      />
      <TextField
        testID="login-password"
        inputRef={passwordRef}
        label="Kata sandi"
        icon="lock-closed-outline"
        value={password}
        onChangeText={setPassword}
        error={errors.password}
        secure
        autoCapitalize="none"
        returnKeyType="go"
        onSubmitEditing={() => submit()}
      />
      {formError ? (
        <View accessibilityLiveRegion="assertive" style={{ flexDirection: 'row', gap: 8, backgroundColor: colors.roseTint, borderRadius: 12, padding: spacing.ms, alignItems: 'center' }}>
          <Ionicons name="alert-circle" size={18} color={colors.roseText} />
          <Text selectable style={[type.small, { color: colors.roseText, flex: 1 }]}>{formError}</Text>
        </View>
      ) : null}

      <Button testID="login-submit" title="Masuk" size="lg" loading={loading} onPress={() => submit()} />
      <Button
        testID="login-demo"
        title="Masuk dengan akun demo"
        variant="tint"
        icon="flash-outline"
        disabled={loading}
        onPress={() => {
          setIdentifier(DEMO_ACCOUNT.email);
          setPassword(DEMO_ACCOUNT.password);
          submit(DEMO_ACCOUNT.email, DEMO_ACCOUNT.password);
        }}
      />

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.ms }}>
        <View style={{ flex: 1, height: 1, backgroundColor: colors.line }} />
        <Text style={type.small}>belum punya akun?</Text>
        <View style={{ flex: 1, height: 1, backgroundColor: colors.line }} />
      </View>
      <Button testID="login-register" title="Daftar akun" variant="secondary" onPress={() => navigation.navigate('Register', route.params)} />
      <Button testID="login-guest" title="Lihat produk dulu tanpa masuk" variant="ghost" onPress={() => (route.params?.fromGuest ? navigation.goBack() : navigation.reset({ index: 0, routes: [{ name: 'Main' }] }))} />
    </FormScroll>
  );
}
