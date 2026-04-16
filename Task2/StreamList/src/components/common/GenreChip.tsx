import { Pressable, StyleSheet, Text } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

export type GenreChipProps = {
  label: string;
  isActive: boolean;
  onPress: () => void;
};

export function GenreChip({ label, isActive, onPress }: GenreChipProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: isActive }}
      onPress={onPress}
      style={[
        styles.chip,
        isActive ? styles.chipActive : styles.chipInactive,
      ]}
    >
      <Text
        style={[
          typography.title_sm,
          isActive ? styles.labelActive : styles.labelInactive,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: spacing.xl,
    marginRight: spacing.sm,
  },
  chipActive: {
    backgroundColor: colors.secondary_container,
  },
  chipInactive: {
    backgroundColor: colors.surface_container_high,
  },
  labelActive: {
    color: colors.on_surface,
  },
  labelInactive: {
    color: colors.on_surface_variant,
  },
});
