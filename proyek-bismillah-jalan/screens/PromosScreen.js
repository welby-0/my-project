import { useState } from 'react';
import { FlatList, Text, View } from 'react-native';
import * as DB from '../db';
import Card from '../components/Card';
import Button from '../components/Button';
import TextField from '../components/TextField';
import { Screen } from '../components/Screen';
import { Spinner } from '../components/Loading';
import { useApp } from '../state/AppContext';
import { useToast } from '../state/Toast';
import { useQuery } from '../state/hooks';
import { promoSummary } from '../utils/pricing';
import { rupiah } from '../utils/format';
import { colors, radius, spacing, type } from '../theme';

export default function PromosScreen({ navigation }) {
  const { activePromo, setActivePromo, user } = useApp();
  const toast = useToast();
  const promos = useQuery(() => DB.listPromos());
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const use = (promo) => {
    setActivePromo(promo.code);
    toast.show(`Promo ${promo.code} dipakai`, user ? { actionLabel: 'Ke keranjang', onAction: () => navigation.navigate('Main', { screen: 'Keranjang' }) } : undefined);
  };

  const submitCode = async () => {
    setError('');
    const promo = await DB.findPromo(code);
    if (!promo) {
      setError('Kode promo tidak ditemukan atau sudah berakhir');
      return;
    }
    setCode('');
    use(promo);
  };

  if (promos.loading && !promos.data) return <Spinner />;

  return (
    <Screen>
      <FlatList
        testID="promo-list"
        data={promos.data || []}
        keyExtractor={(p) => String(p.id)}
        contentContainerStyle={{ padding: spacing.md, gap: spacing.ms }}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <View style={{ flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start', marginBottom: spacing.sm }}>
            <TextField testID="promo-code-input" style={{ flex: 1 }} value={code} onChangeText={setCode} placeholder="Punya kode promo?" autoCapitalize="characters" autoCorrect={false} error={error} returnKeyType="done" onSubmitEditing={submitCode} />
            <Button testID="promo-code-apply" title="Pakai" onPress={submitCode} style={{ height: 50 }} />
          </View>
        }
        renderItem={({ item: p }) => {
          const active = activePromo === p.code;
          return (
            <Card style={{ gap: spacing.sm, borderWidth: active ? 2 : 0, borderColor: colors.brand }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ backgroundColor: colors.ink, borderRadius: radius.sm, paddingHorizontal: 10, paddingVertical: 4 }}>
                  <Text selectable style={{ color: colors.sun, fontWeight: '800', letterSpacing: 1 }}>{p.code}</Text>
                </View>
                {active ? <Text style={{ fontWeight: '800', color: colors.mintText }}>Sedang dipakai</Text> : null}
              </View>
              <Text style={type.heading}>{p.title}</Text>
              <Text style={type.price}>{promoSummary(p)}</Text>
              <Text style={type.small}>{p.description}{p.min_spend ? ` Min. belanja ${rupiah(p.min_spend)}.` : ''}</Text>
              {active ? (
                <Button testID={`promo-release-${p.code}`} title="Lepas promo" variant="secondary" size="sm" onPress={() => setActivePromo(null)} />
              ) : (
                <Button testID={`promo-use-${p.code}`} title="Pakai promo" variant="tint" size="sm" onPress={() => use(p)} />
              )}
            </Card>
          );
        }}
      />
    </Screen>
  );
}
