import { useState } from 'react';
import { Alert, Text } from 'react-native';
import * as DB from '../db';
import Button from '../components/Button';
import Card from '../components/Card';
import TextField from '../components/TextField';
import { FormScroll } from '../components/Screen';
import { useApp, useReportError } from '../state/AppContext';
import { useToast } from '../state/Toast';
import { validatePassword } from '../utils/validators';
import { successFeedback } from '../utils/haptics';
import { colors, spacing, type } from '../theme';

export default function EditProfileScreen({ navigation }) {
  const { user, refreshUser, removeAccount } = useApp();
  const toast = useToast();
  const report = useReportError();
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email || '');
  const [phone, setPhone] = useState(user.phone || '');
  const [saving, setSaving] = useState(false);
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [passErrors, setPassErrors] = useState({});
  const [changing, setChanging] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await DB.updateUser(user.id, { name, email, phone });
      await refreshUser();
      successFeedback();
      toast.show('Profil diperbarui');
    } catch (e) {
      report(e);
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async () => {
    const next = {};
    if (!oldPass) next.old = 'Isi kata sandi lama';
    const err = validatePassword(newPass);
    if (err) next.new = err;
    if (confirmPass !== newPass) next.confirm = 'Kata sandi baru tidak sama';
    setPassErrors(next);
    if (Object.keys(next).length) return;
    setChanging(true);
    try {
      await DB.changePassword(user.id, oldPass, newPass);
      setOldPass('');
      setNewPass('');
      setConfirmPass('');
      successFeedback();
      toast.show('Kata sandi diganti');
    } catch (e) {
      report(e);
    } finally {
      setChanging(false);
    }
  };

  const deleteAccount = () =>
    Alert.alert('Hapus akun permanen?', 'Pesanan, alamat, ulasan, favorit, dan tokomu ikut terhapus. Tindakan ini tidak bisa dibatalkan.', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus akun',
        style: 'destructive',
        onPress: async () => {
          try {
            await removeAccount();
            navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
          } catch (e) {
            report(e);
          }
        },
      },
    ]);

  return (
    <FormScroll>
      <Card style={{ gap: spacing.md }}>
        <Text style={type.heading}>Data diri</Text>
        <TextField testID="profile-name" label="Nama lengkap" value={name} onChangeText={setName} autoCapitalize="words" />
        <TextField testID="profile-email" label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="nama@email.com" />
        <TextField testID="profile-phone" label="No. HP" value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="0812…" helper="Isi minimal salah satu: email atau nomor HP." />
        <Button testID="profile-save" title="Simpan perubahan" loading={saving} onPress={save} />
      </Card>

      <Card style={{ gap: spacing.md }}>
        <Text style={type.heading}>Ganti kata sandi</Text>
        <TextField testID="pass-old" label="Kata sandi lama" value={oldPass} onChangeText={setOldPass} secure autoCapitalize="none" error={passErrors.old} />
        <TextField testID="pass-new" label="Kata sandi baru" value={newPass} onChangeText={setNewPass} secure autoCapitalize="none" error={passErrors.new} />
        <TextField testID="pass-confirm" label="Ulangi kata sandi baru" value={confirmPass} onChangeText={setConfirmPass} secure autoCapitalize="none" error={passErrors.confirm} />
        <Button testID="pass-save" title="Ganti kata sandi" variant="secondary" loading={changing} onPress={changePassword} />
      </Card>

      <Card style={{ gap: spacing.sm }}>
        <Text style={type.heading}>Hapus akun</Text>
        <Text style={[type.small, { color: colors.inkSoft }]}>Semua data yang terkait dengan akun ini akan dihapus dari perangkat.</Text>
        <Button testID="profile-delete" title="Hapus akun saya" variant="danger" onPress={deleteAccount} />
      </Card>
    </FormScroll>
  );
}
