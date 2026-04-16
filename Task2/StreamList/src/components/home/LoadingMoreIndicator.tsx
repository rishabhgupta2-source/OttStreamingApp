import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

export type LoadingMoreIndicatorProps = {
  visible: boolean;
};

export function LoadingMoreIndicator({ visible }: LoadingMoreIndicatorProps) {
  if (!visible) {
    return null;
  }

  return (
    <View style={styles.root}>
      <ActivityIndicator
        color={colors.on_surface_variant}
        size="small"
      />
      <Text style={[typography.label_sm, styles.label]}>
        LOADING MORE CONTENT
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
  },
  label: {
    marginLeft: spacing.sm,
    letterSpacing: 1,
    color: colors.on_surface_variant,
    textTransform: 'uppercase',
  },
});
