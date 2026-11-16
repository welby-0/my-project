import { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, Switch, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DB from '../db';
import Button from '../components/Button';
import Card from '../components/Card';
import Chip from '../components/Chip';
import TextField from '../components/TextField';
import OptionSheet from '../components/OptionSheet';
import ProductThumb from '../components/ProductThumb';
import { FormScroll } from '../components/Screen';
import { Spinner } from '../components/Loading';
import { useApp, useReportError } from '../state/AppContext';
import { useToast } from '../state/Toast';
import { useQuery } from '../state/hooks';
import { PRODUCT_EMOJIS } from '../utils/constants';
import { deletePhoto, isSavedPhoto, pickPhoto, savePhoto } from '../utils/photos';
import { parseMoney, parseSignedMoney } from '../utils/validators';
import { successFeedback } from '../utils/haptics';
import { colors, radius, spacing, type } from '../theme';

let variantKey = 0;
const newVariant = (v = {}) => ({ key: `v${++variantKey}`, id: v.id || null, name: v.name || '', delta: v.price_delta ? String(v.price_delta) : '', stock: v.stock != null ? String(v.stock) : '' });

const EMPTY = { name: '', categoryId: null, price: '', stock: '', weight: '', brand: '', condition: 'baru', description: '', emoji: '📦', imageUri: null, isActive: true, hasVariants: false, variantLabel: 'Ukuran' };

export default function ProductFormScreen({ navigation, route }) {
  const id = route.params?.id;
  const { user } = useApp();
  const toast = useToast();
  const report = useReportError();
  const tree = useQuery(() => DB.listCategoryTree());
  const [form, setForm] = useState(EMPTY);
  const [variants, setVariants] = useState([]);
  const [original, setOriginal] = useState(null);
  const [loading, setLoading] = useState(!!id);
  const [errors, setErrors] = useState({});
  const [showCategory, setShowCategory] = useState(false);
  const [saving, setSaving] = useState(false);
  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));

  useEffect(() => {
    navigation.setOptions({ title: id ? 'Ubah produk' : 'Tambah produk' });
    if (!id) return;
    DB.getProduct(id)
      .then((p) => {
        if (!p || p.store_owner_id !== user.id) {
          toast.show('Produk tidak ditemukan di tokomu', { tone: 'error' });
          navigation.goBack();
          return;
        }
        setOriginal(p);
        setForm({
          name: p.name, categoryId: p.category_id, price: String(p.price), stock: String(p.stock), weight: String(p.weight_gram), brand: p.brand,
          condition: p.condition, description: p.description, emoji: p.emoji, imageUri: p.image_uri, isActive: !!p.is_active,
          hasVariants: p.variants.length > 0, variantLabel: p.variant_label || 'Ukuran',
        });
        setVariants(p.variants.map(newVariant));
        setLoading(false);
      })
      .catch((e) => {
        report(e);
        setLoading(false);
      });
  }, [id, navigation, user.id, toast, report]);

  const sections = useMemo(
    () => (tree.data || []).map((top) => ({ title: top.name, data: top.children.map((c) => ({ value: c.id, label: c.name })) })),
    [tree.data]
  );
  const categoryLabel = useMemo(() => {
    for (const top of tree.data || []) {
      const hit = top.children.find((c) => c.id === form.categoryId);
      if (hit) return `${top.name} › ${hit.name}`;
    }
    return '';
  }, [tree.data, form.categoryId]);

  if (loading || (tree.loading && !tree.data)) return <Spinner />;

  const updateVariant = (key, patch) => setVariants((list) => list.map((v) => (v.key === key ? { ...v, ...patch } : v)));
  const toggleVariants = (on) => {
    set('hasVariants')(on);
    if (on && variants.length === 0) setVariants([newVariant()]);
  };

  const choosePhoto = async () => {
    try {
      const uri = await pickPhoto();
      if (uri) set('imageUri')(uri);
    } catch (e) {
      report(e);
    }
  };

  const validate = () => {
    const next = {};
    if (form.name.trim().length < 3) next.name = 'Nama produk minimal 3 huruf';
    if (!form.categoryId) next.category = 'Pilih kategori produk';
    if (parseMoney(form.price) < 100) next.price = 'Harga minimal Rp100';
    if (parseMoney(form.weight) < 1) next.weight = 'Isi berat dalam gram (untuk hitung ongkir)';
    if (!form.hasVariants && form.stock.trim() === '') next.stock = 'Isi stok (boleh 0)';
    if (form.hasVariants) {
      const names = variants.map((v) => v.name.trim().toLowerCase());
      if (variants.length === 0 || names.some((n) => !n)) next.variants = 'Isi nama semua varian atau matikan varian';
      else if (new Set(names).size !== names.length) next.variants = 'Nama varian tidak boleh sama';
      else if (variants.some((v) => v.stock.trim() === '')) next.variants = 'Isi stok untuk setiap varian (boleh 0)';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const save = async () => {
    if (!validate()) {
      toast.show('Periksa kembali isian yang bertanda merah', { tone: 'error' });
      return;
    }
    setSaving(true);
    let savedCopy = null;
    try {
      let imageUri = form.imageUri;
      if (imageUri && !isSavedPhoto(imageUri)) imageUri = savedCopy = await savePhoto(imageUri);
      const data = {
        name: form.name, categoryId: form.categoryId, price: parseMoney(form.price), stock: parseMoney(form.stock), weightGram: parseMoney(form.weight),
        brand: form.brand, description: form.description, condition: form.condition, emoji: form.emoji, imageUri, isActive: form.isActive,
        variantLabel: form.hasVariants ? form.variantLabel : null,
        variants: form.hasVariants ? variants.map((v) => ({ id: v.id, name: v.name, priceDelta: parseSignedMoney(v.delta), stock: parseMoney(v.stock) })) : [],
      };
      if (id) await DB.updateProduct(user.id, id, data);
      else await DB.createProduct(user.id, data);
      if (original?.image_uri && original.image_uri !== imageUri) await deletePhoto(original.image_uri);
      successFeedback();
      toast.show(id ? 'Produk diperbarui' : 'Produk ditambahkan');
      navigation.goBack();
    } catch (e) {
      if (savedCopy) await deletePhoto(savedCopy);
      report(e);
      setSaving(false);
    }
  };

  const remove = () =>
    Alert.alert('Hapus produk?', 'Produk akan dihapus permanen dan hilang dari keranjang pembeli.', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus',
        style: 'destructive',
        onPress: async () => {
          try {
            await DB.deleteProduct(user.id, id);
            await deletePhoto(original?.image_uri);
            toast.show('Produk dihapus');
            navigation.goBack();
          } catch (e) {
            report(e);
          }
        },
      },
    ]);

  const previewProduct = { emoji: form.emoji, image_uri: form.imageUri, tile_color: colors.brandTint };

  return (
    <FormScroll
      footer={
        <>
          <Button testID="product-save" title={id ? 'Simpan perubahan' : 'Simpan produk'} size="lg" loading={saving} onPress={save} />
          {id ? <Button testID="product-delete" title="Hapus produk" variant="danger" onPress={remove} /> : null}
        </>
      }
    >
      <Card style={{ gap: spacing.md }}>
        <Text style={type.heading}>Foto produk</Text>
        <View style={{ flexDirection: 'row', gap: spacing.md, alignItems: 'center' }}>
          <ProductThumb product={previewProduct} size={104} />
          <View style={{ flex: 1, gap: spacing.sm }}>
            <Button testID="product-photo" title={form.imageUri ? 'Ganti foto' : 'Pilih foto dari galeri'} size="sm" variant="secondary" icon="image-outline" onPress={choosePhoto} />
            {form.imageUri ? <Button title="Hapus foto" size="sm" variant="ghost" onPress={() => set('imageUri')(null)} /> : null}
          </View>
        </View>
        <Text style={type.small}>Tanpa foto, produk tampil dengan ikon pilihanmu:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.sm }}>
          {PRODUCT_EMOJIS.map((e) => (
            <Pressable
              key={e}
              onPress={() => set('emoji')(e)}
              accessibilityRole="button"
              accessibilityLabel={`Ikon ${e}`}
              accessibilityState={{ selected: form.emoji === e }}
              style={{ width: 44, height: 44, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', backgroundColor: form.emoji === e ? colors.brandTint : colors.canvas, borderWidth: 2, borderColor: form.emoji === e ? colors.brand : 'transparent' }}
            >
              <Text style={{ fontSize: 24 }}>{e}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </Card>

      <Card style={{ gap: spacing.md }}>
        <Text style={type.heading}>Informasi produk</Text>
        <TextField testID="product-name" label="Nama produk" value={form.name} onChangeText={set('name')} error={errors.name} maxLength={100} autoCapitalize="sentences" />
        <View style={{ gap: 6 }}>
          <Text style={type.smallStrong}>Kategori</Text>
          <Pressable
            testID="product-category"
            onPress={() => setShowCategory(true)}
            accessibilityRole="button"
            accessibilityLabel={`Kategori: ${categoryLabel || 'belum dipilih'}`}
            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 50, paddingHorizontal: spacing.ms, backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1.5, borderColor: errors.category ? colors.rose : colors.line }}
          >
            <Text style={[type.body, { flex: 1 }, !categoryLabel && { color: colors.inkMute }]} numberOfLines={1}>{categoryLabel || 'Pilih kategori'}</Text>
            <Ionicons name="chevron-down" size={18} color={colors.inkMute} />
          </Pressable>
          {errors.category ? <Text style={[type.caption, { color: colors.roseText }]}>{errors.category}</Text> : null}
        </View>
        <View style={{ flexDirection: 'row', gap: spacing.ms }}>
          <TextField testID="product-price" style={{ flex: 1 }} label="Harga (Rp)" value={form.price} onChangeText={set('price')} error={errors.price} keyboardType="number-pad" />
          <TextField testID="product-weight" style={{ flex: 1 }} label="Berat (gram)" value={form.weight} onChangeText={set('weight')} error={errors.weight} keyboardType="number-pad" />
        </View>
        {!form.hasVariants ? (
          <TextField testID="product-stock" label="Stok" value={form.stock} onChangeText={set('stock')} error={errors.stock} keyboardType="number-pad" />
        ) : null}
        <TextField testID="product-brand" label="Merek (opsional)" value={form.brand} onChangeText={set('brand')} />
        <View style={{ gap: 6 }}>
          <Text style={type.smallStrong}>Kondisi</Text>
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            <Chip label="Baru" selected={form.condition === 'baru'} onPress={() => set('condition')('baru')} />
            <Chip label="Bekas" selected={form.condition === 'bekas'} onPress={() => set('condition')('bekas')} />
          </View>
        </View>
        <TextField testID="product-desc" label="Deskripsi" value={form.description} onChangeText={set('description')} multiline placeholder="Jelaskan bahan, ukuran, kelebihan, dan isi paket" />
      </Card>

      <Card style={{ gap: spacing.md }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md }}>
          <View style={{ flex: 1 }}>
            <Text style={type.heading}>Varian produk</Text>
            <Text style={type.small}>Untuk ukuran, warna, atau kapasitas. Stok dikelola per varian.</Text>
          </View>
          <Switch testID="product-has-variants" value={form.hasVariants} onValueChange={toggleVariants} trackColor={{ true: colors.brand, false: colors.lineStrong }} accessibilityLabel="Produk punya varian" />
        </View>
        {form.hasVariants ? (
          <View style={{ gap: spacing.md }}>
            <TextField testID="product-variant-label" label="Jenis varian" value={form.variantLabel} onChangeText={set('variantLabel')} placeholder="Ukuran / Warna / Kapasitas" maxLength={20} />
            {variants.map((v, index) => (
              <View key={v.key} style={{ gap: spacing.sm, padding: spacing.ms, borderRadius: radius.md, backgroundColor: colors.canvas }}>
                <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm }}>
                  <TextField testID={`variant-name-${index}`} style={{ flex: 1 }} label={`Varian ${index + 1}`} value={v.name} onChangeText={(t) => updateVariant(v.key, { name: t })} placeholder="Mis. 42 atau Hitam" />
                  <Pressable
                    onPress={() => setVariants((list) => list.filter((x) => x.key !== v.key))}
                    hitSlop={8}
                    accessibilityRole="button"
                    accessibilityLabel={`Hapus varian ${index + 1}`}
                    style={{ width: 48, height: 50, alignItems: 'center', justifyContent: 'center' }}
                  >
                    <Ionicons name="trash-outline" size={22} color={colors.roseText} />
                  </Pressable>
                </View>
                <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                  <TextField testID={`variant-delta-${index}`} style={{ flex: 1.3 }} label="Tambahan harga (Rp)" value={v.delta} onChangeText={(t) => updateVariant(v.key, { delta: t })} keyboardType="numbers-and-punctuation" placeholder="0" />
                  <TextField testID={`variant-stock-${index}`} style={{ flex: 1 }} label="Stok" value={v.stock} onChangeText={(t) => updateVariant(v.key, { stock: t })} keyboardType="number-pad" placeholder="0" />
                </View>
              </View>
            ))}
            {errors.variants ? <Text style={[type.caption, { color: colors.roseText }]}>{errors.variants}</Text> : null}
            <Button testID="variant-add" title="Tambah varian" variant="tint" icon="add" onPress={() => setVariants((list) => [...list, newVariant()])} />
            {id && original?.variants.length ? <Text style={type.caption}>Menghapus varian juga mengeluarkannya dari keranjang pembeli.</Text> : null}
          </View>
        ) : null}
      </Card>

      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.xs }}>
        <View style={{ flex: 1 }}>
          <Text style={type.bodyStrong}>Tampilkan di toko</Text>
          <Text style={type.small}>Matikan untuk menyembunyikan sementara.</Text>
        </View>
        <Switch value={form.isActive} onValueChange={set('isActive')} trackColor={{ true: colors.brand, false: colors.lineStrong }} accessibilityLabel="Tampilkan di toko" />
      </View>

      <OptionSheet
        visible={showCategory}
        title="Pilih kategori"
        sections={sections}
        value={form.categoryId}
        onClose={() => setShowCategory(false)}
        onSelect={(v) => {
          set('categoryId')(v);
          setShowCategory(false);
        }}
      />
    </FormScroll>
  );
}
