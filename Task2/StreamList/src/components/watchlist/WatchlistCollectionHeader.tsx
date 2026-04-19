import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

export type WatchlistCollectionHeaderProps = {
  itemCount: number;
};

/**
 * “Your collection” eyebrow + watchlist title + saved count (populated and empty flows).
 */
export function WatchlistCollectionHeader({
  itemCount,
}: WatchlistCollectionHeaderProps) {
  return (
    <View style={styles.root}>
      <Text style={styles.eyebrow}>YOUR COLLECTION</Text>
      <Text style={styles.title}>My Watchlist</Text>
      <Text style={styles.count}>{`${String(itemCount)} titles`}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xs,
  },
  eyebrow: {
    ...typography.label_sm,
    color: colors.on_surface_variant,
    textTransform: 'uppercase',
    letterSpacing: spacing.xs / 2,
  },
  title: {
    ...typography.display_md,
    marginTop: spacing.xs / 2,
    color: colors.on_surface,
  },
  count: {
    ...typography.label_sm,
    marginTop: spacing.xs,
    color: colors.on_surface_variant,
  },
});
