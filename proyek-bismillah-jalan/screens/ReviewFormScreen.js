import { useEffect, useState } from 'react';
import { Alert, Text } from 'react-native';
import * as DB from '../db';
import Button from '../components/Button';
import TextField from '../components/TextField';
import { RatingInput } from '../components/Rating';
import { FormScroll } from '../components/Screen';
import { useApp, useReportError } from '../state/AppContext';
import { useToast } from '../state/Toast';
import { successFeedback } from '../utils/haptics';
import { colors, spacing, type } from '../theme';

export default function ReviewFormScreen({ navigation, route }) {
  const { productId, productName } = route.params;
  const { user } = useApp();
  const toast = useToast();
  const report = useReportError();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [existing, setExisting] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const mine = await DB.getUserReview(productId, user.id);
      if (mine) {
        setExisting(mine);
        setRating(mine.rating);
        setComment(mine.comment);
      }
    })().catch(report);
  }, [productId, user.id, report]);

  useEffect(() => {
    navigation.setOptions({ title: existing ? 'Ubah ulasan' : 'Tulis ulasan' });
  }, [navigation, existing]);

  const save = async () => {
    if (!rating) {
      setError('Pilih rating bintang dulu');
      return;
    }
    setSaving(true);
    try {
      await DB.saveReview(user.id, productId, rating, comment);
      successFeedback();
      toast.show(existing ? 'Ulasan diperbarui' : 'Terima kasih atas ulasanmu!');
      navigation.goBack();
    } catch (e) {
      report(e);
      setSaving(false);
    }
  };

  const remove = () =>
    Alert.alert('Hapus ulasan?', 'Ulasan ini akan dihapus permanen.', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus',
        style: 'destructive',
        onPress: async () => {
          try {
            await DB.deleteReview(user.id, existing.id);
            toast.show('Ulasan dihapus');
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
          <Button testID="review-save" title={existing ? 'Simpan perubahan' : 'Kirim ulasan'} size="lg" loading={saving} onPress={save} />
          {existing ? <Button title="Hapus ulasan" variant="danger" onPress={remove} /> : null}
        </>
      }
    >
      <Text selectable style={type.heading}>{productName}</Text>
      <Text style={[type.body, { color: colors.inkSoft }]}>Bagaimana kualitas produk ini?</Text>
      <RatingInput value={rating} onChange={(n) => { setRating(n); setError(''); }} />
      {error ? <Text style={[type.caption, { color: colors.roseText }]}>{error}</Text> : null}
      <TextField
        testID="review-comment"
        label="Ulasan (opsional)"
        value={comment}
        onChangeText={setComment}
        multiline
        maxLength={500}
        placeholder="Ceritakan pengalamanmu: kualitas, kecocokan ukuran, pengiriman…"
        helper={`${comment.length}/500`}
        style={{ marginTop: spacing.sm }}
      />
    </FormScroll>
  );
}
