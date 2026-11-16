import { useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DB from '../db';
import Card from '../components/Card';
import Chip from '../components/Chip';
import { Spinner } from '../components/Loading';
import { useQuery } from '../state/hooks';
import { colors, radius, spacing, type } from '../theme';

export default function CategoriesScreen({ navigation }) {
  const tree = useQuery(() => DB.listCategoryTree());
  const counts = useQuery(() => DB.categoryProductCounts());
  const [openId, setOpenId] = useState(null);

  if (tree.loading && !tree.data) return <Spinner />;

  return (
    <FlatList
      testID="categories-list"
      data={tree.data || []}
      keyExtractor={(c) => String(c.id)}
      contentContainerStyle={{ padding: spacing.md, gap: spacing.ms }}
      style={{ backgroundColor: colors.canvas }}
      contentInsetAdjustmentBehavior="automatic"
      ListHeaderComponent={
        <Text style={[type.body, { color: colors.inkSoft, paddingBottom: spacing.xs }]}>Pilih kategori untuk melihat produknya.</Text>
      }
      renderItem={({ item: c }) => {
        const open = openId === c.id;
        return (
          <Card padded={false}>
            <Pressable
              testID={`category-${c.slug}`}
              onPress={() => setOpenId(open ? null : c.id)}
              accessibilityRole="button"
              accessibilityState={{ expanded: open }}
              style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: spacing.ms, padding: spacing.ms, backgroundColor: pressed ? colors.canvas : colors.surface })}
            >
              <View style={{ width: 48, height: 48, borderRadius: radius.md, borderCurve: 'continuous', backgroundColor: c.color, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 26 }}>{c.icon}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={type.bodyStrong}>{c.name}</Text>
                <Text style={type.small}>{counts.data?.[c.id] ?? 0} produk · {c.children.length} subkategori</Text>
              </View>
              <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={20} color={colors.inkMute} />
            </Pressable>
            {open ? (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, padding: spacing.ms, paddingTop: 0 }}>
                <Chip
                  label={`Semua ${c.name}`}
                  selected
                  onPress={() => navigation.navigate('Search', { categoryId: c.id, categoryName: c.name })}
                />
                {c.children.map((s) => (
                  <Chip
                    key={s.id}
                    testID={`subcategory-${s.slug}`}
                    icon={s.icon}
                    label={s.name}
                    onPress={() => navigation.navigate('Search', { categoryId: s.id, categoryName: s.name })}
                  />
                ))}
              </View>
            ) : null}
          </Card>
        );
      }}
    />
  );
}
