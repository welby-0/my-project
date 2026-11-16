import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import * as DB from '../db';
import Button from '../components/Button';
import TextField from '../components/TextField';
import { FormScroll } from '../components/Screen';
import { useApp, useReportError } from '../state/AppContext';
import { useToast } from '../state/Toast';
import { deletePhoto } from '../utils/photos';
import { successFeedback } from '../utils/haptics';

export default function StoreFormScreen({ navigation, route }) {
  const edit = !!route.params?.edit;
  const { user } = useApp();
  const toast = useToast();
  const report = useReportError();
  const [form, setForm] = useState({ name: '', city: '', description: '' });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));

  useEffect(() => {
    navigation.setOptions({ title: edit ? 'Ubah toko' : 'Buka toko' });
    if (!edit) return;
    DB.getStoreByOwner(user.id)
      .then((s) => s && setForm({ name: s.name, city: s.city, description: s.description }))
      .catch(report);
  }, [edit, navigation, user.id, report]);

  const save = async () => {
    const next = {};
    if (form.name.trim().length < 3) next.name = 'Nama toko minimal 3 huruf';
    if (!form.city.trim()) next.city = 'Kota asal pengiriman wajib diisi';
    setErrors(next);
    if (Object.keys(next).length) return;
    setSaving(true);
    try {
      if (edit) await DB.updateStore(user.id, form);
      else await DB.createStore(user.id, form);
      successFeedback();
      toast.show(edit ? 'Toko diperbarui' : 'Tokomu sudah buka!');
      navigation.goBack();
    } catch (e) {
      report(e);
      setSaving(false);
    }
  };

  const remove = () =>
    Alert.alert('Hapus toko?', 'Toko dan semua produknya akan dihapus permanen, termasuk dari keranjang pembeli.', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus toko',
        style: 'destructive',
        onPress: async () => {
          try {
            const store = await DB.getStoreByOwner(user.id);
            const products = store ? await DB.listStoreProducts(store.id) : [];
            await DB.deleteStore(user.id);
            await Promise.all(products.map((p) => deletePhoto(p.image_uri)));
            toast.show('Toko dihapus');
            navigation.popToTop();
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
          <Button testID="store-save" title={edit ? 'Simpan perubahan' : 'Buka toko'} size="lg" loading={saving} onPress={save} />
          {edit ? <Button testID="store-delete" title="Hapus toko" variant="danger" onPress={remove} /> : null}
        </>
      }
    >
      <TextField testID="store-name" label="Nama toko" icon="storefront-outline" value={form.name} onChangeText={set('name')} error={errors.name} maxLength={40} autoCapitalize="words" />
      <TextField testID="store-city" label="Kota asal pengiriman" icon="location-outline" value={form.city} onChangeText={set('city')} error={errors.city} autoCapitalize="words" />
      <TextField testID="store-desc" label="Deskripsi toko (opsional)" value={form.description} onChangeText={set('description')} multiline maxLength={200} placeholder="Ceritakan apa yang kamu jual" />
    </FormScroll>
  );
}
