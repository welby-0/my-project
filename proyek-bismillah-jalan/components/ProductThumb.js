import { useState } from 'react';
import { Image, Text, View } from 'react-native';
import { colors, radius } from '../theme';

// Foto produk: gambar dari galeri bila ada, jika tidak tampil ikon emoji di atas warna kategori
export default function ProductThumb({ product, size, rounded = radius.md, style }) {
  const [width, setWidth] = useState(size || 0);
  const box = size ? { width: size, height: size } : { width: '100%', aspectRatio: 1 };
  return (
    <View
      onLayout={size ? undefined : (e) => setWidth(e.nativeEvent.layout.width)}
      style={[
        box,
        { backgroundColor: product.tile_color || colors.brandTint, borderRadius: rounded, borderCurve: 'continuous', overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
        style,
      ]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {product.image_uri ? (
        <Image source={{ uri: product.image_uri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
      ) : (
        <Text style={{ fontSize: Math.max(18, width * 0.46) }}>{product.emoji}</Text>
      )}
    </View>
  );
}
