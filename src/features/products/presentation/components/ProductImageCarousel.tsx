import { Image } from 'expo-image';
import { useState } from 'react';
import {
  FlatList,
  StyleSheet,
  useWindowDimensions,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';

import { TestIds } from '@shared/testing/test-ids';
import { colors, radius, spacing } from '@shared/theme/tokens';

const HEIGHT = 320;
const DOT = 6;

export interface ProductImageCarouselProps {
  images: readonly string[];
  /** Product title, used in each image's accessibility label. */
  title: string;
}

/** Full-width, horizontally paged product gallery with page dots. */
export function ProductImageCarousel({ images, title }: ProductImageCarouselProps) {
  const { width } = useWindowDimensions();
  const [page, setPage] = useState(0);

  const onMomentumScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    setPage(Math.round(event.nativeEvent.contentOffset.x / Math.max(width, 1)));
  };

  return (
    <View testID={TestIds.detailsCarousel} style={styles.container}>
      <FlatList
        data={images}
        horizontal
        pagingEnabled
        bounces={false}
        showsHorizontalScrollIndicator={false}
        keyExtractor={(uri, index) => `${index}-${uri}`}
        onMomentumScrollEnd={onMomentumScrollEnd}
        renderItem={({ item, index }) => (
          <View
            style={[styles.page, { width }]}
            accessible
            accessibilityRole="image"
            accessibilityLabel={`${title}, image ${index + 1} of ${images.length}`}
          >
            <Image
              source={{ uri: item }}
              style={styles.image}
              contentFit="contain"
              transition={150}
              accessible={false}
            />
          </View>
        )}
      />
      {images.length > 1 ? (
        <View
          style={styles.dots}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        >
          {images.map((uri, index) => (
            <View
              key={`${index}-${uri}`}
              style={[styles.dot, index === page ? styles.dotActive : null]}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.imagePlaceholder,
    borderBottomLeftRadius: radius.lg,
    borderBottomRightRadius: radius.lg,
    overflow: 'hidden',
  },
  page: { height: HEIGHT, padding: spacing.xxl },
  image: { flex: 1 },
  dots: {
    position: 'absolute',
    bottom: spacing.md,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
  },
  dot: { width: DOT, height: DOT, borderRadius: DOT / 2, backgroundColor: colors.outlineMuted },
  dotActive: { width: DOT * 3, backgroundColor: colors.primary },
});
