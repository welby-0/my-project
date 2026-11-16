import { useRef, useState } from 'react';
import { Text, View } from 'react-native';
import Button from '../components/Button';
import TextField from '../components/TextField';
import Checkbox from '../components/Checkbox';
import { FormScroll } from '../components/Screen';
import { useApp } from '../state/AppContext';
import { useToast } from '../state/Toast';
import { messageOf } from '../db/errors';
import { parseIdentifier, passwordStrength, validateName, validatePassword } from '../utils/validators';
import { successFeedback } from '../utils/haptics';
import { colors, radius, spacing, type } from '../theme';

const STRENGTH_COLOR = { 1: colors.rose, 2: colors.sun, 3: colors.mint };

export default function RegisterScreen({ navigation }) {
  const { signUp } = useApp();
  const toast = useToast();
  const [name, setName] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [agree, setAgree] = useState(false);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);
  const refs = { ident: useRef(null), pass: useRef(null), confirm: useRef(null) };

  const detected = identifier.trim() ? parseIdentifier(identifier) : null;
  const strength = passwordStrength(password);

  const submit = async () => {
    const next = {};
    const nameError = validateName(name);
    if (nameError) next.name = nameError;
    if (!detected || detected.error) next.identifier = detected?.error || 'Isi email atau nomor HP';
    const passError = validatePassword(password);
    if (passError) next.password = passError;
    if (confirm !== password) next.confirm = 'Kata sandi tidak sama';
    if (!agree) next.agree = 'Setujui syarat dan ketentuan untuk melanjutkan';
    setErrors(next);
    setFormError('');
    if (Object.keys(next).length) return;
    setLoading(true);
    try {
      await signUp({ name, identifier, password });
      successFeedback();
      toast.show('Akun berhasil dibuat. Selamat berbelanja!');
      navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
    } catch (e) {
      setFormError(messageOf(e));
      setLoading(false);
    }
  };

  return (
    <FormScroll>
      <Text style={[type.body, { color: colors.inkSoft }]}>Isi data di bawah. Cukup email atau nomor HP, tidak perlu keduanya.</Text>
      <TextField
        testID="register-name"
        label="Nama lengkap"
        icon="person-outline"
        value={name}
        onChangeText={setName}
        error={errors.name}
        autoCapitalize="words"
        returnKeyType="next"
        onSubmitEditing={() => refs.ident.current?.focus()}
      />
      <TextField
        testID="register-identifier"
        inputRef={refs.ident}
        label="Email atau No. HP"
        icon="mail-outline"
        value={identifier}
        onChangeText={setIdentifier}
        error={errors.identifier}
        helper={detected && !detected.error ? `Terdeteksi sebagai ${detected.type === 'email' ? 'email' : 'nomor HP'}` : undefined}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        returnKeyType="next"
        onSubmitEditing={() => refs.pass.current?.focus()}
      />
      <View style={{ gap: 6 }}>
        <TextField
          testID="register-password"
          inputRef={refs.pass}
          label="Kata sandi"
          icon="lock-closed-outline"
          value={password}
          onChangeText={setPassword}
          error={errors.password}
          secure
          autoCapitalize="none"
          returnKeyType="next"
          onSubmitEditing={() => refs.confirm.current?.focus()}
        />
        {strength.level > 0 ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }} accessibilityLabel={`Kekuatan kata sandi: ${strength.label}`}>
            {[1, 2, 3].map((n) => (
              <View key={n} style={{ flex: 1, height: 5, borderRadius: radius.full, backgroundColor: n <= strength.level ? STRENGTH_COLOR[strength.level] : colors.line }} />
            ))}
            <Text style={[type.caption, { width: 44, textAlign: 'right' }]}>{strength.label}</Text>
          </View>
        ) : null}
      </View>
      <TextField
        testID="register-confirm"
        inputRef={refs.confirm}
        label="Ulangi kata sandi"
        icon="lock-closed-outline"
        value={confirm}
        onChangeText={setConfirm}
        error={errors.confirm}
        secure
        autoCapitalize="none"
        returnKeyType="done"
        onSubmitEditing={submit}
      />
      <View style={{ gap: 6 }}>
        <View style={{ flexDirection: 'row', gap: spacing.ms, alignItems: 'center' }}>
          <Checkbox testID="register-agree" checked={agree} onChange={setAgree} label="Setuju syarat dan ketentuan" />
          <Text style={[type.small, { flex: 1 }]}>Saya setuju dengan Syarat & Ketentuan dan Kebijakan Privasi PASARIN.</Text>
        </View>
        {errors.agree ? <Text style={[type.caption, { color: colors.roseText }]}>{errors.agree}</Text> : null}
      </View>
      {formError ? (
        <Text selectable accessibilityLiveRegion="assertive" style={[type.small, { color: colors.roseText, backgroundColor: colors.roseTint, padding: spacing.ms, borderRadius: radius.md }]}>
          {formError}
        </Text>
      ) : null}
      <Button testID="register-submit" title="Daftar" size="lg" loading={loading} onPress={submit} />
      <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6 }}>
        <Text style={type.body}>Sudah punya akun?</Text>
        <Button title="Masuk" variant="ghost" size="sm" onPress={() => navigation.goBack()} />
      </View>
    </FormScroll>
  );
}
