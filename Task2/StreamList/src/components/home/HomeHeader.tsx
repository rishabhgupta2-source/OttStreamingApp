import { StyleSheet, Text, View } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

const BRAND_ICON_SIZE = typography.title_lg.fontSize;

/**
 * Home top bar: brand mark + notification icon (visual only; no tap handling).
 */
export function HomeHeader() {
  const insets = useSafeAreaInsets();

  return (
    <View
      accessibilityRole="header"
      style={[
        styles.root,
        {
          paddingTop: insets.top + spacing.md,
          paddingBottom: spacing.md,
        },
      ]}
    >
      <View style={styles.left}>
        <MaterialIcons
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          name="movie"
          size={BRAND_ICON_SIZE}
          color={colors.primary_container}
        />
        <Text style={styles.brand}>STREAMLIST</Text>
      </View>
      <MaterialIcons
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        name="notifications"
        size={BRAND_ICON_SIZE}
        color={colors.primary_container}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brand: {
    marginLeft: spacing.sm,
    fontFamily: typography.headline_md.fontFamily,
    fontSize: typography.title_lg.fontSize,
    letterSpacing: spacing.brand_wordmark_letter_spacing,
    color: colors.primary_container,
  },
});
