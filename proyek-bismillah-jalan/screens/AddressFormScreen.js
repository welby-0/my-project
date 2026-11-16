import { useEffect, useState } from 'react';
import { Alert, Pressable, Switch, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DB from '../db';
import Button from '../components/Button';
import Chip from '../components/Chip';
import TextField from '../components/TextField';
import OptionSheet from '../components/OptionSheet';
import { FormScroll } from '../components/Screen';
import { useApp, useReportError } from '../state/AppContext';
import { useToast } from '../state/Toast';
import { ADDRESS_LABELS, PROVINCES } from '../utils/constants';
import { isPhone, validatePostalCode, validateRequired } from '../utils/validators';
import { successFeedback } from '../utils/haptics';
import { colors, radius, spacing, type } from '../theme';

export default function AddressFormScreen({ navigation, route }) {
  const id = route.params?.id;
  const { user } = useApp();
  const toast = useToast();
  const report = useReportError();
  const [form, setForm] = useState({ label: 'Rumah', recipient: user.name, phone: user.phone || '', street: '', city: '', province: '', postalCode: '', isDefault: false });
  const [errors, setErrors] = useState({});
  const [showProvince, setShowProvince] = useState(false);
  const [saving, setSaving] = useState(false);
  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));

  useEffect(() => {
    navigation.setOptions({ title: id ? 'Ubah alamat' : 'Alamat baru' });
    if (!id) return;
    DB.getAddress(user.id, id)
      .then((a) => {
        if (a) setForm({ label: a.label, recipient: a.recipient, phone: a.phone, street: a.street, city: a.city, province: a.province, postalCode: a.postal_code, isDefault: !!a.is_default });
      })
      .catch(report);
  }, [id, navigation, user.id, report]);

  const save = async () => {
    const next = {};
    const r = validateRequired(form.recipient, 'Nama penerima');
    if (r) next.recipient = r;
    if (!isPhone(form.phone)) next.phone = 'Nomor HP harus diawali 08 (10–14 digit)';
    if (form.street.trim().length < 8) next.street = 'Tulis nama jalan, nomor, dan RT/RW';
    const c = validateRequired(form.city, 'Kota/kabupaten');
    if (c) next.city = c;
    if (!form.province) next.province = 'Pilih provinsi';
    const p = validatePostalCode(form.postalCode);
    if (p) next.postalCode = p;
    setErrors(next);
    if (Object.keys(next).length) return;
    setSaving(true);
    try {
      if (id) await DB.updateAddress(user.id, id, form);
      else await DB.createAddress(user.id, form);
      successFeedback();
      toast.show(id ? 'Alamat diperbarui' : 'Alamat disimpan');
      navigation.goBack();
    } catch (e) {
      report(e);
      setSaving(false);
    }
  };

  const remove = () =>
    Alert.alert('Hapus alamat?', 'Alamat ini akan dihapus permanen.', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus',
        style: 'destructive',
        onPress: async () => {
          try {
            await DB.deleteAddress(user.id, id);
            toast.show('Alamat dihapus');
            navigation.goBack();
          } catch (e) {
            report(e);
          }
        },
      },
    ]);

  return (
    <FormScroll
      footer={
        <>
          <Button testID="address-save" title="Simpan alamat" size="lg" loading={saving} onPress={save} />
          {id ? <Button title="Hapus alamat" variant="danger" onPress={remove} /> : null}
        </>
      }
    >
      <View style={{ gap: 6 }}>
        <Text style={type.smallStrong}>Simpan sebagai</Text>
        <View style={{ flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' }}>
          {ADDRESS_LABELS.map((l) => (
            <Chip key={l} label={l} selected={form.label === l} onPress={() => set('label')(l)} />
          ))}
        </View>
      </View>
      <TextField testID="address-recipient" label="Nama penerima" value={form.recipient} onChangeText={set('recipient')} error={errors.recipient} autoCapitalize="words" />
      <TextField testID="address-phone" label="No. HP penerima" value={form.phone} onChangeText={set('phone')} error={errors.phone} keyboardType="phone-pad" placeholder="0812…" />
      <TextField testID="address-street" label="Alamat lengkap" value={form.street} onChangeText={set('street')} error={errors.street} multiline placeholder="Nama jalan, nomor rumah, RT/RW, kelurahan" />
      <TextField testID="address-city" label="Kota / kabupaten" value={form.city} onChangeText={set('city')} error={errors.city} autoCapitalize="words" />
      <View style={{ gap: 6 }}>
        <Text style={type.smallStrong}>Provinsi</Text>
        <Pressable
          testID="address-province"
          onPress={() => setShowProvince(true)}
          accessibilityRole="button"
          accessibilityLabel={`Provinsi: ${form.province || 'belum dipilih'}`}
          style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 50, paddingHorizontal: spacing.ms, backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1.5, borderColor: errors.province ? colors.rose : colors.line }}
        >
          <Text style={[type.body, !form.province && { color: colors.inkMute }]}>{form.province || 'Pilih provinsi'}</Text>
          <Ionicons name="chevron-down" size={18} color={colors.inkMute} />
        </Pressable>
        {errors.province ? <Text style={[type.caption, { color: colors.roseText }]}>{errors.province}</Text> : null}
      </View>
      <TextField testID="address-postal" label="Kode pos" value={form.postalCode} onChangeText={set('postalCode')} error={errors.postalCode} keyboardType="number-pad" maxLength={5} />
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={type.bodyStrong}>Jadikan alamat utama</Text>
        <Switch value={form.isDefault} onValueChange={set('isDefault')} trackColor={{ true: colors.brand, false: colors.lineStrong }} accessibilityLabel="Jadikan alamat utama" />
      </View>
      <OptionSheet
        visible={showProvince}
        title="Pilih provinsi"
        options={PROVINCES.map((p) => ({ value: p, label: p }))}
        value={form.province}
        onClose={() => setShowProvince(false)}
        onSelect={(p) => {
          set('province')(p);
          setShowProvince(false);
        }}
      />
    </FormScroll>
  );
}
