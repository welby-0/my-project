import { useCallback, useEffect, useRef, useState } from 'react';
import { FlatList, Modal, Pressable, ScrollView, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as DB from '../db';
import ProductCard from '../components/ProductCard';
import Chip from '../components/Chip';
import Button from '../components/Button';
import TextField from '../components/TextField';
import IconButton from '../components/IconButton';
import EmptyState from '../components/EmptyState';
import { Spinner } from '../components/Loading';
import { useApp, useReportError } from '../state/AppContext';
import { useQuery } from '../state/hooks';
import { useProductActions } from '../state/useProductActions';
import { SORT_OPTIONS } from '../utils/constants';
import { parseMoney } from '../utils/validators';
import { rupiah } from '../utils/format';
import { colors, radius, shadows, spacing, type } from '../theme';

const PAGE = 20;

function FilterSheet({ visible, filters, categories, onApply, onClose }) {
  const insets = useSafeAreaInsets();
  const [draft, setDraft] = useState(filters);
  const [minText, setMinText] = useState('');
  const [maxText, setMaxText] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (visible) {
      setDraft(filters);
      setMinText(filters.minPrice ? String(filters.minPrice) : '');
      setMaxText(filters.maxPrice ? String(filters.maxPrice) : '');
      setError('');
    }
  }, [visible, filters]);

  const apply = () => {
    const minPrice = parseMoney(minText);
    const maxPrice = parseMoney(maxText);
    if (minPrice && maxPrice && minPrice > maxPrice) {
      setError('Harga terendah tidak boleh lebih besar dari harga tertinggi');
      return;
    }
    onApply({ ...draft, minPrice, maxPrice });
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <Pressable style={{ flex: 1, backgroundColor: colors.overlay }} onPress={onClose} accessibilityRole="button" accessibilityLabel="Tutup filter" />
      <View style={{ maxHeight: '85%', backgroundColor: colors.surface, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, borderCurve: 'continuous', boxShadow: shadows.overlay, paddingBottom: insets.bottom }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.md }}>
          <Text style={type.heading} accessibilityRole="header">Filter & urutkan</Text>
          <Pressable onPress={onClose} hitSlop={12} accessibilityRole="button" accessibilityLabel="Tutup">
            <Ionicons name="close" size={24} color={colors.ink} />
          </Pressable>
        </View>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: spacing.md, paddingTop: 0, gap: spacing.md }}>
          <View style={{ gap: spacing.sm }}>
            <Text style={type.smallStrong}>Urutkan</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
              {SORT_OPTIONS.map((o) => (
                <Chip key={o.value} testID={`filter-sort-${o.value}`} label={o.label} selected={draft.sort === o.value} onPress={() => setDraft({ ...draft, sort: o.value })} />
              ))}
            </View>
          </View>
          <View style={{ gap: spacing.sm }}>
            <Text style={type.smallStrong}>Kategori</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
              <Chip label="Semua" selected={!draft.categoryId} onPress={() => setDraft({ ...draft, categoryId: null, categoryName: '' })} />
              {draft.categoryId && !categories.some((c) => c.id === draft.categoryId) ? (
                <Chip label={draft.categoryName || 'Kategori terpilih'} selected onPress={() => {}} />
              ) : null}
              {categories.map((c) => (
                <Chip key={c.id} icon={c.icon} label={c.name} selected={draft.categoryId === c.id} onPress={() => setDraft({ ...draft, categoryId: c.id, categoryName: c.name })} />
              ))}
            </View>
          </View>
          <View style={{ gap: spacing.sm }}>
            <Text style={type.smallStrong}>Rentang harga (Rp)</Text>
            <View style={{ flexDirection: 'row', gap: spacing.ms }}>
              <TextField testID="filter-min" style={{ flex: 1 }} value={minText} onChangeText={setMinText} placeholder="Terendah" keyboardType="number-pad" />
              <TextField testID="filter-max" style={{ flex: 1 }} value={maxText} onChangeText={setMaxText} placeholder="Tertinggi" keyboardType="number-pad" />
            </View>
            {error ? <Text style={[type.caption, { color: colors.roseText }]}>{error}</Text> : null}
          </View>
        </ScrollView>
        <View style={{ flexDirection: 'row', gap: spacing.ms, padding: spacing.md }}>
          <Button title="Reset" variant="secondary" style={{ flex: 1 }} onPress={() => onApply({ sort: 'relevan', categoryId: null, categoryName: '', minPrice: 0, maxPrice: 0 })} />
          <Button testID="filter-apply" title="Terapkan" style={{ flex: 2 }} onPress={apply} />
        </View>
      </View>
    </Modal>
  );
}

export default function SearchScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { user } = useApp();
  const report = useReportError();
  const actions = useProductActions();
  const params = route.params || {};
  const userId = user?.id || 0;

  const [text, setText] = useState(params.query || '');
  const [query, setQuery] = useState((params.query || '').trim());
  const [filters, setFilters] = useState({ sort: 'relevan', categoryId: params.categoryId || null, categoryName: params.categoryName || '', minPrice: 0, maxPrice: 0 });
  const [showFilter, setShowFilter] = useState(false);
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const seq = useRef(0);

  const categories = useQuery(() => DB.listCategoryTree());
  const history = useQuery(() => DB.listSearchTerms(userId), [userId]);

  useEffect(() => {
    const t = setTimeout(() => setQuery(text.trim()), 300);
    return () => clearTimeout(t);
  }, [text]);

  const discover = !query && !filters.categoryId && !filters.minPrice && !filters.maxPrice;
  const filterFor = useCallback(
    () => ({ q: query, sort: filters.sort, categoryId: filters.categoryId, minPrice: filters.minPrice, maxPrice: filters.maxPrice }),
    [query, filters]
  );

  const run = useCallback(async () => {
    if (discover) {
      seq.current++;
      setItems([]);
      setTotal(0);
      setLoading(false);
      return;
    }
    const id = ++seq.current;
    setLoading(true);
    try {
      const f = filterFor();
      const rows = await DB.listProducts(f, { limit: PAGE, offset: 0 });
      const count = await DB.countProducts(f);
      if (id !== seq.current) return;
      setItems(rows);
      setTotal(count);
    } catch (e) {
      report(e);
    } finally {
      if (id === seq.current) setLoading(false);
    }
  }, [discover, filterFor, report]);

  useFocusEffect(
    useCallback(() => {
      run();
    }, [run])
  );

  const loadMore = async () => {
    if (loading || loadingMore || items.length >= total) return;
    setLoadingMore(true);
    const id = seq.current;
    try {
      const rows = await DB.listProducts(filterFor(), { limit: PAGE, offset: items.length });
      if (id === seq.current) setItems((prev) => [...prev, ...rows]);
    } catch (e) {
      report(e);
    } finally {
      setLoadingMore(false);
    }
  };

  const remember = async (term) => {
    try {
      await DB.addSearchTerm(userId, term);
      history.reload();
    } catch (e) {
      /* riwayat pencarian tidak kritis */
    }
  };
  const submit = () => {
    setQuery(text.trim());
    if (text.trim().length >= 2) remember(text.trim());
  };
  const chooseTerm = (term) => {
    setText(term);
    setQuery(term);
    remember(term);
  };

  const cardWidth = (width - spacing.md * 2 - spacing.ms) / 2;
  const activeFilters = (filters.categoryId ? 1 : 0) + (filters.minPrice || filters.maxPrice ? 1 : 0) + (filters.sort !== 'relevan' ? 1 : 0);
  const sortLabel = SORT_OPTIONS.find((o) => o.value === filters.sort)?.label;
  const priceLabel = filters.minPrice && filters.maxPrice ? `${rupiah(filters.minPrice)} – ${rupiah(filters.maxPrice)}` : filters.minPrice ? `Min ${rupiah(filters.minPrice)}` : filters.maxPrice ? `Maks ${rupiah(filters.maxPrice)}` : '';

  const removable = (label, onRemove, testID) => (
    <Pressable key={label} testID={testID} onPress={onRemove} accessibilityRole="button" accessibilityLabel={`Hapus filter ${label}`} style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.brandTint, borderRadius: radius.full, paddingLeft: 12, paddingRight: 8, height: 32 }}>
      <Text style={{ fontSize: 13, fontWeight: '700', color: colors.brandText }}>{label}</Text>
      <Ionicons name="close" size={14} color={colors.brandText} />
    </Pressable>
  );

  const resultsHeader = (
    <View style={{ gap: spacing.sm, paddingBottom: spacing.sm }}>
      <Text style={type.small} accessibilityLiveRegion="polite">
        {loading && items.length === 0 ? 'Mencari…' : `${total} produk${query ? ` untuk “${query}”` : ''}`}
      </Text>
      {activeFilters ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.sm }}>
          {filters.categoryId ? removable(filters.categoryName || 'Kategori', () => setFilters({ ...filters, categoryId: null, categoryName: '' }), 'remove-category') : null}
          {priceLabel ? removable(priceLabel, () => setFilters({ ...filters, minPrice: 0, maxPrice: 0 }), 'remove-price') : null}
          {filters.sort !== 'relevan' ? removable(sortLabel, () => setFilters({ ...filters, sort: 'relevan' }), 'remove-sort') : null}
        </ScrollView>
      ) : null}
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas, paddingTop: insets.top }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs, paddingHorizontal: spacing.sm, paddingVertical: spacing.sm, backgroundColor: colors.surface }}>
        <IconButton testID="search-back" icon="chevron-back" label="Kembali" onPress={() => navigation.goBack()} />
        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, height: 44, paddingHorizontal: spacing.ms, backgroundColor: colors.canvas, borderRadius: radius.full }}>
          <Ionicons name="search" size={18} color={colors.inkMute} />
          <TextInput
            testID="search-input"
            value={text}
            onChangeText={setText}
            onSubmitEditing={submit}
            autoFocus={!params.categoryId && !params.query}
            returnKeyType="search"
            placeholder={filters.categoryName ? `Cari di ${filters.categoryName}` : 'Cari produk…'}
            placeholderTextColor={colors.inkMute}
            accessibilityLabel="Kata kunci pencarian"
            style={[type.body, { flex: 1, paddingVertical: 0 }]}
          />
          {text ? (
            <Pressable onPress={() => { setText(''); setQuery(''); }} hitSlop={10} accessibilityRole="button" accessibilityLabel="Hapus teks">
              <Ionicons name="close-circle" size={18} color={colors.inkMute} />
            </Pressable>
          ) : null}
        </View>
        <IconButton testID="search-filter" icon="options-outline" label={`Filter${activeFilters ? `, ${activeFilters} aktif` : ''}`} badge={activeFilters || undefined} onPress={() => setShowFilter(true)} />
      </View>

      {discover ? (
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: spacing.md, gap: spacing.lg }}>
          {history.data?.length ? (
            <View style={{ gap: spacing.sm }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={type.heading}>Pencarian terakhir</Text>
                <Pressable testID="history-clear" onPress={async () => { await DB.clearSearchTerms(userId); history.reload(); }} hitSlop={10} accessibilityRole="button">
                  <Text style={{ fontSize: 14, fontWeight: '700', color: colors.brandText }}>Hapus semua</Text>
                </Pressable>
              </View>
              {history.data.map((h) => (
                <View key={h.id} style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Pressable onPress={() => chooseTerm(h.term)} accessibilityRole="button" style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.ms, minHeight: 44 }}>
                    <Ionicons name="time-outline" size={18} color={colors.inkMute} />
                    <Text style={type.body}>{h.term}</Text>
                  </Pressable>
                  <Pressable onPress={async () => { await DB.removeSearchTerm(h.id); history.reload(); }} hitSlop={10} accessibilityRole="button" accessibilityLabel={`Hapus ${h.term} dari riwayat`}>
                    <Ionicons name="close" size={18} color={colors.inkMute} />
                  </Pressable>
                </View>
              ))}
            </View>
          ) : null}
          <View style={{ gap: spacing.sm }}>
            <Text style={type.heading}>Kategori populer</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
              {(categories.data || []).map((c) => (
                <Chip key={c.id} testID={`discover-${c.slug}`} icon={c.icon} label={c.name} onPress={() => setFilters({ ...filters, categoryId: c.id, categoryName: c.name })} />
              ))}
            </View>
          </View>
        </ScrollView>
      ) : (
        <FlatList
          testID="search-results"
          data={items}
          keyExtractor={(item) => String(item.id)}
          numColumns={2}
          columnWrapperStyle={{ gap: spacing.ms }}
          contentContainerStyle={{ padding: spacing.md, gap: spacing.ms, paddingBottom: spacing.xl + insets.bottom }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          ListHeaderComponent={resultsHeader}
          renderItem={({ item }) => (
            <View style={{ width: cardWidth }}>
              <ProductCard
                product={item}
                wished={actions.wishlistIds.has(item.id)}
                onPress={() => {
                  if (query.length >= 2) remember(query);
                  actions.open(item);
                }}
                onAdd={() => actions.add(item)}
                onToggleWish={() => actions.toggleWish(item)}
              />
            </View>
          )}
          ListEmptyComponent={
            loading ? (
              <Spinner />
            ) : (
              <EmptyState
                title="Produk tidak ditemukan"
                message={query ? `Tidak ada hasil untuk “${query}”. Periksa ejaan atau coba kata kunci yang lebih umum.` : 'Coba ubah atau hapus filter.'}
                actionLabel={activeFilters ? 'Hapus semua filter' : undefined}
                onAction={() => setFilters({ sort: 'relevan', categoryId: null, categoryName: '', minPrice: 0, maxPrice: 0 })}
              />
            )
          }
          ListFooterComponent={loadingMore ? <Spinner /> : null}
          onEndReached={loadMore}
          onEndReachedThreshold={0.6}
        />
      )}

      <FilterSheet
        visible={showFilter}
        filters={filters}
        categories={categories.data || []}
        onClose={() => setShowFilter(false)}
        onApply={(next) => {
          setFilters(next);
          setShowFilter(false);
        }}
      />
    </View>
  );
}
